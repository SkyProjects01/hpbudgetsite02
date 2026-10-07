import React, { useState, useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Copy,
  Check,
  AlertTriangle,
  Clock,
  AlignLeft,
} from 'lucide-react';
import { Lending } from '../../types';

type LendingViewProps = {
  lending: Lending[];
  loading: boolean;
  onOpenLendModal: () => void;
  onUpdateStatus: (id: string, status: 'paid' | 'pending') => Promise<void>;
};

export function LendingView({
  lending,
  loading,
  onOpenLendModal,
  onUpdateStatus,
}: LendingViewProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Summary figures
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalOutstanding = useMemo(() => {
    return lending
      .filter((l) => l.status === 'pending')
      .reduce((sum, l) => sum + Number(l.amount), 0);
  }, [lending]);

  const overdueItems = useMemo(() => {
    return lending.filter((l) => {
      if (l.status !== 'pending') return false;
      const due = new Date(l.due_date);
      due.setHours(0, 0, 0, 0);
      return differenceInDays(due, today) < 0;
    });
  }, [lending, today]);

  const totalOverdue = useMemo(() => {
    return overdueItems.reduce((sum, l) => sum + Number(l.amount), 0);
  }, [overdueItems]);

  const totalSettled = useMemo(() => {
    return lending
      .filter((l) => l.status === 'paid')
      .reduce((sum, l) => sum + Number(l.amount), 0);
  }, [lending]);

  // Filtered list
  const filteredList = useMemo(() => {
    return lending.filter((item) => {
      const matchesSearch =
        item.person_name.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filter === 'all') return true;
      if (filter === 'paid') return item.status === 'paid';
      if (filter === 'pending') return item.status === 'pending';
      if (filter === 'overdue') {
        if (item.status !== 'pending') return false;
        const due = new Date(item.due_date);
        due.setHours(0, 0, 0, 0);
        return differenceInDays(due, today) < 0;
      }
      return true;
    });
  }, [lending, search, filter, today]);

  const handleCopyReminder = (item: Lending) => {
    const dueFormatted = format(new Date(item.due_date), 'MMMM do');
    const message = `Hey ${item.person_name}! Hope you're doing well. Just dropping a friendly reminder about the $${Number(item.amount).toFixed(2)} loan that was due on ${dueFormatted}. Let me know whenever you're able to settle. Thank you!`;
    navigator.clipboard.writeText(message);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header section with breathing room */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white">
              Lending Hub
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
              Personal Debt Ledger
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Track money lent to friends and colleagues, schedule expected returns, and manage debt settlement with automated reminders.
          </p>
        </div>

        <button
          onClick={onOpenLendModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Log New Loan</span>
        </button>
      </motion.div>

      {/* 3 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Active Outstanding Loans
          </span>
          <div className="text-2xl sm:text-3xl font-light text-white">
            ${totalOutstanding.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {lending.filter((l) => l.status === 'pending').length} pending borrower(s)
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Overdue Repayments
            </span>
            {overdueItems.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-white border border-zinc-700">
                Action Required
              </span>
            )}
          </div>
          <div className="text-2xl sm:text-3xl font-light text-white">
            ${totalOverdue.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {overdueItems.length} loan(s) past return date
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md"
        >
          <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Successfully Recovered
          </span>
          <div className="text-2xl sm:text-3xl font-light text-white">
            ${totalSettled.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {lending.filter((l) => l.status === 'paid').length} loan(s) marked settled
          </span>
        </motion.div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by person name or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-zinc-900/60 rounded-xl border border-zinc-800 text-xs self-start sm:self-auto overflow-x-auto">
          {(
            [
              { key: 'all', label: `All (${lending.length})` },
              { key: 'pending', label: `Pending (${lending.filter((l) => l.status === 'pending').length})` },
              { key: 'overdue', label: `Overdue (${overdueItems.length})` },
              { key: 'paid', label: `Settled (${lending.filter((l) => l.status === 'paid').length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === t.key ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lending Items - Spacious Grid with Motion */}
      {loading ? (
        <div className="py-20 text-center text-xs text-zinc-500 animate-pulse">
          Querying lending records from database...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
          <AnimatePresence>
            {filteredList.map((item) => {
              const due = new Date(item.due_date);
              due.setHours(0, 0, 0, 0);
              const daysDiff = differenceInDays(due, today);
              const isOverdue = item.status === 'pending' && daysDiff < 0;
              const isDueSoon = item.status === 'pending' && daysDiff >= 0 && daysDiff <= 3;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isOverdue
                      ? 'border-zinc-700 bg-zinc-950/90 shadow-lg'
                      : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700/80'
                  }`}
                >
                  <div>
                    {/* Top Bar: Borrower info & Amount */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-sm">
                          {item.person_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white text-sm">
                            {item.person_name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {item.status === 'paid' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
                                Settled
                              </span>
                            ) : isOverdue ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-white font-semibold flex items-center gap-1">
                                <AlertTriangle size={10} />
                                Overdue by {Math.abs(daysDiff)} day{Math.abs(daysDiff) === 1 ? '' : 's'}
                              </span>
                            ) : isDueSoon ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-300 flex items-center gap-1">
                                <Clock size={10} />
                                {daysDiff === 0 ? 'Due today' : `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
                                Due in {daysDiff} days
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-light text-white block">
                          ${Number(item.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Notes / Reason */}
                    {item.notes && (
                      <div className="mt-3.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-850 text-xs text-zinc-400 flex items-start gap-2">
                        <AlignLeft size={13} className="text-zinc-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item.notes}</span>
                      </div>
                    )}

                    {/* Date details */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-zinc-850 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Lent On
                        </span>
                        <span className="text-zinc-300">
                          {item.lent_date
                            ? format(new Date(item.lent_date), 'MMM dd, yyyy')
                            : 'Recorded previously'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
                          Expected Return
                        </span>
                        <span className={isOverdue ? 'text-white font-semibold' : 'text-zinc-300'}>
                          {format(new Date(item.due_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action buttons */}
                  <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-zinc-800/60">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleCopyReminder(item)}
                        className="flex-1 py-2 px-3 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                        title="Copy polite reminder text to clipboard"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={13} className="text-white" />
                            <span>Copied Note!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={13} />
                            <span>Copy Reminder</span>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() =>
                        onUpdateStatus(
                          item.id,
                          item.status === 'paid' ? 'pending' : 'paid'
                        )
                      }
                      className={`flex-1 py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 ${
                        item.status === 'paid'
                          ? 'border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900'
                          : 'bg-white text-black font-semibold hover:bg-zinc-200'
                      }`}
                    >
                      {item.status === 'paid' ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Settled (Undo)</span>
                        </>
                      ) : (
                        <>
                          <Circle size={13} />
                          <span>Mark As Settled</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredList.length === 0 && (
            <div className="col-span-full py-16 text-center text-zinc-500 text-xs border border-zinc-850 rounded-2xl bg-zinc-950/40">
              No lending records matching your query.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
