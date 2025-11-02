import puppeteer, { Browser, Page } from 'puppeteer';
import { ScrapedPage, ScrapeResult } from '../types';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';

const MAX_PAGES = parseInt(process.env.MAX_PAGES_PER_SITE || '4');
const PAGE_TIMEOUT = 15000; // 15 seconds per page
const MIN_CONTENT_LENGTH = 500; // Minimum characters for valid content

export interface ScrapingQualityCheck {
  isValid: boolean;
  contentLength: number;
  hasText: boolean;
  hasImages: boolean;
  screenshotPath?: string;
  warnings: string[];
  errors: string[];
}

export class PuppeteerScraper {
  private browser: Browser | null = null;

  /**
   * Initialize browser
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Scrape a website with JavaScript execution and visual capture
   */
  async scrapeWebsite(url: string): Promise<ScrapeResult> {
    const normalizedUrl = this.normalizeUrl(url);
    let mainPage: ScrapedPage;
    let mainPageQuality: ScrapingQualityCheck;

    console.log(`\n🌐 PUPPETEER SCRAPING: ${normalizedUrl}`);

    try {
      const browser = await this.getBrowser();

      // Scrape main page
      try {
        const result = await this.scrapePage(browser, normalizedUrl, 'MAIN_PAGE');
        mainPage = result.page;
        mainPageQuality = result.quality;

        console.log(`✅ Main page scraped: ${normalizedUrl}`);
        console.log(`   📊 Content: ${mainPageQuality.contentLength} chars | Screenshot: ${mainPageQuality.screenshotPath ? 'Yes' : 'No'}`);

        // Check quality
        if (!mainPageQuality.isValid) {
          console.error(`❌ QUALITY CHECK FAILED: ${mainPageQuality.errors.join(', ')}`);
          return {
            mainPage: mainPage,
            subPages: [],
            error: `Main page quality check failed: ${mainPageQuality.errors.join(', ')}`,
          };
        }

        if (mainPageQuality.warnings.length > 0) {
          console.warn(`⚠️  Warnings: ${mainPageQuality.warnings.join(', ')}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Main page failed: ${normalizedUrl} - ${errorMsg}`);

        return {
          mainPage: {
            url: normalizedUrl,
            type: 'MAIN_PAGE',
            title: 'Error',
            content: '',
            excerpt: '',
            metadata: { error: errorMsg },
          },
          subPages: [],
          error: `Main page inaccessible: ${errorMsg}`,
        };
      }

      // Find and scrape subpages
      const subPageUrls = this.extractSubPages(normalizedUrl, mainPage);
      console.log(`🔍 Found ${subPageUrls.length} potential subpages, attempting ${Math.min(subPageUrls.length, MAX_PAGES - 1)}...`);

      const subPagePromises = subPageUrls.slice(0, MAX_PAGES - 1).map(async (subPageUrl) => {
        try {
          const result = await this.scrapePage(browser, subPageUrl.url, subPageUrl.type);
          if (result.quality.isValid) {
            console.log(`✅ Subpage scraped: ${subPageUrl.url} (${result.quality.contentLength} chars)`);
            return result.page;
          } else {
            console.warn(`⚠️  Subpage quality low (continuing): ${subPageUrl.url}`);
            return null;
          }
        } catch (error) {
          console.warn(`⚠️  Subpage timeout (continuing): ${subPageUrl.url}`);
          return null;
        }
      });

      const subPageResults = await Promise.all(subPagePromises);
      const subPages = subPageResults.filter((page): page is ScrapedPage => page !== null);

      const failedCount = subPageResults.length - subPages.length;
      if (failedCount > 0) {
        console.log(`⚠️  ${failedCount} of ${subPageResults.length} subpages skipped (${subPages.length} valid pages)`);
      }

      return {
        mainPage,
        subPages,
        warning: failedCount > 0 ? `${failedCount} page(s) skipped due to low quality or timeout` : undefined,
      };
    } finally {
      // Don't close browser - reuse for next scraping
      // await this.close();
    }
  }

  /**
   * Scrape a single page with JavaScript execution
   */
  private async scrapePage(
    browser: Browser,
    url: string,
    type: string
  ): Promise<{ page: ScrapedPage; quality: ScrapingQualityCheck }> {
    const page = await browser.newPage();

    try {
      // Set viewport for consistent screenshots
      await page.setViewport({ width: 1920, height: 1080 });

      // Set timeout
      page.setDefaultTimeout(PAGE_TIMEOUT);

      // Navigate to page and wait for network to be idle
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: PAGE_TIMEOUT,
      });

      // Wait a bit more for any lazy-loaded content
      await page.waitForTimeout(2000);

      // Take screenshot
      const screenshotDir = path.join(process.cwd(), 'public', 'screenshots');
      await fs.mkdir(screenshotDir, { recursive: true });

      const screenshotFilename = `${Date.now()}-${this.sanitizeFilename(url)}.jpg`;
      const screenshotPath = path.join(screenshotDir, screenshotFilename);

      await page.screenshot({
        path: screenshotPath,
        type: 'jpeg',
        quality: 80,
        fullPage: false, // Just viewport for preview
      });

      // Get page content (after JavaScript execution)
      const html = await page.content();

      // Extract metadata
      const metadata = await page.evaluate(() => {
        const getMeta = (selector: string) =>
          document.querySelector(selector)?.getAttribute('content') || undefined;

        return {
          description: getMeta('meta[name="description"]'),
          keywords: getMeta('meta[name="keywords"]')?.split(',').map(k => k.trim()),
          ogTitle: getMeta('meta[property="og:title"]'),
          ogDescription: getMeta('meta[property="og:description"]'),
          ogImage: getMeta('meta[property="og:image"]'),
          screenshot: `/screenshots/${screenshotFilename}`,
        };
      });

      // Get title
      const title = await page.title();

      // Extract main content using Cheerio
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, nav, header, footer, .cookie-banner, #cookie-notice').remove();

      const mainContent = this.extractMainContent($);
      const excerpt = mainContent.slice(0, 300).trim() + (mainContent.length > 300 ? '...' : '');

      // Perform quality check
      const quality = this.checkContentQuality(mainContent, html, `/screenshots/${screenshotFilename}`);

      const scrapedPage: ScrapedPage = {
        url,
        type,
        title: title.trim(),
        content: mainContent,
        excerpt,
        metadata,
      };

      return { page: scrapedPage, quality };
    } finally {
      await page.close();
    }
  }

  /**
   * Check content quality
   */
  private checkContentQuality(
    content: string,
    html: string,
    screenshotPath?: string
  ): ScrapingQualityCheck {
    const warnings: string[] = [];
    const errors: string[] = [];

    const contentLength = content.length;
    const hasText = contentLength > MIN_CONTENT_LENGTH;
    const hasImages = html.includes('<img') || html.includes('background-image');

    // Critical errors
    if (!hasText) {
      errors.push(`Insufficient content (${contentLength} chars, need ${MIN_CONTENT_LENGTH})`);
    }

    // Warnings (non-critical)
    if (contentLength < 1000) {
      warnings.push('Content is shorter than ideal (< 1000 chars)');
    }

    if (!hasImages) {
      warnings.push('No images detected');
    }

    if (!screenshotPath) {
      warnings.push('Screenshot not captured');
    }

    const isValid = errors.length === 0 && hasText;

    return {
      isValid,
      contentLength,
      hasText,
      hasImages,
      screenshotPath,
      warnings,
      errors,
    };
  }

  /**
   * Extract main content from parsed HTML
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '#content',
      '.main-content',
      'body',
    ];

    let content = '';

    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    return content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  /**
   * Extract relevant subpage URLs
   */
  private extractSubPages(
    baseUrl: string,
    mainPage: ScrapedPage
  ): { url: string; type: string }[] {
    const $ = cheerio.load(`<div>${mainPage.content}</div>`);
    const links: { url: string; type: string }[] = [];
    const seenUrls = new Set<string>();

    const patterns = [
      { pattern: /about/i, type: 'ABOUT' },
      { pattern: /homes|plans|residences|properties/i, type: 'HOMES' },
      { pattern: /amenities|features|lifestyle/i, type: 'AMENITIES' },
      { pattern: /location|neighborhood|community/i, type: 'LOCATION' },
      { pattern: /contact|connect/i, type: 'CONTACT' },
      { pattern: /press|news|media/i, type: 'PRESS' },
    ];

    try {
      const baseUrlObj = new URL(baseUrl);

      $('a[href]').each((_, element) => {
        try {
          const href = $(element).attr('href');
          if (!href) return;

          const fullUrl = new URL(href, baseUrl);

          if (fullUrl.hostname !== baseUrlObj.hostname) return;

          if (
            href.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx)$/i) ||
            href.includes('#') ||
            href.includes('javascript:')
          ) {
            return;
          }

          const normalizedUrl = fullUrl.href.split('#')[0].split('?')[0];

          if (seenUrls.has(normalizedUrl)) return;
          seenUrls.add(normalizedUrl);

          let type = 'OTHER';
          for (const { pattern, type: pageType } of patterns) {
            if (pattern.test(normalizedUrl) || pattern.test($(element).text())) {
              type = pageType;
              break;
            }
          }

          links.push({ url: normalizedUrl, type });
        } catch (error) {
          // Skip invalid URLs
        }
      });
    } catch (error) {
      console.error('Error extracting subpages:', error);
    }

    const prioritized = [
      ...links.filter(l => l.type === 'ABOUT'),
      ...links.filter(l => l.type === 'HOMES'),
      ...links.filter(l => l.type === 'AMENITIES'),
      ...links.filter(l => l.type === 'LOCATION'),
      ...links.filter(l => l.type === 'CONTACT'),
      ...links.filter(l => l.type === 'PRESS'),
      ...links.filter(l => l.type === 'OTHER'),
    ];

    return prioritized.slice(0, MAX_PAGES - 1);
  }

  /**
   * Normalize URL
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    return url;
  }

  /**
   * Sanitize filename for screenshots
   */
  private sanitizeFilename(url: string): string {
    return url
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50);
  }

  /**
   * Calculate content hash
   */
  calculateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

export const puppeteerScraper = new PuppeteerScraper();
