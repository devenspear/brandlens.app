'use client';

interface StepIndicatorProps {
  title: string;
  description: string;
  status: 'waiting' | 'active' | 'complete';
}

export function StepIndicator({ title, description, status }: StepIndicatorProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'complete':
        return {
          icon: (
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          bgColor: 'bg-green-500',
          textColor: 'text-gray-900 dark:text-white',
          descColor: 'text-gray-600 dark:text-gray-400',
        };
      case 'active':
        return {
          icon: (
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
          ),
          bgColor: 'bg-blue-500',
          textColor: 'text-gray-900 dark:text-white font-semibold',
          descColor: 'text-blue-600 dark:text-blue-400',
        };
      case 'waiting':
      default:
        return {
          icon: null,
          bgColor: 'bg-gray-300 dark:bg-gray-600',
          textColor: 'text-gray-500 dark:text-gray-400',
          descColor: 'text-gray-400 dark:text-gray-500',
        };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${display.bgColor} transition-all duration-300`}
      >
        {display.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${display.textColor} transition-colors duration-300`}>
          {title}
        </p>
        <p className={`text-sm ${display.descColor} transition-colors duration-300`}>
          {description}
        </p>
      </div>
    </div>
  );
}
