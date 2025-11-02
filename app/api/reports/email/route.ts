import { NextRequest, NextResponse } from 'next/server';
import { reportGenerator } from '@/lib/services/report-generator';

/**
 * POST /api/reports/email
 * Send a report via email
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

    // TODO: Implement email sending service
    // For now, we'll return a placeholder success response
    // In production, you would integrate with:
    // - SendGrid
    // - AWS SES
    // - Resend
    // - Postmark
    // etc.

    console.log(`[Email API] Would send report ${token} to ${email}`);
    console.log(`[Email API] Report URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${token}`);

    // Placeholder response
    // When implementing actual email service, uncomment and use:
    /*
    await sendEmail({
      to: email,
      subject: `BrandLens Report for ${report.url}`,
      html: generateReportEmail(report, token),
    });
    */

    return NextResponse.json({
      success: true,
      message: `Report would be sent to ${email} (email service not yet configured)`,
    });

  } catch (error) {
    console.error('[Email API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

/**
 * Generate HTML email template for report
 * This would be used with the actual email service
 */
function generateReportEmail(report: any, token: string): string {
  const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/report/${token}`;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BrandLens Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">BrandLens</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">AI-Powered Brand Analysis</p>
        </div>

        <div style="background: white; padding: 30px; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px;">
          <h2 style="color: #1a202c; margin-top: 0;">Your Brand Audit Report is Ready</h2>

          <p>We've completed the AI-powered analysis for:</p>

          <div style="background: #f7fafc; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0;">
            <strong style="color: #2d3748; font-family: monospace;">${report.url}</strong>
          </div>

          <p>Your comprehensive report includes:</p>
          <ul style="color: #4a5568;">
            <li>Multi-model AI perspective analysis</li>
            <li>Brand messaging effectiveness scores</li>
            <li>Competitive positioning insights</li>
            <li>Actionable recommendations</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View Your Report</a>
          </div>

          <p style="color: #718096; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <strong>Note:</strong> This report contains AI-generated analysis based on public website content. Results reflect AI interpretation and should be used as one input among many in your marketing decisions.
          </p>
        </div>

        <div style="text-align: center; padding: 20px; color: #a0aec0; font-size: 12px;">
          <p>© ${new Date().getFullYear()} BrandLens. All rights reserved.</p>
          <p>Report generated on ${new Date(report.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
    </html>
  `;
}
