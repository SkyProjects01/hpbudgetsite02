export type Transaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  transaction_date: string;
  category?: string;
  user_id?: string;
};

export type Lending = {
  id: string;
  person_name: string;
  amount: number;
  lent_date?: string;
  due_date: string;
  notes?: string;
  status: 'pending' | 'paid';
  user_id?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'alert' | 'info' | 'success';
  date: string;
  read?: boolean;
  actionType?: 'view_lending' | 'budget';
  lendingId?: string;
};

export type Budget = {
  user_id: string;
  spending_limit: number;
  budget_limit: number;
  used_amount: number;
  updated_at?: string;
};

export type BudgetSettings = {
  spending_limit: number;
  budget_limit: number;
  used_amount: number;
};
