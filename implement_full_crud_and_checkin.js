/**
 * DARI LUXE ERP — Full CRUD & Workday 1.5 + Commission Enhancements
 * 1. Adds workday 1.5 (يوم ونصف) & Commission/Prime (عمولة) in checkin & calculations
 * 2. Connects all delete & add CRUD methods across all modules
 */
const fs = require('fs');
const path = require('path');

const ERP = path.join(__dirname, 'erp');
console.log('=== Implementing Workday 1.5, Commission & Full CRUD ===');

// ============================================================
// 1. UPDATE calculations.js
// ============================================================
const calcPath = path.join(ERP, 'js', 'calculations.js');
let calcCode = fs.readFileSync(calcPath, 'utf8');

// Update computeWorkdayWage to handle one_and_half (1.5) and commission
const oldWageCalc = "  computeWorkdayWage(dailyWage, workdayType, customMultiplier = 1.0) {";
const newWageCalc = `  computeWorkdayWage(dailyWage, workdayType, customMultiplier = 1.0, commission = 0) {
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
        multiplier = parseFloat(customMultiplier) || 1.0;
        break;
      default:
        multiplier = 1.0;
    }

    const wageAmount = baseWage * multiplier;
    const totalAmount = wageAmount + comm;
    return { multiplier, wageAmount, commission: comm, amount: totalAmount };
  },`;

if (calcCode.includes(oldWageCalc)) {
  const sIdx = calcCode.indexOf(oldWageCalc);
  const eIdx = calcCode.indexOf("  computeWorkerFinancialSummary", sIdx);
  if (sIdx !== -1 && eIdx !== -1) {
    calcCode = calcCode.substring(0, sIdx) + newWageCalc + '\n\n' + calcCode.substring(eIdx);
    console.log('✓ calculations.js: Updated computeWorkdayWage with 1.5 & commission');
  }
}

// In computeWorkerFinancialSummary, track one_and_half and commissions
calcCode = calcCode.replace(
  "    let normalDaysCount = 0;",
  "    let normalDaysCount = 0;\n    let oneAndHalfDaysCount = 0;"
);
calcCode = calcCode.replace(
  "      if (att.workday_type === 'half' || mult === 0.5) halfDaysCount++;",
  "      if (att.workday_type === 'one_and_half' || mult === 1.5) oneAndHalfDaysCount++;\n      else if (att.workday_type === 'half' || mult === 0.5) halfDaysCount++;"
);

fs.writeFileSync(calcPath, calcCode, 'utf8');

// ============================================================
// 2. UPDATE daily_checkin.js
// ============================================================
const checkinPath = path.join(ERP, 'js', 'daily_checkin.js');
let checkinCode = fs.readFileSync(checkinPath, 'utf8');

// In initDateState: read commission
checkinCode = checkinCode.replace(
  "advance_given: existingAdv ? parseFloat(existingAdv.amount) || 0 : 0,",
  "advance_given: existingAdv ? parseFloat(existingAdv.amount) || 0 : 0,\n          commission: parseFloat(existingAtt.commission) || 0,"
);
checkinCode = checkinCode.replace(
  "advance_given: 0,\n          work_description: 'أشغال ورشة عادية'",
  "advance_given: 0,\n          commission: 0,\n          work_description: 'أشغال ورشة عادية'"
);
checkinCode = checkinCode.replace(
  "advance_given: 0,\n                    work_description: ''",
  "advance_given: 0,\n                    commission: 0,\n                    work_description: ''"
);

// In metrics counters at top: add countOneAndHalf and totalCommissionsToday
checkinCode = checkinCode.replace(
  "    let countFull = 0, countHalf = 0, countDouble = 0, countAbsent = 0;",
  "    let countFull = 0, countOneAndHalf = 0, countHalf = 0, countDouble = 0, countAbsent = 0, totalCommissionsToday = 0;"
);
checkinCode = checkinCode.replace(
  "      totalAdvancesToday += parseFloat(st.advance_given) || 0;",
  "      totalAdvancesToday += parseFloat(st.advance_given) || 0;\n      totalCommissionsToday += parseFloat(st.commission) || 0;"
);
checkinCode = checkinCode.replace(
  "      if (st.workday_type === 'absent' || st.multiplier === 0) countAbsent++;",
  "      if (st.workday_type === 'absent' || st.multiplier === 0) countAbsent++;\n      else if (st.workday_type === 'one_and_half' || st.multiplier === 1.5) countOneAndHalf++;"
);

