-- ==============================================================================
-- HP Budgeting - Production Supabase Database Schema Migration
-- ==============================================================================
-- Target Engine: PostgreSQL 15+ (Supabase)
-- Enforces: Cryptographic Row Level Security (RLS) & Foreign Key Isolation
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- CLEAN SLATE RESET OPTION (OPTIONAL - UNCOMMENT IF PERFORMING FULL REBUILD)
-- ------------------------------------------------------------------------------
-- DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
-- DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
-- DROP TRIGGER IF EXISTS set_lending_updated_at ON public.lending;
-- DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;
-- DROP TABLE IF EXISTS public.budgets CASCADE;
-- DROP TABLE IF EXISTS public.transactions CASCADE;
-- DROP TABLE IF EXISTS public.lending CASCADE;

-- ------------------------------------------------------------------------------
-- 2. REUSABLE TRIGGER: AUTOMATIC updated_at TIMESTAMPS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 3. TABLE: public.budgets
-- Tracks user spending limits, budget caps, and dynamic used amounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  spending_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  budget_limit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  used_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure updated_at trigger on public.budgets
DROP TRIGGER IF EXISTS set_budgets_updated_at ON public.budgets;
CREATE TRIGGER set_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 4. TABLE: public.transactions
-- Detailed inflow and outflow entries
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  merchant TEXT NOT NULL DEFAULT 'General',
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  type TEXT NOT NULL DEFAULT 'expense' CHECK (type IN ('income', 'expense', 'credit', 'debit')),
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure updated_at trigger on public.transactions
DROP TRIGGER IF EXISTS set_transactions_updated_at ON public.transactions;
CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. TABLE: public.lending
-- Peer-to-peer loan tracking and repayment ledger
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  person_name TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  lent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure updated_at trigger on public.lending
DROP TRIGGER IF EXISTS set_lending_updated_at ON public.lending;
CREATE TRIGGER set_lending_updated_at
  BEFORE UPDATE ON public.lending
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. HIGH-PERFORMANCE B-TREE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_budgets_user_id 
  ON public.budgets(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id 
  ON public.transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_transactions_date 
  ON public.transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON public.transactions(user_id, transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_category 
  ON public.transactions(user_id, category);

CREATE INDEX IF NOT EXISTS idx_lending_user_id 
  ON public.lending(user_id);

CREATE INDEX IF NOT EXISTS idx_lending_due_date 
  ON public.lending(due_date ASC);

CREATE INDEX IF NOT EXISTS idx_lending_user_status 
  ON public.lending(user_id, status);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Gating all operations strictly to the authenticated user owning the record
-- ------------------------------------------------------------------------------
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lending ENABLE ROW LEVEL SECURITY;

-- Budgets RLS Policy
DROP POLICY IF EXISTS "Allow authenticated users full access to own budgets" ON public.budgets;
CREATE POLICY "Allow authenticated users full access to own budgets"
  ON public.budgets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Transactions RLS Policy
DROP POLICY IF EXISTS "Allow authenticated users full access to own transactions" ON public.transactions;
CREATE POLICY "Allow authenticated users full access to own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lending RLS Policy
DROP POLICY IF EXISTS "Allow authenticated users full access to own lending" ON public.lending;
CREATE POLICY "Allow authenticated users full access to own lending"
  ON public.lending
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. SCHEMA CACHE INVALIDATION
-- Signals PostgREST to immediately refresh its schema cache
-- ------------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
