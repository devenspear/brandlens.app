import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    // Require admin access
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const startTime = Date.now();

    // Test database connection
    let dbConnected = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (error) {
      console.error('[Admin] Database connection failed:', error);
    }

    // Get project stats
    const [
      totalProjects,
      completedProjects,
      analyzingProjects,
      scrapingProjects,
      failedProjects,
      pendingProjects,
      recentProjects,
      allLlmRuns,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({ where: { status: 'ANALYZING' } }),
      prisma.project.count({ where: { status: 'SCRAPING' } }),
      prisma.project.count({ where: { status: 'FAILED' } }),
      prisma.project.count({ where: { status: 'PENDING' } }),
      prisma.project.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          url: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          email: true,
        },
      }),
      prisma.llmRun.findMany({
        select: {
          provider: true,
          status: true,
          tokensUsed: true,
          cost: true,
          createdAt: true,
        },
      }),
    ]);

    // Calculate provider stats
    const providerStats: Record<string, any> = {
      OPENAI: { total: 0, completed: 0, failed: 0, successRate: 0, totalCost: 0, totalTokens: 0, avgTokens: 0 },
      ANTHROPIC: { total: 0, completed: 0, failed: 0, successRate: 0, totalCost: 0, totalTokens: 0, avgTokens: 0 },
      GOOGLE: { total: 0, completed: 0, failed: 0, successRate: 0, totalCost: 0, totalTokens: 0, avgTokens: 0 },
    };

    allLlmRuns.forEach((run) => {
      const provider = run.provider;
      if (providerStats[provider]) {
        providerStats[provider].total++;
        if (run.status === 'COMPLETED') providerStats[provider].completed++;
        if (run.status === 'FAILED') providerStats[provider].failed++;
        providerStats[provider].totalCost += run.cost || 0;
        providerStats[provider].totalTokens += run.tokensUsed || 0;
      }
    });

    // Calculate success rates and averages
    Object.values(providerStats).forEach((stats: any) => {
      stats.successRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      stats.avgTokens = stats.completed > 0 ? stats.totalTokens / stats.completed : 0;
    });

    // Calculate performance metrics
    // Note: We don't have completedAt timestamps, so avgAnalysisTime is estimated
    const avgAnalysisTime = 0; // TODO: Add timestamps to track actual analysis time

    const totalCost = allLlmRuns.reduce((sum, run) => sum + (run.cost || 0), 0);
    const totalTokens = allLlmRuns.reduce((sum, run) => sum + (run.tokensUsed || 0), 0);
    const avgCostPerAnalysis = completedProjects > 0 ? totalCost / completedProjects : 0;

    // User analytics
    const allProjects = await prisma.project.findMany({
      select: { email: true },
    });

    const emailSet = new Set(allProjects.map((p) => p.email));
    const domainCounts: Record<string, number> = {};

    allProjects.forEach((p) => {
      const domain = p.email.split('@')[1] || 'unknown';
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    });

    const topDomains = Object.entries(domainCounts)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const response = {
      system: {
        uptime: Date.now() - startTime,
        dbConnected,
        timestamp: new Date().toISOString(),
      },
      projects: {
        total: totalProjects,
        completed: completedProjects,
        analyzing: analyzingProjects,
        scraping: scrapingProjects,
        failed: failedProjects,
        pending: pendingProjects,
      },
      providers: providerStats,
      performance: {
        avgAnalysisTime,
        totalCost,
        avgCostPerAnalysis,
        totalTokens,
      },
      recent: recentProjects,
      users: {
        totalEmails: emailSet.size,
        topDomains,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[Admin] Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
