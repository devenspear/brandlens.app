import { LlmProvider, ProjectStatus } from '@prisma/client';
import { prisma } from '../prisma/client';
import { LLMProviderFactory } from './llm-providers';
import { webScraper } from './scraper';
import {
  createBrandSynopsisPrompt,
  createPositioningPillarsPrompt,
  createToneOfVoicePrompt,
  createBuyerSegmentsPrompt,
  createAmenitiesPrompt,
  createTrustSignalsPrompt,
  createMessagingAnalysisPrompt,
  createRecommendationsPrompt,
  PromptContext,
} from '../prompts/templates';
import { BrandSynopsis, LLMConfig } from '../types';

export class BrandAnalyzer {
  /**
   * Run complete brand analysis for a project
   */
  async analyzeProject(projectId: string): Promise<void> {
    try {
      // Update status
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.SCRAPING },
      });

      // Get project details
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Step 1: Scrape website
      console.log(`Scraping ${project.url}...`);
      const scrapeResult = await webScraper.scrapeWebsite(project.url);

      if (scrapeResult.error) {
        throw new Error(`Scraping failed: ${scrapeResult.error}`);
      }

      // Save sources
      await prisma.source.create({
        data: {
          projectId,
          type: 'MAIN_PAGE',
          url: scrapeResult.mainPage.url,
          contentHash: webScraper.calculateHash(scrapeResult.mainPage.content),
          textExcerpt: scrapeResult.mainPage.excerpt,
          fullContent: scrapeResult.mainPage.content,
          metadata: scrapeResult.mainPage.metadata as any,
        },
      });

      for (const page of scrapeResult.subPages) {
        await prisma.source.create({
          data: {
            projectId,
            type: page.type as any,
            url: page.url,
            contentHash: webScraper.calculateHash(page.content),
            textExcerpt: page.excerpt,
            fullContent: page.content,
            metadata: page.metadata as any,
          },
        });
      }

      // Step 2: Analyze with multiple LLMs
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.ANALYZING },
      });

      console.log('Analyzing with multiple LLMs...');
      const promptContext: PromptContext = {
        domain: new URL(project.url).hostname,
        mainPage: scrapeResult.mainPage,
        subPages: scrapeResult.subPages,
      };

      // Run analysis with all providers in parallel
      const providers = LLMProviderFactory.getAllProviders();
      await Promise.all(
        providers.map(provider => this.analyzeWithProvider(projectId, provider, promptContext))
      );

      // Step 3: Mark as completed
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.COMPLETED },
      });

      console.log(`Analysis complete for project ${projectId}`);
    } catch (error) {
      console.error('Analysis error:', error);
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.FAILED },
      });
      throw error;
    }
  }

  /**
   * Analyze with a specific LLM provider
   */
  private async analyzeWithProvider(
    projectId: string,
    provider: LlmProvider,
    context: PromptContext
  ): Promise<void> {
    const llmProvider = LLMProviderFactory.getProvider(provider);

    const config: LLMConfig = {
      provider,
      model: this.getDefaultModel(provider),
      temperature: 0.3,
      maxTokens: 4000,
    };

    try {
      // 1. Brand Synopsis
      console.log(`${provider}: Generating brand synopsis...`);
      const synopsisPrompt = createBrandSynopsisPrompt(context);
      const synopsisResult = await llmProvider.analyze(synopsisPrompt, config);

      await this.saveLLMRun(projectId, provider, config, synopsisResult);
      await this.saveFinding(
        projectId,
        'BRAND_SYNOPSIS',
        synopsisResult.content,
        synopsisPrompt
      );

      // 2. Positioning Pillars
      console.log(`${provider}: Analyzing positioning pillars...`);
      const pillarsPrompt = createPositioningPillarsPrompt(context);
      const pillarsResult = await llmProvider.analyze(pillarsPrompt, config);

      await this.saveLLMRun(projectId, provider, config, pillarsResult);
      for (const pillar of pillarsResult.content) {
        await this.saveFinding(projectId, 'POSITIONING_PILLAR', pillar, pillarsPrompt);
      }

      // 3. Tone of Voice
      console.log(`${provider}: Analyzing tone of voice...`);
      const tonePrompt = createToneOfVoicePrompt(context);
      const toneResult = await llmProvider.analyze(tonePrompt, config);

      await this.saveLLMRun(projectId, provider, config, toneResult);
      await this.saveFinding(projectId, 'TONE_OF_VOICE', toneResult.content, tonePrompt);

      // 4. Buyer Segments
      console.log(`${provider}: Identifying buyer segments...`);
      const segmentsPrompt = createBuyerSegmentsPrompt(context);
      const segmentsResult = await llmProvider.analyze(segmentsPrompt, config);

      await this.saveLLMRun(projectId, provider, config, segmentsResult);
      for (const segment of segmentsResult.content) {
        await this.saveFinding(projectId, 'BUYER_SEGMENT', segment, segmentsPrompt);
      }

      // 5. Amenities
      console.log(`${provider}: Extracting amenity claims...`);
      const amenitiesPrompt = createAmenitiesPrompt(context);
      const amenitiesResult = await llmProvider.analyze(amenitiesPrompt, config);

      await this.saveLLMRun(projectId, provider, config, amenitiesResult);
      for (const amenity of amenitiesResult.content) {
        await this.saveFinding(projectId, 'AMENITY_CLAIM', amenity, amenitiesPrompt);
      }

      // 6. Trust Signals
      console.log(`${provider}: Identifying trust signals...`);
      const trustPrompt = createTrustSignalsPrompt(context);
      const trustResult = await llmProvider.analyze(trustPrompt, config);

      await this.saveLLMRun(projectId, provider, config, trustResult);
      for (const signal of trustResult.content) {
        await this.saveFinding(projectId, 'TRUST_SIGNAL', signal, trustPrompt);
      }

      // 7. Messaging Analysis
      console.log(`${provider}: Analyzing messaging quality...`);
      const messagingPrompt = createMessagingAnalysisPrompt(context);
      const messagingResult = await llmProvider.analyze(messagingPrompt, config);

      await this.saveLLMRun(projectId, provider, config, messagingResult);
      await this.saveFinding(
        projectId,
        'CLARITY_SCORE',
        messagingResult.content.clarity,
        messagingPrompt
      );
      await this.saveFinding(
        projectId,
        'SPECIFICITY_SCORE',
        messagingResult.content.specificity,
        messagingPrompt
      );
      await this.saveFinding(
        projectId,
        'DIFFERENTIATION_SCORE',
        messagingResult.content.differentiation,
        messagingPrompt
      );
      await this.saveFinding(
        projectId,
        'TRUST_SCORE',
        messagingResult.content.trust,
        messagingPrompt
      );

      // 8. Recommendations
      console.log(`${provider}: Generating recommendations...`);
      const recommendationsPrompt = createRecommendationsPrompt(context, {
        synopsis: synopsisResult.content,
        pillars: pillarsResult.content,
        tone: toneResult.content,
        messaging: messagingResult.content,
      });
      const recommendationsResult = await llmProvider.analyze(recommendationsPrompt, config);

      await this.saveLLMRun(projectId, provider, config, recommendationsResult);
      for (const rec of recommendationsResult.content) {
        await this.saveFinding(projectId, 'RECOMMENDATION', rec, recommendationsPrompt);
      }

      console.log(`${provider}: Analysis complete`);
    } catch (error) {
      console.error(`${provider} analysis failed:`, error);

      // Save failed run
      await prisma.llmRun.create({
        data: {
          projectId,
          provider,
          model: config.model,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          settings: config as any,
          rawResponse: {},
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }

  /**
   * Save LLM run to database
   */
  private async saveLLMRun(
    projectId: string,
    provider: LlmProvider,
    config: LLMConfig,
    result: any
  ): Promise<void> {
    await prisma.llmRun.create({
      data: {
        projectId,
        provider,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        settings: config as any,
        rawResponse: result.raw,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        status: 'COMPLETED',
      },
    });
  }

  /**
   * Save finding to database
   */
  private async saveFinding(
    projectId: string,
    kind: string,
    value: any,
    evidence: string
  ): Promise<void> {
    await prisma.finding.create({
      data: {
        projectId,
        kind: kind as any,
        value: value as any,
        evidenceRef: evidence,
      },
    });
  }

  /**
   * Get default model for each provider
   */
  private getDefaultModel(provider: LlmProvider): string {
    switch (provider) {
      case LlmProvider.OPENAI:
        return 'gpt-4o';
      case LlmProvider.ANTHROPIC:
        return 'claude-sonnet-4-5-20250929';
      case LlmProvider.GOOGLE:
        return 'gemini-1.5-pro';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}

export const brandAnalyzer = new BrandAnalyzer();
