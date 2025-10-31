'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';

type ProjectStatus = 'PENDING' | 'SCRAPING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';

interface ProjectData {
  id: string;
  url: string;
  status: ProjectStatus;
  reportUrl?: string;
}

export default function ProjectStatusPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!params.id) return;

    const pollProject = async () => {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }

        const data = await response.json();
        setProject(data);

        if (data.status === 'COMPLETED' && data.reportUrl) {
          // Redirect to report after a short delay
          setTimeout(() => {
            router.push(data.reportUrl);
          }, 2000);
        } else if (data.status === 'FAILED') {
          setError('Analysis failed. Please try again.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    };

    // Initial poll
    pollProject();

    // Poll every 5 seconds until completed or failed
    const interval = setInterval(() => {
      if (project?.status === 'COMPLETED' || project?.status === 'FAILED') {
        clearInterval(interval);
      } else {
        pollProject();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [params.id, project?.status, router]);

  const getStatusMessage = (status: ProjectStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Preparing analysis...';
      case 'SCRAPING':
        return 'Analyzing your website...';
      case 'ANALYZING':
        return 'Consulting multiple AI models...';
      case 'COMPLETED':
        return 'Analysis complete! Redirecting to your report...';
      case 'FAILED':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  const getProgressPercentage = (status: ProjectStatus) => {
    switch (status) {
      case 'PENDING':
        return 10;
      case 'SCRAPING':
        return 30;
      case 'ANALYZING':
        return 70;
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">
              {project ? getStatusMessage(project.status) : 'Loading...'}
            </h1>
            {project && (
              <p className="text-gray-600 dark:text-gray-400">
                Analyzing <span className="font-medium">{project.url}</span>
              </p>
            )}
          </div>

          {error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="text-center mb-6">
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
                <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Analysis Failed</p>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">{error}</p>
              </div>

              {/* Error Details */}
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-950/30 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs font-semibold text-red-800 dark:text-red-200 mb-2">Possible causes:</p>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                  <li>Website is not accessible or protected</li>
                  <li>Temporary server issue</li>
                  <li>Invalid URL format</li>
                  <li>Database connectivity issue</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <a
                  href="/debug"
                  target="_blank"
                  className="px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  View System Diagnostics
                </a>
                <a
                  href="/api/health"
                  target="_blank"
                  className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Check API Health
                </a>
              </div>

              {/* Support Info */}
              <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-800">
                <p className="text-xs text-center text-red-600 dark:text-red-400">
                  If the problem persists, check the system diagnostics page for detailed error logs
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500 ease-out"
                    style={{
                      width: `${project ? getProgressPercentage(project.status) : 0}%`,
                    }}
                  />
                </div>
                {project && (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {getProgressPercentage(project.status)}% complete
                  </p>
                )}
              </div>

              {/* Loading Animation */}
              {project?.status !== 'COMPLETED' && project?.status !== 'FAILED' && (
                <div className="flex justify-center mb-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {project?.status === 'COMPLETED' && (
                <div className="text-center">
                  <svg
                    className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              )}

              {/* What's Happening */}
              <div className="space-y-4">
                <h2 className="font-semibold text-lg dark:text-white mb-3">What we're doing:</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        project &&
                        ['SCRAPING', 'ANALYZING', 'COMPLETED'].includes(project.status)
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Scanning your website</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Extracting key pages and content
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        project && ['ANALYZING', 'COMPLETED'].includes(project.status)
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">AI model analysis</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Consulting OpenAI, Anthropic, and Google
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        project?.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium dark:text-white">Generating your report</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compiling insights and recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
