import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total projects
    const totalProjects = await prisma.project.count();

    // Active analyses (SCRAPING or ANALYZING)
    const activeAnalyses = await prisma.project.count({
      where: {
        status: {
          in: ['SCRAPING', 'ANALYZING'],
        },
      },
    });

    // Completed today
    const completedToday = await prisma.project.count({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          gte: startOfToday,
        },
      },
    });

    // Success rate (completed / total non-pending)
    const completedTotal = await prisma.project.count({
      where: { status: 'COMPLETED' },
    });
    const failedTotal = await prisma.project.count({
      where: { status: 'FAILED' },
    });
    const successRate = completedTotal + failedTotal > 0
      ? ((completedTotal / (completedTotal + failedTotal)) * 100).toFixed(1)
      : '0.0';

    // Average analysis time (for completed projects)
    const completedProjects = await prisma.project.findMany({
      where: { status: 'COMPLETED' },
      select: {
        createdAt: true,
        updatedAt: true,
      },
      take: 100, // Last 100 to get reasonable average
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const avgTimeMs = completedProjects.length > 0
      ? completedProjects.reduce((sum, p) => {
          return sum + (p.updatedAt.getTime() - p.createdAt.getTime());
        }, 0) / completedProjects.length
      : 0;

    const avgMinutes = Math.floor(avgTimeMs / 60000);
    const avgSeconds = Math.floor((avgTimeMs % 60000) / 1000);
    const avgAnalysisTime = `${avgMinutes}m ${avgSeconds}s`;

    // Total cost this month
    const totalCostMTD = await prisma.llmRun.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
        cost: {
          not: null,
        },
      },
      _sum: {
        cost: true,
      },
    });

    // Pending projects
    const pendingProjects = await prisma.project.count({
      where: { status: 'PENDING' },
    });

    // Failed projects
    const failedProjects = await prisma.project.count({
      where: { status: 'FAILED' },
    });

    return NextResponse.json({
      totalProjects,
      activeAnalyses,
      completedToday,
      pendingProjects,
      failedProjects,
      successRate: parseFloat(successRate),
      avgAnalysisTime,
      totalCostMTD: totalCostMTD._sum.cost || 0,
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
