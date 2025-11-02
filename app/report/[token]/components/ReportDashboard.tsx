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
    <div className="border-2 border-blue-200 rounded-xl p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-white shadow-lg print:border-gray-400 print:bg-white print:shadow-none">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 pb-3">
        📊 Executive Dashboard
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Metric 1: AI Models Analyzed */}
        <div className="text-center p-4 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:bg-white print:shadow-none">
          <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-blue-400 bg-clip-text text-transparent">{modelCount}</div>
          <div className="text-sm font-bold text-blue-900 mt-2">AI Models</div>
          <div className="text-xs text-blue-600 mt-1">Analyzed</div>
        </div>

        {/* Metric 2: Consensus Score */}
        <div className="text-center p-4 border-2 border-green-200 rounded-xl bg-gradient-to-br from-green-50 to-white shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:bg-white print:shadow-none">
          <div className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-400 bg-clip-text text-transparent">
            {consensusScore >= 1 ? Math.round(consensusScore) : Math.round(consensusScore * 100)}%
          </div>
          <div className="text-sm font-bold text-green-900 mt-2">Consensus</div>
          <div className="text-xs text-green-600 mt-1">Agreement Score</div>
        </div>

        {/* Metric 3: Total Findings */}
        <div className="text-center p-4 border-2 border-purple-200 rounded-xl bg-gradient-to-br from-purple-50 to-white shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:bg-white print:shadow-none">
          <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-400 bg-clip-text text-transparent">{totalFindings}</div>
          <div className="text-sm font-bold text-purple-900 mt-2">Key Themes</div>
          <div className="text-xs text-purple-600 mt-1">Identified</div>
        </div>

        {/* Metric 4: Recommendations */}
        <div className="text-center p-4 border-2 border-orange-200 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow print:border-gray-300 print:bg-white print:shadow-none">
          <div className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-amber-400 bg-clip-text text-transparent">{report.recommendations?.length || 0}</div>
          <div className="text-sm font-bold text-orange-900 mt-2">Actions</div>
          <div className="text-xs text-orange-600 mt-1">Recommended</div>
        </div>
      </div>

      {/* Top Insight Banner */}
      <div className="mt-6 p-5 bg-gradient-to-r from-blue-100 to-purple-100 border-l-4 border-blue-600 rounded-r-lg shadow-sm print:bg-gray-100 print:border-gray-600 print:shadow-none">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900 text-sm uppercase tracking-wide mb-1">
              Primary Brand Theme
            </h3>
            <p className="text-gray-800 font-semibold text-lg leading-tight">
              {topTheme}
            </p>
          </div>
        </div>
      </div>

      {/* Model Coverage Indicator */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { name: 'ANTHROPIC', color: 'purple', icon: '🟣' },
          { name: 'OPENAI', color: 'green', icon: '🟢' },
          { name: 'GOOGLE', color: 'blue', icon: '🔵' }
        ].map((model) => {
          const perspective = report.modelPerspectives[model.name as keyof typeof report.modelPerspectives];
          // Check if perspective exists and has meaningful content
          const hasData = !!perspective &&
            typeof perspective === 'object' &&
            !Array.isArray(perspective) &&
            Object.keys(perspective).length > 0 &&
            // Type guard: check if it has a synopsis property
            ('synopsis' in perspective || 'brandSynopsis' in perspective || 'positioning' in perspective);

          const colorClasses = {
            purple: hasData
              ? 'bg-gradient-to-br from-purple-50 to-white border-purple-400 shadow-sm'
              : 'bg-gray-100 border-gray-300',
            green: hasData
              ? 'bg-gradient-to-br from-green-50 to-white border-green-400 shadow-sm'
              : 'bg-gray-100 border-gray-300',
            blue: hasData
              ? 'bg-gradient-to-br from-blue-50 to-white border-blue-400 shadow-sm'
              : 'bg-gray-100 border-gray-300'
          };

          const textColorClasses = {
            purple: hasData ? 'text-purple-600' : 'text-gray-400',
            green: hasData ? 'text-green-600' : 'text-gray-400',
            blue: hasData ? 'text-blue-600' : 'text-gray-400'
          };

          return (
            <div
              key={model.name}
              className={`text-center py-3 px-2 rounded-lg border-2 transition-all print:bg-gray-100 print:border-gray-600 print:shadow-none ${colorClasses[model.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <span>{model.icon}</span>
                <span className="text-xs font-mono font-bold text-gray-700">{model.name}</span>
              </div>
              <div className={`text-sm font-bold ${textColorClasses[model.color as keyof typeof textColorClasses]}`}>
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
