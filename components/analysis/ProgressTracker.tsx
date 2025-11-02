'use client';

import { useEffect, useState } from 'react';
import { ProviderStatus } from './ProviderStatus';
import { StepIndicator } from './StepIndicator';

interface ProgressData {
  id: string;
  url: string;
  status: 'PENDING' | 'SCRAPING' | 'ANALYZING' | 'COMPLETED' | 'FAILED';
  progressMessage: string;
  progressPercent: number;
  reportUrl?: string | null;
  providers: {
    OPENAI: ProviderInfo;
    ANTHROPIC: ProviderInfo;
    GOOGLE: ProviderInfo;
  };
  llmSummary: {
    total: number;
    completed: number;
    failed: number;
    running: number;
  };
}

interface ProviderInfo {
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  model?: string | null;
  tokensUsed?: number;
  cost?: number;
  error?: string | null;
}

interface ProgressTrackerProps {
  projectId: string;
  onComplete?: (reportUrl: string) => void;
}

export function ProgressTracker({ projectId, onComplete }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(180); // 3 minutes in seconds

  useEffect(() => {
    const eventSource = new EventSource(`/api/projects/${projectId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setError(data.error);
          eventSource.close();
          return;
        }

        setProgress(data);

        // Calculate estimated time based on progress
        const remaining = Math.max(0, Math.floor((100 - data.progressPercent) * 2));
        setEstimatedTime(remaining);

        // If completed, trigger callback
        if (data.status === 'COMPLETED' && data.reportUrl && onComplete) {
          setTimeout(() => {
            eventSource.close();
            onComplete(data.reportUrl);
          }, 2000);
        }

        // If failed, close stream
        if (data.status === 'FAILED') {
          setError('Analysis failed. Please try again.');
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = () => {
      setError('Connection lost. Please refresh the page.');
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [projectId, onComplete]);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="flex items-center justify-center gap-3 p-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Connecting...</p>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes} min ${secs > 0 ? `${secs} sec` : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">
          {progress.progressMessage}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Analyzing <span className="font-medium">{progress.url}</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>{progress.progressPercent}% complete</span>
          {progress.status !== 'COMPLETED' && progress.status !== 'FAILED' && (
            <span>~{formatTime(estimatedTime)} remaining</span>
          )}
        </div>
      </div>

      {/* Step Indicators */}
      <div className="space-y-3">
        <StepIndicator
          title="Scraping Website"
          description="Extracting key pages and content"
          status={progress.status === 'PENDING' ? 'waiting' : 'complete'}
        />
        <StepIndicator
          title="Analyzing with AI Models"
          description="Consulting OpenAI, Anthropic, and Google"
          status={
            progress.status === 'ANALYZING' ? 'active' :
            progress.status === 'COMPLETED' ? 'complete' :
            progress.status === 'SCRAPING' ? 'waiting' : 'waiting'
          }
        />
        <StepIndicator
          title="Generating Report"
          description="Compiling insights and recommendations"
          status={progress.status === 'COMPLETED' ? 'complete' : 'waiting'}
        />
      </div>

      {/* Provider Status Panel (during ANALYZING phase) */}
      {progress.status === 'ANALYZING' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
            AI Model Analysis Progress
          </h3>
          <div className="space-y-2">
            <ProviderStatus
              name="OpenAI GPT-4o"
              status={progress.providers.OPENAI.status}
              model={progress.providers.OPENAI.model}
              error={progress.providers.OPENAI.error}
            />
            <ProviderStatus
              name="Anthropic Claude"
              status={progress.providers.ANTHROPIC.status}
              model={progress.providers.ANTHROPIC.model}
              error={progress.providers.ANTHROPIC.error}
            />
            <ProviderStatus
              name="Google Gemini"
              status={progress.providers.GOOGLE.status}
              model={progress.providers.GOOGLE.model}
              error={progress.providers.GOOGLE.error}
            />
          </div>

          {progress.llmSummary.failed > 0 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                ⚠ {progress.llmSummary.failed} provider(s) failed, continuing with {progress.llmSummary.completed} successful provider(s)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Completion Status */}
      {progress.status === 'COMPLETED' && (
        <div className="text-center">
          <svg
            className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4 animate-bounce"
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
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            Analysis Complete!
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Redirecting to your report...
          </p>
        </div>
      )}

      {/* Loading Animation */}
      {progress.status !== 'COMPLETED' && progress.status !== 'FAILED' && (
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {/* Helpful Tip */}
      {progress.status !== 'COMPLETED' && progress.status !== 'FAILED' && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 You can leave this page - we'll email you when the analysis is complete
          </p>
        </div>
      )}
    </div>
  );
}
