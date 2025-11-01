import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface RecommendationsProps {
  recommendations: BrandAuditReport['recommendations'];
}

const Recommendations: FC<RecommendationsProps> = ({ recommendations }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommendations</h2>
      <div className="space-y-4 mt-6">
        {recommendations.map((rec, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{rec.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full ${rec.impact === 'high' ? 'bg-red-100 text-red-800' : rec.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                Impact: {rec.impact}
              </span>
              <span className={`px-2 py-0.5 rounded-full bg-gray-100 text-gray-800`}>
                Effort: {rec.effort}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
