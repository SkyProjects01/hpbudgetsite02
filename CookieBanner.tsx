import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

type CookieBannerProps = {
  onNavigateCookies: () => void;
};

export function CookieBanner({ onNavigateCookies }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('hp_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch (_) {}
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('hp_cookie_consent', 'accepted');
    } catch (_) {}
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40"
        >
          <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
                <Cookie size={14} className="text-zinc-300" />
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                We use strictly essential session tokens to keep you logged in safely. No advertising trackers.{' '}
                <button
                  type="button"
                  onClick={onNavigateCookies}
                  className="text-white underline hover:text-zinc-200"
                >
                  Cookies Policy
                </button>
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={handleAccept}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all shadow-sm"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => setIsVisible(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
