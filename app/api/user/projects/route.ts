import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to view your projects' },
        { status: 401 }
      );
    }

    // Fetch user's projects
    const projects = await prisma.project.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      url: project.url,
      status: project.status,
      industry: project.industry,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      progressMessage: project.progressMessage,
      progressPercent: project.progressPercent,
      reportUrl: project.reports[0] ? `/report/${project.reports[0].urlToken}` : null,
    }));

    return NextResponse.json({
      projects: formattedProjects,
      total: formattedProjects.length,
    });
  } catch (error) {
    console.error('[API] Error fetching user projects:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
