'use client';

import { getAllIndustries } from '@/lib/prompts/loader';

export default function IndustriesPage() {
  const industries = getAllIndustries();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Industry Management</h1>
        <p className="text-gray-400">
          Manage which industries are available for analysis. Only enabled industries will appear in the homepage selector.
        </p>
      </div>

      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 bg-gray-750">
          <h2 className="text-lg font-semibold text-white">Available Industries</h2>
        </div>

        <div className="divide-y divide-gray-700">
          {industries.map((industry) => (
            <div
              key={industry.value}
              className="px-6 py-4 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white">{industry.label}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        industry.enabled
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : 'bg-gray-700 text-gray-400 border border-gray-600'
                      }`}
                    >
                      {industry.enabled ? 'Active' : 'Coming Soon'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{industry.description}</p>

                  {industry.enabled && (
                    <div className="mt-3 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs text-gray-400">Industry-specific prompts configured</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-xs text-gray-400">
                          Available in production
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-6">
                  {industry.enabled ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-700 text-gray-400 text-sm rounded-lg cursor-not-allowed"
                      title="Use code editor to disable"
                    >
                      Enabled
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-700 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                      title="Coming soon - configure prompts first"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
            <h3 className="text-sm font-semibold text-blue-400 mb-1">How to Enable New Industries</h3>
            <p className="text-sm text-gray-400">
              To enable a new industry:
            </p>
            <ol className="text-sm text-gray-400 mt-2 space-y-1 list-decimal list-inside">
              <li>Create industry-specific prompts in <code className="text-blue-400">lib/prompts/industry/</code></li>
              <li>Set <code className="text-blue-400">enabled: true</code> in <code className="text-blue-400">lib/prompts/loader.ts</code></li>
              <li>Test with sample websites from that industry</li>
              <li>Deploy to production</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-3xl font-bold text-white mb-1">
              {industries.filter((i) => i.enabled).length}
            </div>
            <div className="text-sm text-gray-400">Active Industries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">
              {industries.filter((i) => !i.enabled).length}
            </div>
            <div className="text-sm text-gray-400">Coming Soon</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">{industries.length}</div>
            <div className="text-sm text-gray-400">Total Industries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
