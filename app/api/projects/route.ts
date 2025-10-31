import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { brandAnalyzer } from '@/lib/services/brand-analyzer';
import { apiLogger } from '@/lib/debug/api-logger';
import { z } from 'zod';

const createProjectSchema = z.object({
  url: z.string().url('Invalid URL'),
  email: z.string().email('Invalid email address'),
  region: z.string().optional(),
  humanBrandStatement: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logId = apiLogger.logRequest('POST', '/api/projects');

  try {
    const body = await request.json();
    console.log('[API] POST /api/projects - Request body:', JSON.stringify(body, null, 2));

    // Log request body
    apiLogger.logRequest('POST', '/api/projects', body);

    const validated = createProjectSchema.parse(body);
    console.log('[API] Validated data:', JSON.stringify(validated, null, 2));

    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('[API] Database connection: OK');
    } catch (dbError) {
      console.error('[API] Database connection failed:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
    }

    // Create project
    console.log('[API] Creating project in database...');
    const project = await prisma.project.create({
      data: {
        url: validated.url,
        email: validated.email,
        region: validated.region,
        status: 'PENDING',
      },
    });
    console.log('[API] Project created:', project.id);

    const duration = Date.now() - startTime;
    apiLogger.logResponse(logId, 200, duration, { id: project.id });

    // Start analysis asynchronously
    // In production, use a job queue like BullMQ
    console.log('[API] 🤖 Starting AI analysis');
    brandAnalyzer.analyzeProject(project.id).catch(error => {
      console.error('[API] Analysis failed:', error);
    });

    return NextResponse.json({
      id: project.id,
      url: project.url,
      status: project.status,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[API] Create project error:', {
      message: errorMessage,
      stack: errorStack,
      error: error,
    });

    apiLogger.logError(logId, errorMessage);

    if (error instanceof z.ZodError) {
      apiLogger.logResponse(logId, 400, duration);
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.issues,
          message: 'Validation failed. Please check your input.',
        },
        { status: 400 }
      );
    }

    apiLogger.logResponse(logId, 500, duration);
    return NextResponse.json(
      {
        error: 'Failed to create project',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
      { status: 500 }
    );
  }
}
