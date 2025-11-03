import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function GET() {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const industries = await prisma.project.groupBy({
      by: ['industry'],
      _count: {
        id: true,
      },
    });

    const industryStats = await Promise.all(
      industries.map(async (industry) => {
        const completed = await prisma.project.count({
          where: {
            industry: industry.industry,
            status: 'COMPLETED',
          },
        });

        const failed = await prisma.project.count({
          where: {
            industry: industry.industry,
            status: 'FAILED',
          },
        });

        const total = industry._count.id;
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';

        return {
          industry: industry.industry,
          count: total,
          completed,
          failed,
          completionRate: parseFloat(completionRate),
        };
      })
    );

    // Sort by count descending
    industryStats.sort((a, b) => b.count - a.count);

    return NextResponse.json({ industries: industryStats });
  } catch (error) {
    console.error('Error fetching industry stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch industry statistics' },
      { status: 500 }
    );
  }
}
