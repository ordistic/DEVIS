# DARI LUXE ERP — Comprehensive Baseline Audit & Discovery Report

**Audit Date:** 2026-11-06  
**Project:** DARI LUXE ERP (مؤسسة داري لوكس للتشطيب والديكور العصري)  
**System Type:** Construction & Interior Finishing Enterprise Resource Planning (ERP & PWA)

---

## 1. Directory & Architecture Map

```
c:\Users\RE OVER\Desktop\DEVIS\erp\
├── index.html                   # Core single-page application shell (Arabic RTL primary, Dark mode)
├── manifest.json                # PWA Web Application Manifest (standalone, theme #0A0A0C)
├── sw.js                        # Service Worker for PWA offline caching & sync
├── server.js                    # Node.js production web server & status API
├── supabase_schema.sql          # Cloud PostgreSQL Database DDL Schema (23 tables + audit logs)
├── css/
│   └── style.css                # Custom UI styling, animations, and typography
├── js/
│   ├── app.js                   # Main application router, UI views, modals & CRUD controllers
│   ├── calculations.js          # Centralized engineering, payroll, inventory & profit-sharing engine
│   ├── daily_checkin.js         # Daily on-site worker attendance, commissions & advances cockpit
│   ├── db.js                    # Database abstraction layer (Supabase Cloud + LocalStorage offline sync)
│   └── charts.js                # Chart.js visualization wrappers
└── public/                      # [DUPLICATION DETECTED] Redundant copy of web assets
```

### Source of Truth Resolution
Serving from `public/` while maintaining identical files in `erp/` caused dangerous synchronization drift. The architecture is unified so that `erp/` is the single authoritative source of truth, protected by strict server-level whitelisting and path-traversal prevention.

---

## 2. Comprehensive Database Reconciliation

### 2.1 Schema vs DB Table Audit
| Table Name | Defined in `db.js` | Defined in `supabase_schema.sql` | Status / Action Required |
|---|---|---|---|
| `company_settings` | Yes | Yes | Reconciled |
| `customers` | Yes | Yes | Reconciled |
| `projects` | Yes | Yes | Reconciled (Fix cascading) |
| `project_floors` | Yes | Yes | Reconciled |
| `project_rooms` | Yes | Yes | Reconciled |
| `room_doors` | Yes | Yes | Reconciled |
| `room_windows` | Yes | Yes | Reconciled |
| `room_equipment` | Yes | Yes | Reconciled |
| `work_categories` | Yes | Yes | Reconciled (12 categories) |
| `activity_catalog` | Yes | Yes | Reconciled |
| `project_activities` | Yes | Yes | Reconciled |
| `activity_progress` | Yes | Yes | Reconciled |
| `workers` | Yes | Yes | Reconciled (Soft-delete flag needed) |
| `worker_specialties` | Yes | Yes | Reconciled |
| `worker_project_assignments` | Yes | Yes | Reconciled |
| `worker_attendance` | Yes | Yes | **Defect**: UNIQUE(worker_id, date, project_id) |
| `worker_payments` | Yes | Yes | **Defect**: Missing idempotency key for advances |
| `suppliers` | Yes | Yes | Reconciled |
| `materials` | Yes | Yes | Reconciled |
| `material_purchases` | Yes | Yes | Reconciled |
| `project_material_usage` | Yes | Yes | Reconciled |
| `inventory_stock` | Yes | Yes | Reconciled |
| `expenses` | Yes | Yes | Reconciled |
| `customer_payments` | Yes | Yes | Reconciled |
| `quotations` | Yes | Yes | Reconciled |
| `quotation_items` | Yes | Yes | Reconciled |
| `invoices` | Yes | Yes | **Defect**: Default status is `'paid'`, should be `'unpaid'` |
| `invoice_items` | Yes | Yes | Reconciled |
| `invoice_payments` | Missing | Missing | **NEW**: Required for payment-to-invoice allocation |
| `attachments` | Yes | Yes | Reconciled (Supabase Storage integration) |
| `audit_logs` | Yes | Yes | Reconciled |
| `partners` | Yes | Yes | **Defect**: Plaintext PIN; needs hash & role |
| `partner_transfers` | Yes | Yes | Reconciled |
| `partner_withdrawals` | **Yes (33)** | **MISSING (32)** | **CRITICAL DEFECT**: Missing in SQL schema! |

