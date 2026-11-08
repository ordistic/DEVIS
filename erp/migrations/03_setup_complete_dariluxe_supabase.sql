-- ==============================================================================
-- DARI LUXE ERP — Migration 03: Complete Supabase Cloud Setup & Open RLS Policies
-- Execute this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ileqivegtkvcaawlugsj/sql
-- ==============================================================================

-- 1. Create partners table if not exists
CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_fr TEXT,
  phone TEXT,
  role TEXT DEFAULT 'admin',
  pin TEXT DEFAULT '1234',
  avatar TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create partner_transfers table if not exists
CREATE TABLE IF NOT EXISTS partner_transfers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_partner_id TEXT REFERENCES partners(id),
  to_partner_id TEXT REFERENCES partners(id),
  amount NUMERIC(12, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create partner_withdrawals table if not exists
CREATE TABLE IF NOT EXISTS partner_withdrawals (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  partner_id TEXT NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create invoice_payments table if not exists
CREATE TABLE IF NOT EXISTS invoice_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL REFERENCES customer_payments(id) ON DELETE CASCADE,
  amount_allocated NUMERIC(14, 2) NOT NULL CHECK (amount_allocated > 0),
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(invoice_id, payment_id)
);

-- 5. Add partner_id and soft-delete columns across tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customer_payments' AND column_name='partner_id') THEN
    ALTER TABLE customer_payments ADD COLUMN partner_id TEXT REFERENCES partners(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='worker_payments' AND column_name='partner_id') THEN
    ALTER TABLE worker_payments ADD COLUMN partner_id TEXT REFERENCES partners(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='partner_id') THEN
    ALTER TABLE expenses ADD COLUMN partner_id TEXT REFERENCES partners(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='material_purchases' AND column_name='partner_id') THEN
    ALTER TABLE material_purchases ADD COLUMN partner_id TEXT REFERENCES partners(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workers' AND column_name='is_active') THEN
    ALTER TABLE workers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE workers ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='is_active') THEN
    ALTER TABLE projects ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE projects ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='is_active') THEN
    ALTER TABLE customers ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE customers ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='materials' AND column_name='is_active') THEN
    ALTER TABLE materials ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    ALTER TABLE materials ADD COLUMN archived_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='worker_payments' AND column_name='idempotency_key') THEN
    ALTER TABLE worker_payments ADD COLUMN idempotency_key TEXT;
  END IF;
END $$;

-- 6. Configure RLS Policies allowing the web application Anon Key to read and write freely
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users only" ON %I;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all access" ON %I;', tbl);
        EXECUTE format('CREATE POLICY "Allow all access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

-- 7. Seed Default Partners & DARI LUXE Company Settings
INSERT INTO company_settings (id, company_name, company_name_fr, phone, email, address, rc_number, nif_number, currency, currency_symbol, theme)
VALUES ('settings_main', 'مؤسسة داري لوكس للتشطيب والديكور العصري (DARI LUXE)', 'DARI LUXE — Rénovation, Décoration et Aménagement', '0550600909', 'DARILUXE.NET@GMAIL.COM', 'حي 17 أكتوبر، سيدي لخضر - عين الدفلى', '44/00-0987654B20', '002044098765432', 'DZD', 'دج', 'dark')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_name_fr = EXCLUDED.company_name_fr,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address;

INSERT INTO partners (id, name, name_fr, phone, role, pin, color) VALUES
('USR-001', 'الشريك الأول (أمين)', 'Partenaire 1 (Amine)', '0550000001', 'admin', '1234', '#3B82F6'),
('USR-002', 'الشريك الثاني (ياسين)', 'Partenaire 2 (Yacine)', '0550000002', 'admin', '1234', '#10B981')
ON CONFLICT (id) DO NOTHING;
