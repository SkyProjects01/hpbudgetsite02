import React from 'react';

type FooterProps = {
  onNavigatePrivacy: () => void;
  onNavigateTerms: () => void;
  onNavigateCookies?: () => void;
  onNavigateHome: () => void;
};

export function Footer({
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
  onNavigateHome,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleCookiesClick = () => {
    if (onNavigateCookies) {
      onNavigateCookies();
    } else {
      window.location.href = '/cookies';
    }
  };

  return (
    <footer className="w-full mt-16 pt-8 pb-4 border-t border-zinc-850 text-xs text-zinc-400">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 group text-left"
          >
            <div className="w-6 h-6 rounded-lg bg-white text-black flex items-center justify-center font-bold text-[10px] tracking-wider shadow-sm group-hover:scale-105 transition-transform">
              HP
            </div>
            <span className="font-semibold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
              HP Budgeting
            </span>
          </button>
        </div>

        {/* Legal & Navigation Links */}
        <div className="flex flex-wrap items-center gap-5 text-xs">
          <button
            onClick={onNavigateHome}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Dashboard
          </button>

          <button
            onClick={onNavigatePrivacy}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Privacy Policy
          </button>

          <button
            onClick={onNavigateTerms}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Terms & Conditions
          </button>

          <button
            onClick={handleCookiesClick}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            Cookies Policy
          </button>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500">
        <span>
          &copy; {currentYear} HP Budgeting. All rights reserved. Personal Finance & Peer Lending Ledger.
        </span>
        <span className="flex items-center gap-1 text-zinc-600">
          Crafted for privacy & financial clarity
        </span>
      </div>
    </footer>
  );
}
