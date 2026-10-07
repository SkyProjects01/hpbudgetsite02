import React from 'react';
import { motion } from 'motion/react';
import { Scale, ArrowLeft, AlertCircle, FileCheck, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { Footer } from '../../components/Footer';

type TermsAndConditionsProps = {
  onNavigateHome: () => void;
  onNavigatePrivacy: () => void;
  onNavigateCookies?: () => void;
};

export function TermsAndConditions({
  onNavigateHome,
  onNavigatePrivacy,
  onNavigateCookies,
}: TermsAndConditionsProps) {
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
            <Scale size={13} className="text-white" />
            <span>Terms of Service & Usage Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white mb-3">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Last Updated: <span className="text-zinc-300 font-medium">{lastUpdated}</span>
          </p>
        </motion.div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <ShieldAlert size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Personal Tracking Tool
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              HP Budgeting is an analytical utility; it does not render certified financial, legal, or investment advice.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <FileCheck size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              Peer Lending Ledger
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              The lending module serves as a personal memory aid. We are not a creditor, money transmitter, or lender.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-950/60">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
              <Award size={15} className="text-zinc-300" />
            </div>
            <h2 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold mb-1">
              User Ownership
            </h2>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              You maintain all rights to your transactions and data entries. You can export or clear your limits anytime.
            </p>
          </div>
        </div>

        {/* Terms Body */}
        <div className="space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-850 pt-8">
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">01.</span>
              Acceptance of Agreement
            </h2>
            <p>
              By accessing, browsing, or signing into HP Budgeting ("the Service"), you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any provision of these terms, you must discontinue using the Service immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">02.</span>
              Account Authentication & Security
            </h2>
            <p>
              Access to HP Budgeting is secured through OAuth 2.0 via Google Identity Services. You are responsible for preserving the confidentiality of your Google account and for all actions taken under your authenticated session. You agree to notify us immediately of any unauthorized access to your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">03.</span>
              Financial Disclaimer — Not Financial Advice
            </h2>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1.5">
              <div className="flex items-center gap-2 text-white font-medium">
                <AlertCircle size={15} className="text-amber-400 shrink-0" />
                <span>Notice regarding financial information:</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                The tools, calculations, budget graphs, and metrics provided by HP Budgeting are strictly for personal organizational and informational record-keeping. HP Budgeting does not provide financial planning, tax guidance, accounting, credit counseling, or legal advice. All financial decisions are made at your sole discretion.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">04.</span>
              Lending Ledger Limitations
            </h2>
            <p>
              The Lending Ledger feature enables users to record informal peer-to-peer loans, track expected repayment dates, and generate friendly reminder messages. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li>HP Budgeting does not execute monetary transactions, hold funds in escrow, or facilitate money transfers.</li>
              <li>We do not act as an intermediary, guarantor, debt collection service, or credit reporting agency.</li>
              <li>You remain exclusively responsible for any agreements and debt settlements between yourself and third parties.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">05.</span>
              Database Integration & Acceptable Use
            </h2>
            <p>
              All user data is synchronized through authenticated endpoints connecting to Supabase with PostgreSQL Row Level Security. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
              <li>Attempt to circumvent Row Level Security constraints or query data belonging to other users.</li>
              <li>Submit malicious payloads, SQL injection attacks, or abusive automated scripts.</li>
              <li>Decompile, disassemble, or reverse engineer any part of the service's proprietary code.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">06.</span>
              Intellectual Property Rights
            </h2>
            <p>
              All software, user interface designs, logos, graphics, icons, and styling associated with HP Budgeting are the exclusive property of HP Budgeting. Nothing in these Terms grants you rights to use our trademarks or brand elements without prior written authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">07.</span>
              Warranty Disclaimer & Limitation of Liability
            </h2>
            <p>
              THE APPLICATION IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, HP BUDGETING DISCLAIMS ALL LIABILITY FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight flex items-center gap-2">
              <span className="text-zinc-500 font-mono text-xs">08.</span>
              Modifications & Governing Law
            </h2>
            <p>
              We reserve the right to revise these Terms at any time by updating this document. Continued use of the Service following revisions constitutes your consent to the modified terms.
            </p>
          </section>

          <div className="pt-4 flex items-center justify-between border-t border-zinc-850 text-xs text-zinc-400">
            <span>Read how we protect your personal data:</span>
            <button
              onClick={onNavigatePrivacy}
              className="text-white underline hover:text-zinc-300 font-medium"
            >
              Privacy Policy &rarr;
            </button>
          </div>
        </div>
      </div>

      <Footer
        onNavigatePrivacy={onNavigatePrivacy}
        onNavigateTerms={() => {}}
        onNavigateCookies={onNavigateCookies}
        onNavigateHome={onNavigateHome}
      />
    </div>
  );
}
