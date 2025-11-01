import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ConsensusAnalysisProps {
  consensus: BrandAuditReport['consensus'];
}

const ConsensusAnalysis: FC<ConsensusAnalysisProps> = ({ consensus }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consensus Analysis</h2>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agreement Index</h3>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-2">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${consensus.agreementIndex}%` }}
          ></div>
        </div>
        <p className="text-right text-gray-600 dark:text-gray-300 mt-1">{consensus.agreementIndex}%</p>
      </div>
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Common Themes</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {consensus.commonThemes.map((theme, index) => (
            <span key={index} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-sm">
              {theme}
            </span>
          ))}
        </div>
      </div>
      {consensus.divergences.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Divergences</h3>
          <div className="space-y-4 mt-2">
            {consensus.divergences.map((divergence, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">{divergence.topic}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{divergence.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsensusAnalysis;
