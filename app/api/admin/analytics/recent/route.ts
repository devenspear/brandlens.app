import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/helpers';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const authResult = await requireAdmin();
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const projects = await prisma.project.findMany({
      select: {
        id: true,
        url: true,
        industry: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        email: true,
        createdBy: true,
        progressPercent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(limit, 100), // Max 100
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
