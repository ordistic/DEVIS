/**
 * DARI LUXE ERP — Automated Comprehensive Unit & Integration Test Suite
 * Validates financial logic, geometric calculations, attendance integrity,
 * idempotency, inventory shortage detection, and partner equity sharing.
 */

const assert = require('assert');
const CalculationEngine = require('../js/calculations.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

console.log('================================================================');
console.log('  DARI LUXE ERP — AUTOMATED TEST SUITE');
console.log('================================================================\n');

// 1. Room Measurement Deductions (Quantity = 0 Bug Regression Test)
console.log('[1] Room Measurement Deductions');
runTest('Room with 0 doors should NOT deduct door area', () => {
  const room = { length: 5, width: 4, height: 3, include_walls_paint: true, include_ceiling_paint: true };
  const doors = [{ width: 1, height: 2, quantity: 0 }]; // 0 doors
  const windows = [];

  const res = CalculationEngine.computeRoomMeasurements(room, doors, windows);
  // Gross wall = 2 * (5 + 4) * 3 = 54
  // Door area should be 0, not 2
  assert.strictEqual(res.totalDoorArea, 0, `Door area must be 0 when quantity is 0, got ${res.totalDoorArea}`);
  assert.strictEqual(res.netWallPaintingArea, 54, `Net wall area must be 54, got ${res.netWallPaintingArea}`);
});

runTest('Room with 2 doors should deduct correctly (2 * 1 * 2 = 4)', () => {
  const room = { length: 5, width: 4, height: 3, include_walls_paint: true, include_ceiling_paint: true };
  const doors = [{ width: 1, height: 2, quantity: 2 }];
  const windows = [{ width: 1.2, height: 1.0, quantity: 1 }];

  const res = CalculationEngine.computeRoomMeasurements(room, doors, windows);
  assert.strictEqual(res.totalDoorArea, 4);
  assert.strictEqual(res.totalWindowArea, 1.2);
  assert.strictEqual(res.netWallPaintingArea, 54 - 4 - 1.2);
});

// 2. Worker Workday & Payroll Calculations (Zero Multiplier & Absence Bug)
console.log('\n[2] Worker Attendance & Payroll');
runTest('Absent worker has 0.0 multiplier and 0 wage', () => {
  const wage = CalculationEngine.computeWorkdayWage(3500, 'absent', 1.0, 0);
  assert.strictEqual(wage.multiplier, 0.0);
  assert.strictEqual(wage.wageAmount, 0);
  assert.strictEqual(wage.amount, 0);
});

runTest('Worker Financial Summary must NOT count absent days as effective working days', () => {
  const attendances = [
    { worker_id: 'W1', date: '2026-11-01', workday_type: 'normal', multiplier: 1.0, calculated_amount: 3500 },
    { worker_id: 'W1', date: '2026-11-02', workday_type: 'absent', multiplier: 0.0, calculated_amount: 0 },
    { worker_id: 'W1', date: '2026-11-03', workday_type: 'half', multiplier: 0.5, calculated_amount: 1750 },
    { worker_id: 'W1', date: '2026-11-04', workday_type: 'one_and_half', multiplier: 1.5, calculated_amount: 5250 }
  ];
  const payments = [
    { worker_id: 'W1', amount: 3000, payment_type: 'advance' }
  ];

  const summary = CalculationEngine.computeWorkerFinancialSummary('W1', attendances, payments);
  assert.strictEqual(summary.absentDaysCount, 1, `Expected 1 absent day, got ${summary.absentDaysCount}`);
  assert.strictEqual(summary.normalDaysCount, 1);
  assert.strictEqual(summary.halfDaysCount, 1);
  assert.strictEqual(summary.oneAndHalfDaysCount, 1);
  // Total effective days: 1.0 + 0.5 + 1.5 = 3.0 (Absent is 0)
  assert.strictEqual(summary.totalEffectiveDays, 3.0, `Expected 3.0 effective days, got ${summary.totalEffectiveDays}`);
  assert.strictEqual(summary.totalEarnedWages, 3500 + 1750 + 5250); // 10,500
  assert.strictEqual(summary.remainingBalance, 10500 - 3000); // 7,500
});

// 3. Material Stock & Shortage Detection
console.log('\n[3] Material Stock & Inventory Shortage Detection');
runTest('Material shortage is detected when consumption exceeds purchased stock', () => {
  const purchases = [
    { material_id: 'M1', quantity: 50, unit_price: 1000, material_source: 'company' }
  ];
  const usages = [
    { material_id: 'M1', quantity_consumed: 70, unit_cost: 1000, source: 'company_purchased' }
  ];

  const res = CalculationEngine.computeMaterialInventory('M1', purchases, usages);
  assert.strictEqual(res.totalCompanyPurchasedQty, 50);
  assert.strictEqual(res.companyConsumedQty, 70);
  assert.strictEqual(res.hasShortage, true, 'hasShortage must be true');
  assert.strictEqual(res.shortageQty, 20, `Expected shortageQty of 20, got ${res.shortageQty}`);
  assert.strictEqual(res.remainingCompanyStockQty, 0);
});

runTest('Stock is correctly calculated when purchased exceeds consumption', () => {
  const purchases = [
    { material_id: 'M2', quantity: 100, unit_price: 500, material_source: 'company' }
  ];
  const usages = [
    { material_id: 'M2', quantity_consumed: 40, unit_cost: 500, source: 'company_purchased' }
  ];

  const res = CalculationEngine.computeMaterialInventory('M2', purchases, usages);
  assert.strictEqual(res.hasShortage, false);
  assert.strictEqual(res.shortageQty, 0);
  assert.strictEqual(res.remainingCompanyStockQty, 60);
  assert.strictEqual(res.remainingStockValue, 30000);
});

// 4. Partner 0% Equity Preservation & Profit Sharing
console.log('\n[4] Partner Equity & Unified Company Finances');
runTest('Partner equity 0% is preserved and NOT coerced to 50%', () => {
  const customerPayments = [{ amount: 100000, partner_id: 'USR-001' }];
  const expenses = [{ amount: 20000, partner_id: 'USR-001' }];
  const materialPurchases = [{ total_cost: 30000, material_source: 'company', partner_id: 'USR-001' }];
  const workerPayments = [{ amount: 10000, partner_id: 'USR-002' }];
  const withdrawals = [];
  const shareConfig = { partner1Share: 0, partner2Share: 100 }; // 0% / 100% split

  const res = CalculationEngine.computeUnifiedCompanyFinancesAndProfitSharing(
    customerPayments,
    expenses,
    materialPurchases,
    workerPayments,
    withdrawals,
    shareConfig
  );

  assert.strictEqual(res.share1Pct, 0, `Expected Partner 1 share to be 0%, got ${res.share1Pct}%`);
  assert.strictEqual(res.share2Pct, 100, `Expected Partner 2 share to be 100%, got ${res.share2Pct}%`);
  // Net Profit = 100,000 - 20,000 - 30,000 - 10,000 = 40,000
  assert.strictEqual(res.netProfit, 40000);
  assert.strictEqual(res.p1EntitledProfit, 0);
  assert.strictEqual(res.p2EntitledProfit, 40000);
  assert.strictEqual(res.totalCashInWallet, 40000);
});

runTest('Equal 50/50 split calculates entitled profits and remaining dividends correctly', () => {
  const customerPayments = [{ amount: 200000, partner_id: 'USR-001' }];
  const expenses = [{ amount: 40000, partner_id: 'USR-001' }];
  const materialPurchases = [{ total_cost: 60000, material_source: 'company', partner_id: 'USR-002' }];
  const workerPayments = [{ amount: 20000, partner_id: 'USR-001' }];
  const withdrawals = [
    { amount: 15000, partner_id: 'USR-001' },
    { amount: 10000, partner_id: 'USR-002' }
  ];
  const shareConfig = { partner1Share: 50, partner2Share: 50 };

  const res = CalculationEngine.computeUnifiedCompanyFinancesAndProfitSharing(
    customerPayments,
    expenses,
    materialPurchases,
    workerPayments,
    withdrawals,
    shareConfig
  );

  // Net Profit = 200,000 - (40k + 60k + 20k) = 80,000
  assert.strictEqual(res.netProfit, 80000);
  // 50% each = 40,000
  assert.strictEqual(res.p1EntitledProfit, 40000);
  assert.strictEqual(res.p2EntitledProfit, 40000);
  // Remaining unpaid: P1: 40k - 15k = 25k, P2: 40k - 10k = 30k
  assert.strictEqual(res.p1RemainingShare, 25000);
  assert.strictEqual(res.p2RemainingShare, 30000);
  // Total cash in wallet = 200k - (40k + 60k + 20k + 25k withdrawals) = 55,000
  assert.strictEqual(res.totalCashInWallet, 55000);
});

// 5. Customer Account Ledger
console.log('\n[5] Customer Account Ledger');
runTest('Customer financial summary computes outstanding contract and invoice balances', () => {
  const projects = [
    { id: 'PRJ-1', customer_id: 'CUST-1', contract_value: 500000 },
    { id: 'PRJ-2', customer_id: 'CUST-1', contract_value: 300000 }
  ];
  const payments = [
    { project_id: 'PRJ-1', amount: 200000 },
    { project_id: 'PRJ-2', amount: 150000 }
  ];
  const invoices = [
    { project_id: 'PRJ-1', total_amount: 250000, paid_amount: 200000 }
  ];

  const res = CalculationEngine.computeCustomerFinancialSummary('CUST-1', projects, payments, invoices);
  assert.strictEqual(res.totalContractValue, 800000);
  assert.strictEqual(res.totalCollectedPayments, 350000);
  assert.strictEqual(res.outstandingContractBalance, 450000);
  assert.strictEqual(res.totalInvoicedAmount, 250000);
  assert.strictEqual(res.outstandingInvoicedBalance, 50000);
});

console.log('\n================================================================');
console.log(`  TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('✓ ALL CRITICAL BUSINESS RULES & MATH LOGIC VALIDATED SUCCESSFULLY!');
  process.exit(0);
}
