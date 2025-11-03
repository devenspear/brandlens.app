'use client';

interface ProviderStatusProps {
  name: string;
  status: 'WAITING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  model?: string | null;
  error?: string | null;
}

export function ProviderStatus({ name, status, model, error }: ProviderStatusProps) {
  // Convert technical errors to user-friendly messages
  const getUserFriendlyError = (errorMsg: string | null | undefined): string | null => {
    if (!errorMsg) return null;

    // Hide technical error details from users
    // Log them for debugging but show generic message
    console.error(`LLM Provider Error (${name}):`, errorMsg);

    // Return user-friendly message
    return 'Temporarily unavailable';
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: (
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: 'Complete',
          textColor: 'text-green-600 dark:text-green-400',
          indicator: <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />,
        };
      case 'RUNNING':
        return {
          icon: (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ),
          text: 'Running...',
          textColor: 'text-blue-600 dark:text-blue-400',
          indicator: <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />,
        };
      case 'FAILED':
        return {
          icon: (
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          text: 'Skipped',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          indicator: <span className="w-2 h-2 rounded-full bg-yellow-500" />,
        };
      case 'WAITING':
      default:
        return {
          icon: (
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: 'Waiting...',
          textColor: 'text-gray-500 dark:text-gray-400',
          indicator: <span className="w-2 h-2 rounded-full bg-gray-400" />,
        };
    }
  };

  const display = getStatusDisplay();
  const friendlyError = getUserFriendlyError(error);

  return (
    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">{display.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
            {name}
          </p>
          {model && status === 'COMPLETED' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {model}
            </p>
          )}
          {friendlyError && status === 'FAILED' && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate">
              {friendlyError}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-medium ${display.textColor}`}>
          {display.text}
        </span>
        {display.indicator}
      </div>
    </div>
  );
}
