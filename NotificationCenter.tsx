import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, AlertTriangle, Clock, CheckCircle2, Copy, Check, Info } from 'lucide-react';
import { NotificationItem, Lending } from '../types';

type NotificationCenterProps = {
  notifications: NotificationItem[];
  lendingItems: Lending[];
  onMarkPaid: (id: string) => void;
  onDismiss: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export function NotificationCenter({
  notifications,
  lendingItems,
  onMarkPaid,
  onDismiss,
  isOpen,
  onToggle,
}: NotificationCenterProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyReminder = (lendingId: string) => {
    const item = lendingItems.find((l) => l.id === lendingId);
    if (!item) return;

    const message = `Hey ${item.person_name}, hope you're having a good week! Just a gentle heads-up regarding the $${Number(item.amount).toFixed(2)} loan that was due on ${new Date(item.due_date).toLocaleDateString()}. Let me know when you're able to settle it. Thanks!`;
    navigator.clipboard.writeText(message);
    setCopiedId(lendingId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="relative p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all flex items-center justify-center"
        aria-label="Open notifications"
      >
        <Bell size={16} />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center shadow-lg border border-zinc-900 animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={onToggle}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-4 shadow-2xl z-50"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-white">
                    Notifications & Alerts
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={onToggle}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
                    <CheckCircle2 size={24} className="text-zinc-700" />
                    <span>All caught up! No pending debt alerts or budget warnings.</span>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:border-zinc-700 transition-all text-xs flex flex-col gap-2 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          {notif.type === 'alert' && (
                            <AlertTriangle size={15} className="text-white shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'warning' && (
                            <Clock size={15} className="text-zinc-300 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'info' && (
                            <Info size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <div className="font-medium text-white">{notif.title}</div>
                            <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                              {notif.message}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onDismiss(notif.id)}
                          className="text-zinc-600 hover:text-zinc-300 p-1 rounded transition-colors"
                          title="Dismiss notification"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {notif.lendingId && (
                        <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 mt-1">
                          <button
                            onClick={() => handleCopyReminder(notif.lendingId!)}
                            className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-zinc-300 hover:text-white transition-colors"
                            title="Copy polite reminder text to clipboard"
                          >
                            {copiedId === notif.lendingId ? (
                              <>
                                <Check size={11} className="text-white" />
                                <span>Copied Message!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copy Reminder</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onMarkPaid(notif.lendingId!)}
                            className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 text-[10px] font-medium transition-colors ml-auto"
                          >
                            <CheckCircle2 size={11} />
                            <span>Mark Paid</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
