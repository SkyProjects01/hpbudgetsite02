import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { Transaction } from '../../types';

type TransactionsViewProps = {
  transactions: Transaction[];
  loading: boolean;
  onOpenTxModal: () => void;
};

export function TransactionsView({
  transactions,
  loading,
  onOpenTxModal,
}: TransactionsViewProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [transactions]);

  // Totals
  const totalExpenses = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [transactions]);

  // Filtered transactions
  const filteredList = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.merchant.toLowerCase().includes(search.toLowerCase()) ||
        (t.category && t.category.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      return true;
    });
  }, [transactions, search, typeFilter, selectedCategory]);

  const handleExportCSV = () => {
    const headers = ['Date', 'Merchant', 'Type', 'Category', 'Amount'];
    const rows = filteredList.map((t) => [
      t.transaction_date,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.type,
      `"${t.category || ''}"`,
      t.amount,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hp_budgeting_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white">
              Transactions Ledger
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              Complete History
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Detailed view of all your spending activity and income streams fetched from the transactions table.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all"
            title="Download CSV"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={onOpenTxModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-md"
          >
            <Plus size={15} />
            <span>New Transaction</span>
          </button>
        </div>
      </motion.div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Total Outflow (Expenses)
          </span>
          <div className="text-2xl sm:text-3xl font-light text-white">
            ${totalExpenses.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {transactions.filter((t) => t.type === 'expense').length} expense transactions
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Total Inflow (Income)
          </span>
          <div className="text-2xl sm:text-3xl font-light text-white">
            +${totalIncome.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {transactions.filter((t) => t.type === 'income').length} income transactions
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Net Cash Flow
          </span>
          <div className="text-2xl sm:text-3xl font-light text-white">
            ${(totalIncome - totalExpenses).toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Cumulative financial delta
          </span>
        </motion.div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by merchant or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'all' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'expense' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                typeFilter === 'income' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category Dropdown if available */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-400"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Spacious Full Table */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 animate-pulse">
          Querying transactions from database...
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] bg-zinc-900/30">
                  <th className="py-3.5 px-4 font-normal">Date</th>
                  <th className="py-3.5 px-4 font-normal">Merchant / Source</th>
                  <th className="py-3.5 px-4 font-normal">Category</th>
                  <th className="py-3.5 px-4 font-normal">Type</th>
                  <th className="py-3.5 px-4 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredList.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="py-4 px-4 text-zinc-400 whitespace-nowrap">
                      {format(new Date(tx.transaction_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-4 font-medium text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                          {tx.type === 'expense' ? (
                            <ArrowDownLeft size={13} />
                          ) : (
                            <ArrowUpRight size={13} className="text-white" />
                          )}
                        </div>
                        <span>{tx.merchant}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-400">
                      <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px]">
                        {tx.category || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-400 uppercase text-[10px]">
                      {tx.type}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-medium whitespace-nowrap text-sm ${
                        tx.type === 'expense' ? 'text-zinc-200' : 'text-white'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}${Number(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {filteredList.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-16 text-center text-zinc-600 text-xs"
                    >
                      No transactions match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
