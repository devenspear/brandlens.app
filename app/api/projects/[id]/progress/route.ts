import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyOwnership } from '@/lib/auth/helpers';
import { prisma } from '@/lib/prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      select: {
        status: true,
        progressMessage: true,
        progressPercent: true,
        updatedAt: true,
        createdBy: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user owns this project
    const ownershipError = verifyOwnership(authResult, project.createdBy);
    if (ownershipError) {
      return ownershipError;
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
