import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface BrandProfileProps {
  report: BrandAuditReport;
}

const BrandProfile: FC<BrandProfileProps> = ({ report }) => {
  const { messaging } = report;

  // Calculate overall brand strength
  const overallScore = Math.round(
    (messaging.clarity.score + messaging.specificity.score +
     messaging.differentiation.score + messaging.trust.score) / 4
  );

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: 'bg-green-500', border: 'border-green-600', text: 'text-green-700' };
    if (score >= 40) return { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-700' };
    return { bg: 'bg-red-500', border: 'border-red-600', text: 'text-red-700' };
  };

  const dimensions = [
    { label: 'Clarity', score: messaging.clarity.score, key: 'clarity' },
    { label: 'Specificity', score: messaging.specificity.score, key: 'specificity' },
    { label: 'Differentiation', score: messaging.differentiation.score, key: 'differentiation' },
    { label: 'Trust', score: messaging.trust.score, key: 'trust' },
  ];

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">AI-Assessed Brand Profile</h2>
        <p className="text-sm text-gray-600 mt-2">
          Multi-dimensional analysis of brand strength across key metrics
        </p>
      </div>

      {/* Overall Score */}
      <div className="mb-8 p-6 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-300 rounded-xl print:bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">
              Overall Brand Strength
            </h3>
            <p className="text-4xl font-bold text-gray-900">{overallScore}<span className="text-2xl text-gray-500">/100</span></p>
          </div>
          <div className="w-32 h-32 relative">
            {/* Circular progress */}
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallScore / 100)}`}
                className={getScoreColor(overallScore).text}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{overallScore}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart / Diamond Visualization */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
          Brand Dimension Analysis
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Visual Radar Chart Representation */}
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border-2 border-gray-200 print:bg-white print:border-gray-400">
            <div className="relative w-64 h-64">
              {/* Background grid */}
              <svg viewBox="0 0 200 200" className="absolute inset-0">
                {/* Concentric squares for reference */}
                {[25, 50, 75, 100].map((size, i) => (
                  <rect
                    key={i}
                    x={100 - size}
                    y={100 - size}
                    width={size * 2}
                    height={size * 2}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                ))}

                {/* Axes */}
                <line x1="100" y1="0" x2="100" y2="200" stroke="#d1d5db" strokeWidth="1" />
                <line x1="0" y1="100" x2="200" y2="100" stroke="#d1d5db" strokeWidth="1" />

                {/* Data polygon */}
                <polygon
                  points={`
                    100,${100 - messaging.clarity.score}
                    ${100 + messaging.specificity.score},100
                    100,${100 + messaging.differentiation.score}
                    ${100 - messaging.trust.score},100
                  `}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                />

                {/* Data points */}
                <circle cx="100" cy={100 - messaging.clarity.score} r="4" fill="rgb(59, 130, 246)" />
                <circle cx={100 + messaging.specificity.score} cy="100" r="4" fill="rgb(59, 130, 246)" />
                <circle cx="100" cy={100 + messaging.differentiation.score} r="4" fill="rgb(59, 130, 246)" />
                <circle cx={100 - messaging.trust.score} cy="100" r="4" fill="rgb(59, 130, 246)" />

                {/* Labels */}
                <text x="100" y="15" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
                  Clarity
                </text>
                <text x="185" y="105" textAnchor="end" fontSize="12" fontWeight="bold" fill="#374151">
                  Specificity
                </text>
                <text x="100" y="195" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
                  Differentiation
                </text>
                <text x="15" y="105" textAnchor="start" fontSize="12" fontWeight="bold" fill="#374151">
                  Trust
                </text>
              </svg>
            </div>
          </div>

          {/* Dimension Bars */}
          <div className="space-y-4">
            {dimensions.map((dim) => {
              const colors = getScoreColor(dim.score);
              return (
                <div key={dim.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">{dim.label}</span>
                    <span className="text-sm font-bold text-gray-700">{dim.score}/100</span>
                  </div>
                  <div className="relative w-full bg-gray-200 rounded-full h-6 border-2 border-gray-300 overflow-hidden print:border-gray-400">
                    <div
                      className={`h-full ${colors.bg} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${dim.score}%` }}
                    >
                      {dim.score > 15 && (
                        <span className="text-white text-xs font-bold">{dim.score}%</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Strengths & Opportunities Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="border-2 border-green-200 rounded-lg p-5 bg-gradient-to-br from-green-50 to-white print:bg-white print:border-gray-400">
          <h4 className="text-sm font-bold text-green-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-lg">✓</span>
            Strengths (70+)
          </h4>
          <ul className="space-y-2">
            {dimensions
              .filter(d => d.score >= 70)
              .map(d => (
                <li key={d.key} className="flex items-center gap-2 text-sm text-green-800">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">{d.label}</span>
                  <span className="ml-auto font-bold">{d.score}</span>
                </li>
              ))}
            {dimensions.filter(d => d.score >= 70).length === 0 && (
              <li className="text-sm text-gray-500 italic">No dimensions scored 70 or above</li>
            )}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="border-2 border-orange-200 rounded-lg p-5 bg-gradient-to-br from-orange-50 to-white print:bg-white print:border-gray-400">
          <h4 className="text-sm font-bold text-orange-900 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-lg">⚠</span>
            Opportunities (&lt;70)
          </h4>
          <ul className="space-y-2">
            {dimensions
              .filter(d => d.score < 70)
              .sort((a, b) => a.score - b.score)
              .map(d => (
                <li key={d.key} className="flex items-center gap-2 text-sm text-orange-800">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  <span className="font-medium">{d.label}</span>
                  <span className="ml-auto font-bold">{d.score}</span>
                </li>
              ))}
            {dimensions.filter(d => d.score < 70).length === 0 && (
              <li className="text-sm text-gray-500 italic">All dimensions performing strongly!</li>
            )}
          </ul>
        </div>
      </div>

      {/* Benchmark Guide */}
      <div className="mt-6 p-4 bg-gray-100 border-l-4 border-gray-600 rounded-r print:bg-gray-50">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          Score Interpretation Guide
        </h4>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <span className="font-bold text-green-700">70-100: Strong</span>
            <p className="text-gray-600 mt-1">Competitive advantage</p>
          </div>
          <div>
            <span className="font-bold text-yellow-700">40-69: Moderate</span>
            <p className="text-gray-600 mt-1">Room for improvement</p>
          </div>
          <div>
            <span className="font-bold text-red-700">0-39: Weak</span>
            <p className="text-gray-600 mt-1">Requires immediate attention</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandProfile;
