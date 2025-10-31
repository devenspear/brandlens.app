import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from '@/lib/debug/api-logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '50');
  const stats = searchParams.get('stats') === 'true';

  if (stats) {
    return NextResponse.json({
      stats: apiLogger.getStats(),
      logs: apiLogger.getLogs(10), // Just show last 10 with stats
    });
  }

  return NextResponse.json({
    logs: apiLogger.getLogs(limit),
  });
}

export async function DELETE() {
  apiLogger.clear();
  return NextResponse.json({ message: 'Logs cleared' });
}