// Update table header in renderView: Add "عمولة / منحة (+ دج)" column
checkinCode = checkinCode.replace(
  '<th class="py-3 px-3 text-center">أجر اليوم</th>\n                  <th class="py-3 px-3 text-center font-bold text-amber-400">المستحق اليوم</th>',
  '<th class="py-3 px-3 text-center">أجر اليوم</th>\n                  <th class="py-3 px-2 text-center font-bold text-emerald-400">عمولة / منحة (+ دج)</th>\n                  <th class="py-3 px-3 text-center font-bold text-amber-400">المستحق اليوم</th>'
);

// Update row HTML in renderView: add 1.5 button and commission input
const oldRowButtons = `<button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'normal')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'normal' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
                            حاضر (1.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'half')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'half' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
                            نصف (0.5)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'double')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'double' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
                            مضاعف (2.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'absent')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'absent' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}">
                            غائب (0)
                          </button>`;

const newRowButtons = `<button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'normal')" class="px-2 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'normal' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يوم كامل">
                            يوم (1.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'one_and_half')" class="px-2 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'one_and_half' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يوم ونصف">
                            يوم ونصف (1.5)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'double')" class="px-2 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'double' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يومان مضاعف">
                            يومان (2.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'half')" class="px-2 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'half' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="نصف يوم">
                            نصف (0.5)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('\${w.id}', 'absent')" class="px-2 py-1 rounded-lg text-xs font-bold transition \${item.workday_type === 'absent' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="غائب">
                            غائب (0)
                          </button>`;

checkinCode = checkinCode.replace(oldRowButtons, newRowButtons);

// Add commission input cell before Calculated Amount cell
const oldAmountCell = `<!-- Calculated Amount for Today -->
                      <td class="py-3 px-3 text-center font-black text-sm \${item.calculated_amount > 0 ? 'text-blue-400' : 'text-slate-500'}">
                        \${App.formatCurrency(item.calculated_amount)}
                      </td>`;

const newAmountAndCommissionCells = `<!-- Commission / Bonus Input -->
                      <td class="py-3 px-2 text-center">
                        <input type="number" step="500" min="0" value="\${item.commission || ''}" placeholder="+0 دج" onchange="DailyCheckin.updateWorkerCommission('\${w.id}', parseFloat(this.value) || 0)" class="w-24 bg-slate-900 border border-emerald-500/40 rounded-lg p-1.5 text-center font-bold text-emerald-400 text-xs focus:ring-1 focus:ring-emerald-500" title="عمولة إضافية أو مكافأة إنتاجية للعامل">
                      </td>

                      <!-- Calculated Amount for Today -->
                      <td class="py-3 px-3 text-center font-black text-sm \${item.calculated_amount > 0 ? 'text-blue-400' : 'text-slate-500'}">
                        \${App.formatCurrency(item.calculated_amount)}
                      </td>`;

checkinCode = checkinCode.replace(oldAmountCell, newAmountAndCommissionCells);

// Update setWorkerStatus to handle one_and_half and commission
const oldSetStatus = `  setWorkerStatus(workerId, type) {
    if (!this.state[workerId]) return;
    const baseWage = this.state[workerId].daily_wage || 0;
    let multiplier = 1.0;

    if (type === 'half') multiplier = 0.5;
    else if (type === 'double') multiplier = 2.0;
    else if (type === 'absent') multiplier = 0;
    else multiplier = 1.0;

    this.state[workerId].workday_type = type;
    this.state[workerId].multiplier = multiplier;
    this.state[workerId].calculated_amount = baseWage * multiplier;

    this.renderView(document.getElementById('main-content-view'));
  },`;

