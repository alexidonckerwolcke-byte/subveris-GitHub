-- Create tables for SubscriptionSense app in Supabase

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  frequency TEXT NOT NULL,
  next_billing_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_date TEXT,
  logo_url TEXT,
  description TEXT,
  is_detected BOOLEAN NOT NULL DEFAULT true
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(36) PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  category TEXT,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  merchant_name TEXT,
  subscription_id VARCHAR(36)
);

-- Insights table
CREATE TABLE IF NOT EXISTS insights (
  id VARCHAR(36) PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  potential_savings REAL,
  subscription_id VARCHAR(36),
  priority INTEGER NOT NULL DEFAULT 1,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TEXT NOT NULL
);

-- Bank connections table
CREATE TABLE IF NOT EXISTS bank_connections (
  id VARCHAR(36) PRIMARY KEY,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  last_sync TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  account_mask TEXT
);

-- Enable Row Level Security (RLS) - disable for now for easy access
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (for development - adjust for production)
CREATE POLICY "Allow all on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all on subscriptions" ON subscriptions FOR ALL USING (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow all on insights" ON insights FOR ALL USING (true);
CREATE POLICY "Allow all on bank_connections" ON bank_connections FOR ALL USING (true);
