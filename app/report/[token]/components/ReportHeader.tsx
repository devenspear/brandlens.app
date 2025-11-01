import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ReportHeaderProps {
  report: BrandAuditReport;
}

const ReportHeader: FC<ReportHeaderProps> = ({ report }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Audit Report</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{report.url}</p>
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span>Generated on {new Date(report.generatedAt).toLocaleDateString()}</span>
        <span>Project ID: {report.projectId}</span>
      </div>
    </header>
  );
};

export default ReportHeader;