const newSetStatus = `  setWorkerStatus(workerId, type) {
    if (!this.state[workerId]) return;
    const baseWage = parseFloat(this.state[workerId].daily_wage) || 0;
    const comm = parseFloat(this.state[workerId].commission) || 0;
    let multiplier = 1.0;

    if (type === 'half') multiplier = 0.5;
    else if (type === 'one_and_half') multiplier = 1.5;
    else if (type === 'double') multiplier = 2.0;
    else if (type === 'absent') multiplier = 0;
    else multiplier = 1.0;

    this.state[workerId].workday_type = type;
    this.state[workerId].multiplier = multiplier;
    this.state[workerId].calculated_amount = (baseWage * multiplier) + comm;

    this.renderView(document.getElementById('main-content-view'));
  },

  updateWorkerCommission(workerId, commVal) {
    if (!this.state[workerId]) return;
    const comm = Math.max(0, parseFloat(commVal) || 0);
    this.state[workerId].commission = comm;
    const baseWage = parseFloat(this.state[workerId].daily_wage) || 0;
    const mult = parseFloat(this.state[workerId].multiplier) || 1.0;
    this.state[workerId].calculated_amount = (baseWage * mult) + comm;

    this.renderView(document.getElementById('main-content-view'));
  },`;

checkinCode = checkinCode.replace(oldSetStatus, newSetStatus);

// In recordDailyCheckin in db.js: store commission
fs.writeFileSync(checkinPath, checkinCode, 'utf8');
console.log('✓ daily_checkin.js: Added 1.5 workday & Commission/Bonus handling');

// ============================================================
// 3. UPDATE db.js recordDailyCheckin
// ============================================================
const dbPath = path.join(ERP, 'js', 'db.js');
let dbCode = fs.readFileSync(dbPath, 'utf8');

dbCode = dbCode.replace(
  "const dailyWage = parseFloat(item.daily_wage) || 0;\n      const amount = parseFloat(item.calculated_amount) || 0;",
  "const dailyWage = parseFloat(item.daily_wage) || 0;\n      const commission = parseFloat(item.commission) || 0;\n      const amount = parseFloat(item.calculated_amount) || 0;"
);

dbCode = dbCode.replace(
  "daily_wage: dailyWage,\n          calculated_amount: amount,",
  "daily_wage: dailyWage,\n          commission: commission,\n          calculated_amount: amount,"
);

fs.writeFileSync(dbPath, dbCode, 'utf8');
console.log('✓ db.js: Storing commission in worker_attendance records');

// ============================================================
// 4. ADD COMPLETE CRUD (Add, Edit, Delete) IN app.js
// ============================================================
const appPath = path.join(ERP, 'js', 'app.js');
let appCode = fs.readFileSync(appPath, 'utf8');

