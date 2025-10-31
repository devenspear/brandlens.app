import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { brandAnalyzer } from '@/lib/services/brand-analyzer';
import { z } from 'zod';

const createProjectSchema = z.object({
  url: z.string().url('Invalid URL'),
  region: z.string().optional(),
  humanBrandStatement: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    // Create project
    const project = await prisma.project.create({
      data: {
        url: validated.url,
        region: validated.region,
        status: 'PENDING',
      },
    });

    // Start analysis asynchronously
    // In production, use a job queue like BullMQ
    brandAnalyzer.analyzeProject(project.id).catch(error => {
      console.error('Analysis failed:', error);
    });

    return NextResponse.json({
      id: project.id,
      url: project.url,
      status: project.status,
    });
  } catch (error) {
    console.error('Create project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
