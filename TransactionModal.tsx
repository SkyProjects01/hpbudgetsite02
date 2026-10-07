import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownLeft, ArrowUpRight, Plus, Tag } from 'lucide-react';

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (entry: {
    amount: number;
    type: 'expense' | 'income';
    merchant: string;
    category?: string;
    transaction_date: string;
  }) => Promise<void>;
};

const COMMON_CATEGORIES = [
  'Groceries',
  'Dining',
  'Transport',
  'Shopping',
  'Housing',
  'Bills & Utilities',
  'Health',
  'Salary',
  'Investment',
  'Other',
];

export function TransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Dining');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount) return;

    setSubmitting(true);
    try {
      await onAddTransaction({
        amount: parseFloat(amount),
        type,
        merchant: merchant.trim(),
        category,
        transaction_date: new Date(transactionDate).toISOString(),
      });
      setMerchant('');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
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
                  <Plus size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-medium tracking-wide uppercase text-white">
                  Log Transaction
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
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      type === 'expense'
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownLeft size={14} />
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      type === 'income'
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight size={14} />
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                  Merchant / Source
                </label>
                <input
                  type="text"
                  required
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder={type === 'expense' ? "e.g. Apple Store, Trader Joe's" : 'e.g. Monthly Salary, Freelance'}
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                    Amount ($)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl py-3 pl-8 pr-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium flex items-center gap-1">
                    <Tag size={12} />
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-white transition-all text-sm"
                  >
                    {COMMON_CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-zinc-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2 font-medium">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full bg-zinc-900/70 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-white transition-all text-sm"
                  style={{ colorScheme: 'dark' }}
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
                  {submitting ? 'Saving...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
