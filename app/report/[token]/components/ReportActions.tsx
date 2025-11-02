'use client';

import { FC, useState } from 'react';

interface ReportActionsProps {
  reportToken: string;
  url: string;
}

const ReportActions: FC<ReportActionsProps> = ({ reportToken, url }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleDownloadPDF = () => {
    setIsDownloading(true);

    // Use browser's built-in print functionality to generate PDF
    // Modern browsers allow "Save as PDF" in the print dialog
    window.print();

    // Reset state after a short delay
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handleEmailReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: reportToken,
          email: email.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailStatus({
        type: 'success',
        message: `Report sent successfully to ${email}!`
      });
      setEmail('');

      // Close form after 3 seconds
      setTimeout(() => {
        setShowEmailForm(false);
        setEmailStatus(null);
      }, 3000);

    } catch (error) {
      setEmailStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to send email'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="print:hidden sticky top-0 z-50 bg-white border-b-2 border-gray-200 shadow-md mb-8">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Report Title */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">Brand Audit Report</h2>
            <p className="text-sm text-gray-500 font-mono truncate">{url}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isDownloading ? 'Opening...' : 'Download PDF'}
            </button>

            {/* Email Button */}
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Report
            </button>
          </div>
        </div>

        {/* Email Form (conditional) */}
        {showEmailForm && (
          <div className="mt-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
            <form onSubmit={handleEmailReport} className="flex items-end gap-3">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSendingEmail}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSendingEmail ? 'Sending...' : 'Send'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmailStatus(null);
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </form>

            {/* Status Message */}
            {emailStatus && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                emailStatus.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {emailStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportActions;