const fullCrudMethods = `
  // ============================================================
  // FULL CRUD ENGINE (ADD, EDIT, DELETE) ACROSS ALL MODULES
  // ============================================================

  // 1. Projects CRUD
  async deleteProject(projectId) {
    const proj = await DB.getById('projects', projectId);
    const pName = proj ? proj.name : projectId;
    if (!confirm(\`هل أنت متأكد من حذف المشروع بالكامل:\\n"\${pName}"؟\\nسيتم حذف جميع الطوابق، الغرف، الأنشطة، والمصاريف المرتبطة به.\`)) {
      return;
    }
    await DB.delete('projects', projectId);
    alert('✓ تم حذف المشروع وكافة ملحقاته بنجاح!');
    this.playClickSound();
    if (this.activeProjectId === projectId) this.activeProjectId = null;
    await this.renderCurrentView();
  },

  async editProject(projectId) {
    const proj = await DB.getById('projects', projectId);
    if (!proj) return;

    const newName = prompt('تعديل اسم المشروع:', proj.name);
    if (!newName) return;
    const newClient = prompt('اسم الزبون:', proj.client_name || '');
    const newBudget = parseFloat(prompt('الميزانية التقديرية (دج DZD):', proj.initial_budget || proj.contract_value || 0)) || proj.contract_value;
    const newStatus = prompt('حالة المشروع (planning, quotation_pending, approved, in_progress, completed, on_hold, cancelled):', proj.status || 'in_progress');

    await DB.update('projects', projectId, {
      name: newName.trim(),
      client_name: (newClient || proj.client_name).trim(),
      contract_value: newBudget,
      initial_budget: newBudget,
      status: newStatus || proj.status
    });

    alert('✓ تم تحديث بيانات المشروع بنجاح!');
    await this.renderCurrentView();
  },

  // 2. Building Structure (Floors & Rooms) CRUD
  async deleteFloor(floorId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطابق وجميع الغرف والأجهزة الموجودة بداخله؟')) return;
    await DB.delete('project_floors', floorId);
    alert('✓ تم حذف الطابق وغرفه بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteRoom(roomId) {
    if (!confirm('هل أنت متأكد من حذف هذه الغرفة وجميع القياسات والفتحات والأجهزة التابعة لها؟')) return;
    await DB.delete('project_rooms', roomId);
    alert('✓ تم حذف الغرفة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  // 3. Workers CRUD
  async openNewWorkerModal() {
    const name = prompt('اسم العامل بالكامل:');
    if (!name) return;
    const specialty = prompt('التخصص (بلاكيست BA13، كهربائي وإنارة، صباغ، سباك، عامل متعدد):', 'بلاكيست (Plaquiste BA13)');
    const wage = parseFloat(prompt('الأجر اليومي الأساسي (دج DZD):', '3500')) || 3000;
    const phone = prompt('رقم الهاتف:', '0550 00 00 00') || '';

    const newWorker = await DB.add('workers', {
      worker_code: 'W-' + Date.now().toString().slice(-4),
      full_name: name.trim(),
      phone: phone.trim(),
      specialty: specialty.trim(),
      daily_wage: wage,
      overtime_rate: Math.round(wage / 8),
      employment_date: new Date().toISOString().split('T')[0],
      status: 'active'
    });

    alert(\`✓ تم إضافة العامل "\${name}" بنجاح بالأجر اليومي \${wage.toLocaleString('fr-FR')} دج!\`);
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    const wName = w ? w.full_name : workerId;
    if (!confirm(\`هل أنت متأكد من حذف العامل "\${wName}" من سجل العمال؟\`)) return;
    await DB.delete('workers', workerId);
    alert('✓ تم حذف العامل بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  async editWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    if (!w) return;
    const newName = prompt('اسم العامل:', w.full_name);
    if (!newName) return;
    const newSpec = prompt('التخصص:', w.specialty);
    const newWage = parseFloat(prompt('الأجر اليومي (دج DZD):', w.daily_wage)) || w.daily_wage;
    const newPhone = prompt('رقم الهاتف:', w.phone || '');

    await DB.update('workers', workerId, {
      full_name: newName.trim(),
      specialty: (newSpec || w.specialty).trim(),
      daily_wage: newWage,
      phone: newPhone.trim()
    });

    alert('✓ تم تحديث بيانات العامل بنجاح!');
    await this.renderCurrentView();
  },

  // 4. Materials CRUD
  async openNewMaterialModal() {
    const name = prompt('اسم المادة أو العتاد:');
    if (!name) return;
    const category = prompt('الفئة (plasterboard, electrical, painting, plumbing, general):', 'plasterboard');
    const unit = prompt('الوحدة (piece, m2, m, kg, sac, litre):', 'piece');
    const buyPrice = parseFloat(prompt('سعر الشراء الافتراضي (دج DZD):', '1000')) || 0;
    const sellPrice = parseFloat(prompt('سعر البيع/التركيب الافتراضي (دج DZD):', '1400')) || buyPrice;

    await DB.add('materials', {
      name: name.trim(),
      category: category.trim(),
      unit: unit.trim(),
      default_purchase_price: buyPrice,
      default_selling_price: sellPrice,
      sku: 'MAT-' + Date.now().toString().slice(-4)
    });

    alert(\`✓ تم إضافة المادة "\${name}" إلى دليل المواد بنجاح!\`);
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteMaterial(materialId) {
    const m = await DB.getById('materials', materialId);
    const mName = m ? m.name : materialId;
    if (!confirm(\`هل أنت متأكد من حذف المادة "\${mName}" من الكتالوج؟\`)) return;
    await DB.delete('materials', materialId);
    alert('✓ تم حذف المادة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteMaterialPurchase(purchaseId) {
    if (!confirm('هل أنت متأكد من إلغاء وحذف حركة شراء المادة هذه؟')) return;
    await DB.delete('material_purchases', purchaseId);
    alert('✓ تم حذف حركة الشراء بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  // 5. Expenses CRUD
  async deleteExpense(expenseId) {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    await DB.delete('expenses', expenseId);
    alert('✓ تم حذف المصروف بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  // 6. Customer Payments CRUD
  async deleteCustomerPayment(paymentId) {
    if (!confirm('هل أنت متأكد من حذف سند الدفعة المالية هذه؟')) return;
    await DB.delete('customer_payments', paymentId);
    alert('✓ تم حذف سند الدفعة وتحديث رصيد الصندوق بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  // 7. Quotations & Invoices CRUD
  async deleteQuotation(quotationId) {
    if (!confirm('هل أنت متأكد من حذف هذا الكشف التقديري (Devis)؟')) return;
    await DB.delete('quotations', quotationId);
    alert('✓ تم حذف الكشف التقديري بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteInvoice(invoiceId) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة (Facture)؟')) return;
    await DB.delete('invoices', invoiceId);
    alert('✓ تم حذف الفاتورة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  // 8. Catalog Activities CRUD
  async deleteCatalogActivity(activityId) {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط من الكتالوج المرجعي؟')) return;
    await DB.delete('activity_catalog', activityId);
    alert('✓ تم حذف النشاط من الكتالوج!');
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteProjectActivity(activityId) {
    if (!confirm('هل أنت متأكد من حذف هذا النشاط من الورشة؟')) return;
    await DB.delete('project_activities', activityId);
    alert('✓ تم حذف النشاط من الورشة!');
    this.playClickSound();
    await this.renderCurrentView();
  },
`;

