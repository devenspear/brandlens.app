import { NextRequest, NextResponse } from 'next/server';
import { reportGenerator } from '@/lib/services/report-generator';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const report = await reportGenerator.getReportByToken(params.token);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    return NextResponse.json(
      { error: 'Failed to get report' },
      { status: 500 }
    );
  }
}
