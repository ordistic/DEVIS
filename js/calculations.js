/**
 * Centralized Automatic Calculations Engine for ERP
 * Handles all architectural, measurement, payroll, inventory, and commercial financial models.
 */

const CalculationEngine = {
  // 1. Room Geometric & Painting Calculations
  computeRoomMeasurements(room, doors = [], windows = []) {
    const length = parseFloat(room.length) || 0;
    const width = parseFloat(room.width) || 0;
    const height = parseFloat(room.height) || 0;

    // Floor area and perimeter
    const floorArea = length * width;
    const perimeter = 2 * (length + width);
    const grossWallArea = perimeter * height;
    const ceilingArea = floorArea;

    // Door deductions (safely handles quantity === 0)
    let totalDoorArea = 0;
    doors.forEach(d => {
      const w = parseFloat(d.width) || 0;
      const h = parseFloat(d.height) || 0;
      const qty = (d.quantity !== undefined && d.quantity !== null && !isNaN(parseInt(d.quantity, 10)))
        ? parseInt(d.quantity, 10)
        : 1;
      totalDoorArea += (w * h) * qty;
    });

    // Window deductions (safely handles quantity === 0)
    let totalWindowArea = 0;
    windows.forEach(w => {
      const widthVal = parseFloat(w.width) || 0;
      const heightVal = parseFloat(w.height) || 0;
      const qty = (w.quantity !== undefined && w.quantity !== null && !isNaN(parseInt(w.quantity, 10)))
        ? parseInt(w.quantity, 10)
        : 1;
      totalWindowArea += (widthVal * heightVal) * qty;
    });

    // Net Wall Painting Area (with wall inclusion switch)
    const includeWalls = room.include_walls_paint !== false;
    const includeCeiling = room.include_ceiling_paint !== false;
    const manualAdj = parseFloat(room.manual_paint_adj) || 0;

    let netWallPaintingArea = 0;
    if (includeWalls) {
      netWallPaintingArea = Math.max(0, grossWallArea - totalDoorArea - totalWindowArea);
    }

    const ceilingPaintingArea = includeCeiling ? ceilingArea : 0;
    const totalPaintingArea = Math.max(0, netWallPaintingArea + ceilingPaintingArea + manualAdj);

    return {
      floorArea,
      perimeter,
      grossWallArea,
      ceilingArea,
      totalDoorArea,
      totalWindowArea,
      netWallPaintingArea,
      ceilingPaintingArea,
      manualAdj,
      totalPaintingArea
    };
  },

  // 2. Worker Workday & Payroll Calculations
  computeWorkdayWage(dailyWage, workdayType, customMultiplier = 1.0, commission = 0) {
    const baseWage = parseFloat(dailyWage) || 0;
    const comm = parseFloat(commission) || 0;
    let multiplier = 1.0;

    switch (workdayType) {
      case 'half':
        multiplier = 0.5;
        break;
      case 'normal':
        multiplier = 1.0;
        break;
      case 'one_and_half':
        multiplier = 1.5;
        break;
      case 'double':
        multiplier = 2.0;
        break;
      case 'absent':
        multiplier = 0.0;
        break;
      case 'custom':
        multiplier = (customMultiplier !== undefined && !isNaN(parseFloat(customMultiplier))) 
          ? parseFloat(customMultiplier) 
          : 1.0;
        break;
      default:
        multiplier = 1.0;
    }

    const wageAmount = baseWage * multiplier;
    const totalAmount = wageAmount + comm;
    return { multiplier, wageAmount, commission: comm, amount: totalAmount };
  },

  computeWorkerFinancialSummary(workerId, attendances = [], payments = []) {
    const workerAttendances = attendances.filter(a => String(a.worker_id) === String(workerId));
    const workerPayments = payments.filter(p => String(p.worker_id) === String(workerId));

    let normalDaysCount = 0;
    let oneAndHalfDaysCount = 0;
    let halfDaysCount = 0;
    let doubleDaysCount = 0;
    let absentDaysCount = 0;
    let customDaysCount = 0;
    let totalEffectiveDays = 0;
    let totalEarnedWages = 0;

    workerAttendances.forEach(att => {
      const mult = (att.multiplier !== undefined && !isNaN(parseFloat(att.multiplier)))
        ? parseFloat(att.multiplier)
        : (att.workday_type === 'absent' ? 0.0 : 1.0);

      const calculatedAmt = parseFloat(att.calculated_amount) || 0;
      totalEarnedWages += calculatedAmt;

      if (att.workday_type === 'absent' || mult === 0) {
        absentDaysCount++;
      } else {
        totalEffectiveDays += mult;
        if (att.workday_type === 'one_and_half' || mult === 1.5) oneAndHalfDaysCount++;
        else if (att.workday_type === 'half' || mult === 0.5) halfDaysCount++;
        else if (att.workday_type === 'double' || mult === 2.0) doubleDaysCount++;
        else if (att.workday_type === 'normal' || mult === 1.0) normalDaysCount++;
        else customDaysCount++;
      }
    });

    let totalPaymentsReceived = 0;
    let totalAdvances = 0;

    workerPayments.forEach(pmt => {
      const amount = parseFloat(pmt.amount) || 0;
      totalPaymentsReceived += amount;
      if (pmt.payment_type === 'advance') {
        totalAdvances += amount;
      }
    });

    // Worker Balance = Total Earned Wages - Total Payments
    // Positive balance = Company owes worker
    // Negative balance = Worker took advances exceeding earned wages
    const remainingBalance = totalEarnedWages - totalPaymentsReceived;

    return {
      totalAttendances: workerAttendances.length,
      normalDaysCount,
      oneAndHalfDaysCount,
      halfDaysCount,
      doubleDaysCount,
      absentDaysCount,
      customDaysCount,
      totalEffectiveDays,
      totalEarnedWages,
      totalPaymentsReceived,
      totalAdvances,
      remainingBalance
    };
  },

  // 3. Material Stock & Project Consumption
  computeMaterialInventory(materialId, purchases = [], usages = []) {
    const matPurchases = purchases.filter(p => String(p.material_id) === String(materialId));
    const matUsages = usages.filter(u => String(u.material_id) === String(materialId));

    let totalCompanyPurchasedQty = 0;
    let totalCompanyPurchaseCost = 0;
    let totalCustomerSuppliedQty = 0;

    matPurchases.forEach(p => {
      const qty = parseFloat(p.quantity) || 0;
      const unitPrice = parseFloat(p.unit_price) || 0;
      if (p.material_source === 'customer') {
        totalCustomerSuppliedQty += qty;
      } else {
        totalCompanyPurchasedQty += qty;
        totalCompanyPurchaseCost += (qty * unitPrice);
      }
    });

    let totalConsumedQty = 0;
    let totalCompanyConsumedCost = 0;
    let totalCustomerConsumedQty = 0;

    matUsages.forEach(u => {
      const qty = parseFloat(u.quantity_consumed) || 0;
      const unitCost = parseFloat(u.unit_cost) || 0;
      totalConsumedQty += qty;

      if (u.source === 'customer_supplied') {
        totalCustomerConsumedQty += qty;
      } else {
        totalCompanyConsumedCost += (qty * unitCost);
      }
    });

    const averageCost = totalCompanyPurchasedQty > 0
      ? totalCompanyPurchaseCost / totalCompanyPurchasedQty
      : 0;

    // Track real balances and shortages
    const companyConsumedQty = totalConsumedQty - totalCustomerConsumedQty;
    const companyStockBalance = totalCompanyPurchasedQty - companyConsumedQty;
    const hasShortage = companyStockBalance < 0;
    const shortageQty = companyStockBalance < 0 ? Math.abs(companyStockBalance) : 0;
    const remainingCompanyStockQty = Math.max(0, companyStockBalance);
    const remainingStockValue = remainingCompanyStockQty * averageCost;

    const customerStockBalance = totalCustomerSuppliedQty - totalCustomerConsumedQty;
    const customerShortageQty = customerStockBalance < 0 ? Math.abs(customerStockBalance) : 0;
    const remainingCustomerStockQty = Math.max(0, customerStockBalance);

    return {
      totalCompanyPurchasedQty,
      totalCompanyPurchaseCost,
      totalCustomerSuppliedQty,
      totalConsumedQty,
      companyConsumedQty,
      totalCompanyConsumedCost,
      totalCustomerConsumedQty,
      averageCost,
      companyStockBalance,
      remainingCompanyStockQty,
      remainingStockValue,
      hasShortage,
      shortageQty,
      customerStockBalance,
      customerShortageQty,
      remainingCustomerStockQty
    };
  },

  // 4. Comprehensive Project Financial Engine
  computeProjectFinances(project, attendances = [], materialUsages = [], expenses = [], customerPayments = [], projectActivities = []) {
    const pId = String(project.id);

    // 1. Revenue
    const contractValue = parseFloat(project.contract_value) || 0;
    let plannedLaborRevenue = 0;
    let plannedMaterialRevenue = 0;

    projectActivities.filter(a => String(a.project_id) === pId).forEach(act => {
      const plannedQty = parseFloat(act.planned_qty) || 0;
      const laborP = parseFloat(act.labor_price) || 0;
      const matP = parseFloat(act.material_price) || 0;
      plannedLaborRevenue += (plannedQty * laborP);
      plannedMaterialRevenue += (plannedQty * matP);
    });

    // Customer payments collected
    const prjPayments = customerPayments.filter(p => String(p.project_id) === pId);
    let totalCollectedPayments = 0;
    prjPayments.forEach(p => {
      totalCollectedPayments += parseFloat(p.amount) || 0;
    });

    // Customer Outstanding Balance
    const customerOutstandingBalance = contractValue - totalCollectedPayments;

    // 2. Direct Labor Cost (Worker Wages recorded for this project)
    const prjAttendances = attendances.filter(a => String(a.project_id) === pId);
    let totalLaborCost = 0;
    prjAttendances.forEach(a => {
      totalLaborCost += parseFloat(a.calculated_amount) || 0;
    });

    // 3. Material Costs (Company-Purchased Consumed ONLY)
    const prjUsages = materialUsages.filter(u => String(u.project_id) === pId);
    let companyMaterialCost = 0;
    let customerSuppliedMaterialQty = 0;
    let customerSuppliedReferenceValue = 0;

    prjUsages.forEach(u => {
      const qty = parseFloat(u.quantity_consumed) || 0;
      const unitCost = parseFloat(u.unit_cost) || 0;
      if (u.source === 'customer_supplied') {
        customerSuppliedMaterialQty += qty;
        customerSuppliedReferenceValue += (qty * unitCost); // Informational only!
      } else {
        // Company purchased or stock transferred
        companyMaterialCost += (qty * unitCost);
      }
    });

    // 4. Other Project Expenses (Exclude wages & materials already tracked to prevent double-counting)
    const prjExpenses = expenses.filter(e => String(e.project_id) === pId);
    let otherExpenses = 0;
    prjExpenses.forEach(e => {
      otherExpenses += parseFloat(e.amount) || 0;
    });

    // 5. Total Actual Project Cost = Labor Costs + Company-purchased Material Consumption + Other Project Expenses
    // Crucial rule: Customer-supplied materials are NEVER counted as company expenses!
    const totalActualCost = totalLaborCost + companyMaterialCost + otherExpenses;

    // 6. Profit Calculations
    // Actual Profit = Collected Payments - Total Actual Cost
    const actualProfit = totalCollectedPayments - totalActualCost;

    // Contractual Expected Profit = Contract Value - Total Actual Cost
    const contractualProfit = contractValue - totalActualCost;

    // Gross Margins
    const laborGrossMargin = plannedLaborRevenue > 0 ? (plannedLaborRevenue - totalLaborCost) : 0;
    const materialGrossMargin = plannedMaterialRevenue > 0 ? (plannedMaterialRevenue - companyMaterialCost) : 0;

    const profitMarginPercentage = contractValue > 0
      ? (contractualProfit / contractValue) * 100
      : 0;

    return {
      commercialModel: project.commercial_model || 'hybrid',
      contractValue,
      plannedLaborRevenue,
      plannedMaterialRevenue,
      totalCollectedPayments,
      customerOutstandingBalance,
      totalLaborCost,
      companyMaterialCost,
      customerSuppliedMaterialQty,
      customerSuppliedReferenceValue,
      otherExpenses,
      totalActualCost,
      actualProfit,
      contractualProfit,
      laborGrossMargin,
      materialGrossMargin,
      profitMarginPercentage
    };
  },

  // 5. Verification Suite for the 4 Mandatory Financial Scenarios
  runMandatoryTestScenarios() {
    const results = [];

    // Scenario A — Labor Only
    // Contract: 150,000 DA, Worker wages: 75,000 DA, Other expenses: 5,000 DA, Customer supplies all materials.
    // Expected profit: 70,000 DA.
    const scenarioA_project = { id: 'TEST_A', contract_value: 150000, commercial_model: 'labor_only' };
    const scenarioA_attendances = [{ project_id: 'TEST_A', calculated_amount: 75000 }];
    const scenarioA_materials = [{ project_id: 'TEST_A', source: 'customer_supplied', quantity_consumed: 10, unit_cost: 2000 }]; // 20,000 DA customer supplied
    const scenarioA_expenses = [{ project_id: 'TEST_A', amount: 5000 }];
    const scenarioA_payments = [{ project_id: 'TEST_A', amount: 150000 }];

    const resA = this.computeProjectFinances(scenarioA_project, scenarioA_attendances, scenarioA_materials, scenarioA_expenses, scenarioA_payments, []);
    const passA = Math.abs(resA.contractualProfit - 70000) < 0.01 && resA.companyMaterialCost === 0;
    results.push({
      scenario: 'Scenario A: Labor Only (أشغال اليد فقط)',
      contractValue: 150000,
      costs: { wages: 75000, materialCost: 0, expenses: 5000 },
      expectedProfit: 70000,
      actualProfit: resA.contractualProfit,
      passed: passA,
      explanation: 'المواد موردة من الزبون، لذا تكلفة المواد على الشركة = 0 دج، والربح الفعلي = 70,000 دج تماماً.'
    });

    // Scenario B — Labor + Materials
    // Contract labor: 150,000 DA, Contract materials: 100,000 DA (Total contract 250,000 DA)
    // Worker wages: 75,000 DA, Consumed material cost: 65,000 DA, Other expenses: 5,000 DA.
    // Expected profit: 105,000 DA.
    const scenarioB_project = { id: 'TEST_B', contract_value: 250000, commercial_model: 'labor_materials' };
    const scenarioB_attendances = [{ project_id: 'TEST_B', calculated_amount: 75000 }];
    const scenarioB_materials = [{ project_id: 'TEST_B', source: 'company_purchase', quantity_consumed: 1, unit_cost: 65000 }];
    const scenarioB_expenses = [{ project_id: 'TEST_B', amount: 5000 }];
    const scenarioB_payments = [{ project_id: 'TEST_B', amount: 250000 }];

    const resB = this.computeProjectFinances(scenarioB_project, scenarioB_attendances, scenarioB_materials, scenarioB_expenses, scenarioB_payments, []);
    const passB = Math.abs(resB.contractualProfit - 105000) < 0.01;
    results.push({
      scenario: 'Scenario B: Labor + Materials (توريد وتركيب)',
      contractValue: 250000,
      costs: { wages: 75000, materialCost: 65000, expenses: 5000 },
      expectedProfit: 105000,
      actualProfit: resB.contractualProfit,
      passed: passB,
      explanation: 'إجمالي التكاليف = 75,000 + 65,000 + 5,000 = 145,000 دج. الربح = 250,000 - 145,000 = 105,000 دج.'
    });

    // Scenario C — Hybrid Project
    // Labor revenue: 150,000 DA, Material revenue: 50,000 DA (Total 200,000 DA)
    // Worker wages: 75,000 DA, Company material consumption: 30,000 DA.
    // Customer-supplied materials: 20,000 DA reference value. Other expenses: 5,000 DA.
    // Expected profit: 90,000 DA.
    const scenarioC_project = { id: 'TEST_C', contract_value: 200000, commercial_model: 'hybrid' };
    const scenarioC_attendances = [{ project_id: 'TEST_C', calculated_amount: 75000 }];
    const scenarioC_materials = [
      { project_id: 'TEST_C', source: 'company_purchase', quantity_consumed: 1, unit_cost: 30000 },
      { project_id: 'TEST_C', source: 'customer_supplied', quantity_consumed: 1, unit_cost: 20000 }
    ];
    const scenarioC_expenses = [{ project_id: 'TEST_C', amount: 5000 }];
    const scenarioC_payments = [{ project_id: 'TEST_C', amount: 200000 }];

    const resC = this.computeProjectFinances(scenarioC_project, scenarioC_attendances, scenarioC_materials, scenarioC_expenses, scenarioC_payments, []);
    const passC = Math.abs(resC.contractualProfit - 90000) < 0.01 && resC.companyMaterialCost === 30000;
    results.push({
      scenario: 'Scenario C: Hybrid Project (مشروع هجين)',
      contractValue: 200000,
      costs: { wages: 75000, materialCost: 30000, expenses: 5000, customerRef: 20000 },
      expectedProfit: 90000,
      actualProfit: resC.contractualProfit,
      passed: passC,
      explanation: 'مواد الزبون (20,000 دج) لم تُخصم من أرباح الشركة. تكاليف الشركة الفعلية = 110,000 دج. الربح = 90,000 دج.'
    });

    // Scenario D — Partial Material Consumption
    // Company purchases 10 units at 2,000 DA each = 20,000 DA.
    // Only 7 units are consumed. Remaining 3 units are retained in stock.
    // Expected: Total purchase = 20,000 DA, Project consumption cost = 14,000 DA, Remaining inventory = 6,000 DA.
    const matPurchasesD = [{ material_id: 'MAT_D', material_source: 'company', quantity: 10, unit_price: 2000 }];
    const matUsagesD = [{ material_id: 'MAT_D', source: 'company_purchase', quantity_consumed: 7, unit_cost: 2000 }];

    const resD = this.computeMaterialInventory('MAT_D', matPurchasesD, matUsagesD);
    const passD = resD.totalCompanyPurchaseCost === 20000 &&
      resD.totalCompanyConsumedCost === 14000 &&
      resD.remainingStockValue === 6000 &&
      resD.remainingCompanyStockQty === 3;

    results.push({
      scenario: 'Scenario D: Partial Material Consumption (الاستهلاك الجزئي للمواد والمخزون)',
      totalPurchaseCost: 20000,
      consumedCost: resD.totalCompanyConsumedCost,
      expectedConsumed: 14000,
      remainingStockValue: resD.remainingStockValue,
      expectedStockValue: 6000,
      remainingUnits: resD.remainingCompanyStockQty,
      passed: passD,
      explanation: 'تم شراء 10 وحدات بـ 20,000 دج، استهلك المشروع 7 وحدات (14,000 دج)، وبقي 3 وحدات بالمخزون بقيمة 6,000 دج.'
    });

    return results;
  },

  // 6. Unified Company Finances and Two-Partner Profit Sharing Engine
  computeUnifiedCompanyFinancesAndProfitSharing(
    customerPayments = [],
    expenses = [],
    materialPurchases = [],
    workerPayments = [],
    withdrawals = [],
    shareConfig = { partner1Share: 50, partner2Share: 50 },
    attendances = []
  ) {
    // Preserve 0% equity accurately
    const p1Share = (shareConfig && shareConfig.partner1Share !== undefined && !isNaN(parseFloat(shareConfig.partner1Share)))
      ? parseFloat(shareConfig.partner1Share)
      : 50;
    const p2Share = (shareConfig && shareConfig.partner2Share !== undefined && !isNaN(parseFloat(shareConfig.partner2Share)))
      ? parseFloat(shareConfig.partner2Share)
      : (100 - p1Share);

    let totalCollected = 0;
    let p1Collected = 0;
    let p2Collected = 0;
    let p1OpsCount = 0;
    let p2OpsCount = 0;

    // Inflows: Customer payments
    customerPayments.forEach(p => {
      const amt = parseFloat(p.amount) || 0;
      totalCollected += amt;
      if (p.partner_id === 'USR-002') {
        p2OpsCount++;
        p2Collected += amt;
      } else {
        p1OpsCount++;
        p1Collected += amt;
      }
    });

    // Outflow: Expenses
    let totalExpenses = 0;
    let p1Expenses = 0;
    let p2Expenses = 0;
    expenses.forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      totalExpenses += amt;
      if (e.partner_id === 'USR-002') {
        p2OpsCount++;
        p2Expenses += amt;
      } else {
        p1OpsCount++;
        p1Expenses += amt;
      }
    });

    // Outflow: Material Purchases (Company only, exclude customer supplied)
    let totalMaterialCost = 0;
    let p1Materials = 0;
    let p2Materials = 0;
    materialPurchases.forEach(m => {
      if (m.material_source === 'customer') return;
      const amt = parseFloat(m.total_cost || m.amount) || 0;
      totalMaterialCost += amt;
      if (m.partner_id === 'USR-002') {
        p2OpsCount++;
        p2Materials += amt;
      } else {
        p1OpsCount++;
        p1Materials += amt;
      }
    });

    // Outflow: Worker payments / advances
    let totalWorkerWagesPaid = 0;
    let p1WorkerPaid = 0;
    let p2WorkerPaid = 0;
    workerPayments.forEach(w => {
      const amt = parseFloat(w.amount) || 0;
      totalWorkerWagesPaid += amt;
      if (w.partner_id === 'USR-002') {
        p2OpsCount++;
        p2WorkerPaid += amt;
      } else {
        p1OpsCount++;
        p1WorkerPaid += amt;
      }
    });

    // Partner Withdrawals (dividends taken from profits)
    let totalWithdrawals = 0;
    let withdrawalsP1 = 0;
    let withdrawalsP2 = 0;
    withdrawals.forEach(w => {
      const amt = parseFloat(w.amount) || 0;
      totalWithdrawals += amt;
      if (w.partner_id === 'USR-002') {
        withdrawalsP2 += amt;
        p2OpsCount++;
      } else {
        withdrawalsP1 += amt;
        p1OpsCount++;
      }
    });

    // Unified Wallet: Cash physically in the company safe/wallet
    // = Inflows - (Expenses + Materials + Worker Wages + Withdrawals)
    const totalOutflows = totalExpenses + totalMaterialCost + totalWorkerWagesPaid + totalWithdrawals;
    const totalCashInWallet = totalCollected - totalOutflows;

    // Direct project costs paid
    const totalDirectCosts = totalExpenses + totalMaterialCost + totalWorkerWagesPaid;

    // Company Net Profit (before dividends/withdrawals)
    const netProfit = totalCollected - totalDirectCosts;

    // Accrued unpaid labor: wages earned by workers via attendance minus wages actually paid out
    let totalEarnedLabor = 0;
    if (Array.isArray(attendances)) {
      attendances.forEach(a => {
        totalEarnedLabor += parseFloat(a.calculated_amount) || 0;
      });
    }
    const accruedUnpaidLabor = Math.max(0, totalEarnedLabor - totalWorkerWagesPaid);

    // Entitled profit based on share ratio (e.g. 50% / 50% or custom)
    const p1EntitledProfit = netProfit * (p1Share / 100);
    const p2EntitledProfit = netProfit * (p2Share / 100);

    // Remaining unpaid dividends to be claimed
    const p1RemainingShare = p1EntitledProfit - withdrawalsP1;
    const p2RemainingShare = p2EntitledProfit - withdrawalsP2;

    const p1TotalSpent = p1Expenses + p1Materials + p1WorkerPaid;
    const p2TotalSpent = p2Expenses + p2Materials + p2WorkerPaid;

    return {
      share1Pct: p1Share,
      share2Pct: p2Share,
      totalCashInWallet,
      totalCollected,
      totalExpenses,
      totalMaterialCost,
      totalWorkerWagesPaid,
      totalWithdrawals,
      netProfit,
      accruedUnpaidLabor,
      p1OpsCount,
      p1Collected,
      p1TotalSpent,
      p1EntitledProfit,
      withdrawalsP1,
      p1RemainingShare,
      p2OpsCount,
      p2Collected,
      p2TotalSpent,
      p2EntitledProfit,
      withdrawalsP2,
      p2RemainingShare
    };
  },

  // 7. Customer Financial Account Ledger
  computeCustomerFinancialSummary(customerId, projects = [], customerPayments = [], invoices = []) {
    const cId = String(customerId);
    const custProjects = projects.filter(p => String(p.customer_id) === cId);
    const custPayments = customerPayments.filter(p => {
      // Direct customer payment or linked through one of the customer's projects
      if (p.customer_id && String(p.customer_id) === cId) return true;
      return custProjects.some(prj => String(prj.id) === String(p.project_id));
    });
    const custInvoices = invoices.filter(inv => {
      if (inv.customer_id && String(inv.customer_id) === cId) return true;
      return custProjects.some(prj => String(prj.id) === String(inv.project_id));
    });

    let totalContractValue = 0;
    custProjects.forEach(p => {
      totalContractValue += parseFloat(p.contract_value) || 0;
    });

    let totalInvoicedAmount = 0;
    let totalInvoicedPaid = 0;
    custInvoices.forEach(inv => {
      totalInvoicedAmount += parseFloat(inv.total_amount) || 0;
      totalInvoicedPaid += parseFloat(inv.paid_amount) || 0;
    });

    let totalCollectedPayments = 0;
    custPayments.forEach(p => {
      totalCollectedPayments += parseFloat(p.amount) || 0;
    });

    // Outstanding balance based on contracts
    const outstandingContractBalance = totalContractValue - totalCollectedPayments;
    // Outstanding balance based on issued invoices
    const outstandingInvoicedBalance = totalInvoicedAmount - totalInvoicedPaid;

    return {
      projectsCount: custProjects.length,
      invoicesCount: custInvoices.length,
      paymentsCount: custPayments.length,
      totalContractValue,
      totalInvoicedAmount,
      totalInvoicedPaid,
      totalCollectedPayments,
      outstandingContractBalance,
      outstandingInvoicedBalance
    };
  },

  // Backward-compatible alias
  computePartnerWalletSummary(customerPayments, expenses, materialPurchases, workerPayments, withdrawals, shareConfig) {
    return this.computeUnifiedCompanyFinancesAndProfitSharing(customerPayments, expenses, materialPurchases, workerPayments, withdrawals, shareConfig);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CalculationEngine;
}
