import { nanoid } from 'nanoid';
import { prisma } from '../prisma/client';
import { consensusAnalyzer } from './consensus-analyzer';
import { BrandAuditReport, Recommendation } from '../types';
import { LlmProvider } from '@prisma/client';

export class ReportGenerator {
  /**
   * Generate a complete brand audit report
   */
  async generateReport(projectId: string): Promise<string> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        sources: true,
        llmRuns: true,
        findings: true,
        competitors: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Build the report
    const report: BrandAuditReport = {
      projectId,
      url: project.url,
      region: project.region || undefined,
      generatedAt: new Date(),

      executiveSummary: this.buildExecutiveSummary(project),

      modelPerspectives: this.buildModelPerspectives(project),

      consensus: await consensusAnalyzer.analyzeConsensus(projectId),

      positioning: this.buildPositioningGrid(project),

      messaging: this.buildMessagingScores(project),

      recommendations: this.buildRecommendations(project),

      metadata: {
        pagesAnalyzed: project.sources.length,
        tokensUsed: project.llmRuns.reduce((sum, run) => sum + (run.tokensUsed || 0), 0),
        cost: project.llmRuns.reduce((sum, run) => sum + (run.cost || 0), 0),
        processingTime: 0, // Calculate from timestamps if needed
      },
    };

    // Save report
    const urlToken = nanoid(16);
    await prisma.report.create({
      data: {
        projectId,
        urlToken,
        isPublic: false,
        version: 1,
        data: report as any,
      },
    });

    return urlToken;
  }

  /**
   * Build executive summary
   */
  private buildExecutiveSummary(project: any): {
    overview: string;
    topActions: Recommendation[];
  } {
    const synopses = project.findings.filter((f: any) => f.kind === 'BRAND_SYNOPSIS');
    const recommendations = project.findings.filter((f: any) => f.kind === 'RECOMMENDATION');

    // Combine synopses for overview
    let overview = 'Based on analysis from multiple AI models, ';
    if (synopses.length > 0) {
      const firstSynopsis = synopses[0].value?.summary || 'this community presents a unique brand positioning.';
      overview += firstSynopsis;
    } else {
      overview += 'this community requires further brand clarity and positioning refinement.';
    }

    // Get top 5 recommendations by impact
    const topActions = recommendations
      .map((r: any) => r.value as Recommendation)
      .filter((r: Recommendation) => r && r.impact)
      .sort((a: Recommendation, b: Recommendation) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 5);

    return { overview, topActions };
  }

  /**
   * Build model perspectives section
   */
  private buildModelPerspectives(project: any): {
    provider: LlmProvider;
    model: string;
    synopsis: any;
  }[] {
    const perspectives: any[] = [];
    const providers = [LlmProvider.OPENAI, LlmProvider.ANTHROPIC, LlmProvider.GOOGLE];

    for (const provider of providers) {
      const run = project.llmRuns.find((r: any) => r.provider === provider && r.status === 'COMPLETED');
      if (!run) continue;

      const synopsis = project.findings.find(
        (f: any) => f.kind === 'BRAND_SYNOPSIS'
        // In production, you'd filter by the specific LLM run
      );

      const pillars = project.findings.filter(
        (f: any) => f.kind === 'POSITIONING_PILLAR'
      ).slice(0, 5);

      const tone = project.findings.find((f: any) => f.kind === 'TONE_OF_VOICE');

      const segments = project.findings.filter(
        (f: any) => f.kind === 'BUYER_SEGMENT'
      ).slice(0, 3);

      const amenities = project.findings.filter(
        (f: any) => f.kind === 'AMENITY_CLAIM'
      ).slice(0, 10);

      const trustSignals = project.findings.filter(
        (f: any) => f.kind === 'TRUST_SIGNAL'
      );

      perspectives.push({
        provider,
        model: run.model,
        synopsis: {
          summary: synopsis?.value?.summary || '',
          pillars: pillars.map((p: any) => p.value),
          toneOfVoice: tone?.value || {},
          segments: segments.map((s: any) => s.value),
          amenities: amenities.map((a: any) => a.value),
          trustSignals: trustSignals.map((t: any) => t.value),
        },
      });
    }

    return perspectives;
  }

  /**
   * Build positioning grid
   */
  private buildPositioningGrid(project: any): any {
    // For now, return a basic structure
    // In production, this would use actual competitor data
    return {
      axes: {
        x: { label: 'Value', min: 'Attainable', max: 'Luxury' },
        y: { label: 'Style', min: 'Traditional', max: 'Modern' },
      },
      subject: {
        name: new URL(project.url).hostname,
        url: project.url,
        positioning: { x: 0, y: 0 },
      },
      competitors: project.competitors.map((c: any) => ({
        name: c.name,
        url: c.url,
        positioning: {
          x: c.axisX || 0,
          y: c.axisY || 0,
        },
        tagline: c.notes,
      })),
      whiteSpace: [],
      claimOverlaps: [],
    };
  }

  /**
   * Build messaging scores
   */
  private buildMessagingScores(project: any): any {
    const clarity = project.findings.find((f: any) => f.kind === 'CLARITY_SCORE');
    const specificity = project.findings.find((f: any) => f.kind === 'SPECIFICITY_SCORE');
    const differentiation = project.findings.find((f: any) => f.kind === 'DIFFERENTIATION_SCORE');
    const trust = project.findings.find((f: any) => f.kind === 'TRUST_SCORE');

    return {
      clarity: clarity?.value || this.getDefaultScore('clarity'),
      specificity: specificity?.value || this.getDefaultScore('specificity'),
      differentiation: differentiation?.value || this.getDefaultScore('differentiation'),
      trust: trust?.value || this.getDefaultScore('trust'),
    };
  }

  /**
   * Build recommendations list
   */
  private buildRecommendations(project: any): Recommendation[] {
    const recommendations = project.findings
      .filter((f: any) => f.kind === 'RECOMMENDATION')
      .map((f: any) => f.value as Recommendation)
      .filter((r: Recommendation) => r && r.title);

    // Deduplicate and sort by impact
    const unique = new Map<string, Recommendation>();
    for (const rec of recommendations) {
      if (!unique.has(rec.title)) {
        unique.set(rec.title, rec);
      }
    }

    return Array.from(unique.values())
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 10);
  }

  /**
   * Get default score structure
   */
  private getDefaultScore(dimension: string): any {
    return {
      level: 'medium',
      score: 50,
      rationale: `${dimension} analysis pending`,
      evidence: [],
      recommendations: [],
    };
  }

  /**
   * Get report by token
   */
  async getReportByToken(token: string): Promise<BrandAuditReport | null> {
    const report = await prisma.report.findUnique({
      where: { urlToken: token },
    });

    if (!report) return null;

    return report.data as any as BrandAuditReport;
  }
}

export const reportGenerator = new ReportGenerator();
