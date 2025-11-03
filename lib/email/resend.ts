import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('[Resend] API key not configured - email sending will fail');
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send report email with BrandLens branding
 */
export async function sendReportEmail(
  to: string,
  reportUrl: string,
  brandUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BrandLens <reports@brandlens.app>',
      to,
      subject: `Your BrandLens Report for ${brandUrl}`,
      html: generateReportEmailHTML(reportUrl, brandUrl),
    });

    if (error) {
      console.error('[Resend] Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('[Resend] Email sent successfully:', data?.id);
    return { success: true };
  } catch (error) {
    console.error('[Resend] Exception sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML email template
 */
function generateReportEmailHTML(reportUrl: string, brandUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BrandLens Report</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">BrandLens</h1>
          <p style="color: rgba(255,255,255,0.95); margin: 12px 0 0 0; font-size: 16px;">AI-Powered Brand Analysis</p>
        </div>

        <!-- Body -->
        <div style="background: white; padding: 40px 30px; border: 1px solid #e2e8f0; border-top: none;">
          <h2 style="color: #1a202c; margin-top: 0; font-size: 24px; font-weight: 600;">Your Brand Analysis is Ready 🎯</h2>

          <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">We've completed the AI-powered analysis for:</p>

          <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 20px; border-left: 4px solid #667eea; margin: 24px 0; border-radius: 4px;">
            <strong style="color: #2d3748; font-family: 'Monaco', 'Courier New', monospace; font-size: 15px; word-break: break-all;">${brandUrl}</strong>
          </div>

          <p style="color: #4a5568; font-size: 16px; margin-top: 28px; margin-bottom: 16px;">Your comprehensive report includes:</p>

          <ul style="color: #4a5568; font-size: 15px; line-height: 1.8; padding-left: 20px;">
            <li>Multi-model AI perspective analysis (OpenAI, Anthropic, Google)</li>
            <li>Brand messaging effectiveness scores</li>
            <li>Competitive positioning insights</li>
            <li>Brand profile visualization</li>
            <li>Actionable recommendations with industry examples</li>
          </ul>

          <div style="text-align: center; margin: 40px 0 32px 0;">
            <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
              View Your Report →
            </a>
          </div>

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; margin-top: 32px; border-radius: 4px;">
            <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
              <strong>⚠️ Important:</strong> This report contains AI-generated analysis based on public website content. Results reflect AI interpretation and should be used as one input among many in your marketing decisions.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: white; padding: 24px 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 13px; margin: 0;">
              <strong>Need help?</strong> Visit our <a href="https://brandlens.app" style="color: #667eea; text-decoration: none;">support center</a>
            </p>
          </div>

          <div style="text-align: center; padding-top: 16px;">
            <p style="color: #a0aec0; font-size: 12px; margin: 0 0 8px 0;">
              © ${new Date().getFullYear()} BrandLens. All rights reserved.
            </p>
            <p style="color: #cbd5e0; font-size: 11px; margin: 0;">
              You received this email because you requested a brand analysis at BrandLens.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  firstName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'BrandLens <hello@brandlens.app>',
      to,
      subject: 'Welcome to BrandLens! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #667eea;">Welcome to BrandLens, ${firstName}!</h1>
            <p>We're excited to have you on board. Get started by running your first brand analysis.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
              Start Your First Analysis
            </a>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('[Resend] Error sending welcome email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Resend] Exception sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
