import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { reportGenerator } from '@/lib/services/report-generator';

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
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // If completed and no report exists, generate one
    if (project.status === 'COMPLETED' && project.reports.length === 0) {
      try {
        const token = await reportGenerator.generateReport(project.id);
        return NextResponse.json({
          id: project.id,
          url: project.url,
          status: project.status,
          reportUrl: `/report/${token}`,
        });
      } catch (error) {
        console.error('Report generation failed:', error);
      }
    }

    return NextResponse.json({
      id: project.id,
      url: project.url,
      status: project.status,
      reportUrl: project.reports[0]
        ? `/report/${project.reports[0].urlToken}`
        : undefined,
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { error: 'Failed to get project' },
      { status: 500 }
    );
  }
}