if (!appCode.includes('deleteProject(projectId)')) {
  // Inject right after getActivePartner()
  appCode = appCode.replace('  async getActivePartner() {', fullCrudMethods + '\n  async getActivePartner() {');
  console.log('✓ app.js: Injected all CRUD methods (add & delete for all parts)');
}

// Ensure action buttons in Cockpit tables have delete and edit actions
// In Projects table:
appCode = appCode.replace(
  '<button onclick="App.openProjectWorkspace(\'${p.id}\')" class="btn-action-open"><span>👁</span><span>Ouvrir</span></button>',
  `<div class="inline-flex items-center gap-1">
    <button onclick="App.openProjectWorkspace('\${p.id}')" class="btn-action-open" title="فتح الورشة"><span>👁</span><span>Ouvrir</span></button>
    <button onclick="App.editProject('\${p.id}')" class="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs transition" title="تعديل المشروع">✏️</button>
    <button onclick="App.deleteProject('\${p.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition" title="حذف المشروع">🗑️</button>
  </div>`
);

// In Workers table:
appCode = appCode.replace(
  '<button onclick="App.editWorker(\'${w.id}\')" class="btn-action-open"><span>✏️</span><span>Modifier</span></button>',
  `<div class="inline-flex items-center gap-1">
    <button onclick="App.editWorker('\${w.id}')" class="btn-action-open" title="تعديل"><span>✏️</span><span>Modifier</span></button>
    <button onclick="App.openRecordWorkerPaymentModal('\${w.id}')" class="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs transition" title="تسليم دفعة/تسبيق">💰</button>
    <button onclick="App.deleteWorker('\${w.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition" title="حذف العامل">🗑️</button>
  </div>`
);

// In Expenses table:
appCode = appCode.replace(
  '<button onclick="App.editExpense(\'${e.id}\')" class="btn-action-open"><span>👁</span><span>Détail</span></button>',
  `<div class="inline-flex items-center gap-1">
    <button onclick="App.deleteExpense('\${e.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition" title="حذف المصروف">🗑️</button>
  </div>`
);

// In Quotations/Invoices table:
appCode = appCode.replace(
  '<button onclick="App.printQuotation(\'${q.id}\')" class="btn-action-open"><span>🖨️</span><span>Imprimer</span></button>',
  `<div class="inline-flex items-center gap-1">
    <button onclick="App.printQuotation('\${q.id}')" class="btn-action-open" title="طباعة الكشف التقديري"><span>🖨️</span><span>Imprimer</span></button>
    <button onclick="App.deleteQuotation('\${q.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition" title="حذف الكشف التقديري">🗑️</button>
  </div>`
);

// In Materials View header: connect the add button to openNewMaterialModal
appCode = appCode.replace(
  'onclick="App.openAddMaterialModal()"',
  'onclick="App.openNewMaterialModal()"'
);

fs.writeFileSync(appPath, appCode, 'utf8');

// Also sync all to public/
const PUB = path.join(ERP, 'public');
fs.copyFileSync(appPath, path.join(PUB, 'js', 'app.js'));
fs.copyFileSync(checkinPath, path.join(PUB, 'js', 'daily_checkin.js'));
fs.copyFileSync(calcPath, path.join(PUB, 'js', 'calculations.js'));
fs.copyFileSync(dbPath, path.join(PUB, 'js', 'db.js'));

console.log('✓ All files updated and synced to public/!');
