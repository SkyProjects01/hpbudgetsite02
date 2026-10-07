import React from 'react';
import { motion } from 'motion/react';
import { Cookie, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Trash2, ArrowRight } from 'lucide-react';
import { Footer } from '../../components/Footer';

type CookiesPolicyProps = {
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
};

export function CookiesPolicy({
  onNavigateHome,
  onNavigatePrivacy,
  onNavigateTerms,
}: CookiesPolicyProps) {
  const lastUpdated = 'October 7, 2026';

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 lg:px-12 py-6 flex flex-col justify-between font-sans selection:bg-zinc-800">
      <div className="max-w-4xl w-full mx-auto">
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-850">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs tracking-wider shadow-md group-hover:scale-105 transition-transform">
              HP
            </div>
            <div>
              <span className="font-semibold tracking-tight text-sm text-white block group-hover:text-zinc-200 transition-colors">
                HP Budgeting
              </span>
              <span className="text-[11px] text-zinc-500">Legal Center</span>
            </div>
          </div>

          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={13} />
            <span>Back to App</span>
          </button>
        </header>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 mb-4">
            <Cookie size={13} className="text-white" />
            <span>Transparent Storage Usage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-3">
            Cookies & Local Storage Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: <span className="text-zinc-300 font-medium">{lastUpdated}</span>
          </p>
        </motion.div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <ShieldCheck size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Strictly Essential Only
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              We only employ storage mechanisms necessary to authenticate your account session securely.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Lock size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Zero Ad Tracking
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              No advertising pixels, cross-site trackers, or commercial cookies are embedded into our application.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Trash2 size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Complete Control
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Signing out or clearing browser storage instantly removes all local cryptographic session tokens.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-850 pt-8">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">01.</span>
              What Are Cookies & Local Storage?
            </h2>
            <p>
              Cookies are small data files stored on your computer or mobile device when you visit web applications. Similar browser technologies include <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">localStorage</code> and <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">sessionStorage</code>, which allow web applications to remember your authenticated session across page refreshes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">02.</span>
              Storage Mechanisms Used by HP Budgeting
            </h2>
            <p>
              HP Budgeting uses strictly essential, functional storage entries to maintain authenticated access:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs mt-3">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px] bg-zinc-950/60">
                    <th className="py-2.5 px-3 font-medium">Storage Key</th>
                    <th className="py-2.5 px-3 font-medium">Type</th>
                    <th className="py-2.5 px-3 font-medium">Purpose</th>
                    <th className="py-2.5 px-3 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  <tr>
                    <td className="py-3 px-3 font-mono text-zinc-200">sb-*-auth-token</td>
                    <td className="py-3 px-3 text-zinc-400">Local Storage</td>
                    <td className="py-3 px-3 text-zinc-300">
                      Stores cryptographic JWT tokens for Supabase authentication to verify your identity.
                    </td>
                    <td className="py-3 px-3 text-zinc-400">Session / Refresh Token Lifecycle</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono text-zinc-200">hp_cookie_consent</td>
                    <td className="py-3 px-3 text-zinc-400">Local Storage</td>
                    <td className="py-3 px-3 text-zinc-300">
                      Remembers your acknowledgment of our essential cookie and privacy terms.
                    </td>
                    <td className="py-3 px-3 text-zinc-400">1 Year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">03.</span>
              Third-Party Cookies & Analytics
            </h2>
            <p>
              We firmly respect user privacy:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>We do not embed third-party advertising cookies or cross-site tracking scripts.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>Google OAuth authentication only receives session tokens to sign you in securely; no advertising profiles are connected.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>All financial calculations (spending caps, lending entries) are saved in our Supabase database, never left in unmanaged browser storage.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">04.</span>
              How to Manage or Remove Cookies
            </h2>
            <p>
              You can control or clear cookies and local storage via your browser settings:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Sign Out:</strong> Clicking "Sign Out" in HP Budgeting instantly invalidates and clears your local authentication token.</li>
              <li><strong>Browser Settings:</strong> You can purge site data at any time via your browser's Developer Tools or Settings under "Privacy and Security &gt; Cookies and site data".</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">05.</span>
              Questions & Contact
            </h2>
            <p>
              If you have any questions regarding our use of cookies or local storage, reach out to <a href="mailto:privacy@hpbudgeting.internal" className="text-white underline hover:text-zinc-300">privacy@hpbudgeting.internal</a>.
            </p>
          </section>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-850 text-xs text-zinc-400 flex-wrap gap-2">
            <button
              onClick={onNavigatePrivacy}
              className="text-white underline hover:text-zinc-300 font-medium"
            >
              &larr; Privacy Policy
            </button>
            <button
              onClick={onNavigateTerms}
              className="text-white underline hover:text-zinc-300 font-medium"
            >
              Terms and Conditions &rarr;
            </button>
          </div>
        </div>
      </div>

      <Footer
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={onNavigateTerms}
        onNavigateCookies={() => {}}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
}
