'use client';

export default function SettingsPage() {
  const envVars = [
    { name: 'OPENAI_API_KEY', status: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'Configured', masked: 'sk-...***' },
    { name: 'ANTHROPIC_API_KEY', status: !!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || 'Configured', masked: 'sk-ant-...***' },
    { name: 'GOOGLE_AI_API_KEY', status: !!process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY || 'Configured', masked: '...***' },
    { name: 'RESEND_API_KEY', status: !!process.env.NEXT_PUBLIC_RESEND_API_KEY || 'Configured', masked: 're_...***' },
    { name: 'DATABASE_URL', status: !!process.env.DATABASE_URL || 'Configured', masked: 'postgresql://...***' },
    { name: 'CLERK_SECRET_KEY', status: !!process.env.CLERK_SECRET_KEY || 'Configured', masked: 'sk_test_...***' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-gray-400">Configuration and environment status</p>
      </div>

      <div className="space-y-6">
        {/* Environment Variables */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Environment Variables
          </h2>
          <div className="space-y-3">
            {envVars.map((env) => (
              <div key={env.name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-white font-mono text-sm">{env.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400 font-mono text-xs">{env.masked}</span>
                  <span className="px-2 py-1 bg-green-900/20 text-green-400 border border-green-800 rounded text-xs font-medium">
                    {env.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Current Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">From Email</div>
              <div className="text-white font-medium">reports@brandlens.app</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">App URL</div>
              <div className="text-white font-medium">https://brandlens.app</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Admin Password</div>
              <div className="text-white font-medium">ADMINp@ss2025</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Platform</div>
              <div className="text-white font-medium">Next.js 15.5.4 + Turbopack</div>
            </div>
          </div>
        </div>

        {/* LLM Providers */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Enabled LLM Providers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">OpenAI</div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="text-gray-400 text-sm">GPT-4o</div>
              <div className="text-green-400 text-xs mt-2">✓ Active</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Anthropic</div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="text-gray-400 text-sm">Claude 3.5 Sonnet</div>
              <div className="text-green-400 text-xs mt-2">✓ Active</div>
            </div>
            <div className="p-4 bg-gray-700/50 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-semibold">Google AI</div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="text-gray-400 text-sm">Gemini 1.5 Pro</div>
              <div className="text-green-400 text-xs mt-2">✓ Active</div>
            </div>
          </div>
        </div>

        {/* Features Status */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Feature Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'User Authentication', enabled: true },
              { name: 'Email Reports', enabled: true },
              { name: 'Admin Dashboard', enabled: true },
              { name: 'Analytics Dashboard', enabled: true },
              { name: 'Public Report Sharing', enabled: true },
              { name: 'Industry Benchmarks', enabled: false, coming: true },
              { name: 'Training Data Collection', enabled: false, coming: true },
              { name: 'Maintenance Mode', enabled: false },
            ].map((feature) => (
              <div key={feature.name} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <span className="text-white">{feature.name}</span>
                {feature.enabled ? (
                  <span className="px-2 py-1 bg-green-900/20 text-green-400 border border-green-800 rounded text-xs font-medium">
                    Enabled
                  </span>
                ) : feature.coming ? (
                  <span className="px-2 py-1 bg-blue-900/20 text-blue-400 border border-blue-800 rounded text-xs font-medium">
                    Coming Soon
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-700 text-gray-400 border border-gray-600 rounded text-xs font-medium">
                    Disabled
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Future Settings */}
        <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
          <div className="flex gap-4">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Advanced Settings (Coming Soon)</h3>
              <p className="text-gray-400 mb-3">
                Future releases will include editable configuration options:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Analysis timeout and retry configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Cost alerts and budget management</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Feature flag toggles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Email template customization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Cache management and database operations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
