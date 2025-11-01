import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        findings: {
          orderBy: { createdAt: 'desc' },
        },
        llmRuns: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Format the response with all analysis data
    const response = {
      id: project.id,
      url: project.url,
      email: project.email,
      status: project.status,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,

      // Latest report
      report: project.reports[0] || null,

      // Findings grouped by type
      findings: {
        synopsis: project.findings.find(f => f.kind === 'BRAND_SYNOPSIS')?.value || null,
        pillars: project.findings.filter(f => f.kind === 'POSITIONING_PILLAR').map(f => f.value),
        tone: project.findings.find(f => f.kind === 'TONE_OF_VOICE')?.value || null,
        segments: project.findings.filter(f => f.kind === 'BUYER_SEGMENT').map(f => f.value),
        amenities: project.findings.filter(f => f.kind === 'AMENITY_CLAIM').map(f => f.value),
        trustSignals: project.findings.filter(f => f.kind === 'TRUST_SIGNAL').map(f => f.value),
        messaging: {
          clarity: project.findings.find(f => f.kind === 'CLARITY_SCORE')?.value || null,
          specificity: project.findings.find(f => f.kind === 'SPECIFICITY_SCORE')?.value || null,
          differentiation: project.findings.find(f => f.kind === 'DIFFERENTIATION_SCORE')?.value || null,
          trust: project.findings.find(f => f.kind === 'TRUST_SCORE')?.value || null,
        },
        recommendations: project.findings.filter(f => f.kind === 'RECOMMENDATION').map(f => f.value),
      },

      // LLM runs summary (which providers ran)
      llmAnalyses: project.llmRuns.map(run => ({
        provider: run.provider,
        model: run.model,
        status: run.status,
        tokensUsed: run.tokensUsed,
        cost: run.cost,
        createdAt: run.createdAt,
      })),

      // Analysis metadata
      totalFindings: project.findings.length,
      totalLLMRuns: project.llmRuns.length,
      hasReport: project.reports.length > 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Get project error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch project',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
