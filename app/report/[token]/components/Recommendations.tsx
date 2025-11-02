import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface RecommendationsProps {
  recommendations: BrandAuditReport['recommendations'];
}

const Recommendations: FC<RecommendationsProps> = ({ recommendations }) => {
  // Helper function to get impact styling
  const getImpactStyle = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300 print:bg-gray-200 print:text-gray-900 print:border-gray-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 print:bg-gray-200 print:text-gray-900 print:border-gray-400';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300 print:bg-gray-200 print:text-gray-900 print:border-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">AI-Recommended Actions</h2>
        <p className="text-sm text-gray-600 mt-2">
          Suggested improvements from AI analysis, prioritized by potential impact and effort
        </p>
      </div>

      {/* Recommendations Grid */}
      <div className="space-y-5">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className="border-2 border-gray-300 rounded-lg p-6 bg-white hover:border-gray-400 transition-colors print:border-gray-400"
          >
            {/* Header with Number */}
            <div className="flex items-start gap-4 mb-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm print:bg-gray-700">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {rec.title}
                </h3>
              </div>
            </div>

            {/* Description */}
            <div className="ml-12">
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {rec.description}
              </p>

              {/* Justification */}
              {rec.justification && (
                <div className="mb-4 p-3 bg-blue-50 border-l-2 border-blue-400 rounded print:bg-gray-50">
                  <h5 className="text-xs font-bold text-blue-900 uppercase tracking-wide mb-1">
                    Why This Works
                  </h5>
                  <p className="text-sm text-blue-800 leading-relaxed print:text-gray-800">
                    {rec.justification}
                  </p>
                </div>
              )}

              {/* Industry Examples */}
              {rec.industryExamples && rec.industryExamples.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    📊 Industry Examples
                  </h5>
                  <ul className="space-y-1.5">
                    {rec.industryExamples.map((example, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-gray-400 mt-0.5">▸</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best Practices */}
              {rec.bestPractices && rec.bestPractices.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                    ✓ Best Practices
                  </h5>
                  <ul className="space-y-1.5">
                    {rec.bestPractices.map((practice, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metrics */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Impact:
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getImpactStyle(rec.impact)}`}>
                    {rec.impact}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Effort:
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-gray-100 text-gray-800 border border-gray-300 print:bg-gray-200">
                    {rec.effort}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
