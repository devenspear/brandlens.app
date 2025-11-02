import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ModelPerspectivesProps {
  perspectives: BrandAuditReport['modelPerspectives'];
}

const ModelPerspectives: FC<ModelPerspectivesProps> = ({ perspectives }) => {
  // Define all providers we want to show
  const allProviders = [
    { key: 'ANTHROPIC', name: 'Anthropic', icon: '🟣' },
    { key: 'OPENAI', name: 'OpenAI', icon: '🟢' },
    { key: 'GOOGLE', name: 'Google', icon: '🔵' }
  ];

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Model Perspectives</h2>
        <p className="text-sm text-gray-600 mt-2">
          Independent analysis from multiple AI providers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {allProviders.map((providerInfo) => {
          const perspective = perspectives[providerInfo.key as keyof typeof perspectives];
          const isAvailable = !!perspective;

          return (
            <div
              key={providerInfo.key}
              className={`border-2 rounded-lg p-6 ${
                isAvailable
                  ? 'border-gray-400 bg-white'
                  : 'border-gray-200 bg-gray-50 print:bg-gray-100'
              }`}
            >
              {/* Provider Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-300">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{providerInfo.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                      {providerInfo.name}
                    </h3>
                    {isAvailable && perspective.model && (
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{perspective.model}</p>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                }`}>
                  {isAvailable ? '✓ AVAILABLE' : '✗ N/A'}
                </div>
              </div>

              {/* Content */}
              {isAvailable ? (
                <>
                  {/* Synopsis */}
                  {perspective.synopsis?.summary && (
                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Synopsis
                      </h4>
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {perspective.synopsis.summary}
                      </p>
                    </div>
                  )}

                  {/* Brand Pillars */}
                  {perspective.synopsis?.pillars && perspective.synopsis.pillars.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                        Brand Pillars
                      </h4>
                      <ul className="space-y-1.5">
                        {perspective.synopsis.pillars.slice(0, 3).map((pillar: any, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-gray-400 mt-0.5">▪</span>
                            <span className="text-gray-800 font-medium">
                              {pillar.name || pillar}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl text-gray-300 mb-3">⚠</div>
                  <p className="text-sm text-gray-500 font-medium">
                    Analysis Unavailable
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    This provider did not complete analysis for this brand.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModelPerspectives;
