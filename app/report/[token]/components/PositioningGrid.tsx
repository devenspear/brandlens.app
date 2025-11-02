import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface PositioningGridProps {
  positioning: BrandAuditReport['positioning'];
}

const PositioningGrid: FC<PositioningGridProps> = ({ positioning }) => {
  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Competitive Positioning Map</h2>
        <p className="text-sm text-gray-600 mt-2">
          Visual representation of market positioning vs. competitors
        </p>
      </div>

      {/* Chart Container */}
      <div className="mb-6">
        {/* Axis Labels */}
        <div className="text-center mb-2">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            {positioning.axes.x.label || 'X-Axis'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Y-Axis Label (Left) */}
          <div className="flex-shrink-0 w-20 flex items-center justify-center">
            <div className="transform -rotate-90 whitespace-nowrap">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                {positioning.axes.y.label || 'Y-Axis'}
              </span>
            </div>
          </div>

          {/* Chart Grid */}
          <div className="flex-1">
            <div className="relative w-full h-80 border-2 border-gray-400 rounded-lg bg-gradient-to-br from-gray-50 to-white print:bg-white print:border-gray-500">
              {/* Grid Lines */}
              <div className="absolute inset-0">
                {/* Vertical Center Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 print:bg-gray-400"></div>
                {/* Horizontal Center Line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-300 print:bg-gray-400"></div>
              </div>

              {/* Axis Labels on Edges */}
              <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300">
                {positioning.axes.x.max}
              </span>
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300">
                {positioning.axes.x.min}
              </span>
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300">
                {positioning.axes.y.min}
              </span>
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-300">
                {positioning.axes.y.max}
              </span>

              {/* Subject Brand (Blue) */}
              <div
                className="absolute w-5 h-5 bg-blue-600 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-10 print:border-gray-300"
                style={{
                  left: `${50 + positioning.subject.positioning.x}%`,
                  top: `${50 - positioning.subject.positioning.y}%`,
                }}
                title={positioning.subject.name}
              >
                {/* Pulse effect for subject */}
                <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-75"></div>
              </div>

              {/* Subject Label */}
              <div
                className="absolute transform -translate-x-1/2 text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded border border-blue-300 whitespace-nowrap print:bg-white print:border-blue-600"
                style={{
                  left: `${50 + positioning.subject.positioning.x}%`,
                  top: `${50 - positioning.subject.positioning.y - 8}%`,
                }}
              >
                {positioning.subject.name}
              </div>

              {/* Competitors (Gray) */}
              {positioning.competitors.map((competitor, index) => (
                <div key={index}>
                  <div
                    className="absolute w-4 h-4 bg-gray-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md print:border-gray-300"
                    style={{
                      left: `${50 + competitor.positioning.x}%`,
                      top: `${50 - competitor.positioning.y}%`,
                    }}
                    title={competitor.name}
                  ></div>
                  {/* Competitor Label */}
                  <div
                    className="absolute transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 whitespace-nowrap print:bg-white"
                    style={{
                      left: `${50 + competitor.positioning.x}%`,
                      top: `${50 - competitor.positioning.y - 6}%`,
                    }}
                  >
                    {competitor.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t-2 border-gray-300 pt-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-sm print:border-gray-300"></div>
            <span className="text-sm font-medium text-gray-700">Subject Brand</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 bg-gray-500 border-2 border-white rounded-full shadow-sm print:border-gray-300"></div>
            <span className="text-sm font-medium text-gray-700">Competitors</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositioningGrid;
