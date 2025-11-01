import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface PositioningGridProps {
  positioning: BrandAuditReport['positioning'];
}

const PositioningGrid: FC<PositioningGridProps> = ({ positioning }) => {
  // This is a simplified representation. A real implementation would use a charting library.
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Positioning Grid</h2>
      <div className="relative w-full h-64 mt-6 border border-gray-300 dark:border-gray-600 rounded-lg">
        <span className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full text-sm text-gray-500 dark:text-gray-400 p-2">
          {positioning.axes.y.min}
        </span>
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full text-sm text-gray-500 dark:text-gray-400 p-2">
          {positioning.axes.x.max}
        </span>
        <span className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full text-sm text-gray-500 dark:text-gray-400 p-2">
          {positioning.axes.y.max}
        </span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full text-sm text-gray-500 dark:text-gray-400 p-2">
          {positioning.axes.x.min}
        </span>

        {/* Subject */}
        <div
          className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${50 + positioning.subject.positioning.x}%`,
            top: `${50 - positioning.subject.positioning.y}%`,
          }}
        ></div>

        {/* Competitors */}
        {positioning.competitors.map((competitor, index) => (
          <div
            key={index}
            className="absolute w-3 h-3 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + competitor.positioning.x}%`,
              top: `${50 - competitor.positioning.y}%`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default PositioningGrid;
