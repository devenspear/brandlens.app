import { prisma } from '../prisma/client';
import { Industry, ComparisonType, InsightType } from '@prisma/client';

/**
 * Benchmark Service
 *
 * Handles industry benchmarking, training data management, and comparative analysis
 * Leverages historical project data to provide context and insights
 */
export class BenchmarkService {
  /**
   * Calculate and store industry benchmarks for a specific metric
   */
  async calculateIndustryBenchmark(
    industry: Industry,
    metric: string,
    periodStart?: Date,
    periodEnd?: Date
  ): Promise<void> {
    // Get all completed projects in this industry within the period
    const projects = await prisma.project.findMany({
      where: {
        industry,
        status: 'COMPLETED',
        ...(periodStart && periodEnd
          ? {
              createdAt: {
                gte: periodStart,
                lte: periodEnd,
              },
            }
          : {}),
      },
      include: {
        findings: {
          where: {
            kind: this.metricToFindingKind(metric),
          },
        },
      },
    });

    // Extract scores
    const scores = projects
      .flatMap((p) => p.findings)
      .map((f) => (f.value as any)?.score)
      .filter((s) => typeof s === 'number');

    if (scores.length === 0) {
      console.log(`No data available for ${industry} - ${metric}`);
      return;
    }

    // Calculate statistics
    const sorted = scores.sort((a, b) => a - b);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const percentile25 = sorted[Math.floor(sorted.length * 0.25)];
    const percentile75 = sorted[Math.floor(sorted.length * 0.75)];
    const percentile90 = sorted[Math.floor(sorted.length * 0.9)];

    // Calculate standard deviation
    const squareDiffs = scores.map((score) => Math.pow(score - average, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const standardDeviation = Math.sqrt(avgSquareDiff);

    // Store benchmark
    await prisma.industryBenchmark.create({
      data: {
        industry,
        metric,
        average,
        median,
        percentile25,
        percentile75,
        percentile90,
        standardDeviation,
        sampleSize: scores.length,
        minValue: Math.min(...scores),
        maxValue: Math.max(...scores),
        dataSourcePeriodStart: periodStart,
        dataSourcePeriodEnd: periodEnd,
      },
    });

    console.log(`✅ Benchmark calculated for ${industry} - ${metric}:`);
    console.log(`   Sample size: ${scores.length}`);
    console.log(`   Average: ${average.toFixed(1)}`);
    console.log(`   Median: ${median.toFixed(1)}`);
  }

  /**
   * Get industry benchmark for comparison
   */
  async getIndustryBenchmark(industry: Industry, metric: string) {
    return prisma.industryBenchmark.findFirst({
      where: { industry, metric },
      orderBy: { calculatedAt: 'desc' },
    });
  }

  /**
   * Compare a project against industry benchmarks
   */
  async compareToIndustry(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { findings: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const metrics = ['clarity', 'specificity', 'differentiation', 'trust'];
    const comparisons: any[] = [];

    for (const metric of metrics) {
      const benchmark = await this.getIndustryBenchmark(
        project.industry,
        `${metric}_score`
      );

      if (!benchmark) continue;

      const finding = project.findings.find(
        (f) => f.kind === this.metricToFindingKind(`${metric}_score`)
      );

      if (!finding) continue;

      const score = (finding.value as any)?.score;
      if (typeof score !== 'number') continue;

      const percentile = this.calculatePercentile(
        score,
        benchmark.percentile25,
        benchmark.median,
        benchmark.percentile75,
        benchmark.percentile90
      );

      comparisons.push({
        metric,
        score,
        industryAverage: benchmark.average,
        industryMedian: benchmark.median,
        percentile,
        status:
          score > benchmark.percentile75
            ? 'above_average'
            : score < benchmark.percentile25
            ? 'below_average'
            : 'average',
      });
    }

    return comparisons;
  }

  /**
   * Tag a project as training data
   */
  async tagAsTrainingData(
    projectId: string,
    options: {
      qualityRating?: number;
      isReferenceExample?: boolean;
      isBenchmark?: boolean;
      brandTags?: string[];
      characteristics?: string[];
      notes?: string;
    }
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return prisma.trainingDataset.upsert({
      where: { projectId },
      create: {
        projectId,
        industry: project.industry,
        qualityRating: options.qualityRating,
        isReferenceExample: options.isReferenceExample || false,
        isBenchmark: options.isBenchmark || false,
        brandTags: options.brandTags || [],
        characteristics: options.characteristics || [],
        notes: options.notes,
      },
      update: {
        qualityRating: options.qualityRating,
        isReferenceExample: options.isReferenceExample,
        isBenchmark: options.isBenchmark,
        brandTags: options.brandTags,
        characteristics: options.characteristics,
        notes: options.notes,
      },
    });
  }

  /**
   * Create a brand comparison entry
   */
  async createComparison(
    primaryProjectId: string,
    compareProjectId: string | null,
    comparisonType: ComparisonType,
    comparisonData: any,
    tags?: string[]
  ) {
    const primaryProject = await prisma.project.findUnique({
      where: { id: primaryProjectId },
    });

    if (!primaryProject) {
      throw new Error('Primary project not found');
    }

    const compareProject = compareProjectId
      ? await prisma.project.findUnique({
          where: { id: compareProjectId },
        })
      : null;

    return prisma.brandComparison.create({
      data: {
        primaryProjectId,
        primaryUrl: primaryProject.url,
        primaryIndustry: primaryProject.industry,
        compareProjectId: compareProjectId,
        compareUrl: compareProject?.url,
        comparisonType,
        comparisonData,
        tags: tags || [],
      },
    });
  }

  /**
   * Store an insight discovered from analysis
   */
  async storeInsight(
    projectId: string,
    insightType: InsightType,
    title: string,
    description: string,
    data: any,
    confidence?: number,
    basedOnSample?: number
  ) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return prisma.brandInsight.create({
      data: {
        projectId,
        industry: project.industry,
        insightType,
        title,
        description,
        data,
        confidence,
        basedOnSample,
      },
    });
  }

  /**
   * Get reference examples for an industry
   */
  async getReferenceExamples(industry: Industry, limit: number = 10) {
    return prisma.trainingDataset.findMany({
      where: {
        industry,
        isReferenceExample: true,
      },
      orderBy: {
        qualityRating: 'desc',
      },
      take: limit,
    });
  }

  // Helper methods

  private metricToFindingKind(metric: string): any {
    const map: Record<string, string> = {
      clarity_score: 'CLARITY_SCORE',
      specificity_score: 'SPECIFICITY_SCORE',
      differentiation_score: 'DIFFERENTIATION_SCORE',
      trust_score: 'TRUST_SCORE',
    };
    return map[metric] || metric;
  }

  private calculatePercentile(
    score: number,
    p25: number,
    median: number,
    p75: number,
    p90: number
  ): number {
    if (score <= p25) return 25;
    if (score <= median) return 25 + ((score - p25) / (median - p25)) * 25;
    if (score <= p75) return 50 + ((score - median) / (p75 - median)) * 25;
    if (score <= p90) return 75 + ((score - p75) / (p90 - p75)) * 15;
    return 90 + Math.min((score - p90) / (100 - p90) * 10, 10);
  }
}

export const benchmarkService = new BenchmarkService();
