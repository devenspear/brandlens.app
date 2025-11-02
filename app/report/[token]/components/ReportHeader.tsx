import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ReportHeaderProps {
  report: BrandAuditReport;
}

const ReportHeader: FC<ReportHeaderProps> = ({ report }) => {
  const formattedDate = new Date(report.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="border-b-4 border-gray-900 pb-8 print:border-b-2">
      {/* Company Logo / Branding Area */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="inline-block px-4 py-1 bg-gray-900 text-white font-mono text-xs font-bold tracking-wider mb-4">
            BRANDLENS
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Brand Audit Report
          </h1>
          <p className="text-xl text-gray-600 mt-3 font-light">
            AI-Powered Brand Analysis & Positioning Insights
          </p>
        </div>

        {/* Report Metadata Box */}
        <div className="ml-6 text-right border-2 border-gray-300 p-4 bg-gray-50 print:bg-white print:border-gray-400 min-w-[200px]">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Report Date
          </div>
          <div className="text-sm font-medium text-gray-900 mb-3">
            {formattedDate}
          </div>
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Document ID
          </div>
          <div className="text-xs font-mono text-gray-700">
            {report.projectId.substring(0, 12)}...
          </div>
        </div>
      </div>

      {/* Subject/URL Info Bar */}
      <div className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-gray-50 border-l-4 border-gray-900 print:bg-gray-100 print:border-gray-600">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Analysis Subject
        </div>
        <div className="text-lg font-semibold text-gray-900 font-mono break-all">
          {report.url}
        </div>
      </div>

      {/* Confidentiality Notice */}
      <div className="mt-4 text-xs text-gray-500 italic text-center print:text-gray-600">
        This document contains proprietary analysis generated using advanced AI models.
        For authorized use only.
      </div>
    </header>
  );
};

export default ReportHeader;
