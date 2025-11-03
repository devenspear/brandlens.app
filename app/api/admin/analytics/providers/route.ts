import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';
import { LlmProvider } from '@prisma/client';

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const providers = await prisma.llmRun.groupBy({
      by: ['provider'],
      _count: {
        id: true,
      },
      _sum: {
        tokensUsed: true,
        cost: true,
      },
      _avg: {
        tokensUsed: true,
        cost: true,
      },
    });

    const providerStats: Record<string, any> = {};

    for (const provider of providers) {
      const successful = await prisma.llmRun.count({
        where: {
          provider: provider.provider,
          status: 'COMPLETED',
        },
      });

      const failed = await prisma.llmRun.count({
        where: {
          provider: provider.provider,
          status: 'FAILED',
        },
      });

      const totalRuns = provider._count.id;
      const successRate = totalRuns > 0 ? ((successful / totalRuns) * 100).toFixed(1) : '0.0';

      providerStats[provider.provider] = {
        totalRuns,
        successful,
        failed,
        successRate: parseFloat(successRate),
        avgTokens: Math.round(provider._avg.tokensUsed || 0),
        totalTokens: provider._sum.tokensUsed || 0,
        totalCost: provider._sum.cost || 0,
        avgCost: provider._avg.cost || 0,
      };
    }

    // Ensure all providers are represented even if no data
    const allProviders: LlmProvider[] = ['OPENAI', 'ANTHROPIC', 'GOOGLE'];
    allProviders.forEach((provider) => {
      if (!providerStats[provider]) {
        providerStats[provider] = {
          totalRuns: 0,
          successful: 0,
          failed: 0,
          successRate: 0,
          avgTokens: 0,
          totalTokens: 0,
          totalCost: 0,
          avgCost: 0,
        };
      }
    });

    return NextResponse.json(providerStats);
  } catch (error) {
    console.error('Error fetching provider stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch provider statistics' },
      { status: 500 }
    );
  }
}
