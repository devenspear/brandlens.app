'use client';

import { useEffect, useState } from 'react';

interface OverviewStats {
  totalProjects: number;
  activeAnalyses: number;
  completedToday: number;
  pendingProjects: number;
  failedProjects: number;
  successRate: number;
  avgAnalysisTime: string;
  totalCostMTD: number;
}

interface ProviderStats {
  totalRuns: number;
  successful: number;
  failed: number;
  successRate: number;
  avgTokens: number;
  totalTokens: number;
  totalCost: number;
  avgCost: number;
}

interface Project {
  id: string;
  url: string;
  industry: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  email: string;
  progressPercent?: number;
}

interface IndustryStats {
  industry: string;
  count: number;
  completed: number;
  failed: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [providers, setProviders] = useState<Record<string, ProviderStats> | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [industries, setIndustries] = useState<IndustryStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, providersRes, recentRes, industriesRes] = await Promise.all([
          fetch('/api/admin/analytics/overview'),
          fetch('/api/admin/analytics/providers'),
          fetch('/api/admin/analytics/recent?limit=10'),
          fetch('/api/admin/analytics/industries'),
        ]);

        const overviewData = await overviewRes.json();
        const providersData = await providersRes.json();
        const recentData = await recentRes.json();
        const industriesData = await industriesRes.json();

        setOverview(overviewData);
        setProviders(providersData);
        setRecentProjects(recentData.projects || []);
        setIndustries(industriesData.industries || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-900/20 text-green-400 border-green-800';
      case 'ANALYZING':
      case 'SCRAPING':
        return 'bg-blue-900/20 text-blue-400 border-blue-800';
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-800';
      case 'FAILED':
        return 'bg-red-900/20 text-red-400 border-red-800';
      default:
        return 'bg-gray-900/20 text-gray-400 border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time system analytics and performance metrics</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Projects</span>
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.totalProjects.toLocaleString()}</div>
            <div className="text-xs text-gray-500">All time</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Active Analyses</span>
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.activeAnalyses}</div>
            <div className="text-xs text-gray-500">Running now</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Success Rate</span>
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{overview.successRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Completed / Total</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Cost (MTD)</span>
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-1">${overview.totalCostMTD.toFixed(2)}</div>
            <div className="text-xs text-gray-500">Avg time: {overview.avgAnalysisTime}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* LLM Provider Performance */}
        {providers && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              LLM Provider Performance
            </h2>
            <div className="space-y-4">
              {Object.entries(providers).map(([provider, stats]) => (
                <div key={provider} className="border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">{provider}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      stats.successRate >= 95 ? 'bg-green-900/20 text-green-400' :
                      stats.successRate >= 85 ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {stats.successRate.toFixed(1)}% success
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Total Runs:</span>
                      <span className="ml-2 text-white font-medium">{stats.totalRuns}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Avg Tokens:</span>
                      <span className="ml-2 text-white font-medium">{stats.avgTokens.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Total Cost:</span>
                      <span className="ml-2 text-white font-medium">${stats.totalCost.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Failed:</span>
                      <span className="ml-2 text-red-400 font-medium">{stats.failed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Industry Distribution
          </h2>
          <div className="space-y-3">
            {industries.slice(0, 5).map((industry) => (
              <div key={industry.industry} className="border border-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{industry.industry.replace(/_/g, ' ')}</span>
                  <span className="text-gray-400 text-sm">{industry.count} projects</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
                      style={{ width: `${industry.completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{industry.completionRate.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left">
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">URL</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Industry</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Created</th>
                <th className="pb-3 text-xs font-semibold text-gray-400 uppercase">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {recentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-700/30 transition">
                  <td className="py-3 text-sm text-white truncate max-w-xs">{project.url}</td>
                  <td className="py-3 text-sm text-gray-400">{project.industry.replace(/_/g, ' ')}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-sm text-gray-400 truncate max-w-xs">{project.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
