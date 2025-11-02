import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ReportDashboardProps {
  report: BrandAuditReport;
}

const ReportDashboard: FC<ReportDashboardProps> = ({ report }) => {
  // Calculate key metrics
  const modelCount = Array.isArray(report.modelPerspectives)
    ? report.modelPerspectives.length
    : Object.keys(report.modelPerspectives).length;
  const totalFindings = report.consensus?.commonThemes?.length || 0;
  const consensusScore = report.consensus?.agreementIndex || 0;

  // Get top theme if available
  const topTheme = report.consensus?.commonThemes?.[0] || 'N/A';

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-gradient-to-br from-gray-50 to-white print:border-gray-400 print:bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-900 pb-3">
        📊 Executive Dashboard
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Metric 1: AI Models Analyzed */}
        <div className="text-center p-4 border-2 border-gray-200 rounded-lg bg-white print:border-gray-300">
          <div className="text-4xl font-bold text-blue-600">{modelCount}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">AI Models</div>
          <div className="text-xs text-gray-500 mt-1">Analyzed</div>
        </div>

        {/* Metric 2: Consensus Score */}
        <div className="text-center p-4 border-2 border-gray-200 rounded-lg bg-white print:border-gray-300">
          <div className="text-4xl font-bold text-green-600">
            {consensusScore >= 1 ? Math.round(consensusScore) : Math.round(consensusScore * 100)}%
          </div>
          <div className="text-sm font-medium text-gray-600 mt-2">Consensus</div>
          <div className="text-xs text-gray-500 mt-1">Agreement Score</div>
        </div>

        {/* Metric 3: Total Findings */}
        <div className="text-center p-4 border-2 border-gray-200 rounded-lg bg-white print:border-gray-300">
          <div className="text-4xl font-bold text-purple-600">{totalFindings}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Key Themes</div>
          <div className="text-xs text-gray-500 mt-1">Identified</div>
        </div>

        {/* Metric 4: Recommendations */}
        <div className="text-center p-4 border-2 border-gray-200 rounded-lg bg-white print:border-gray-300">
          <div className="text-4xl font-bold text-orange-600">{report.recommendations?.length || 0}</div>
          <div className="text-sm font-medium text-gray-600 mt-2">Actions</div>
          <div className="text-xs text-gray-500 mt-1">Recommended</div>
        </div>
      </div>

      {/* Top Insight Banner */}
      <div className="mt-6 p-5 bg-blue-50 border-l-4 border-blue-600 print:bg-gray-100 print:border-gray-600">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-1">
              Primary Brand Theme
            </h3>
            <p className="text-gray-800 font-medium text-lg leading-tight">
              {topTheme}
            </p>
          </div>
        </div>
      </div>

      {/* Model Coverage Indicator */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {['ANTHROPIC', 'OPENAI', 'GOOGLE'].map((model) => {
          const perspective = report.modelPerspectives[model as keyof typeof report.modelPerspectives];
          // Check if perspective exists and has meaningful content
          const hasData = !!perspective &&
            typeof perspective === 'object' &&
            Object.keys(perspective).length > 0 &&
            // Check for either synopsis or any other meaningful data
            (perspective.synopsis || perspective.brandSynopsis || perspective.positioning || Object.keys(perspective).some(key => key !== 'model'));

          return (
            <div
              key={model}
              className={`text-center py-3 px-2 rounded border-2 ${
                hasData
                  ? 'bg-green-50 border-green-500 print:bg-gray-100 print:border-gray-600'
                  : 'bg-gray-100 border-gray-300 print:border-gray-400'
              }`}
            >
              <div className="text-xs font-mono font-bold text-gray-700">{model}</div>
              <div className={`text-lg font-bold mt-1 ${hasData ? 'text-green-600' : 'text-gray-400'}`}>
                {hasData ? '✓ Available' : 'No Data'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportDashboard;
