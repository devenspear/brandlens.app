import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/helpers';
import { prisma } from '@/lib/prisma/client';
import { brandAnalyzer } from '@/lib/services/brand-analyzer';
import { apiLogger } from '@/lib/debug/api-logger';
import { z } from 'zod';
import { Industry } from '@prisma/client';

const createProjectSchema = z.object({
  url: z.string().url('Invalid URL'),
  email: z.string().email('Invalid email address').optional(), // Optional since we get it from Clerk
  industry: z.nativeEnum(Industry).default(Industry.RESIDENTIAL_REAL_ESTATE),
  region: z.string().optional(),
  humanBrandStatement: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logId = apiLogger.logRequest('POST', '/api/projects');

  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult; // Return error response
    }

    const { userId, email: userEmail } = authResult;

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
        email: userEmail, // Use Clerk user's email
        industry: validated.industry,
        region: validated.region,
        humanBrandStatement: validated.humanBrandStatement,
        status: 'PENDING',
        createdBy: userId, // Associate with Clerk user
      },
    });
    console.log('[API] Project created:', project.id, 'Industry:', validated.industry, 'User:', userId);

    const duration = Date.now() - startTime;
    apiLogger.logResponse(logId, 200, duration, { id: project.id });

    // Start analysis asynchronously (don't wait for completion)
    // This allows the frontend to immediately show progress tracking
    console.log('[API] 🤖 Starting AI analysis asynchronously');
    brandAnalyzer.analyzeProject(project.id).catch((error) => {
      console.error('[API] Analysis failed:', error);
    });

    // Return project info immediately so frontend can show progress
    return NextResponse.json({
      id: project.id,
      url: project.url,
      status: 'PENDING',
      message: 'Analysis started successfully',
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
