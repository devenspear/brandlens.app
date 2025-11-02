import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface MessagingScoresProps {
  scores: BrandAuditReport['messaging'];
}

const ScoreCard: FC<{ title: string; score: any }> = ({ title, score }) => {
  // Determine score color and label
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'high':
        return { bar: 'bg-green-600', badge: 'bg-green-100 text-green-800 border-green-300' };
      case 'medium':
        return { bar: 'bg-yellow-600', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
      case 'low':
        return { bar: 'bg-red-600', badge: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { bar: 'bg-gray-600', badge: 'bg-gray-100 text-gray-800 border-gray-300' };
    }
  };

  const colors = getScoreColor(score.level);

  return (
    <div className="border-2 border-gray-300 rounded-lg p-5 bg-white hover:border-gray-400 transition-colors print:border-gray-400">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          {title}
        </h4>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${colors.badge} print:bg-gray-200 print:text-gray-900 print:border-gray-400`}>
            {score.level}
          </span>
        </div>
      </div>

      {/* Score Display */}
      <div className="mb-3">
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Score</span>
          <span className="text-3xl font-bold text-gray-900">{score.score}<span className="text-lg text-gray-500">/100</span></span>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-200 rounded-full h-4 border-2 border-gray-300 overflow-hidden print:border-gray-400">
          <div
            className={`${colors.bar} h-full transition-all duration-500 flex items-center justify-end pr-2`}
            style={{ width: `${score.score}%` }}
          >
            {score.score > 15 && (
              <span className="text-white text-xs font-bold">{score.score}%</span>
            )}
          </div>
        </div>
      </div>

      {/* Rationale */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-700 leading-relaxed">
          {score.rationale}
        </p>
      </div>
    </div>
  );
};

const MessagingScores: FC<MessagingScoresProps> = ({ scores }) => {
  // Calculate average score
  const avgScore = Math.round(
    (scores.clarity.score + scores.specificity.score + scores.differentiation.score + scores.trust.score) / 4
  );

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Messaging Effectiveness</h2>
            <p className="text-sm text-gray-600 mt-2">
              Quantitative analysis of brand messaging quality
            </p>
          </div>
          {/* Overall Score Badge */}
          <div className="text-center border-2 border-gray-900 rounded-lg p-4 bg-gray-50 print:bg-white print:border-gray-600">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Overall
            </div>
            <div className="text-4xl font-bold text-gray-900">{avgScore}</div>
            <div className="text-xs text-gray-500 mt-1">Average Score</div>
          </div>
        </div>
      </div>

      {/* Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard title="Clarity" score={scores.clarity} />
        <ScoreCard title="Specificity" score={scores.specificity} />
        <ScoreCard title="Differentiation" score={scores.differentiation} />
        <ScoreCard title="Trust" score={scores.trust} />
      </div>

      {/* Score Legend */}
      <div className="border-t-2 border-gray-300 pt-4 mt-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Score Levels</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded border border-green-700"></div>
            <span className="text-sm font-medium text-gray-700">High (70-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded border border-yellow-700"></div>
            <span className="text-sm font-medium text-gray-700">Medium (40-69)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded border border-red-700"></div>
            <span className="text-sm font-medium text-gray-700">Low (0-39)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingScores;
