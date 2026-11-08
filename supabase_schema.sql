-- ==============================================================================
-- SCHEMA POSTGRESQL COMPLET POUR SUPABASE
-- نظام إدارة مؤسسة التشطيب والديكور العصري — داري لوكس DARI LUXE
-- DARI LUXE — Rénovation, Décoration et Aménagement ERP
-- ==============================================================================

-- 1. جدول إعدادات المؤسسة / Paramètres de l'entreprise
CREATE TABLE IF NOT EXISTS company_settings (
    id TEXT PRIMARY KEY DEFAULT 'settings_main',
    company_name TEXT NOT NULL DEFAULT 'مؤسسة داري لوكس للتشطيب والديكور العصري (DARI LUXE)',
    company_name_fr TEXT DEFAULT 'DARI LUXE — Rénovation, Décoration et Aménagement',
    phone TEXT DEFAULT '0XXXXXXXXX',
    email TEXT DEFAULT 'contact@example.com',
    address TEXT DEFAULT 'حي 17 أكتوبر، سيدي لخضر، عين الدفلى',
    logo_url TEXT DEFAULT 'dari_luxe_logo.png',
    rc_number TEXT DEFAULT '44/00-0987654B20',
    nif_number TEXT DEFAULT '002044098765432',
    currency TEXT DEFAULT 'DZD',
    currency_symbol TEXT DEFAULT 'دج',
    tax_rate NUMERIC DEFAULT 0,
    theme TEXT DEFAULT 'dark',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. جدول الزبائن / Clients
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. جدول المشاريع المستقلة / Projets
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT,
    address TEXT,
    project_type TEXT DEFAULT 'renovation',
    description TEXT,
    start_date DATE,
    expected_date DATE,
    actual_date DATE,
    status TEXT DEFAULT 'in_progress', -- planning, approved, in_progress, completed, on_hold, cancelled
    commercial_model TEXT DEFAULT 'hybrid', -- labor_only, labor_materials, hybrid
    contract_value NUMERIC DEFAULT 0,
    initial_budget NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. جدول طوابق المبنى / Étages du bâtiment
CREATE TABLE IF NOT EXISTS project_floors (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    floor_name TEXT NOT NULL,
    floor_number INTEGER DEFAULT 1,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول الغرف والمساحات / Pièces & Espaces
CREATE TABLE IF NOT EXISTS project_rooms (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    floor_id TEXT NOT NULL REFERENCES project_floors(id) ON DELETE CASCADE,
    room_name TEXT NOT NULL,
    room_type TEXT DEFAULT 'bedroom',
    length NUMERIC NOT NULL DEFAULT 4.0,
    width NUMERIC NOT NULL DEFAULT 3.5,
    height NUMERIC NOT NULL DEFAULT 2.58,
    ceiling_type TEXT DEFAULT 'placo',
    floor_type TEXT DEFAULT 'tiles',
    include_walls_paint BOOLEAN DEFAULT TRUE,
    include_ceiling_paint BOOLEAN DEFAULT TRUE,
    manual_paint_adj NUMERIC DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول الأبواب وخصم الفتحات / Portes & Ouvertures
CREATE TABLE IF NOT EXISTS room_doors (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Porte',
    width NUMERIC NOT NULL DEFAULT 0.9,
    height NUMERIC NOT NULL DEFAULT 2.1,
    quantity INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول النوافذ / Fenêtres
CREATE TABLE IF NOT EXISTS room_windows (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    name TEXT DEFAULT 'Fenêtre',
    width NUMERIC NOT NULL DEFAULT 1.4,
    height NUMERIC NOT NULL DEFAULT 1.2,
    quantity INTEGER NOT NULL DEFAULT 1,
    window_type TEXT DEFAULT 'standard',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. جدول التجهيزات التقنية للغرفة / Équipement technique de la pièce
CREATE TABLE IF NOT EXISTS room_equipment (
    id TEXT PRIMARY KEY,
    room_id TEXT UNIQUE NOT NULL REFERENCES project_rooms(id) ON DELETE CASCADE,
    outlets INTEGER DEFAULT 0,
    switches INTEGER DEFAULT 0,
    spots INTEGER DEFAULT 0,
    ceiling_lights INTEGER DEFAULT 0,
    wall_lights INTEGER DEFAULT 0,
    led_strips INTEGER DEFAULT 0,
    led_profile_enabled BOOLEAN DEFAULT FALSE,
    led_profile_len NUMERIC DEFAULT 0,
    curtains_enabled BOOLEAN DEFAULT FALSE,
    curtain_len NUMERIC DEFAULT 0,
    curtain_tracks INTEGER DEFAULT 0,
    decorative_plaster TEXT,
    decorative_panels TEXT,
    water_points INTEGER DEFAULT 0,
    drainage_points INTEGER DEFAULT 0,
    sinks INTEGER DEFAULT 0,
    toilets INTEGER DEFAULT 0,
    showers INTEGER DEFAULT 0,
    faucets INTEGER DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. جدول تصنيفات الأشغال / Catégories de travaux
CREATE TABLE IF NOT EXISTS work_categories (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    icon TEXT DEFAULT 'tool'
);

-- 10. جدول دليل بنود الأشغال / Catalogue des activités
CREATE TABLE IF NOT EXISTS activity_catalog (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES work_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'm2',
    default_price NUMERIC DEFAULT 0,
    estimated_labor_cost NUMERIC DEFAULT 0,
    estimated_material_cost NUMERIC DEFAULT 0
);

-- 11. جدول بنود أشغال المشروع / Activités du projet
CREATE TABLE IF NOT EXISTS project_activities (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    floor_id TEXT,
    room_id TEXT,
    activity_id TEXT,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT NOT NULL DEFAULT 'm2',
    unit_price NUMERIC DEFAULT 0,
    labor_price NUMERIC DEFAULT 0,
    material_price NUMERIC DEFAULT 0,
    planned_qty NUMERIC DEFAULT 0,
    executed_qty NUMERIC DEFAULT 0,
    remaining_qty NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    labor_responsibility TEXT DEFAULT 'company', -- company, customer
    material_responsibility TEXT DEFAULT 'company', -- company, customer, subcontractor
    start_date DATE,
    end_date DATE,
    assigned_worker_ids JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. جدول العمال / Ouvriers
CREATE TABLE IF NOT EXISTS workers (
    id TEXT PRIMARY KEY,
    worker_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    specialty TEXT NOT NULL,
    daily_wage NUMERIC NOT NULL DEFAULT 3000,
    overtime_rate NUMERIC DEFAULT 400,
    employment_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. جدول التحضير واليوميات (Check اليومي) / Pointage & Présences
CREATE TABLE IF NOT EXISTS worker_attendance (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    floor_id TEXT,
    room_id TEXT,
    date DATE NOT NULL,
    workday_type TEXT NOT NULL DEFAULT 'normal', -- normal (1.0), half (0.5), double (2.0), custom, absent (0)
    multiplier NUMERIC NOT NULL DEFAULT 1.0,
    daily_wage NUMERIC NOT NULL DEFAULT 3000,
    commission NUMERIC DEFAULT 0,
    calculated_amount NUMERIC NOT NULL DEFAULT 3000,
    work_description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. جدول دفعات وتسبيقات العمال / Paiements & Avances Ouvriers
CREATE TABLE IF NOT EXISTS worker_payments (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    payment_type TEXT DEFAULT 'salary', -- salary, advance, bonus
    payment_method TEXT DEFAULT 'cash',
    receipt_ref TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. جدول الموردين / Fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    category TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. جدول دليل المواد / Catalogue des matériaux
CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'piece',
    default_purchase_price NUMERIC DEFAULT 0,
    default_selling_price NUMERIC DEFAULT 0,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. جدول مشتريات المواد / Achats des matériaux
CREATE TABLE IF NOT EXISTS material_purchases (
    id TEXT PRIMARY KEY,
    material_id TEXT,
    material_name TEXT NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    supplier_id TEXT REFERENCES suppliers(id) ON DELETE SET NULL,
    quantity NUMERIC NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    purchase_date DATE NOT NULL,
    invoice_ref TEXT,
    payment_status TEXT DEFAULT 'paid',
    material_source TEXT DEFAULT 'company', -- company, customer, stock
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. جدول الاستهلاك الفعلي للمواد بالمشروع / Consommation sur chantier
CREATE TABLE IF NOT EXISTS project_material_usage (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    floor_id TEXT,
    room_id TEXT,
    material_id TEXT,
    material_name TEXT NOT NULL,
    quantity_consumed NUMERIC NOT NULL DEFAULT 1,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    source TEXT DEFAULT 'company_purchase', -- company_purchase, customer_supplied, stock
    date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. جدول المصاريف العامة والنفقات / Dépenses
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- transport, equipment_rental, tools, fuel, maintenance, admin, subcontracting, other
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    recipient TEXT,
    payment_method TEXT DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. جدول مقبوضات ودفعات الزبائن / Paiements Clients
CREATE TABLE IF NOT EXISTS customer_payments (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    payment_date DATE NOT NULL,
    payment_type TEXT DEFAULT 'progress', -- deposit, progress, final, extra
    payment_method TEXT DEFAULT 'cash',
    receipt_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. جدول عروض الأسعار / Devis
CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    validity_days INTEGER DEFAULT 30,
    subtotal NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'draft', -- draft, sent, approved, rejected
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. جدول الفواتير الرسمية / Factures
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    ref TEXT UNIQUE NOT NULL,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    quotation_id TEXT REFERENCES quotations(id) ON DELETE SET NULL,
    invoice_type TEXT DEFAULT 'progress', -- deposit, progress, final, additional
    issue_date DATE NOT NULL,
    due_date DATE,
    subtotal NUMERIC DEFAULT 0,
    tax_amount NUMERIC DEFAULT 0,
    total_amount NUMERIC NOT NULL,
    paid_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'unpaid', -- unpaid, partially_paid, paid, draft, overdue, void
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. جدول سجل العمليات / Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB
);

-- ==============================================================================
-- تمكين سياسات الأمان ROW LEVEL SECURITY (RLS) للعمل المباشر
-- ==============================================================================
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_floors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_doors ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول الحر للمفتاح العام Anon Key
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy" ON %I;', tbl);
        EXECUTE format('CREATE POLICY "Public access policy" ON %I FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);', tbl);
    END LOOP;
END $$;

-- ==============================================================================
-- إدخال البيانات النموذجية الأولية في SUPABASE / Données Initiales
-- ==============================================================================
INSERT INTO company_settings (id, company_name, company_name_fr, phone, email, address, rc_number, nif_number, currency, currency_symbol, theme)
VALUES ('settings_main', 'مؤسسة داري لوكس للتشطيب والديكور العصري (DARI LUXE)', 'DARI LUXE — Rénovation, Décoration et Aménagement', '0550600909', 'DARILUXE.NET@GMAIL.COM', 'حي 17 أكتوبر، سيدي لخضر - عين الدفلى', '44/00-0987654B20', '002044098765432', 'DZD', 'دج', 'dark')
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_name_fr = EXCLUDED.company_name_fr,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address;

-- UNIQUE constraint to prevent duplicate attendance entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_attendance_per_day'
  ) THEN
    ALTER TABLE worker_attendance 
      ADD CONSTRAINT unique_attendance_per_day 
      UNIQUE (worker_id, date, project_id);
  END IF;
END $$;


-- ============================================================
-- MISSING TABLES (db.js references but were absent from schema)
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_progress (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_activity_id TEXT REFERENCES project_activities(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  qty_executed NUMERIC(12, 3) DEFAULT 0,
  percentage_complete NUMERIC(5, 2) DEFAULT 0,
  notes TEXT,
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  entity_type TEXT, -- 'project', 'worker', 'quotation', 'invoice', etc.
  entity_id TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- 'image', 'pdf', 'document'
  file_size INTEGER,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_stock (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  material_id TEXT REFERENCES materials(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('in', 'out', 'adjustment')),
  qty_in NUMERIC(12, 3) DEFAULT 0,
  qty_out NUMERIC(12, 3) DEFAULT 0,
  qty_balance NUMERIC(12, 3) DEFAULT 0,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  location TEXT,
  reference TEXT,
  notes TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  quotation_item_id TEXT,
  line_number INTEGER DEFAULT 1,
  description TEXT NOT NULL,
  qty NUMERIC(12, 3) DEFAULT 1,
  unit TEXT DEFAULT 'U',
  unit_price NUMERIC(12, 2) DEFAULT 0,
  discount_pct NUMERIC(5, 2) DEFAULT 0,
  total NUMERIC(14, 2) GENERATED ALWAYS AS (ROUND(qty * unit_price * (1 - discount_pct / 100), 2)) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quotation_id TEXT REFERENCES quotations(id) ON DELETE CASCADE,
  activity_id TEXT,
  floor_id TEXT,
  room_id TEXT,
  line_number INTEGER DEFAULT 1,
  description TEXT NOT NULL,
  description_fr TEXT,
  qty NUMERIC(12, 3) DEFAULT 1,
  unit TEXT DEFAULT 'U',
  unit_price NUMERIC(12, 2) DEFAULT 0,
  discount_pct NUMERIC(5, 2) DEFAULT 0,
  total NUMERIC(14, 2) GENERATED ALWAYS AS (ROUND(qty * unit_price * (1 - discount_pct / 100), 2)) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS worker_project_assignments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'worker', -- 'chef_equipe', 'worker', 'specialist'
  daily_wage_override NUMERIC(10, 2), -- NULL = use worker default
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  notes TEXT,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, project_id)
);

CREATE TABLE IF NOT EXISTS worker_specialties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  worker_id TEXT REFERENCES workers(id) ON DELETE CASCADE,
  specialty_name TEXT NOT NULL,
  specialty_name_fr TEXT,
  level TEXT DEFAULT 'intermediate' CHECK (level IN ('junior', 'intermediate', 'senior', 'expert')),
  certified BOOLEAN DEFAULT FALSE,
  certificate_ref TEXT,
  valid_until DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for missing tables
ALTER TABLE activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_specialties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users only" ON activity_progress FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON attachments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON inventory_stock FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON invoice_items FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON quotation_items FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON worker_project_assignments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON worker_specialties FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================
-- PARTNERS & WALLET CAISSE SYSTEM
-- ============================================================

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

CREATE TABLE IF NOT EXISTS partner_transfers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  from_partner_id TEXT REFERENCES partners(id),
  to_partner_id TEXT REFERENCES partners(id),
  amount NUMERIC(12, 2) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add partner_id column to transaction tables if not exists
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
END $$;

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users only" ON partners FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON partner_transfers FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- 33. جدول سحوبات وتوزيع أرباح الشركاء / Retraits & Dividendes Associés
-- ============================================================
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

-- ============================================================
-- 34. جدول تسديدات الفواتير المخصصة / Affectations Paiements Factures
-- ============================================================
CREATE TABLE IF NOT EXISTS invoice_payments (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL REFERENCES customer_payments(id) ON DELETE CASCADE,
  amount_allocated NUMERIC(14, 2) NOT NULL CHECK (amount_allocated > 0),
  allocated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(invoice_id, payment_id)
);

-- Soft delete & Idempotency columns
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

-- Enable RLS and add policies
ALTER TABLE partner_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users only" ON partner_withdrawals FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users only" ON invoice_payments FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Seed default partners
INSERT INTO partners (id, name, name_fr, phone, role, pin, color) VALUES
('USR-001', 'الشريك الأول (أمين)', 'Partenaire 1 (Amine)', '0550000001', 'admin', '1234', '#3B82F6'),
('USR-002', 'الشريك الثاني (ياسين)', 'Partenaire 2 (Yacine)', '0550000002', 'admin', '1234', '#10B981')
ON CONFLICT (id) DO NOTHING;
