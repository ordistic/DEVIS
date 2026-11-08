-- ==============================================================================
-- DARI LUXE ERP — Migration 02: Wipe All Demo & Operational Data
-- ==============================================================================
-- This script safely wipes all demo/sample records across all operational tables.
-- Preserves company_settings, partners, and base work categories.

TRUNCATE TABLE 
  attachments,
  audit_logs,
  invoice_payments,
  invoice_items,
  invoices,
  quotation_items,
  quotations,
  customer_payments,
  expenses,
  project_material_usage,
  material_purchases,
  inventory_stock,
  materials,
  suppliers,
  worker_payments,
  worker_attendance,
  worker_project_assignments,
  worker_specialties,
  workers,
  activity_progress,
  project_activities,
  room_equipment,
  room_windows,
  room_doors,
  project_rooms,
  project_floors,
  projects,
  customers,
  partner_transfers,
  partner_withdrawals
CASCADE;

-- Ensure default partners are present
INSERT INTO partners (id, name, name_fr, phone, role, pin, color) VALUES
('USR-001', 'الشريك الأول (أمين)', 'Partenaire 1 (Amine)', '0550000001', 'admin', '1234', '#3B82F6'),
('USR-002', 'الشريك الثاني (ياسين)', 'Partenaire 2 (Yacine)', '0550000002', 'admin', '1234', '#10B981')
ON CONFLICT (id) DO NOTHING;
