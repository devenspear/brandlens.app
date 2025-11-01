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
      console.log(`\n🌐 SCRAPING: ${project.url}`);
      const scrapeStart = Date.now();
      const scrapeResult = await webScraper.scrapeWebsite(project.url);
      console.log(`✅ SCRAPING COMPLETE: ${Date.now() - scrapeStart}ms | Main page + ${scrapeResult.subPages.length} subpages`);

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

      console.log(`\n🤖 ANALYZING WITH ALL LLMS IN PARALLEL...`);
      const analysisStart = Date.now();
      const promptContext: PromptContext = {
        domain: new URL(project.url).hostname,
        mainPage: scrapeResult.mainPage,
        subPages: scrapeResult.subPages,
      };

      // Run analysis with all providers in parallel
      const providers = LLMProviderFactory.getAllProviders();
      console.log(`📊 Starting ${providers.length} LLM providers: ${providers.join(', ')}`);

      await Promise.all(
        providers.map(provider => this.analyzeWithProvider(projectId, provider, promptContext))
      );

      console.log(`✅ ALL LLM ANALYSES COMPLETE: ${Date.now() - analysisStart}ms`);

      // Step 3: Mark as completed
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.COMPLETED },
      });

      console.log(`\n🎊 PROJECT COMPLETE: ${projectId}`);
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
      const startTime = Date.now();

      // 1. Brand Synopsis
      console.log(`[${provider}] ⏱️  Step 1/8: Starting brand synopsis analysis...`);
      const synopsisPrompt = createBrandSynopsisPrompt(context);
      const synopsisStart = Date.now();
      const synopsisResult = await llmProvider.analyze(synopsisPrompt, config);
      console.log(`[${provider}] ✅ Step 1/8: Brand synopsis complete (${Date.now() - synopsisStart}ms, ${synopsisResult.tokensUsed} tokens, $${synopsisResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, synopsisResult);
      await this.saveFinding(
        projectId,
        'BRAND_SYNOPSIS',
        synopsisResult.content,
        synopsisPrompt
      );

      // 2. Positioning Pillars
      console.log(`[${provider}] ⏱️  Step 2/8: Starting positioning pillars analysis...`);
      const pillarsPrompt = createPositioningPillarsPrompt(context);
      const pillarsStart = Date.now();
      const pillarsResult = await llmProvider.analyze(pillarsPrompt, config);
      console.log(`[${provider}] ✅ Step 2/8: Positioning pillars complete (${Date.now() - pillarsStart}ms, ${pillarsResult.tokensUsed} tokens, $${pillarsResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, pillarsResult);
      // Handle both array and object responses
      const pillars = Array.isArray(pillarsResult.content)
        ? pillarsResult.content
        : (pillarsResult.content as any)?.pillars || [];
      console.log(`[${provider}] 💾 Saved ${pillars.length} positioning pillars`);
      for (const pillar of pillars) {
        await this.saveFinding(projectId, 'POSITIONING_PILLAR', pillar, pillarsPrompt);
      }

      // 3. Tone of Voice
      console.log(`[${provider}] ⏱️  Step 3/8: Starting tone of voice analysis...`);
      const tonePrompt = createToneOfVoicePrompt(context);
      const toneStart = Date.now();
      const toneResult = await llmProvider.analyze(tonePrompt, config);
      console.log(`[${provider}] ✅ Step 3/8: Tone of voice complete (${Date.now() - toneStart}ms, ${toneResult.tokensUsed} tokens, $${toneResult.cost.toFixed(4)})`);


      await this.saveLLMRun(projectId, provider, config, toneResult);
      await this.saveFinding(projectId, 'TONE_OF_VOICE', toneResult.content, tonePrompt);

      // 4. Buyer Segments
      console.log(`[${provider}] ⏱️  Step 4/8: Starting buyer segments analysis...`);
      const segmentsPrompt = createBuyerSegmentsPrompt(context);
      const segmentsStart = Date.now();
      const segmentsResult = await llmProvider.analyze(segmentsPrompt, config);
      console.log(`[${provider}] ✅ Step 4/8: Buyer segments complete (${Date.now() - segmentsStart}ms, ${segmentsResult.tokensUsed} tokens, $${segmentsResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, segmentsResult);
      const segments = Array.isArray(segmentsResult.content)
        ? segmentsResult.content
        : (segmentsResult.content as any)?.segments || [];
      console.log(`[${provider}] 💾 Saved ${segments.length} buyer segments`);
      for (const segment of segments) {
        await this.saveFinding(projectId, 'BUYER_SEGMENT', segment, segmentsPrompt);
      }

      // 5. Amenities
      console.log(`[${provider}] ⏱️  Step 5/8: Starting amenity claims extraction...`);
      const amenitiesPrompt = createAmenitiesPrompt(context);
      const amenitiesStart = Date.now();
      const amenitiesResult = await llmProvider.analyze(amenitiesPrompt, config);
      console.log(`[${provider}] ✅ Step 5/8: Amenity claims complete (${Date.now() - amenitiesStart}ms, ${amenitiesResult.tokensUsed} tokens, $${amenitiesResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, amenitiesResult);
      const amenities = Array.isArray(amenitiesResult.content)
        ? amenitiesResult.content
        : (amenitiesResult.content as any)?.amenities || [];
      console.log(`[${provider}] 💾 Saved ${amenities.length} amenities`);
      for (const amenity of amenities) {
        await this.saveFinding(projectId, 'AMENITY_CLAIM', amenity, amenitiesPrompt);
      }

      // 6. Trust Signals
      console.log(`[${provider}] ⏱️  Step 6/8: Starting trust signals analysis...`);
      const trustPrompt = createTrustSignalsPrompt(context);
      const trustStart = Date.now();
      const trustResult = await llmProvider.analyze(trustPrompt, config);
      console.log(`[${provider}] ✅ Step 6/8: Trust signals complete (${Date.now() - trustStart}ms, ${trustResult.tokensUsed} tokens, $${trustResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, trustResult);
      const trustSignals = Array.isArray(trustResult.content)
        ? trustResult.content
        : (trustResult.content as any)?.signals || [];
      console.log(`[${provider}] 💾 Saved ${trustSignals.length} trust signals`);
      for (const signal of trustSignals) {
        await this.saveFinding(projectId, 'TRUST_SIGNAL', signal, trustPrompt);
      }

      // 7. Messaging Analysis
      console.log(`[${provider}] ⏱️  Step 7/8: Starting messaging quality analysis...`);
      const messagingPrompt = createMessagingAnalysisPrompt(context);
      const messagingStart = Date.now();
      const messagingResult = await llmProvider.analyze(messagingPrompt, config);
      console.log(`[${provider}] ✅ Step 7/8: Messaging analysis complete (${Date.now() - messagingStart}ms, ${messagingResult.tokensUsed} tokens, $${messagingResult.cost.toFixed(4)})`);


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
      console.log(`[${provider}] ⏱️  Step 8/8: Starting recommendations generation...`);
      const recommendationsPrompt = createRecommendationsPrompt(context, {
        synopsis: synopsisResult.content,
        pillars: pillars,
        tone: toneResult.content,
        messaging: messagingResult.content,
      });
      const recommendationsStart = Date.now();
      const recommendationsResult = await llmProvider.analyze(recommendationsPrompt, config);
      console.log(`[${provider}] ✅ Step 8/8: Recommendations complete (${Date.now() - recommendationsStart}ms, ${recommendationsResult.tokensUsed} tokens, $${recommendationsResult.cost.toFixed(4)})`);

      await this.saveLLMRun(projectId, provider, config, recommendationsResult);
      const recommendations = Array.isArray(recommendationsResult.content)
        ? recommendationsResult.content
        : (recommendationsResult.content as any)?.recommendations || [];
      console.log(`[${provider}] 💾 Saved ${recommendations.length} recommendations`);
      for (const rec of recommendations) {
        await this.saveFinding(projectId, 'RECOMMENDATION', rec, recommendationsPrompt);
      }

      const totalTime = Date.now() - startTime;
      const totalTokens = synopsisResult.tokensUsed + pillarsResult.tokensUsed + toneResult.tokensUsed +
                         segmentsResult.tokensUsed + amenitiesResult.tokensUsed + trustResult.tokensUsed +
                         messagingResult.tokensUsed + recommendationsResult.tokensUsed;
      const totalCost = synopsisResult.cost + pillarsResult.cost + toneResult.cost +
                       segmentsResult.cost + amenitiesResult.cost + trustResult.cost +
                       messagingResult.cost + recommendationsResult.cost;

      console.log(`[${provider}] 🎉 COMPLETE: All 8 analyses done in ${totalTime}ms | ${totalTokens} total tokens | $${totalCost.toFixed(4)} total cost`);
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
    // Serialize raw response to remove function objects
    const serializedRaw = JSON.parse(JSON.stringify(result.raw));

    await prisma.llmRun.create({
      data: {
        projectId,
        provider,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        settings: config as any,
        rawResponse: serializedRaw,
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
        return 'gemini-2.5-pro';
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}

export const brandAnalyzer = new BrandAnalyzer();
