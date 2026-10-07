import React from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import {
  HandCoins,
  ArrowRight,
  Plus,
  Settings,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Transaction, Lending } from '../../types';
import { CircularProgress } from '../CircularProgress';

type OverviewViewProps = {
  transactions: Transaction[];
  lending: Lending[];
  budgetLimit: number;
  totalSpentThisMonth: number;
  totalIncomeThisMonth: number;
  totalOutstandingLent: number;
  remainingBudget: number;
  budgetPercentage: number;
  isOverBudget: boolean;
  overdueCount: number;
  overdueAmount: number;
  budgetLoading?: boolean;
  onOpenBudgetModal: () => void;
  onOpenResetConfirm: () => void;
  onOpenTxModal: () => void;
  onNavigateToTab: (tab: 'overview' | 'lending' | 'transactions') => void;
};

export function OverviewView({
  transactions,
  lending,
  budgetLimit,
  totalSpentThisMonth,
  totalIncomeThisMonth,
  totalOutstandingLent,
  remainingBudget,
  budgetPercentage,
  isOverBudget,
  overdueCount,
  overdueAmount,
  budgetLoading = false,
  onOpenBudgetModal,
  onOpenResetConfirm,
  onOpenTxModal,
  onNavigateToTab,
}: OverviewViewProps) {
  const recentTransactions = transactions.slice(0, 5);
  const pendingLending = lending.filter((l) => l.status === 'pending').slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero: Monthly Budget & Circular Progress Ring */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/60 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                Monthly Spending & Budget Limit
              </span>
              {budgetLoading ? (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-500 animate-pulse">
                  SYNCING WITH SUPABASE...
                </span>
              ) : (
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border ${
                    budgetLimit === 0
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      : isOverBudget
                      ? 'border-zinc-600 bg-zinc-800 text-white font-bold'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-300'
                  }`}
                >
                  {budgetLimit === 0
                    ? 'NO CAP CONFIGURED'
                    : isOverBudget
                    ? 'LIMIT EXCEEDED'
                    : `${budgetPercentage}% USED`}
                </span>
              )}
            </div>

            {budgetLoading ? (
              <div className="mt-2 space-y-1.5 animate-pulse">
                <div className="h-8 w-48 bg-zinc-800/70 rounded-lg"></div>
              </div>
            ) : (
              <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-white mt-1">
                ${totalSpentThisMonth.toFixed(2)}
                <span className="text-xs text-zinc-500 font-normal ml-2">
                  spent of ${budgetLimit.toFixed(2)} cap
                </span>
              </h2>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={onOpenBudgetModal}
              disabled={budgetLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900/70 hover:bg-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            >
              <Settings size={13} />
              <span>Adjust Limit</span>
            </button>
            <button
              onClick={onOpenResetConfirm}
              disabled={budgetLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-red-950/30 hover:border-red-900/60 hover:text-red-300 text-xs text-zinc-400 transition-all disabled:opacity-40"
              title="Reset limits to $0.00 in database"
            >
              <RotateCcw size={13} />
              <span>Reset Limits</span>
            </button>
            <button
              onClick={onOpenTxModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-md"
            >
              <Plus size={14} />
              <span>Log Expense</span>
            </button>
          </div>
        </div>

        {/* Circular indicator and breakdown metrics */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Ring */}
          <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
            {budgetLoading ? (
              <div className="w-40 h-40 rounded-full border-4 border-zinc-800/60 border-t-zinc-500 animate-spin flex items-center justify-center">
                <span className="text-xs text-zinc-500 font-medium animate-pulse">Loading...</span>
              </div>
            ) : (
              <CircularProgress
                value={budgetLimit > 0 ? budgetPercentage : 0}
                size={160}
                strokeWidth={12}
                label={budgetLimit > 0 ? `${budgetPercentage}%` : '0%'}
                sublabel={
                  budgetLimit === 0
                    ? 'NO LIMIT'
                    : isOverBudget
                    ? 'OVER CAP'
                    : 'OF BUDGET'
                }
              />
            )}
          </div>

          {/* Metrics summary */}
          <div className="md:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40"
              >
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Money Left To Spend
                </span>
                {budgetLoading ? (
                  <div className="h-7 w-20 bg-zinc-800/60 rounded animate-pulse my-1"></div>
                ) : (
                  <div className="text-2xl font-light text-white">
                    ${remainingBudget.toFixed(2)}
                  </div>
                )}
                <div className="text-[11px] text-zinc-500 mt-1">
                  {budgetLimit === 0
                    ? 'Set a monthly cap to track'
                    : isOverBudget
                    ? '0.00 left (over budget)'
                    : `${(100 - budgetPercentage).toFixed(0)}% available`}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40"
              >
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Total Monthly Inflow
                </span>
                <div className="text-2xl font-light text-white">
                  +${totalIncomeThisMonth.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Salary & receipts
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40"
              >
                <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                  Net Cash Position
                </span>
                <div className="text-2xl font-light text-white">
                  {totalIncomeThisMonth >= totalSpentThisMonth ? '+' : '-'}${Math.abs(totalIncomeThisMonth - totalSpentThisMonth).toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">
                  Inflow minus spending
                </div>
              </motion.div>
            </div>

            {/* Linear Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-zinc-400 mb-2">
                <span>Budget Consumed</span>
                {budgetLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>
                    ${totalSpentThisMonth.toFixed(2)} / ${budgetLimit.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetLimit > 0 ? Math.min(budgetPercentage, 100) : 0}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    isOverBudget ? 'bg-zinc-100' : 'bg-white'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Two secondary snapshot cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lending Section Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          whileHover={{ borderColor: 'rgba(113, 113, 122, 0.5)' }}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <HandCoins size={14} />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold">
                  Lending Ledger
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('lending')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Full Page</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex items-baseline justify-between mb-4">
              <div>
                <span className="text-2xl font-light text-white">
                  ${totalOutstandingLent.toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 block">
                  Total outstanding lent to friends & peers
                </span>
              </div>
              {overdueCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-700 bg-zinc-900 text-[11px] text-white">
                  <AlertTriangle size={12} />
                  <span>{overdueCount} Overdue (${overdueAmount.toFixed(0)})</span>
                </div>
              )}
            </div>

            {/* Quick List Preview */}
            <div className="space-y-2 mt-4">
              {pendingLending.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 text-xs"
                >
                  <div>
                    <span className="text-white font-medium">{item.person_name}</span>
                    <span className="text-zinc-500 text-[11px] ml-2">
                      Due {format(new Date(item.due_date), 'MMM dd')}
                    </span>
                  </div>
                  <span className="font-semibold text-white">
                    ${Number(item.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {pendingLending.length === 0 && (
                <p className="text-xs text-zinc-500 italic py-2">
                  No pending loans awaiting repayment.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('lending')}
            className="w-full mt-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 text-xs text-zinc-300 hover:text-white transition-all text-center"
          >
            Manage Active Lending
          </button>
        </motion.div>

        {/* Transactions Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' }}
          whileHover={{ borderColor: 'rgba(113, 113, 122, 0.5)' }}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                  <Plus size={14} />
                </div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-300 font-semibold">
                  Recent Transactions
                </h3>
              </div>
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View Full Page</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-850 bg-zinc-900/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        tx.type === 'income' ? 'bg-zinc-200' : 'bg-zinc-600'
                      }`}
                    />
                    <div>
                      <span className="text-white font-medium block">
                        {tx.merchant}
                      </span>
                      <span className="text-zinc-500 text-[10px]">
                        {format(new Date(tx.transaction_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`font-semibold ${
                      tx.type === 'income' ? 'text-zinc-200' : 'text-zinc-400'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <p className="text-xs text-zinc-500 italic py-2">
                  No recent transactions found.
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('transactions')}
            className="w-full mt-5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/80 text-xs text-zinc-300 hover:text-white transition-all text-center"
          >
            Open All Transactions
          </button>
        </motion.div>
      </div>
    </div>
  );
}
