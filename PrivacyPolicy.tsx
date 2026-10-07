import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowLeft, Lock, Database, EyeOff, FileText, CheckCircle2 } from 'lucide-react';
import { Footer } from '../../components/Footer.tsx';

type PrivacyPolicyProps = {
  onNavigateHome: () => void;
  onNavigateTerms: () => void;
  onNavigateCookies?: () => void;
};

export function PrivacyPolicy({
  onNavigateHome,
  onNavigateTerms,
  onNavigateCookies,
}: PrivacyPolicyProps) {
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
            <Shield size={13} className="text-white" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: <span className="text-zinc-300 font-medium">{lastUpdated}</span>
          </p>
        </motion.div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <EyeOff size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Zero Data Monetization
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              We never sell, rent, or trade your financial figures or transaction records with advertisers or third parties.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Database size={15} className="text-zinc-300" />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Every database query is strictly partitioned by PostgreSQL RLS to your authenticated user UUID.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Lock size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Encrypted in Transit
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              All interactions communicate over hardened TLS 1.3 encrypted HTTPS pipelines directly with Supabase.
            </p>
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-850 pt-8">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">01.</span>
              Introduction
            </h2>
            <p>
              HP Budgeting ("we", "our", or "the Application") is an intentional, privacy-first personal financial management and peer lending ledger. We prioritize confidentiality, data isolation, and user autonomy. This Privacy Policy outlines what information is collected, how it is safeguarded in our PostgreSQL database, and your rights concerning your personal financial records.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">02.</span>
              Information We Collect
            </h2>
            <p>
              We collect only the minimal data strictly required to deliver our budgeting and lending ledger features:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>
                <strong className="text-zinc-200">Authentication Information:</strong> When signing in with Google OAuth, we receive your email address, user ID, and public display profile name/avatar to identify your session.
              </li>
              <li>
                <strong className="text-zinc-200">Financial Entries & Ledger:</strong> User-submitted transactions (amounts, category, merchant name, transaction timestamp, and income/expense classification) and lending entries (borrower/peer name, loaned amount, due dates, and repayment status).
              </li>
              <li>
                <strong className="text-zinc-200">Budget Configurations:</strong> Monthly spending limits and budget cap preferences stored securely in the Supabase <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">budgets</code> database table.
              </li>
              <li>
                <strong className="text-zinc-200">Session Tokens:</strong> Cryptographic JWT authentication tokens stored in your browser's local session for authenticated access to Supabase.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">03.</span>
              How Your Data Is Utilized
            </h2>
            <p>Your data is processed strictly for the following purposes:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>Calculating your monthly spending totals, remaining balance, and budget progress rings.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>Tracking outstanding peer loans, computing overdue debt, and generating courteous reminder notices.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-white shrink-0 mt-0.5" />
                <span>Enforcing Row Level Security rules so that no other user can inspect, query, or mutate your data.</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">04.</span>
              Data Storage & Cryptographic Architecture
            </h2>
            <p>
              Budget and spending limit figures are never cached insecurely in arbitrary browser state. All persistent records reside within Supabase (PostgreSQL) hosted in enterprise-grade cloud facilities. Access to every table (<code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">transactions</code>, <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">lending</code>, and <code className="text-white bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">budgets</code>) is gated by Row Level Security policies evaluated directly by the database engine against the cryptographic token of the authenticated user.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">05.</span>
              Your Rights & Data Portability
            </h2>
            <p>
              You maintain complete ownership of your personal finance records:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Export:</strong> You can export all logged transactions to CSV format at any time via the Transactions tab.</li>
              <li><strong>Reset:</strong> You can reset your spending limit and budget cap back to $0.00 via the Dashboard "Reset Limits" action.</li>
              <li><strong>Erasure:</strong> You can mark debts as paid, remove entries, or request full account deletion.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">06.</span>
              Third-Party Infrastructure Providers
            </h2>
            <p>
              We engage only essential, audited infrastructure partners:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li><strong>Supabase Inc.:</strong> Cloud database hosting, user authentication, and API endpoints.</li>
              <li><strong>Google LLC:</strong> Identity provider for secure OAuth 2.0 authentication.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">07.</span>
              Contact & Privacy Inquiries
            </h2>
            <p>
              If you have any questions or data requests regarding this Privacy Policy, please contact our privacy compliance desk at <a href="mailto:privacy@hpbudgeting.internal" className="text-white underline hover:text-zinc-300">privacy@hpbudgeting.internal</a>.
            </p>
          </section>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-850 text-xs text-zinc-400">
            <span>Also review our terms of use:</span>
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
        onNavigatePrivacy={() => {}}
        onNavigateTerms={onNavigateTerms}
        onNavigateCookies={onNavigateCookies}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
}
