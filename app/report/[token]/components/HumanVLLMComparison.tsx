import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface HumanVLLMComparisonProps {
  comparison: BrandAuditReport['humanVLLM'];
}

const HumanVLLMComparison: FC<HumanVLLMComparisonProps> = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Human vs. LLM</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Brand Statement</h3>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{comparison.humanStatement}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">LLM Consensus Summary</h3>
          <p className="text-gray-700 dark:text-gray-300 mt-2">{comparison.llmConsensus}</p>
        </div>
      </div>
      {/* Add alignment and gap analysis here */}
    </div>
  );
};

export default HumanVLLMComparison;
