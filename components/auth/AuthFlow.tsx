'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PendingAnalysis {
  url: string;
  industry: string;
  region?: string;
}

/**
 * AuthFlow component handles seamless signup flow
 * - Stores pending analysis data
 * - Auto-submits after authentication
 * - Provides feedback during the process
 */
export function useAuthFlow() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null);

  // Check for pending analysis on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const pending = sessionStorage.getItem('pendingAnalysis');
    if (pending) {
      try {
        setPendingAnalysis(JSON.parse(pending));
      } catch {
        sessionStorage.removeItem('pendingAnalysis');
      }
    }
  }, []);

  /**
   * Store analysis data and redirect to signup
   */
  const startSignupFlow = (analysisData: PendingAnalysis) => {
    sessionStorage.setItem('pendingAnalysis', JSON.stringify(analysisData));
    router.push('/sign-up');
  };

  /**
   * Get pending analysis and clear storage
   */
  const getPendingAnalysis = (): PendingAnalysis | null => {
    const pending = pendingAnalysis;
    if (pending) {
      sessionStorage.removeItem('pendingAnalysis');
      setPendingAnalysis(null);
    }
    return pending;
  };

  /**
   * Clear pending analysis
   */
  const clearPendingAnalysis = () => {
    sessionStorage.removeItem('pendingAnalysis');
    setPendingAnalysis(null);
  };

  return {
    isSignedIn,
    user,
    isLoaded,
    hasPendingAnalysis: !!pendingAnalysis,
    pendingAnalysis,
    startSignupFlow,
    getPendingAnalysis,
    clearPendingAnalysis,
  };
}

/**
 * Component to show signup prompt with context
 */
export function SignupPrompt({
  message = 'Sign up to continue',
  onSignup,
}: {
  message?: string;
  onSignup?: () => void;
}) {
  const router = useRouter();

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      router.push('/sign-up');
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">🔐</div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
        Authentication Required
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={handleSignup}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Create Free Account
        </button>
        <button
          onClick={() => router.push('/sign-in')}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-semibold"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
