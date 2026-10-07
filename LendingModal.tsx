import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HandCoins, Calendar, User, AlignLeft } from 'lucide-react';

type LendingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddLending: (entry: {
    person_name: string;
    amount: number;
    lent_date: string;
    due_date: string;
    notes?: string;
  }) => Promise<void>;
};

export function LendingModal({ isOpen, onClose, onAddLending }: LendingModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [lentDate, setLentDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount) return;

    setSubmitting(true);
    try {
      await onAddLending({
        person_name: personName.trim(),
        amount: parseFloat(amount),
        lent_date: lentDate,
        due_date: dueDate,
        notes: notes.trim() || undefined,
      });
      setPersonName('');
      setAmount('');
      setNotes('');
      setLentDate(todayStr);
      setDueDate(defaultDue);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

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
                  <HandCoins size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-medium tracking-wide uppercase text-white">
                  Log Lent Money
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-900"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5 font-medium">
                  <User size={13} />
                  Person / Borrower Name
                </label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                  Amount Lent ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl py-3 pl-8 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5 font-medium">
                    <Calendar size={13} />
                    Date Lent
                  </label>
                  <input
                    type="date"
                    required
                    value={lentDate}
                    onChange={(e) => setLentDate(e.target.value)}
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-white transition-all text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5 font-medium">
                    <Calendar size={13} />
                    Expected Return
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-white transition-all text-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5 font-medium">
                  <AlignLeft size={13} />
                  Reason / Memo (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dinner split, concert ticket"
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-800/80 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 py-3 text-xs uppercase tracking-wider rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 text-xs uppercase tracking-wider rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Confirm Loan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
