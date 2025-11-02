import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ModelPerspectivesProps {
  perspectives: BrandAuditReport['modelPerspectives'];
}

const ModelPerspectives: FC<ModelPerspectivesProps> = ({ perspectives }) => {
  // Define all providers we want to show with color theming
  const allProviders = [
    { key: 'ANTHROPIC', name: 'Anthropic', icon: '🟣', color: 'purple', bgGradient: 'from-purple-50 to-white', borderColor: 'border-purple-300', textColor: 'text-purple-700', badgeBg: 'bg-purple-100', badgeText: 'text-purple-700' },
    { key: 'OPENAI', name: 'OpenAI', icon: '🟢', color: 'green', bgGradient: 'from-green-50 to-white', borderColor: 'border-green-300', textColor: 'text-green-700', badgeBg: 'bg-green-100', badgeText: 'text-green-700' },
    { key: 'GOOGLE', name: 'Google', icon: '🔵', color: 'blue', bgGradient: 'from-blue-50 to-white', borderColor: 'border-blue-300', textColor: 'text-blue-700', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700' }
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
          const perspective = Array.isArray(perspectives)
            ? perspectives.find((p) => p?.provider === providerInfo.key)
            : perspectives?.[providerInfo.key as keyof typeof perspectives];
          const isAvailable = !!perspective && typeof perspective === 'object' && 'model' in perspective;

          return (
            <div
              key={providerInfo.key}
              className={`border-2 rounded-xl p-6 shadow-sm transition-all ${
                isAvailable
                  ? `bg-gradient-to-br ${providerInfo.bgGradient} ${providerInfo.borderColor} hover:shadow-md`
                  : 'border-gray-200 bg-gray-50 print:bg-gray-100'
              } print:border-gray-400 print:shadow-none`}
            >
              {/* Provider Header */}
              <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${isAvailable ? providerInfo.borderColor : 'border-gray-300'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{providerInfo.icon}</span>
                  <div>
                    <h3 className={`text-lg font-bold uppercase tracking-wide ${isAvailable ? providerInfo.textColor : 'text-gray-900'}`}>
                      {providerInfo.name}
                    </h3>
                    {isAvailable && perspective && 'model' in perspective && perspective.model && (
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{perspective.model}</p>
                    )}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold shadow-sm ${
                  isAvailable ? `${providerInfo.badgeBg} ${providerInfo.badgeText}` : 'bg-gray-200 text-gray-500'
                }`}>
                  {isAvailable ? '✓ INCLUDED' : '— PENDING'}
                </div>
              </div>

              {/* Content */}
              {isAvailable && perspective && 'synopsis' in perspective ? (
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
                  {(() => {
                    // Try to extract pillars from various possible formats
                    let pillars: any[] = [];
                    const synopsisData = perspective.synopsis as any; // Type assertion for flexible data access

                    if (synopsisData?.pillars && Array.isArray(synopsisData.pillars)) {
                      pillars = synopsisData.pillars;
                    } else if (synopsisData?.keyQuotes && Array.isArray(synopsisData.keyQuotes)) {
                      // Fallback to keyQuotes if pillars aren't available
                      pillars = synopsisData.keyQuotes.slice(0, 3);
                    }

                    return pillars.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
                          Brand Pillars
                        </h4>
                        <ul className="space-y-1.5">
                          {pillars.slice(0, 3).map((pillar: any, i: number) => {
                            // Handle different pillar formats
                            let displayText = '';
                            if (typeof pillar === 'string') {
                              displayText = pillar;
                            } else if (pillar.name) {
                              displayText = pillar.description ? `${pillar.name}: ${pillar.description}` : pillar.name;
                            } else if (pillar.description) {
                              displayText = pillar.description;
                            } else {
                              displayText = JSON.stringify(pillar);
                            }

                            return (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="text-gray-400 mt-0.5">▪</span>
                                <span className="text-gray-800 font-medium">
                                  {displayText}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 italic">
                        No brand pillars identified for this provider
                      </div>
                    );
                  })()}
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
