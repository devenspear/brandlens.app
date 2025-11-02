'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AdminStats {
  system: {
    uptime: number;
    dbConnected: boolean;
    timestamp: string;
  };
  projects: {
    total: number;
    completed: number;
    analyzing: number;
    scraping: number;
    failed: number;
    pending: number;
  };
  providers: {
    OPENAI: ProviderStats;
    ANTHROPIC: ProviderStats;
    GOOGLE: ProviderStats;
  };
  performance: {
    avgAnalysisTime: number;
    totalCost: number;
    avgCostPerAnalysis: number;
    totalTokens: number;
  };
  recent: RecentProject[];
  users: {
    totalEmails: number;
    topDomains: { domain: string; count: number }[];
  };
}

interface ProviderStats {
  total: number;
  completed: number;
  failed: number;
  successRate: number;
  totalCost: number;
  totalTokens: number;
  avgTokens: number;
}

interface RecentProject {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  email: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) throw new Error('Failed to fetch admin stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-white text-2xl">Loading admin dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    );
  }

  if (!stats) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400';
      case 'RUNNING': return 'text-blue-400';
      case 'FAILED': return 'text-red-400';
      case 'PENDING': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">BrandLens Admin Dashboard</h1>
          <p className="text-gray-400">System monitoring and analytics • Last updated: {new Date(stats.system.timestamp).toLocaleTimeString()}</p>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stats.system.dbConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-2xl font-bold text-white">
                  {stats.system.dbConnected ? 'Online' : 'Offline'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Database connected</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.projects.total}</div>
              <p className="text-xs text-gray-500 mt-1">All-time analyses</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">
                {stats.projects.total > 0
                  ? ((stats.projects.completed / stats.projects.total) * 100).toFixed(1)
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">{stats.projects.completed} completed</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">${stats.performance.totalCost.toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">LLM API costs</p>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Breakdown */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Project Status Breakdown</CardTitle>
            <CardDescription className="text-gray-400">Current state of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-green-400">{stats.projects.completed}</div>
                <div className="text-sm text-gray-400 mt-1">Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-blue-400">{stats.projects.analyzing}</div>
                <div className="text-sm text-gray-400 mt-1">Analyzing</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-cyan-400">{stats.projects.scraping}</div>
                <div className="text-sm text-gray-400 mt-1">Scraping</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-red-400">{stats.projects.failed}</div>
                <div className="text-sm text-gray-400 mt-1">Failed</div>
              </div>
              <div className="text-center p-4 bg-gray-700 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400">{stats.projects.pending}</div>
                <div className="text-sm text-gray-400 mt-1">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LLM Provider Performance */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">LLM Provider Performance</CardTitle>
            <CardDescription className="text-gray-400">Success rates, costs, and token usage by provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(stats.providers).map(([provider, data]) => (
                <div key={provider} className="border-b border-gray-700 pb-6 last:border-b-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-white">{provider}</h3>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        data.successRate >= 90 ? 'bg-green-500/20 text-green-400' :
                        data.successRate >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {data.successRate.toFixed(1)}% success
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Total Runs</div>
                      <div className="text-2xl font-bold text-white">{data.total}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Completed</div>
                      <div className="text-2xl font-bold text-green-400">{data.completed}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Failed</div>
                      <div className="text-2xl font-bold text-red-400">{data.failed}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Total Cost</div>
                      <div className="text-2xl font-bold text-white">${data.totalCost.toFixed(3)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg Tokens</div>
                      <div className="text-2xl font-bold text-blue-400">{Math.round(data.avgTokens)}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.successRate >= 90 ? 'bg-green-500' :
                          data.successRate >= 70 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${data.successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Avg Analysis Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">
                N/A
              </div>
              <p className="text-sm text-gray-400 mt-2">Tracking not yet implemented</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cost Per Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ${stats.performance.avgCostPerAnalysis.toFixed(4)}
              </div>
              <p className="text-sm text-gray-400 mt-2">Average across all providers</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Total Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {(stats.performance.totalTokens / 1000).toFixed(1)}K
              </div>
              <p className="text-sm text-gray-400 mt-2">All LLM providers combined</p>
            </CardContent>
          </Card>
        </div>

        {/* User Analytics */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">User Analytics</CardTitle>
            <CardDescription className="text-gray-400">Email domains and usage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-gray-400">Total Unique Emails</div>
              <div className="text-3xl font-bold text-white">{stats.users.totalEmails}</div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-400 mb-3">Top Email Domains</div>
              {stats.users.topDomains.map((domain, idx) => (
                <div key={domain.domain} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-gray-400 font-mono">#{idx + 1}</div>
                    <div className="text-white font-medium">{domain.domain}</div>
                  </div>
                  <div className="text-blue-400 font-bold">{domain.count} users</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Projects</CardTitle>
            <CardDescription className="text-gray-400">Latest 10 analysis submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recent.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <a
                        href={`/project/${project.id}`}
                        className="text-white font-medium hover:text-blue-400 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {project.url}
                      </a>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {project.email} • {new Date(project.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {project.id.substring(0, 8)}...
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
