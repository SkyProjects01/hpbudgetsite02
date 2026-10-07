import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { ShieldCheck, AlertCircle } from 'lucide-react';

type LoginPageProps = {
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
};

export function LoginPage({
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
}: LoginPageProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      setErrorMsg(err.message || 'Failed to authenticate with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 selection:bg-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="max-w-sm w-full border border-gray-800 bg-black p-8 sm:p-10 rounded-2xl text-center shadow-2xl relative"
      >
        {/* Minimalist Monogram Badge */}
        <div className="w-12 h-12 rounded-xl bg-white text-black flex items-center justify-center mx-auto mb-6 text-base font-bold tracking-wider">
          HP
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          HP Budgeting
        </h1>
        <p className="text-zinc-400 text-xs mb-8 leading-relaxed">
          Sign in to access your personal finances, spending limits, and lending ledger.
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl border border-gray-800 bg-black text-left text-xs flex items-start gap-2.5">
            <AlertCircle size={15} className="text-white shrink-0 mt-0.5" />
            <div className="text-zinc-300 text-[11px] leading-relaxed">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Strict Minimalist Monochrome Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full border border-gray-800 hover:bg-white hover:text-black text-white py-3.5 px-4 rounded-xl text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>
      </motion.div>

      {/* Footer Navigation Links for Login View */}
      {(onNavigatePrivacy || onNavigateTerms || onNavigateCookies) && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500">
          {onNavigatePrivacy && (
            <button
              onClick={onNavigatePrivacy}
              className="hover:text-zinc-300 transition-colors"
            >
              Privacy Policy
            </button>
          )}
          {onNavigatePrivacy && onNavigateTerms && <span>•</span>}
          {onNavigateTerms && (
            <button
              onClick={onNavigateTerms}
              className="hover:text-zinc-300 transition-colors"
            >
              Terms & Conditions
            </button>
          )}
          {(onNavigateTerms || onNavigatePrivacy) && onNavigateCookies && <span>•</span>}
          {onNavigateCookies && (
            <button
              onClick={onNavigateCookies}
              className="hover:text-zinc-300 transition-colors"
            >
              Cookies Policy
            </button>
          )}
        </div>
      )}
    </div>
  );
}
