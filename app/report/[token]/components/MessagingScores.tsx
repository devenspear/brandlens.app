import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface MessagingScoresProps {
  scores: BrandAuditReport['messaging'];
}

const ScoreCard: FC<{ title: string; score: any }> = ({ title, score }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
      <div
        className={`${score.level === 'high' ? 'bg-green-500' : score.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'} h-2.5 rounded-full`}
        style={{ width: `${score.score}%` }}
      ></div>
    </div>
    <p className="text-right text-sm text-gray-600 dark:text-gray-300 mt-1">{score.score}/100</p>
    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{score.rationale}</p>
  </div>
);

const MessagingScores: FC<MessagingScoresProps> = ({ scores }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Messaging Scores</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ScoreCard title="Clarity" score={scores.clarity} />
        <ScoreCard title="Specificity" score={scores.specificity} />
        <ScoreCard title="Differentiation" score={scores.differentiation} />
        <ScoreCard title="Trust" score={scores.trust} />
      </div>
    </div>
  );
};

export default MessagingScores;
