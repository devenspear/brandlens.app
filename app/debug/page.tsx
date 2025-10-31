'use client';

import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/shared/theme-toggle';

interface HealthCheck {
  timestamp: string;
  status: string;
  checks: {
    database: {
      status: string;
      message: string;
      responseTime?: string;
      error?: string;
    };
    environment: {
      status: string;
      required: Record<string, boolean>;
      optional: Record<string, boolean>;
    };
    api: {
      status: string;
      endpoints: Record<string, string>;
    };
  };
  system: {
    nodeVersion: string;
    platform: string;
    uptime: string;
    memory: {
      used: string;
      total: string;
    };
  };
  responseTime: string;
}

interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  error?: string;
}

interface ApiStats {
  total: number;
  last5Minutes: number;
  errors: number;
  averageDuration: number;
  byStatus: Record<number, number>;
}

export default function DebugPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Failed to fetch health:', error);
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/debug/logs?stats=true');
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
  };

  const clearLogs = async () => {
    try {
      await fetch('/api/debug/logs', { method: 'DELETE' });
      fetchLogs();
    } catch (error) {
      console.error('Failed to clear logs:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchHealth(), fetchLogs()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealth();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'available':
        return 'text-green-600 dark:text-green-400';
      case 'unhealthy':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-yellow-600 dark:text-yellow-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'healthy':
      case 'available':
        return `${baseClasses} bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300`;
      case 'unhealthy':
        return `${baseClasses} bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300`;
      default:
        return `${baseClasses} bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300`;
    }
  };

  const getHttpStatusColor = (status?: number) => {
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-600 dark:text-yellow-400';
    if (status >= 500) return 'text-red-600 dark:text-red-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Diagnostics</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring and debugging</p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (5s)
              </label>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">Overall Status</h2>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${health?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
              <div>
                <span className={`text-xl font-bold ${getStatusColor(health?.status || '')}`}>
                  {health?.status?.toUpperCase()}
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">Response: {health?.responseTime}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">API Activity</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                <span className="font-semibold dark:text-white">{stats?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last 5 min</span>
                <span className="font-semibold dark:text-white">{stats?.last5Minutes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Errors</span>
                <span className={`font-semibold ${(stats?.errors || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats?.errors || 0}
                </span>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 dark:text-white">System Info</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Node.js</span>
                <span className="font-mono text-xs dark:text-white">{health?.system.nodeVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Memory</span>
                <span className="font-mono text-xs dark:text-white">
                  {health?.system.memory.used} / {health?.system.memory.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="font-mono text-xs dark:text-white">{health?.system.uptime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 dark:text-white">Health Checks</h2>

          {/* Database */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Database</h3>
              <span className={getStatusBadge(health?.checks.database.status || '')}>
                {health?.checks.database.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{health?.checks.database.message}</p>
            {health?.checks.database.responseTime && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Response time: {health.checks.database.responseTime}
              </p>
            )}
            {health?.checks.database.error && (
              <pre className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                {health.checks.database.error}
              </pre>
            )}
          </div>

          {/* Environment Variables */}
          <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">Environment Variables</h3>
              <span className={getStatusBadge(health?.checks.environment.status || '')}>
                {health?.checks.environment.status}
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Required:</p>
              {Object.entries(health?.checks.environment.required || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-gray-600 dark:text-gray-400">{key}</span>
                  <span className={value ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {value ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
              ))}
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-4">Optional:</p>
              {Object.entries(health?.checks.environment.optional || {}).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-gray-600 dark:text-gray-400">{key}</span>
                  <span className={value ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                    {value ? '✓ Set' : '- Not set'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* API Endpoints */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">API Endpoints</h3>
              <span className={getStatusBadge(health?.checks.api.status || '')}>
                {health?.checks.api.status}
              </span>
            </div>
            <div className="space-y-2 mt-4">
              {Object.entries(health?.checks.api.endpoints || {}).map(([path, status]) => (
                <div key={path} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-gray-600 dark:text-gray-400">{path}</span>
                  <span className={getStatusColor(status)}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* API Logs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Recent API Calls</h2>
            <button
              onClick={clearLogs}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"
            >
              Clear Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Time</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Method</th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">URL</th>
                  <th className="text-center py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="text-right py-2 px-3 font-semibold text-gray-700 dark:text-gray-300">Duration</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No API calls logged yet
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                          {log.method}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-gray-700 dark:text-gray-300">{log.url}</td>
                      <td className="py-2 px-3 text-center">
                        {log.status ? (
                          <span className={`font-semibold ${getHttpStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-600 dark:text-gray-400">
                        {log.duration ? `${log.duration}ms` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Last updated: {new Date(health?.timestamp || '').toLocaleString()}
        </div>
      </div>
    </div>
  );
}
