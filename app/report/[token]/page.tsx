'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';

interface Report {
  projectId: string;
  url: string;
  region?: string;
  generatedAt: string;
  executiveSummary: {
    overview: string;
    topActions: any[];
  };
  modelPerspectives: any[];
  consensus: any;
  positioning: any;
  messaging: any;
  recommendations: any[];
  metadata: {
    pagesAnalyzed: number;
    tokensUsed: number;
    cost: number;
  };
}

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'messaging' | 'recommendations'>('overview');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/reports/${params.token}`);
        if (!response.ok) {
          throw new Error('Report not found');
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (params.token) {
      fetchReport();
    }
  }, [params.token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Report Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Analysis
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Brand Audit Report</h1>
              <p className="text-xl text-gray-700 dark:text-gray-300">{report.url}</p>
              {report.region && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{report.region}</p>
              )}
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg transition-colors">
              Export PDF
            </button>
          </div>

          <div className="flex gap-6 mt-8 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Generated:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(report.generatedAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Pages analyzed:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-white">{report.metadata.pagesAnalyzed}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">AI models:</span>{' '}
              <span className="font-medium text-gray-900 dark:text-white">{report.modelPerspectives.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'models', label: 'Model Perspectives' },
              { id: 'messaging', label: 'Messaging Analysis' },
              { id: 'recommendations', label: 'Recommendations' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Executive Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">Executive Summary</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {report.executiveSummary.overview}
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 dark:text-white">Top Priority Actions</h3>
                <div className="space-y-3">
                  {report.executiveSummary.topActions.slice(0, 5).map((action: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg"
                    >
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium dark:text-white">{action.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              action.impact === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : action.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            }`}
                          >
                            {action.impact} impact
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            {action.effort} effort
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Consensus Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4 dark:text-white">AI Consensus</h2>
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-blue-600">
                    {report.consensus.agreementIndex}%
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">Agreement across models</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full"
                    style={{ width: `${report.consensus.agreementIndex}%` }}
                  />
                </div>
              </div>

              {report.consensus.commonThemes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3 dark:text-white">Common Themes</h3>
                  <div className="flex flex-wrap gap-2">
                    {report.consensus.commonThemes.map((theme: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {report.consensus.divergences?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 dark:text-white">Key Divergences</h3>
                  <div className="space-y-3">
                    {report.consensus.divergences.map((div: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <p className="font-medium dark:text-white">{div.topic}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {div.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
            {report.modelPerspectives.map((perspective: any, index: number) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {perspective.provider.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">{perspective.provider}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{perspective.model}</p>
                  </div>
                </div>

                {perspective.synopsis?.summary && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 dark:text-white">Brand Synopsis</h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {perspective.synopsis.summary}
                    </p>
                  </div>
                )}

                {perspective.synopsis?.pillars?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 dark:text-white">Positioning Pillars</h3>
                    <div className="space-y-2">
                      {perspective.synopsis.pillars.slice(0, 5).map((pillar: any, pidx: number) => (
                        <div
                          key={pidx}
                          className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <p className="font-medium dark:text-white">{pillar.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {pillar.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {perspective.synopsis?.toneOfVoice?.adjectives && (
                  <div>
                    <h3 className="font-semibold mb-3 dark:text-white">Tone of Voice</h3>
                    <div className="flex flex-wrap gap-2">
                      {perspective.synopsis.toneOfVoice.adjectives.map((adj: string, aidx: number) => (
                        <span
                          key={aidx}
                          className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                        >
                          {adj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'messaging' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Messaging Quality Analysis</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(report.messaging || {}).map(([key, value]: [string, any]) => (
                <div
                  key={key}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg capitalize dark:text-white">{key}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        value.level === 'high'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : value.level === 'medium'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {value.level}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-full rounded-full ${
                          value.level === 'high'
                            ? 'bg-green-500'
                            : value.level === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${value.score || 50}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {value.rationale}
                  </p>
                  {value.recommendations?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Quick Wins:
                      </p>
                      <ul className="space-y-1">
                        {value.recommendations.slice(0, 2).map((rec: string, ridx: number) => (
                          <li
                            key={ridx}
                            className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2"
                          >
                            <span className="text-blue-600 dark:text-blue-400">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Detailed Recommendations</h2>
            <div className="space-y-6">
              {report.recommendations.map((rec: any, index: number) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg dark:text-white flex-1">{rec.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          rec.impact === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : rec.impact === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {rec.impact}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {rec.effort}
                      </span>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {rec.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{rec.description}</p>
                  {rec.before && rec.after && (
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">
                          Before:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec.before}</p>
                      </div>
                      <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">
                          After:
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec.after}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4 max-w-6xl text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            This audit is based on public content analysis and AI model interpretations. Not a
            compliance certification or technical performance test.
          </p>
          <p className="mt-2">
            Generated with LLM Brand Lens • {report.metadata.tokensUsed.toLocaleString()} tokens •{' '}
            {report.modelPerspectives.length} AI models
          </p>
        </div>
      </div>
    </div>
  );
}
