import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ModelPerspectivesProps {
  perspectives: BrandAuditReport['modelPerspectives'];
}

const ModelPerspectives: FC<ModelPerspectivesProps> = ({ perspectives }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Perspectives</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {perspectives.map((perspective, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{perspective.provider}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{perspective.model}</p>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Synopsis</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{perspective.synopsis.summary}</p>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Pillars</h4>
              <ul className="list-disc list-inside text-sm">
                {perspective.synopsis.pillars.map((pillar: any, i: number) => (
                  <li key={i} className="text-gray-700 dark:text-gray-300">{pillar.name}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModelPerspectives;
