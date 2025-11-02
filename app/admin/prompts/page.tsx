'use client';

import { useState } from 'react';
import { getAllIndustries } from '@/lib/prompts/loader';
import { Industry } from '@prisma/client';

export default function PromptsPage() {
  const industries = getAllIndustries();
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(Industry.RESIDENTIAL_REAL_ESTATE);

  const promptTypes = [
    { key: 'brandSynopsis', label: 'Brand Synopsis', description: '120-150 word summary of brand promise' },
    { key: 'positioningPillars', label: 'Positioning Pillars', description: '3-5 key differentiators' },
    { key: 'toneOfVoice', label: 'Tone of Voice', description: 'Linguistic style assessment' },
    { key: 'buyerSegments', label: 'Buyer Segments', description: 'Target audience identification' },
    { key: 'amenities', label: 'Amenities', description: 'Features and benefits inventory' },
    { key: 'trustSignals', label: 'Trust Signals', description: 'Credibility indicators' },
    { key: 'messagingAnalysis', label: 'Messaging Analysis', description: 'Clarity, specificity, differentiation, trust scores' },
    { key: 'recommendations', label: 'Recommendations', description: 'Actionable improvement suggestions' },
  ];

  const selectedIndustryData = industries.find((i) => i.value === selectedIndustry);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Prompt Management</h1>
        <p className="text-gray-400">
          View and manage industry-specific prompt templates. Prompts are loaded from{' '}
          <code className="text-blue-400">lib/prompts/industry/</code>
        </p>
      </div>

      {/* Industry Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Select Industry</label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value as Industry)}
          className="w-full max-w-md px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {industries.map((industry) => (
            <option key={industry.value} value={industry.value}>
              {industry.label} {industry.enabled ? '' : '(Coming Soon)'}
            </option>
          ))}
        </select>
      </div>

      {/* Industry Info */}
      <div className="mb-6 bg-gray-800 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-white">{selectedIndustryData?.label}</h2>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedIndustryData?.enabled
                    ? 'bg-green-900/30 text-green-400 border border-green-800'
                    : 'bg-gray-700 text-gray-400 border border-gray-600'
                }`}
              >
                {selectedIndustryData?.enabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-gray-400">{selectedIndustryData?.description}</p>
          </div>
        </div>
      </div>

      {/* Prompt Templates */}
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
          <h3 className="text-lg font-semibold text-white">Prompt Templates</h3>
        </div>

        <div className="divide-y divide-gray-700">
          {promptTypes.map((prompt, index) => (
            <div key={prompt.key} className="px-6 py-4 hover:bg-gray-750 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm text-gray-500 font-mono">Step {index + 1}/8</span>
                    <h4 className="text-base font-medium text-white">{prompt.label}</h4>
                    {selectedIndustryData?.enabled && (
                      <span className="px-2 py-0.5 text-xs bg-blue-900/30 text-blue-400 border border-blue-800 rounded">
                        Industry-Specific
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">{prompt.description}</p>

                  {selectedIndustryData?.enabled && (
                    <div className="mt-2">
                      <code className="text-xs text-gray-500 font-mono">
                        lib/prompts/industry/{selectedIndustry.toLowerCase().replace(/_/g, '-')}.ts
                      </code>
                    </div>
                  )}
                </div>

                <div className="ml-6">
                  {selectedIndustryData?.enabled ? (
                    <button
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                      onClick={() => alert('View/Edit functionality coming soon')}
                    >
                      View Prompt
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 bg-gray-700 text-gray-500 text-xs rounded">Generic</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-900/20 border border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-400 mb-1">Creating Industry-Specific Prompts</h3>
            <p className="text-sm text-gray-400 mb-2">
              Industry-specific prompts allow you to tailor the analysis to different vertical markets. Each industry can override any or all of the 8 prompt templates.
            </p>
            <p className="text-sm text-gray-400">
              Edit the TypeScript file at{' '}
              <code className="text-blue-400">
                lib/prompts/industry/{selectedIndustry.toLowerCase().replace(/_/g, '-')}.ts
              </code>{' '}
              to customize prompts for this industry.
            </p>
          </div>
        </div>
      </div>

      {!selectedIndustryData?.enabled && (
        <div className="mt-6 bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">Industry Not Enabled</h3>
              <p className="text-sm text-gray-400">
                This industry is using generic prompts. To create industry-specific prompts, create a new file and enable it in the loader configuration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
