import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, DollarSign, Loader2, AlertCircle } from 'lucide-react';

type BudgetModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  currentSpent: number;
  onSaveBudget: (budget: number) => Promise<void> | void;
  isLoading?: boolean;
  error?: string | null;
};

export function BudgetModal({
  isOpen,
  onClose,
  currentBudget,
  currentSpent,
  onSaveBudget,
  isLoading = false,
  error = null,
}: BudgetModalProps) {
  const [budgetInput, setBudgetInput] = useState(currentBudget > 0 ? currentBudget.toString() : '');
  const [entryMode, setEntryMode] = useState<'total_limit' | 'money_left'>('total_limit');
  const [remainingInput, setRemainingInput] = useState(
    Math.max(currentBudget - currentSpent, 0).toFixed(2)
  );

  useEffect(() => {
    if (isOpen) {
      setBudgetInput(currentBudget > 0 ? currentBudget.toString() : '');
      setRemainingInput(Math.max(currentBudget - currentSpent, 0).toFixed(2));
    }
  }, [isOpen, currentBudget, currentSpent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (entryMode === 'total_limit') {
      const val = parseFloat(budgetInput);
      if (!isNaN(val) && val >= 0) {
        await onSaveBudget(val);
      }
    } else {
      const remainingVal = parseFloat(remainingInput);
      if (!isNaN(remainingVal) && remainingVal >= 0) {
        const calculatedBudget = currentSpent + remainingVal;
        await onSaveBudget(calculatedBudget);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center">
                  <DollarSign size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-medium tracking-wide uppercase text-white">
                  Configure Spending Limit
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 mb-6 text-xs font-medium">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setEntryMode('total_limit')}
                className={`py-2 px-3 rounded-lg transition-all ${
                  entryMode === 'total_limit'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Monthly Limit
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setEntryMode('money_left');
                  setRemainingInput(Math.max(currentBudget - currentSpent, 0).toFixed(2));
                }}
                className={`py-2 px-3 rounded-lg transition-all ${
                  entryMode === 'money_left'
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Enter Money Left
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {entryMode === 'total_limit' ? (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                    Monthly Spending Cap ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="2500.00"
                      className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Already spent this month: ${currentSpent.toFixed(2)}. Remaining balance is calculated dynamically.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                    Current Money Left To Spend ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                      value={remainingInput}
                      onChange={(e) => setRemainingInput(e.target.value)}
                      placeholder="1500.00"
                      className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm disabled:opacity-50"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-2">
                    With spent amount (${currentSpent.toFixed(2)}), this updates your total limit to ${(currentSpent + (parseFloat(remainingInput) || 0)).toFixed(2)}.
                  </p>
                </div>
              )}

              {/* Preset Buttons */}
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-2 font-medium">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {[1000, 2500, 3500, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setEntryMode('total_limit');
                        setBudgetInput(preset.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors disabled:opacity-50"
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 py-3 text-xs uppercase tracking-wider rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 text-xs uppercase tracking-wider rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save to Database</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
