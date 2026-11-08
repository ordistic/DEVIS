-- ==============================================================================
-- DARI LUXE ERP — Migration 01: Core Architecture, Tables & Integrity Upgrade
-- ==============================================================================

-- 1. Create partner_withdrawals table if not exists
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

-- 2. Create invoice_payments table if not exists
CREATE TABLE IF NOT EXISTS invoice_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL REFERENCES customer_payments(id) ON DELETE CASCADE,
  amount_allocated NUMERIC(14, 2) NOT NULL CHECK (amount_allocated > 0),
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(invoice_id, payment_id)
);

-- 3. Add soft delete and idempotency columns
DO $$
BEGIN
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

-- 4. Enable RLS and add policies
ALTER TABLE partner_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users only" ON partner_withdrawals;
CREATE POLICY "Authenticated users only" ON partner_withdrawals FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users only" ON invoice_payments;
CREATE POLICY "Authenticated users only" ON invoice_payments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Seed default partners if not exist
INSERT INTO partners (id, name, name_fr, phone, role, pin, color) VALUES
('USR-001', 'الشريك الأول (أمين)', 'Partenaire 1 (Amine)', '0550000001', 'admin', '1234', '#3B82F6'),
('USR-002', 'الشريك الثاني (ياسين)', 'Partenaire 2 (Yacine)', '0550000002', 'admin', '1234', '#10B981')
ON CONFLICT (id) DO NOTHING;
