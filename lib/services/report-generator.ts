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

      humanVLLM: this.buildHumanVLLMComparison(project),

      recommendations: this.buildRecommendations(project),

      metadata: {
        pagesAnalyzed: project.sources.length,
        tokensUsed: project.llmRuns.reduce((sum, run) => sum + (run.tokensUsed || 0), 0),
        cost: project.llmRuns.reduce((sum, run) => sum + (run.cost || 0), 0),
        processingTime: project.updatedAt.getTime() - project.createdAt.getTime(),
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
    const consensus = project.findings.filter((f: any) => f.kind === 'BRAND_SYNOPSIS');
    const recommendations = project.findings.filter((f: any) => f.kind === 'RECOMMENDATION');

    // Generate a more insightful overview
    let overview = 'This AI-powered brand audit reveals several key insights. ';
    if (consensus.length > 0) {
      const mainTheme = consensus[0].value?.summary || 'a focus on modern living';
      overview += `The consensus view highlights ${mainTheme}. However, there are divergences in how different AI models perceive the brand's tone and key differentiators, suggesting opportunities to improve messaging clarity.`;
    } else {
      overview += 'The analysis was inconclusive, indicating a lack of clear brand messaging on the website.';
    }

    // Get top 5 recommendations by impact
    const topActions = this.buildRecommendations(project).slice(0, 5);

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

      const findings = project.findings.filter((f: any) => f.llmRunId === run.id);

      const synopsis = findings.find((f: any) => f.kind === 'BRAND_SYNOPSIS');
      const pillars = findings.filter((f: any) => f.kind === 'POSITIONING_PILLAR');
      const tone = findings.find((f: any) => f.kind === 'TONE_OF_VOICE');
      const segments = findings.filter((f: any) => f.kind === 'BUYER_SEGMENT');
      const amenities = findings.filter((f: any) => f.kind === 'AMENITY_CLAIM');
      const trustSignals = findings.filter((f: any) => f.kind === 'TRUST_SIGNAL');

      perspectives.push({
        provider,
        model: run.model,
        synopsis: {
          summary: synopsis?.value?.summary || 'No synopsis generated.',
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
    const scores: any = {};
    const scoreKinds = ['CLARITY_SCORE', 'SPECIFICITY_SCORE', 'DIFFERENTIATION_SCORE', 'TRUST_SCORE'];

    for (const kind of scoreKinds) {
      const findings = project.findings.filter((f: any) => f.kind === kind);
      if (findings.length > 0) {
        // Average the scores from different models
        const avgScore = findings.reduce((acc: number, f: any) => acc + (f.value?.score || 0), 0) / findings.length;
        const level = avgScore > 75 ? 'high' : avgScore > 50 ? 'medium' : 'low';
        scores[kind.replace('_SCORE', '').toLowerCase()] = {
          level,
          score: Math.round(avgScore),
          rationale: findings[0].value?.rationale || 'Analysis pending',
          evidence: findings[0].value?.evidence || [],
        };
      } else {
        scores[kind.replace('_SCORE', '').toLowerCase()] = this.getDefaultScore(kind.replace('_SCORE', '').toLowerCase());
      }
    }

    return scores;
  }

  /**
   * Build human vs LLM comparison
   */
  private buildHumanVLLMComparison(project: any): any {
    if (!project.humanBrandStatement) {
      return null;
    }

    const llmConsensus = project.findings.find((f: any) => f.kind === 'BRAND_SYNOPSIS');

    return {
      humanStatement: project.humanBrandStatement,
      llmConsensus: llmConsensus?.value?.summary || 'No consensus summary available.',
      alignment: [], // Placeholder for alignment analysis
      gaps: [], // Placeholder for gap analysis
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
