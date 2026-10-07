import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const rawUrl = process.env.SUPABASE_URL || '';
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || supabaseKey;
const DEFAULT_USER_ID = '56eed88b-042f-479a-ab90-a48f9f8e2720';

const adminSupabase = createClient(supabaseUrl, supabaseKey);

// Helper: Returns a scoped Supabase client with the caller's JWT token to enforce RLS
function getSupabaseForReq(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    return createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }
  return adminSupabase;
}

// Health & connection status endpoint
app.get('/api/status', async (_req, res) => {
  try {
    const [txCount, lendCount] = await Promise.all([
      adminSupabase.from('transactions').select('*', { count: 'exact', head: true }),
      adminSupabase.from('lending').select('*', { count: 'exact', head: true }),
    ]);

    res.json({
      connected: true,
      url: supabaseUrl,
      tables: ['transactions', 'lending'],
      records: {
        transactions: txCount.count ?? 0,
        lending: lendCount.count ?? 0,
      },
    });
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// GET /api/transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { data, error } = await client
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw error;

    const mapped = (data || []).map((t) => ({
      id: t.id,
      amount: Number(t.amount),
      type: t.type === 'credit' ? 'income' : 'expense',
      merchant: t.merchant || t.description || 'General',
      transaction_date: t.transaction_date || t.created_at,
      date: t.transaction_date || t.created_at,
      category: t.category,
      user_id: t.user_id,
    }));

    res.json(mapped);
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transactions
app.post('/api/transactions', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { amount, type, merchant, description, category, transaction_date, date } = req.body;
    const dbType = type === 'income' ? 'credit' : 'debit';
    const txDate = transaction_date || date ? new Date(transaction_date || date).toISOString() : new Date().toISOString();

    const { data, error } = await client
      .from('transactions')
      .insert([
        {
          user_id: DEFAULT_USER_ID,
          amount: parseFloat(amount),
          type: dbType,
          merchant: merchant || description || 'General',
          description: description || merchant || '',
          category: category || 'General',
          transaction_date: txDate,
        },
      ])
      .select();

    if (error) throw error;

    const created = data?.[0];
    res.status(201).json({
      id: created.id,
      amount: Number(created.amount),
      type: created.type === 'credit' ? 'income' : 'expense',
      merchant: created.merchant,
      transaction_date: created.transaction_date,
      date: created.transaction_date,
      category: created.category,
      user_id: created.user_id,
    });
  } catch (err: any) {
    console.error('Error adding transaction:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/lending
app.get('/api/lending', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { data, error } = await client
      .from('lending')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;

    const mapped = (data || []).map((l) => ({
      id: l.id,
      person_name: l.person_name,
      amount: Number(l.amount),
      lent_date: l.lent_date,
      due_date: l.due_date,
      notes: l.notes,
      status: l.status,
      user_id: l.user_id,
    }));

    res.json(mapped);
  } catch (err: any) {
    console.error('Error fetching lending records:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/lending
app.post('/api/lending', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { person_name, amount, due_date, lent_date, notes = '', status = 'pending' } = req.body;
    const dueDateIso = due_date ? new Date(due_date).toISOString() : new Date().toISOString();
    const lentDateIso = lent_date ? new Date(lent_date).toISOString() : new Date().toISOString();

    const { data, error } = await client
      .from('lending')
      .insert([
        {
          user_id: DEFAULT_USER_ID,
          person_name,
          amount: parseFloat(amount),
          lent_date: lentDateIso,
          due_date: dueDateIso,
          notes,
          status,
        },
      ])
      .select();

    if (error) throw error;

    const created = data?.[0];
    res.status(201).json({
      id: created.id,
      person_name: created.person_name,
      amount: Number(created.amount),
      lent_date: created.lent_date,
      due_date: created.due_date,
      notes: created.notes,
      status: created.status,
      user_id: created.user_id,
    });
  } catch (err: any) {
    console.error('Error adding lending record:', err);
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/lending/:id
app.patch('/api/lending/:id', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { id } = req.params;
    const { status } = req.body;

    const { data, error } = await client
      .from('lending')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json(data?.[0]);
  } catch (err: any) {
    console.error('Error updating lending record:', err);
    res.status(400).json({ error: err.message });
  }
});

// GET /api/budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { data, error } = await client
      .from('budgets')
      .select('spending_limit, budget_limit, used_amount')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    res.json(data || { spending_limit: 0, budget_limit: 0, used_amount: 0 });
  } catch (err: any) {
    console.error('Error fetching budgets:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budgets (Upsert)
app.post('/api/budgets', async (req, res) => {
  try {
    const client = getSupabaseForReq(req);
    const { spending_limit, budget_limit, used_amount } = req.body;

    const { data, error } = await client
      .from('budgets')
      .upsert(
        {
          user_id: DEFAULT_USER_ID,
          spending_limit: parseFloat(spending_limit ?? 0),
          budget_limit: parseFloat(budget_limit ?? spending_limit ?? 0),
          used_amount: parseFloat(used_amount ?? 0),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select();

    if (error) throw error;
    res.json(data?.[0]);
  } catch (err: any) {
    console.error('Error upserting budget record:', err);
    res.status(400).json({ error: err.message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HP Budgeting server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
