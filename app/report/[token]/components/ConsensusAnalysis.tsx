import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface ConsensusAnalysisProps {
  consensus: BrandAuditReport['consensus'];
}

const ConsensusAnalysis: FC<ConsensusAnalysisProps> = ({ consensus }) => {
  // Determine agreement level color
  const getAgreementColor = (index: number) => {
    if (index >= 80) return 'bg-green-600';
    if (index >= 60) return 'bg-blue-600';
    if (index >= 40) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getAgreementLabel = (index: number) => {
    if (index >= 80) return 'Strong Agreement';
    if (index >= 60) return 'Moderate Agreement';
    if (index >= 40) return 'Partial Agreement';
    return 'Low Agreement';
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Cross-Model Consensus</h2>
        <p className="text-sm text-gray-600 mt-2">
          Agreement analysis across all AI providers
        </p>
      </div>

      {/* Agreement Index Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
            Agreement Index
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">
              {getAgreementLabel(consensus.agreementIndex)}
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {consensus.agreementIndex}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full bg-gray-200 rounded-full h-6 border-2 border-gray-300 overflow-hidden print:border-gray-400">
          <div
            className={`h-full ${getAgreementColor(consensus.agreementIndex)} transition-all duration-500 flex items-center justify-end pr-3`}
            style={{ width: `${consensus.agreementIndex}%` }}
          >
            <span className="text-white text-xs font-bold">{consensus.agreementIndex}%</span>
          </div>
        </div>

        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2 font-medium">
          <span>Low</span>
          <span>Moderate</span>
          <span>High</span>
        </div>
      </div>

      {/* Common Themes Section */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide mb-4">
          Common Themes
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {consensus.commonThemes.map((theme, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-gray-100 border-2 border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:border-gray-400 transition-colors print:border-gray-400"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* Divergences Section */}
      {consensus.divergences.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              Model Divergences
            </h3>
            <div className="flex-1 border-b-2 border-gray-300"></div>
            <span className="text-sm font-medium text-gray-600">
              {consensus.divergences.length} {consensus.divergences.length === 1 ? 'topic' : 'topics'}
            </span>
          </div>

          <div className="space-y-4">
            {consensus.divergences.map((divergence, index) => (
              <div
                key={index}
                className="border-2 border-gray-300 rounded-lg p-5 bg-gray-50 print:bg-white print:border-gray-400"
              >
                {/* Topic Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-xs print:bg-gray-700">
                    !
                  </div>
                  <h4 className="flex-1 font-bold text-gray-900 text-base">
                    {divergence.topic}
                  </h4>
                </div>

                {/* Explanation */}
                <div className="ml-9">
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">
                    {divergence.explanation}
                  </p>

                  {/* Model Perspectives */}
                  {divergence.modelPerspectives && divergence.modelPerspectives.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Provider Perspectives:
                      </div>
                      {divergence.modelPerspectives.map((perspective, pIndex) => (
                        <div
                          key={pIndex}
                          className="border-l-4 border-gray-400 pl-4 py-2 bg-white print:border-gray-500"
                        >
                          <div className="text-xs font-bold text-gray-700 uppercase mb-1">
                            {perspective.provider}
                          </div>
                          <div className="text-sm text-gray-800 font-medium mb-1">
                            {perspective.view}
                          </div>
                          {perspective.evidence && (
                            <div className="text-xs text-gray-600 italic">
                              {perspective.evidence}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsensusAnalysis;
