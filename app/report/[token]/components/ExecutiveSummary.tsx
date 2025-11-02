import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ExecutiveSummaryProps {
  summary: BrandAuditReport['executiveSummary'];
}

const ExecutiveSummary: FC<ExecutiveSummaryProps> = ({ summary }) => {
  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Executive Summary</h2>
        <p className="text-sm text-gray-600 mt-2">
          Strategic overview and key findings
        </p>
      </div>

      {/* Overview Section */}
      <div className="mb-8">
        <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-l-4 border-gray-900 print:bg-gray-50 print:border-gray-600">
          <p className="text-gray-800 text-base leading-relaxed">
            {summary.overview}
          </p>
        </div>
      </div>

      {/* Top Actions Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
            Priority Actions
          </h3>
          <div className="flex-1 border-b-2 border-gray-300"></div>
        </div>

        <div className="space-y-4">
          {summary.topActions.map((action, index) => (
            <div
              key={index}
              className="flex gap-4 p-5 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors print:border-gray-400"
            >
              {/* Number Badge */}
              <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-lg print:bg-gray-700">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 text-base mb-1.5">
                  {action.title}
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