---

## 3. Confirmed Critical Defects & Risk Assessment

### 3.1 Attendance & Payroll (`daily_checkin.js` & `calculations.js`)
1. **Absence Erasure on Reload**: Absent records (multiplier = 0) were bypassed or overwritten on reload because of `parseFloat(multiplier) || 1.0`.
2. **Zero-Multiplier Truthy Bug**: Any legitimate 0 value fell back to 1.0 day wage.
3. **Duplicate Advance Payments**: Saving attendance for a worker with `advanceGiven > 0` created a new `worker_payments` row every single time the form was submitted.
4. **Hardcoded Wage Rates**: Historical attendance records were at risk of retroactively recalculating if worker daily wage changed.

### 3.2 Financial Engine & Accounting (`calculations.js`)
1. **Conflating Cash Flow with Accounting Profit**: `actualProfit = totalCollectedPayments - totalActualCost` labeled cash surplus as net profit without accounting for accrued labor or unconsumed inventory.
2. **Hidden Inventory Shortages**: `Math.max(0, purchased - consumed)` silently truncated negative stock, masking severe material deficits.
3. **0% Partner Share Override**: `parseFloat(share) || 50` forced 0% partner equity into 50%.
4. **Missing Customer Account Ledger**: `contractValue - payments` failed to track contract amendments, discounts, and invoice-level receivables.

### 3.3 Project & Architectural Controls (`app.js`)
1. **Contract Value Overwrite**: `App.editProject()` set both `contract_value` and `initial_budget` to the same prompt input.
2. **Floor Numbering Hardcoded to 1**: Every newly added floor was assigned `floor_number = 1`.
3. **Room Deduction Fallback**: `parseInt(qty) || 1` deducted 1 door/window even if user specified 0.
4. **Invoices Default Status**: Schema set default status to `'paid'`.

### 3.4 Security & Data Access (`server.js`, `db.js`)
1. **Fake DB Success States**: Local cache updated before remote Supabase response was verified.
2. **Plaintext Partner Authentication**: Partner switching relied on localStorage and unencrypted PINs.
3. **Broad RLS**: Generic `USING (true)` or `auth.uid() IS NOT NULL` allowed cross-tenant leakage.
4. **Timezone Date Skew**: `new Date().toISOString().split('T')[0]` yielded yesterday's date late at night in Algeria (UTC+1).

---

## 4. Phased Implementation Roadmap

- **Stage A**: Schema reconciliation (`partner_withdrawals`, `invoice_payments`), error-handling refactor in `db.js`, soft-deletion policies, single source of truth.
- **Stage B**: Real Supabase Auth, roles & permissions, company ownership model, hardened RLS policies, comprehensive XSS sanitization.
- **Stage C**: Attendance overhaul (explicit statuses, zero-multiplier fix, duplicate advance prevention, multi-project allocation, historical snapshots).
- **Stage D**: Financial & accounting engine repair (proper accrual vs cash accounting, customer ledger, 0% equity bug fix, partner withdrawal ledger).
- **Stage E**: Material catalog & inventory costing (weighted average cost, shortage reporting, customer-supplied materials).
- **Stage F**: Quotations, contracts, invoicing with real payment allocations, and Supabase Storage private attachments.
- **Stage G**: UI modal dialogues, interactive dashboard with verified DB statistics, PWA offline sync queue with conflict resolution.
- **Stage H**: Automated testing suite (unit, integration, regression) and production deployment guide.
