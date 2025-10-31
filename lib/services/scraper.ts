import * as cheerio from 'cheerio';
import { ScrapedPage, ScrapeResult } from '../types';

const MAX_PAGES = parseInt(process.env.MAX_PAGES_PER_SITE || '10');
const TIMEOUT = 10000;

export class WebScraper {
  /**
   * Scrape a website and extract relevant content
   */
  async scrapeWebsite(url: string): Promise<ScrapeResult> {
    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url);

      // Scrape main page
      const mainPage = await this.scrapePage(normalizedUrl, 'MAIN_PAGE');

      // Find and scrape subpages
      const subPageUrls = this.extractSubPages(normalizedUrl, mainPage);
      const subPages: ScrapedPage[] = [];

      for (const subPageUrl of subPageUrls.slice(0, MAX_PAGES - 1)) {
        try {
          const page = await this.scrapePage(subPageUrl.url, subPageUrl.type);
          subPages.push(page);
        } catch (error) {
          console.error(`Failed to scrape ${subPageUrl.url}:`, error);
        }
      }

      return {
        mainPage,
        subPages,
      };
    } catch (error) {
      return {
        mainPage: {
          url,
          type: 'MAIN_PAGE',
          title: 'Error',
          content: '',
          excerpt: '',
          metadata: {},
        },
        subPages: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Scrape a single page
   */
  private async scrapePage(url: string, type: string): Promise<ScrapedPage> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LLM-Brand-Lens-Bot/1.0 (Brand Analysis Tool)',
        },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and nav elements
      $('script, style, nav, header, footer, .cookie-banner, #cookie-notice').remove();

      // Extract metadata
      const metadata = {
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()),
        ogTitle: $('meta[property="og:title"]').attr('content'),
        ogDescription: $('meta[property="og:description"]').attr('content'),
      };

      // Extract title
      const title = $('title').text() || $('h1').first().text() || '';

      // Extract main content
      const mainContent = this.extractMainContent($);

      // Create excerpt (first 300 chars)
      const excerpt = mainContent.slice(0, 300).trim() + (mainContent.length > 300 ? '...' : '');

      return {
        url,
        type,
        title: title.trim(),
        content: mainContent,
        excerpt,
        metadata,
      };
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  /**
   * Extract main content from a page
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find main content areas
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
   * Extract relevant subpage URLs from main page
   */
  private extractSubPages(
    baseUrl: string,
    mainPage: ScrapedPage
  ): { url: string; type: string }[] {
    const $ = cheerio.load(`<div>${mainPage.content}</div>`);
    const links: { url: string; type: string }[] = [];
    const seenUrls = new Set<string>();

    // Define patterns for important pages
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

          // Only same domain
          if (fullUrl.hostname !== baseUrlObj.hostname) return;

          // Skip common non-content URLs
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

          // Try to classify the page
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

    // Prioritize important pages
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
   * Calculate content hash
   */
  calculateHash(content: string): string {
    // Simple hash function for content comparison
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

export const webScraper = new WebScraper();
