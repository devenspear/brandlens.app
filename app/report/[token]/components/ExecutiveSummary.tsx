import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ExecutiveSummaryProps {
  summary: BrandAuditReport['executiveSummary'];
}

const ExecutiveSummary: FC<ExecutiveSummaryProps> = ({ summary }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Summary</h2>
      <p className="text-gray-700 dark:text-gray-300 mt-4">{summary.overview}</p>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Actions</h3>
        <ul className="list-disc list-inside mt-2 space-y-2">
          {summary.topActions.map((action, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{action.title}:</span> {action.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
