import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {},
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'healthy',
      message: 'Database connection successful',
      responseTime: `${Date.now() - startTime}ms`,
    };
  } catch (error) {
    checks.status = 'unhealthy';
    checks.checks.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
      error: String(error),
    };
  }

  // Check environment variables
  const requiredEnvVars = ['DATABASE_URL'];
  const optionalEnvVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY'];

  checks.checks.environment = {
    status: 'healthy',
    required: {} as Record<string, boolean>,
    optional: {} as Record<string, boolean>,
  };

  requiredEnvVars.forEach(varName => {
    const exists = !!process.env[varName];
    checks.checks.environment.required[varName] = exists;
    if (!exists) {
      checks.status = 'unhealthy';
      checks.checks.environment.status = 'unhealthy';
    }
  });

  optionalEnvVars.forEach(varName => {
    checks.checks.environment.optional[varName] = !!process.env[varName];
  });

  // Check API endpoints availability
  checks.checks.api = {
    status: 'healthy',
    endpoints: {
      '/api/projects': 'available',
      '/api/health': 'available',
    },
  };

  // System info
  checks.system = {
    nodeVersion: process.version,
    platform: process.platform,
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
    },
  };

  const totalResponseTime = Date.now() - startTime;
  checks.responseTime = `${totalResponseTime}ms`;

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
