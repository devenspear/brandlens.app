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
      select: {
        status: true,
        progressMessage: true,
        progressPercent: true,
        updatedAt: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: project.status,
      progressMessage: project.progressMessage,
      progressPercent: project.progressPercent,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error('[API] Get project progress error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
