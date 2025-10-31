import { prisma } from '../prisma/client';
import { ConsensusAnalysis, Divergence } from '../types';
import { LlmProvider } from '@prisma/client';

export class ConsensusAnalyzer {
  /**
   * Analyze consensus and divergence across LLM outputs
   */
  async analyzeConsensus(projectId: string): Promise<ConsensusAnalysis> {
    // Get all findings for the project
    const findings = await prisma.finding.findMany({
      where: { projectId },
      include: {
        project: {
          include: {
            llmRuns: true,
          },
        },
      },
    });

    // Group findings by kind
    const findingsByKind = findings.reduce((acc, finding) => {
      if (!acc[finding.kind]) {
        acc[finding.kind] = [];
      }
      acc[finding.kind].push(finding);
      return acc;
    }, {} as Record<string, typeof findings>);

    // Analyze brand synopsis consensus
    const synopses = findingsByKind['BRAND_SYNOPSIS'] || [];
    const pillars = findingsByKind['POSITIONING_PILLAR'] || [];
    const tones = findingsByKind['TONE_OF_VOICE'] || [];

    // Extract common themes
    const commonThemes = this.extractCommonThemes(synopses, pillars);

    // Find divergences
    const divergences = this.findDivergences(synopses, pillars, tones);

    // Calculate overall agreement index
    const agreementIndex = this.calculateAgreementIndex(divergences.length, findings.length);

    return {
      agreementIndex,
      commonThemes,
      divergences,
    };
  }

  /**
   * Extract common themes across multiple findings
   */
  private extractCommonThemes(synopses: any[], pillars: any[]): string[] {
    const themes = new Set<string>();

    // Extract key phrases from synopses
    for (const synopsis of synopses) {
      const summary = synopsis.value?.summary || '';
      const words = this.extractKeyPhrases(summary);
      words.forEach(word => themes.add(word));
    }

    // Extract pillar names
    for (const pillar of pillars) {
      const name = pillar.value?.name || '';
      if (name) {
        themes.add(name.toLowerCase());
      }
    }

    // Count occurrences and keep only common ones (appears in 2+ providers)
    const themeCounts = new Map<string, number>();
    themes.forEach(theme => {
      const count = synopses.filter(s =>
        (s.value?.summary || '').toLowerCase().includes(theme.toLowerCase())
      ).length;
      themeCounts.set(theme, count);
    });

    // Return themes that appear in at least 2 analyses
    return Array.from(themeCounts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  /**
   * Find divergences between LLM outputs
   */
  private findDivergences(synopses: any[], pillars: any[], tones: any[]): Divergence[] {
    const divergences: Divergence[] = [];

    // Check for divergences in brand positioning
    if (pillars.length >= 2) {
      const pillarsByProvider = this.groupByProvider(pillars);
      const pillarTopics = this.identifyDivergentTopics(pillarsByProvider);

      for (const topic of pillarTopics) {
        divergences.push({
          topic: `Positioning: ${topic.name}`,
          modelPerspectives: topic.perspectives,
          explanation: topic.explanation,
        });
      }
    }

    // Check for divergences in tone
    if (tones.length >= 2) {
      const tonesByProvider = this.groupByProvider(tones);
      const toneDivergence = this.analyzeToneDivergence(tonesByProvider);

      if (toneDivergence) {
        divergences.push(toneDivergence);
      }
    }

    return divergences;
  }

  /**
   * Group findings by provider
   */
  private groupByProvider(findings: any[]): Map<LlmProvider, any[]> {
    const grouped = new Map<LlmProvider, any[]>();

    // This is a simplified version - in reality, you'd need to track which
    // LLM run produced which finding
    for (const finding of findings) {
      // For now, we'll distribute evenly across providers
      // In production, you'd want to properly track this relationship
      const providers = [LlmProvider.OPENAI, LlmProvider.ANTHROPIC, LlmProvider.GOOGLE];
      const provider = providers[findings.indexOf(finding) % providers.length];

      if (!grouped.has(provider)) {
        grouped.set(provider, []);
      }
      grouped.get(provider)!.push(finding);
    }

    return grouped;
  }

  /**
   * Identify divergent topics in positioning pillars
   */
  private identifyDivergentTopics(pillarsByProvider: Map<LlmProvider, any[]>): {
    name: string;
    perspectives: { provider: LlmProvider; view: string; evidence: string }[];
    explanation: string;
  }[] {
    const topics: any[] = [];

    // Get all unique pillar names
    const allPillars = Array.from(pillarsByProvider.values()).flat();
    const pillarNames = new Set(
      allPillars.map(p => (p.value?.name || '').toLowerCase())
    );

    // Check each pillar for divergent views
    for (const name of pillarNames) {
      const perspectives: any[] = [];

      for (const [provider, pillars] of pillarsByProvider.entries()) {
        const pillar = pillars.find(p =>
          (p.value?.name || '').toLowerCase() === name
        );

        if (pillar) {
          perspectives.push({
            provider,
            view: pillar.value?.description || '',
            evidence: pillar.value?.evidence || '',
          });
        }
      }

      // If perspectives differ significantly, add as divergence
      if (perspectives.length >= 2) {
        const views = perspectives.map(p => p.view.toLowerCase());
        const similarity = this.calculateSimilarity(views[0], views[1]);

        if (similarity < 0.6) {
          topics.push({
            name,
            perspectives,
            explanation: `Models have different perspectives on "${name}" positioning`,
          });
        }
      }
    }

    return topics;
  }

  /**
   * Analyze divergence in tone assessments
   */
  private analyzeToneDivergence(tonesByProvider: Map<LlmProvider, any[]>): Divergence | null {
    const perspectives: any[] = [];

    for (const [provider, tones] of tonesByProvider.entries()) {
      if (tones.length > 0) {
        const tone = tones[0];
        const adjectives = tone.value?.adjectives || [];
        perspectives.push({
          provider,
          view: adjectives.join(', '),
          evidence: tone.value?.exampleSentence || '',
        });
      }
    }

    if (perspectives.length < 2) return null;

    // Check if tone assessments differ
    const allAdjectives = perspectives.flatMap(p => p.view.split(', '));
    const uniqueAdjectives = new Set(allAdjectives.map(a => a.toLowerCase()));

    // If there's low overlap, it's a divergence
    if (uniqueAdjectives.size > allAdjectives.length * 0.6) {
      return {
        topic: 'Tone of Voice',
        modelPerspectives: perspectives,
        explanation: 'Models perceive different tonal qualities in the brand communication',
      };
    }

    return null;
  }

  /**
   * Calculate agreement index (0-100)
   */
  private calculateAgreementIndex(divergenceCount: number, totalFindings: number): number {
    if (totalFindings === 0) return 0;

    // Agreement decreases as divergences increase
    const divergenceRatio = divergenceCount / Math.max(totalFindings / 3, 1);
    const agreement = Math.max(0, 100 - (divergenceRatio * 30));

    return Math.round(agreement);
  }

  /**
   * Extract key phrases from text
   */
  private extractKeyPhrases(text: string): string[] {
    // Simple keyword extraction - in production, use NLP library
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 4); // Only words longer than 4 chars

    // Remove common words
    const stopWords = new Set([
      'about', 'their', 'which', 'would', 'there', 'these', 'those',
      'community', 'brand', 'offers', 'provides', 'features'
    ]);

    return words.filter(word => !stopWords.has(word));
  }

  /**
   * Calculate similarity between two texts (0-1)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }
}

export const consensusAnalyzer = new ConsensusAnalyzer();
