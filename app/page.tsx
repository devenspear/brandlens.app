'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { ProgressTracker } from '@/components/analysis/ProgressTracker';
import { getVersionString } from '@/lib/utils/version';
import { Industry } from '@prisma/client';
import { getAllIndustries } from '@/lib/prompts/loader';

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState<Industry>(Industry.RESIDENTIAL_REAL_ESTATE);
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showHeroForm, setShowHeroForm] = useState(false);

  const industries = getAllIndustries();

  // Handle pending analysis after sign-up
  useEffect(() => {
    if (isSignedIn && user) {
      const pendingUrl = sessionStorage.getItem('pendingAnalysisUrl');
      const pendingIndustry = sessionStorage.getItem('pendingAnalysisIndustry');
      const pendingRegion = sessionStorage.getItem('pendingAnalysisRegion');

      if (pendingUrl && pendingIndustry) {
        // Restore form values
        setUrl(pendingUrl);
        setIndustry(pendingIndustry as Industry);
        if (pendingRegion) setRegion(pendingRegion);

        // Clear session storage
        sessionStorage.removeItem('pendingAnalysisUrl');
        sessionStorage.removeItem('pendingAnalysisIndustry');
        sessionStorage.removeItem('pendingAnalysisRegion');

        // Auto-submit the form
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }, 500);
      }
    }
  }, [isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user is signed in
      if (!isSignedIn) {
        // Store URL in session storage for after sign-up
        sessionStorage.setItem('pendingAnalysisUrl', url);
        sessionStorage.setItem('pendingAnalysisIndustry', industry);
        if (region) sessionStorage.setItem('pendingAnalysisRegion', region);

        // Redirect to sign-up
        router.push('/sign-up');
        return;
      }

      let normalizedUrl = url.trim();
      if (!/^https?:\/\//i.test(normalizedUrl)) {
        normalizedUrl = `https://${normalizedUrl}`;
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          email: user?.primaryEmailAddress?.emailAddress || '',
          industry,
          region: region || undefined
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create project');
      }

      const project = await response.json();
      setProjectId(project.id);
      setAnalyzing(true);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const handleAnalysisComplete = (reportUrl: string) => {
    router.push(reportUrl);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Theme Toggle & User Button */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
        {isSignedIn && (
          <>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition font-medium"
            >
              Dashboard
            </a>
            <UserButton afterSignOutUrl="/" />
          </>
        )}
        <ThemeToggle />
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-900 dark:via-purple-900 dark:to-pink-900">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            {/* Branding */}
            <div className="mb-6">
              <span className="text-white/90 text-sm font-semibold tracking-wider uppercase">
                BrandLens — The AI Perception Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              See Your Brand Through<br/>the Eyes of AI
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              ChatGPT, Claude, Gemini, and Perplexity already describe your brand.<br/>
              Run a free test report to see what they say — and how to fix it.
            </p>

            {/* CTA Button */}
            <button
              onClick={() => setShowHeroForm(!showHeroForm)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <span>🧠</span>
              Run a Test Report — Free
            </button>

            <p className="text-white/70 text-sm mt-4">
              Just enter your website and create your BrandLens account to get started.
            </p>

            {/* Hero Form (conditional) - Only show if not analyzing */}
            {showHeroForm && (
              <div className="mt-8 mx-auto max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                {!analyzing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://yourbrand.com"
                      required
                      className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg placeholder-gray-400 focus:ring-4 focus:ring-blue-500 focus:border-transparent"
                    />
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading || !url}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
                    >
                      {loading ? 'Starting...' : '→ Generate My Report'}
                    </button>
                    {!isSignedIn && (
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        You'll be prompted to sign up after clicking the button
                      </p>
                    )}
                  </form>
                ) : projectId && (
                  <ProgressTracker projectId={projectId} onComplete={handleAnalysisComplete} />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECTION 1 — The Why */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Online Presence Is Already Being Read by AI
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
            Large language models now summarize, recommend, and rank every brand online — shaping how customers and investors perceive you.
            <br/><br/>
            <strong>BrandLens turns that hidden narrative into data you can manage.</strong>
          </p>
          <a
            href="#try-it"
            className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            Understand AI Perception →
          </a>
        </div>
      </section>

      {/* SECTION 2 — Try It Yourself */}
      <section id="try-it" className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Experience the Power of AI Perception in 60 Seconds
          </h2>

          {!analyzing ? (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-4 border-blue-600 dark:border-blue-400 rounded-2xl p-10 mb-12">
              <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                Run a Free AI Perception Test
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourbrand.com"
                    required
                    className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg placeholder-gray-400 focus:ring-4 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !url}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 text-xl shadow-xl flex items-center justify-center gap-2"
                >
                  <span>🔍</span>
                  {loading ? 'Starting Analysis...' : 'Run My Test Report'}
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {isSignedIn
                    ? "No credit card required. You'll see your AI consensus and top-5 actions instantly."
                    : "You'll sign up after clicking - no credit card required."}
                </p>
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                🔬 Analysis in Progress
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Scroll up to see live progress, or we'll email you when it's ready
              </p>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 3 — What You'll Get */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What You'll Get
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: 'AI Consensus Summary',
                description: 'How major models describe your brand'
              },
              {
                title: 'Answer Share of Voice',
                description: 'Where you appear in AI results'
              },
              {
                title: 'Trust & Specificity Score',
                description: 'Your credibility and clarity vs competitors'
              },
              {
                title: 'Top 5 FixKit Actions',
                description: 'Exactly how to improve your AI narrative'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-600">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="#"
              className="inline-block px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
            >
              See Sample Report →
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 4 — How It Works */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'Enter Your URL', desc: 'BrandLens scans your site across AI models' },
              { num: '2', title: 'Sign In', desc: 'Create a secure account for report access' },
              { num: '3', title: 'Get Your Audit', desc: 'Interactive dashboard and downloadable report' },
              { num: '4', title: 'Apply Actions', desc: 'Boost your AI visibility and trust score' }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — Enterprise & Vertical Packs */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Tailored Intelligence for Every Industry
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏡', title: 'Real Estate (ULI)', desc: 'Discover how communities rank in AI answers' },
              { icon: '🏨', title: 'Hospitality', desc: 'Measure brand perception in travel-related queries' },
              { icon: '💻', title: 'SaaS', desc: 'Track your product visibility in AI recommendations' }
            ].map((vertical, i) => (
              <div key={i} className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-600 text-center">
                <div className="text-5xl mb-4">{vertical.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{vertical.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{vertical.desc}</p>
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all">
                  Request Demo Report →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — Social Proof */}
      <section className="py-20 bg-blue-600 dark:bg-blue-900">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <blockquote className="text-2xl md:text-3xl font-medium text-white mb-6 leading-relaxed italic">
            "We learned exactly what AI thought of our brand — and how to change the narrative."
          </blockquote>
          <cite className="text-white/90 text-lg not-italic">
            — Marketing Director, Lakewood Ranch
          </cite>
        </div>
      </section>

      {/* SECTION 7 — Final Conversion Block */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 dark:from-black dark:to-blue-950">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Don't Guess What AI Thinks. Know It.
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Your brand's AI reputation is being written every day.<br/>
            Start measuring it now.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#try-it"
              className="px-10 py-5 bg-white text-blue-600 font-bold text-xl rounded-xl hover:bg-gray-100 transition-all shadow-2xl inline-flex items-center gap-2"
            >
              <span>🚀</span>
              Run My Test Report
            </a>
            <button className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-xl rounded-xl hover:bg-white/10 transition-all">
              Book an Executive Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 dark:bg-black text-center">
        <p className="text-sm text-gray-400">
          BrandLens {getVersionString()} | AI-Powered Brand Analysis
        </p>
      </footer>
    </div>
  );
}
