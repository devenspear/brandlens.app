import { NextRequest, NextResponse } from 'next/server';
import { benchmarkService } from '@/lib/services/benchmark-service';
import { Industry } from '@prisma/client';

/**
 * POST /api/admin/benchmarks
 * Calculate industry benchmarks
 *
 * Example body:
 * {
 *   "action": "calculate",
 *   "industry": "RESIDENTIAL_REAL_ESTATE",
 *   "metrics": ["clarity_score", "trust_score"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, industry, metrics, projectId } = body;

    // Action: Calculate benchmarks
    if (action === 'calculate') {
      if (!industry || !metrics || !Array.isArray(metrics)) {
        return NextResponse.json(
          { error: 'Missing required fields: industry, metrics' },
          { status: 400 }
        );
      }

      const results = [];
      for (const metric of metrics) {
        await benchmarkService.calculateIndustryBenchmark(
          industry as Industry,
          metric
        );
        results.push({ metric, status: 'calculated' });
      }

      return NextResponse.json({
        success: true,
        industry,
        results,
      });
    }

    // Action: Compare project to industry
    if (action === 'compare') {
      if (!projectId) {
        return NextResponse.json(
          { error: 'Missing projectId' },
          { status: 400 }
        );
      }

      const comparisons = await benchmarkService.compareToIndustry(projectId);

      return NextResponse.json({
        success: true,
        projectId,
        comparisons,
      });
    }

    // Action: Tag as training data
    if (action === 'tag') {
      if (!projectId) {
        return NextResponse.json(
          { error: 'Missing projectId' },
          { status: 400 }
        );
      }

      const result = await benchmarkService.tagAsTrainingData(projectId, {
        qualityRating: body.qualityRating,
        isReferenceExample: body.isReferenceExample,
        isBenchmark: body.isBenchmark,
        brandTags: body.brandTags,
        characteristics: body.characteristics,
        notes: body.notes,
      });

      return NextResponse.json({
        success: true,
        trainingDataset: result,
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Supported: calculate, compare, tag' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Benchmarks API] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/benchmarks?industry=RESIDENTIAL_REAL_ESTATE&metric=clarity_score
 * Get industry benchmark data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry') as Industry;
    const metric = searchParams.get('metric');

    if (!industry || !metric) {
      return NextResponse.json(
        { error: 'Missing required params: industry, metric' },
        { status: 400 }
      );
    }

    const benchmark = await benchmarkService.getIndustryBenchmark(
      industry,
      metric
    );

    if (!benchmark) {
      return NextResponse.json(
        {
          error: 'No benchmark data available',
          hint: 'Run POST /api/admin/benchmarks with action=calculate to generate',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      benchmark,
    });
  } catch (error) {
    console.error('[Benchmarks API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benchmark' },
      { status: 500 }
    );
  }
}
