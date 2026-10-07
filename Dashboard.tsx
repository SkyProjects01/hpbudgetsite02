import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Transaction, Lending, NotificationItem, BudgetSettings } from '../types';
import {
  LayoutDashboard,
  HandCoins,
  Receipt,
  Plus,
  RefreshCw,
  Database,
  LogOut,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { OverviewView } from './views/OverviewView';
import { LendingView } from './views/LendingView';
import { TransactionsView } from './views/TransactionsView';
import { BudgetModal } from './BudgetModal';
import { LendingModal } from './LendingModal';
import { TransactionModal } from './TransactionModal';
import { NotificationCenter } from './NotificationCenter';
import { Footer } from './Footer';

type TabKey = 'overview' | 'lending' | 'transactions';

type DashboardProps = {
  onNavigatePrivacy?: () => void;
  onNavigateTerms?: () => void;
  onNavigateCookies?: () => void;
};

export function Dashboard({
  onNavigatePrivacy,
  onNavigateTerms,
  onNavigateCookies,
}: DashboardProps = {}) {
  const { user, session, signOut } = useAuth();

  // Extract display name from user's Google account metadata
  const userName = useMemo(() => {
    if (!user) return 'User';
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.given_name ||
      (user.email ? user.email.split('@')[0] : 'User')
    );
  }, [user]);

  // Clean in-memory tab state (no hash in URL bar)
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Supabase Database-backed Budget State (strictly initialized to 0, NO localStorage fallback)
  const [budgetState, setBudgetState] = useState<BudgetSettings>({
    spending_limit: 0,
    budget_limit: 0,
    used_amount: 0,
  });
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetModalError, setBudgetModalError] = useState<string | null>(null);

  // Reset Limits Confirmation Modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Toast / Banner notifications state
  const [bannerToast, setBannerToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Database Records
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lending, setLending] = useState<Lending[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isLendModalOpen, setIsLendModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [dismissedNotifIds, setDismissedNotifIds] = useState<string[]>([]);

  const triggerToast = useCallback((type: 'success' | 'error', message: string) => {
    setBannerToast({ type, message });
    setTimeout(() => {
      setBannerToast((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  }, []);

  // Clean stray '#' or '#/...' from Google OAuth and URL history immediately on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      // Do not strip if Supabase is actively reading the access_token exchange
      if (hash && !hash.includes('access_token')) {
        window.history.replaceState(null, '', '/dashboard');
      } else if (window.location.pathname === '/') {
        window.history.replaceState(null, '', '/dashboard');
      }
    }
  }, []);

  // Clean tab switcher without altering window.location.hash
  const navigateToTab = (tab: TabKey) => {
    setActiveTab(tab);
  };

  // Fetch Budget record strictly from Supabase `public.budgets` table
  const fetchBudget = useCallback(async () => {
    setBudgetLoading(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const currentUser = authData?.user || user;

      if (authErr || !currentUser) {
        setBudgetState({ spending_limit: 0, budget_limit: 0, used_amount: 0 });
        return;
      }

      const { data, error } = await supabase
        .from('budgets')
        .select('spending_limit, budget_limit, used_amount')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching budget record from Supabase:', error);
        triggerToast('error', `Failed to load budget record: ${error.message}`);
        return;
      }

      if (data) {
        const spendingLimit = Number(data.spending_limit) || 0;
        const budgetLimit = Number(data.budget_limit) || spendingLimit || 0;
        const usedAmount = Number(data.used_amount) || 0;

        setBudgetState({
          spending_limit: spendingLimit,
          budget_limit: budgetLimit,
          used_amount: usedAmount,
        });
      } else {
        setBudgetState({
          spending_limit: 0,
          budget_limit: 0,
          used_amount: 0,
        });
      }
    } catch (err: any) {
      console.error('Unexpected error fetching budget:', err);
      triggerToast('error', 'Error querying budget table in Supabase.');
    } finally {
      setBudgetLoading(false);
    }
  }, [user, triggerToast]);

  // Load transactions and lending records
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, lendRes] = await Promise.all([
        supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
        supabase.from('lending').select('*').order('due_date', { ascending: true }),
      ]);

      if (!txRes.error && !lendRes.error) {
        const mappedTx: Transaction[] = (txRes.data || []).map((t: any) => ({
          id: t.id,
          amount: Number(t.amount),
          type: (t.type === 'credit' || t.type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
          merchant: t.merchant || t.description || 'General',
          transaction_date: t.transaction_date || t.created_at,
          category: t.category,
          user_id: t.user_id,
        }));

        const mappedLend: Lending[] = (lendRes.data || []).map((l: any) => ({
          id: l.id,
          person_name: l.person_name,
          amount: Number(l.amount),
          lent_date: l.lent_date,
          due_date: l.due_date,
          notes: l.notes,
          status: l.status,
          user_id: l.user_id,
        }));

        setTransactions(mappedTx);
        setLending(mappedLend);
        return;
      }

      // Backend API proxy fallback passing Bearer token
      const reqHeaders: Record<string, string> = session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : {};
      const [txApi, lendApi] = await Promise.all([
        fetch('/api/transactions', { headers: reqHeaders }),
        fetch('/api/lending', { headers: reqHeaders }),
      ]);

      if (txApi.ok && lendApi.ok) {
        const txData = await txApi.json();
        const lendData = await lendApi.json();
        setTransactions(Array.isArray(txData) ? txData : []);
        setLending(Array.isArray(lendData) ? lendData : []);
      }
    } catch (error) {
      console.error('Error fetching data with authenticated session:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Initial load on mount or user transition
  useEffect(() => {
    fetchData();
    fetchBudget();
  }, [fetchData, fetchBudget]);

  const handleRefreshAll = async () => {
    await Promise.all([fetchData(), fetchBudget()]);
  };

  // Upsert modified spending/budget limit directly to Supabase `budgets` table
  const handleSaveBudget = async (newLimit: number) => {
    setBudgetSaving(true);
    setBudgetModalError(null);

    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const currentUser = authData?.user || user;

      if (authErr || !currentUser) {
        const msg = 'User authentication required to save budget.';
        setBudgetModalError(msg);
        triggerToast('error', msg);
        return;
      }

      const { error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: currentUser.id,
            spending_limit: newLimit,
            budget_limit: newLimit,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Supabase error upserting budget limits:', error);
        setBudgetModalError(error.message || 'Failed to persist limit to Supabase.');
        triggerToast('error', error.message || 'Failed to update spending limit in database.');
        return;
      }

      setBudgetState((prev) => ({
        ...prev,
        spending_limit: newLimit,
        budget_limit: newLimit,
      }));
      setIsBudgetModalOpen(false);
      triggerToast('success', `Spending limit of $${newLimit.toFixed(2)} synchronized with database.`);
    } catch (err: any) {
      console.error('Network error during budget upsert:', err);
      const errMsg = err.message || 'Unexpected network error updating limits.';
      setBudgetModalError(errMsg);
      triggerToast('error', errMsg);
    } finally {
      setBudgetSaving(false);
    }
  };

  // "Reset Limits" Action Integration: upsert spending_limit=0, budget_limit=0, used_amount=0
  const handleConfirmResetLimits = async () => {
    setIsResetting(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const currentUser = authData?.user || user;

      if (authErr || !currentUser) {
        triggerToast('error', 'Authentication required to reset limits.');
        return;
      }

      const { error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: currentUser.id,
            spending_limit: 0,
            budget_limit: 0,
            used_amount: 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (error) {
        console.error('Error resetting budget limits in database:', error);
        triggerToast('error', error.message || 'Failed to reset limits in Supabase.');
        return;
      }

      setBudgetState({
        spending_limit: 0,
        budget_limit: 0,
        used_amount: 0,
      });
      setIsResetConfirmOpen(false);
      triggerToast('success', 'Budget & spending limits reset to $0.00.');
    } catch (err: any) {
      console.error('Error performing reset limits operation:', err);
      triggerToast('error', err.message || 'Failed to execute reset operation.');
    } finally {
      setIsResetting(false);
    }
  };

  // Add Transaction to live Supabase database with user auth
  const handleAddTransaction = async (entry: {
    amount: number;
    type: 'expense' | 'income';
    merchant: string;
    category?: string;
    transaction_date: string;
  }) => {
    try {
      const dbType = entry.type;
      const txDate = entry.transaction_date ? new Date(entry.transaction_date).toISOString() : new Date().toISOString();

      const { error } = await supabase.from('transactions').insert([
        {
          amount: parseFloat(entry.amount as any),
          type: dbType,
          merchant: entry.merchant,
          description: entry.merchant,
          category: entry.category || 'General',
          transaction_date: txDate,
          user_id: user?.id,
        },
      ]);

      if (error) {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify(entry),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || error.message);
        }
      }

      await fetchData();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
      triggerToast('error', error.message || 'Could not save transaction to database.');
    }
  };

  // Add Lending Record to live Supabase database with user auth
  const handleAddLending = async (entry: {
    person_name: string;
    amount: number;
    lent_date: string;
    due_date: string;
    notes?: string;
  }) => {
    try {
      const dueDateIso = entry.due_date ? new Date(entry.due_date).toISOString() : new Date().toISOString();
      const lentDateIso = entry.lent_date ? new Date(entry.lent_date).toISOString() : new Date().toISOString();

      const { error } = await supabase.from('lending').insert([
        {
          person_name: entry.person_name,
          amount: parseFloat(entry.amount as any),
          lent_date: lentDateIso,
          due_date: dueDateIso,
          notes: entry.notes || '',
          status: 'pending',
          user_id: user?.id,
        },
      ]);

      if (error) {
        const res = await fetch('/api/lending', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify(entry),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || error.message);
        }
      }

      await fetchData();
    } catch (error: any) {
      console.error('Error saving lending record:', error);
      triggerToast('error', error.message || 'Could not save lending record to database.');
    }
  };

  // Update Lending Status in live Supabase database
  const handleUpdateLendingStatus = async (id: string, newStatus: 'paid' | 'pending') => {
    try {
      const { error } = await supabase
        .from('lending')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        await fetch(`/api/lending/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      await fetchData();
    } catch (error) {
      console.error('Error updating lending status:', error);
    }
  };

  // Calculations
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const totalSpentThisMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = new Date(t.transaction_date);
        return (
          t.type === 'expense' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions, currentMonth, currentYear]);

  const totalIncomeThisMonth = useMemo(() => {
    return transactions
      .filter((t) => {
        const d = new Date(t.transaction_date);
        return (
          t.type === 'income' &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + Number(t.amount), 0);
  }, [transactions, currentMonth, currentYear]);

  const totalOutstandingLent = useMemo(() => {
    return lending
      .filter((l) => l.status === 'pending')
      .reduce((acc, l) => acc + Number(l.amount), 0);
  }, [lending]);

  const overdueItems = useMemo(() => {
    return lending.filter((l) => {
      if (l.status !== 'pending') return false;
      const due = new Date(l.due_date);
      due.setHours(0, 0, 0, 0);
      return differenceInDays(due, today) < 0;
    });
  }, [lending, today]);

  const overdueAmount = useMemo(() => {
    return overdueItems.reduce((sum, l) => sum + Number(l.amount), 0);
  }, [overdueItems]);

  // Derived budget limit & spending metrics
  const effectiveLimit = useMemo(() => {
    if (budgetState.budget_limit > 0) return budgetState.budget_limit;
    if (budgetState.spending_limit > 0) return budgetState.spending_limit;
    return 0;
  }, [budgetState]);

  const displaySpent = useMemo(() => {
    if (effectiveLimit === 0 && budgetState.used_amount === 0) return 0;
    if (budgetState.used_amount > 0) return budgetState.used_amount;
    return totalSpentThisMonth;
  }, [effectiveLimit, budgetState.used_amount, totalSpentThisMonth]);

  const remainingBudget = useMemo(() => {
    if (effectiveLimit <= 0) return 0;
    return Math.max(effectiveLimit - displaySpent, 0);
  }, [effectiveLimit, displaySpent]);

  const budgetPercentage = useMemo(() => {
    if (effectiveLimit <= 0) return 0;
    return Math.min(Math.round((displaySpent / effectiveLimit) * 100), 999);
  }, [effectiveLimit, displaySpent]);

  const isOverBudget = useMemo(() => {
    if (effectiveLimit <= 0) return false;
    return displaySpent > effectiveLimit;
  }, [effectiveLimit, displaySpent]);

  // Notifications calculation based on live data
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];

    lending.forEach((item) => {
      if (item.status === 'pending') {
        const due = new Date(item.due_date);
        due.setHours(0, 0, 0, 0);
        const daysDiff = differenceInDays(due, today);

        if (daysDiff < 0) {
          list.push({
            id: `overdue-${item.id}`,
            title: `Overdue Loan: ${item.person_name}`,
            message: `$${Number(item.amount).toFixed(2)} was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'} ago (${format(due, 'MMM dd')}).`,
            type: 'alert',
            date: item.due_date,
            actionType: 'view_lending',
            lendingId: item.id,
          });
        } else if (daysDiff <= 3) {
          list.push({
            id: `due-soon-${item.id}`,
            title: `Repayment Expected: ${item.person_name}`,
            message:
              daysDiff === 0
                ? `$${Number(item.amount).toFixed(2)} is due today!`
                : `$${Number(item.amount).toFixed(2)} due in ${daysDiff} day${daysDiff === 1 ? '' : 's'} (${format(due, 'MMM dd')}).`,
            type: 'warning',
            date: item.due_date,
            actionType: 'view_lending',
            lendingId: item.id,
          });
        }
      }
    });

    if (effectiveLimit > 0 && isOverBudget) {
      list.push({
        id: 'budget-exceeded',
        title: 'Spending Limit Exceeded',
        message: `You have surpassed your $${effectiveLimit.toFixed(2)} monthly budget by $${(displaySpent - effectiveLimit).toFixed(2)}.`,
        type: 'alert',
        date: new Date().toISOString(),
        actionType: 'budget',
      });
    } else if (effectiveLimit > 0 && budgetPercentage >= 85) {
      list.push({
        id: 'budget-near-limit',
        title: 'Budget Threshold Reached',
        message: `You've utilized ${budgetPercentage}% of your $${effectiveLimit.toFixed(2)} monthly limit.`,
        type: 'warning',
        date: new Date().toISOString(),
        actionType: 'budget',
      });
    }

    return list.filter((n) => !dismissedNotifIds.includes(n.id));
  }, [lending, isOverBudget, budgetPercentage, effectiveLimit, displaySpent, dismissedNotifIds, today]);

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-8 lg:px-12 py-4 sm:py-6 pb-28 font-sans selection:bg-zinc-800 w-full relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {bannerToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-5 right-5 z-50 max-w-md w-full shadow-2xl pointer-events-auto"
          >
            <div
              className={`p-4 rounded-2xl border backdrop-blur-xl flex items-start gap-3 shadow-2xl ${bannerToast.type === 'success'
                  ? 'bg-zinc-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/30'
                  : 'bg-zinc-950/90 border-red-500/40 text-red-100 shadow-red-950/30'
                }`}
            >
              {bannerToast.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 text-xs">
                <span className="font-semibold block mb-0.5">
                  {bannerToast.type === 'success' ? 'Database Synchronized' : 'Database Notice'}
                </span>
                <p className="text-zinc-300">{bannerToast.message}</p>
              </div>
              <button
                onClick={() => setBannerToast(null)}
                className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sleek Top Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 py-3 bg-transparent"
      >
        <div className="flex items-center justify-between">
          <div
            onClick={() => navigateToTab('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center font-bold text-xs tracking-wider shadow-md group-hover:scale-105 transition-transform">
              HP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-base text-white block group-hover:text-zinc-200 transition-colors">
                  HP Budgeting
                </span>
                <span className="text-[10px] text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-800 bg-zinc-900/40 flex items-center gap-1">
                  <Database size={10} className="text-zinc-300" />
                  <span>Supabase Synced</span>
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 truncate max-w-[200px] sm:max-w-none block">
                {user?.email || 'Authenticated Ledger'}
              </span>
            </div>
          </div>

          {/* Mobile Right Action Icons */}
          <div className="flex items-center gap-2 md:hidden">
            <NotificationCenter
              notifications={notifications}
              lendingItems={lending}
              isOpen={isNotifOpen}
              onToggle={() => setIsNotifOpen(!isNotifOpen)}
              onMarkPaid={(id) => handleUpdateLendingStatus(id, 'paid')}
              onDismiss={(id) => setDismissedNotifIds([...dismissedNotifIds, id])}
            />
            <button
              onClick={signOut}
              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Clean Segmented Control for Sub-sections / Tabs */}
        <nav className="flex items-center p-1 bg-zinc-950/80 rounded-2xl border border-zinc-850 self-start md:self-center text-xs backdrop-blur-md shadow-sm">
          <button
            onClick={() => navigateToTab('overview')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'overview'
                ? 'text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
              }`}
          >
            {activeTab === 'overview' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </span>
          </button>

          <button
            onClick={() => navigateToTab('lending')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'lending'
                ? 'text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
              }`}
          >
            {activeTab === 'lending' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <HandCoins size={14} />
              <span>Lending</span>
              {overdueItems.length > 0 && (
                <span
                  className={`w-2 h-2 rounded-full ${activeTab === 'lending' ? 'bg-black' : 'bg-white animate-pulse'
                    }`}
                />
              )}
            </span>
          </button>

          <button
            onClick={() => navigateToTab('transactions')}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${activeTab === 'transactions'
                ? 'text-black font-semibold'
                : 'text-zinc-400 hover:text-white'
              }`}
          >
            {activeTab === 'transactions' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-sm"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Receipt size={14} />
              <span>Transactions</span>
            </span>
          </button>
        </nav>

        {/* Desktop Header Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <NotificationCenter
            notifications={notifications}
            lendingItems={lending}
            isOpen={isNotifOpen}
            onToggle={() => setIsNotifOpen(!isNotifOpen)}
            onMarkPaid={(id) => handleUpdateLendingStatus(id, 'paid')}
            onDismiss={(id) => setDismissedNotifIds([...dismissedNotifIds, id])}
          />

          <button
            onClick={() => (activeTab === 'lending' ? setIsLendModalOpen(true) : setIsTxModalOpen(true))}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-all shadow-md"
          >
            <Plus size={14} />
            <span>{activeTab === 'lending' ? 'Log Loan' : 'Log Transaction'}</span>
          </button>

          <button
            onClick={handleRefreshAll}
            disabled={loading || budgetLoading}
            className="p-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh database records"
          >
            <RefreshCw size={14} className={loading || budgetLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={signOut}
            className="text-xs text-zinc-400 hover:text-white transition-colors py-2 px-2.5 rounded-xl border border-transparent hover:border-zinc-800 hover:bg-zinc-900/40"
            title="Sign out of your session"
          >
            Sign Out
          </button>
        </div>
      </motion.header>

      {/* Top Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3.5">
          {user?.user_metadata?.avatar_url || user?.user_metadata?.picture ? (
            <img
              src={user.user_metadata.avatar_url || user.user_metadata.picture}
              alt={userName}
              className="w-10 h-10 rounded-xl border border-zinc-800 object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white text-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white">
              Welcome, <span className="font-semibold text-white">{userName}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Personal financial summary and lending ledger
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Sub-Section View Content */}
      <main className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <OverviewView
                transactions={transactions}
                lending={lending}
                budgetLimit={effectiveLimit}
                totalSpentThisMonth={displaySpent}
                totalIncomeThisMonth={totalIncomeThisMonth}
                totalOutstandingLent={totalOutstandingLent}
                remainingBudget={remainingBudget}
                budgetPercentage={budgetPercentage}
                isOverBudget={isOverBudget}
                overdueCount={overdueItems.length}
                overdueAmount={overdueAmount}
                budgetLoading={budgetLoading}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
                onOpenResetConfirm={() => setIsResetConfirmOpen(true)}
                onOpenTxModal={() => setIsTxModalOpen(true)}
                onNavigateToTab={navigateToTab}
              />
            </motion.div>
          )}

          {activeTab === 'lending' && (
            <motion.div
              key="lending"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <LendingView
                lending={lending}
                loading={loading}
                onOpenLendModal={() => setIsLendModalOpen(true)}
                onUpdateStatus={handleUpdateLendingStatus}
              />
            </motion.div>
          )}

          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <TransactionsView
                transactions={transactions}
                loading={loading}
                onOpenTxModal={() => setIsTxModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistent Legal & Navigation Footer */}
      <Footer
        onNavigatePrivacy={onNavigatePrivacy || (() => { window.location.href = '/privacy'; })}
        onNavigateTerms={onNavigateTerms || (() => { window.location.href = '/terms'; })}
        onNavigateCookies={onNavigateCookies || (() => { window.location.href = '/cookies'; })}
        onNavigateHome={() => navigateToTab('overview')}
      />

      {/* MODALS */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setBudgetModalError(null);
        }}
        currentBudget={effectiveLimit}
        currentSpent={displaySpent}
        onSaveBudget={handleSaveBudget}
        isLoading={budgetSaving}
        error={budgetModalError}
      />

      <LendingModal
        isOpen={isLendModalOpen}
        onClose={() => setIsLendModalOpen(false)}
        onAddLending={handleAddLending}
      />

      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* Confirmation Modal for "Reset Limits" Action */}
      <AnimatePresence>
        {isResetConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={isResetting ? undefined : () => setIsResetConfirmOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Reset Limits to $0.00?
                  </h3>
                  <p className="text-xs text-zinc-400">
                    This directly updates your record in Supabase.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 mb-6 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-zinc-200 font-medium">
                  <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                  <span>The following database fields will be updated:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-zinc-400 font-mono text-[11px]">
                  <li>spending_limit = 0.00</li>
                  <li>budget_limit = 0.00</li>
                  <li>used_amount = 0.00</li>
                </ul>
                <p className="text-[11px] text-zinc-500 pt-1">
                  Your dashboard metrics and circular progress indicators will immediately reset to 0.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={() => setIsResetConfirmOpen(false)}
                  className="flex-1 py-2.5 text-xs uppercase tracking-wider rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleConfirmResetLimits}
                  className="flex-1 py-2.5 text-xs uppercase tracking-wider rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Confirm Reset</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}