import { NextRequest, NextResponse } from 'next/server';
import { reportGenerator } from '@/lib/services/report-generator';
import { sendReportEmail } from '@/lib/email/resend';

/**
 * POST /api/reports/email
 * Send a report via email using Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email } = body;

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing token or email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Get the report
    const report = await reportGenerator.getReportByToken(token);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get the project for brand URL
    const brandUrl = (report as any).url || 'your brand';

    // Send email via Resend
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${token}`;
    const result = await sendReportEmail(email, reportUrl, brandUrl);

    if (!result.success) {
      console.error('[Email API] Failed to send email:', result.error);
      return NextResponse.json(
        {
          error: 'Failed to send email',
          message: result.error || 'Email service error',
        },
        { status: 500 }
      );
    }

    console.log(`[Email API] Successfully sent report ${token} to ${email}`);

    return NextResponse.json({
      success: true,
      message: `Report sent to ${email}`,
    });
  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

