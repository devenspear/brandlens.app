import { BrandAuditReport } from '@/lib/types';
import { FC } from 'react';

interface HumanVLLMComparisonProps {
  comparison: BrandAuditReport['humanVLLM'];
}

const HumanVLLMComparison: FC<HumanVLLMComparisonProps> = ({ comparison }) => {
  if (!comparison) return null;

  return (
    <div className="border-2 border-gray-300 rounded-lg p-8 bg-white print:border-gray-400">
      {/* Header */}
      <div className="border-b-2 border-gray-900 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Human vs. AI Alignment</h2>
        <p className="text-sm text-gray-600 mt-2">
          Comparison of brand self-description with AI-discovered insights
        </p>
      </div>

      {/* Statements Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Human Statement */}
        <div className="border-2 border-gray-300 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-white print:bg-white print:border-gray-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              Your Brand Statement
            </h3>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed italic">
            "{comparison.humanStatement}"
          </p>
        </div>

        {/* LLM Consensus */}
        <div className="border-2 border-gray-300 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-white print:bg-white print:border-gray-400">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              AI
            </div>
            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
              AI Consensus
            </h3>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed italic">
            "{comparison.llmConsensus}"
          </p>
        </div>
      </div>

      {/* Alignment Analysis */}
      {comparison.alignment && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide mb-4 border-b-2 border-gray-300 pb-2">
            Alignment Analysis
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            {comparison.alignment.strengths && comparison.alignment.strengths.length > 0 && (
              <div className="border-2 border-green-300 rounded-lg p-5 bg-green-50 print:bg-white print:border-gray-400">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">✓</span>
                  <h4 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    Alignment Strengths
                  </h4>
                </div>
                <ul className="space-y-2">
                  {comparison.alignment.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-800">
                      <span className="text-green-600 mt-0.5">▪</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Gaps */}
            {comparison.alignment.gaps && comparison.alignment.gaps.length > 0 && (
              <div className="border-2 border-yellow-300 rounded-lg p-5 bg-yellow-50 print:bg-white print:border-gray-400">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚠</span>
                  <h4 className="text-base font-bold text-gray-900 uppercase tracking-wide">
                    Perception Gaps
                  </h4>
                </div>
                <ul className="space-y-2">
                  {comparison.alignment.gaps.map((gap, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-800">
                      <span className="text-yellow-600 mt-0.5">▪</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Edits */}
      {comparison.suggestedEdits && comparison.suggestedEdits.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
              Suggested Messaging Refinements
            </h3>
            <div className="flex-1 border-b-2 border-gray-300"></div>
            <span className="text-sm font-medium text-gray-600">
              {comparison.suggestedEdits.length} {comparison.suggestedEdits.length === 1 ? 'edit' : 'edits'}
            </span>
          </div>

          <div className="space-y-4">
            {comparison.suggestedEdits.map((edit, index) => (
              <div
                key={index}
                className="border-2 border-gray-300 rounded-lg p-5 bg-gray-50 print:bg-white print:border-gray-400"
              >
                {/* Section Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </div>
                  <h4 className="flex-1 font-bold text-gray-900 text-base">
                    {edit.section}
                  </h4>
                </div>

                {/* Current vs Suggested */}
                <div className="ml-9 space-y-4">
                  {/* Current Text */}
                  <div className="border-l-4 border-red-400 pl-4 py-2 bg-red-50 print:bg-white">
                    <div className="text-xs font-bold text-gray-600 uppercase mb-1">Current:</div>
                    <p className="text-sm text-gray-800 italic">"{edit.currentText}"</p>
                  </div>

                  {/* Suggested Text */}
                  <div className="border-l-4 border-green-400 pl-4 py-2 bg-green-50 print:bg-white">
                    <div className="text-xs font-bold text-gray-600 uppercase mb-1">Suggested:</div>
                    <p className="text-sm text-gray-800 italic font-medium">"{edit.suggestedText}"</p>
                  </div>

                  {/* Reasoning */}
                  <div className="border-t border-gray-300 pt-3">
                    <div className="text-xs font-bold text-gray-600 uppercase mb-1">Rationale:</div>
                    <p className="text-sm text-gray-700">{edit.reasoning}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HumanVLLMComparison;
