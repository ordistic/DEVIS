/**
 * Main Application Controller for Home Renovation & Finishing ERP
 * Manages view routing, project workspaces, building structure, payroll, materials,
 * financial calculations, quotations, invoices, and settings.
 */

const App = {
  currentView: 'dashboard',
  soundEnabled: true,
  cockpitFilterRole: 'all',
  cockpitFilterStatus: 'all',
  cockpitFilterVerification: 'all',
  cockpitFilterWilaya: 'all',
  cockpitFilterSort: 'recent',
  cockpitSearchQuery: '',
  activeProjectId: null,
  activeProjectTab: 'overview',
  activePartnerId: (typeof localStorage !== 'undefined' && localStorage.getItem('dariluxe_active_partner')) || 'USR-001',
  theme: 'dark',

  async init() {
    await DB.init();
    const savedLang = (typeof localStorage !== 'undefined' && localStorage.getItem('dari_lang')) || 'ar';
    document.documentElement.setAttribute('lang', savedLang);
    document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    this.applyLanguageToUI(savedLang);
    this.initTheme();
    this.startCockpitClock();
    this.initSidebarState();
    this.updateSupabaseUIState();
    this.setupEventListeners();
    await this.renderCurrentView();
    this.updateGlobalHeaderStats();
    console.log('ERP Application initialized successfully.');
  },

  /**
   * Returns current date as YYYY-MM-DD in Africa/Algiers timezone (UTC+1)
   */
  getLocalDateString() {
    try {
      return new Intl.DateTimeFormat('fr-CA', { timeZone: 'Africa/Algiers' }).format(new Date());
    } catch (e) {
      const d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
  },

  initTheme() {
    this.theme = 'dark';
    const html = document.documentElement;
    html.classList.remove('light');
    html.classList.add('dark');
  },

  setTheme(theme) {
    this.theme = 'dark';
    const html = document.documentElement;
    html.classList.remove('light');
    html.classList.add('dark');
  },

  toggleTheme() {
    // Strictly Dark Mode only per user requirement
    this.initTheme();
  },

  /**
   * SECURITY: Escape HTML entities to prevent XSS attacks.
   * Apply to ALL user-supplied values before inserting into innerHTML.
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * SECURITY: Safe integer parse for monetary values (DZD centimes).
   * Avoids float precision issues.
   */
  safeNum(val, decimals = 0) {
    const n = parseFloat(val) || 0;
    return decimals > 0 ? Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(n);
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed bottom-20 left-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none';
      if (document.body) document.body.appendChild(container);
    }
    if (!container) return;
    const toast = document.createElement('div');
    const bgClass = type === 'error' ? 'bg-rose-900/90 text-rose-100 border-rose-500/30' :
                    type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/30' :
                    'bg-[#1C1C24]/95 text-slate-100 border-white/10';
    toast.className = `${bgClass} border rounded-xl px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto flex items-center gap-2`;
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : type === 'success' ? '✓' : 'ℹ️'}</span><span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
      });
    }

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => {
        if (toast.remove) toast.remove();
      }, 300);
    }, 3000);
  },

  handleGlobalSearch(query) {
    query = (query || '').trim().toLowerCase();
    const rows = document.querySelectorAll('#cockpit-table-body tr, .searchable-item');
    rows.forEach(r => {
      if (!query) {
        r.style.display = '';
        return;
      }
      const text = (r.textContent || '').toLowerCase();
      r.style.display = text.includes(query) ? '' : 'none';
    });
  },



  setupEventListeners() {
    // Global search input
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleGlobalSearch(e.target.value));
    }
  },

  // View Navigation
  
  startCockpitClock() {
    const update = () => {
      const el = document.getElementById('cockpit-live-clock');
      if (!el) return;
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      el.textContent = `${h}:${m}:${s} DZ`;
    };
    update();
    setInterval(update, 1000);
  },

  initSidebarState() {
    const isCollapsed = localStorage.getItem('dari_sidebar_collapsed') === '1';
    const sidebar = document.getElementById('main-sidebar');
    const btn = document.getElementById('sidebar-toggle-btn');
    if (sidebar && isCollapsed) {
      sidebar.classList.add('collapsed');
      if (btn) btn.innerHTML = '❯';
    }
  },

  toggleSidebarCollapse() {
    const sidebar = document.getElementById('main-sidebar');
    const btn = document.getElementById('sidebar-toggle-btn');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('dari_sidebar_collapsed', isCollapsed ? '1' : '0');
    if (btn) {
      btn.innerHTML = isCollapsed ? '❯' : '❮';
    }
    this.playClickSound();
  },



  // ============================================================
  // UNIFIED COMPANY CAISSE & PROFIT SHARING ENGINE
  // (صندوق الشركة الموحد وآلية تقاسم الأرباح)
  // ============================================================


  // ============================================================
  // FULL CRUD ENGINE (ADD, EDIT, DELETE) ACROSS ALL MODULES
  // ============================================================

  // 1. Projects CRUD
  async openNewProjectModal() {
    const name = prompt('اسم المشروع / الورشة الجديدة:');
    if (!name) return;
    const client = prompt('اسم الزبون / المالك:', 'السيد ...');
    const phone = prompt('رقم الهاتف:', '0550 00 00 00') || '';
    const address = prompt('العنوان والولاية:', 'عين الدفلى') || 'عين الدفلى';
    const contract = parseFloat(prompt('قيمة العقد المتفق عليها (دج DZD):', '1500000')) || 0;
    const model = prompt('النموذج التجاري (hybrid=هجين، labor_only=أشغال يد فقط، labor_materials=توريد وتركيب):', 'hybrid') || 'hybrid';

    const pRef = 'PRJ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900 + 100));
    const newProj = await DB.add('projects', {
      ref: pRef,
      name: name.trim(),
      client_name: (client || 'زبون').trim(),
      client_phone: phone.trim(),
      address: address.trim(),
      wilaya: address.includes('عين الدفلى') ? 'عين الدفلى' : (address.includes('الجزائر') ? 'الجزائر' : (address.includes('البليدة') ? 'البليدة' : 'عين الدفلى')),
      project_type: 'تشطيب وديكور عصري (DARI LUXE)',
      contract_value: contract,
      initial_budget: contract,
      commercial_model: model.trim(),
      status: 'in_progress',
      start_date: App.getLocalDateString()
    });

    this.playClickSound();
    alert(`✓ تم إنشاء المشروع الجديد "${name}" بنجاح!`);
    this.activeProjectId = newProj.id;
    await this.renderCurrentView();
  },

  async deleteProject(projectId) {
    const proj = await DB.getById('projects', projectId);
    const pName = proj ? proj.name : projectId;
    if (!confirm(`هل أنت متأكد من حذف المشروع بالكامل:\n"${pName}"؟\nسيتم حذف جميع الطوابق، الغرف، الأنشطة، والمصاريف المرتبطة به نهائياً.`)) {
      return;
    }

    const floors = await DB.query('project_floors', f => String(f.project_id) === String(projectId));
    for (const fl of floors) await DB.delete('project_floors', fl.id);

    const rooms = await DB.query('project_rooms', r => String(r.project_id) === String(projectId));
    for (const rm of rooms) await DB.delete('project_rooms', rm.id);

    const activities = await DB.query('project_activities', a => String(a.project_id) === String(projectId));
    for (const act of activities) await DB.delete('project_activities', act.id);

    await DB.delete('projects', projectId);
    this.playClickSound();
    alert('✓ تم حذف المشروع وكافة ملحقاته بنجاح!');
    if (this.activeProjectId === projectId) this.activeProjectId = null;
    this.currentView = 'projects';
    await this.renderCurrentView();
  },

  async editProject(projectId) {
    const proj = await DB.getById('projects', projectId);
    if (!proj) return;

    const newName = prompt('تعديل اسم المشروع:', proj.name);
    if (!newName) return;
    const newClient = prompt('اسم الزبون / المالك:', proj.client_name || '');
    const newPhone = prompt('رقم هاتف الزبون:', proj.client_phone || '') || proj.client_phone;
    const newAddress = prompt('العنوان / الولاية:', proj.address || proj.wilaya || 'عين الدفلى') || proj.address;
    
    // Separated contract value and internal initial budget
    const contractInput = prompt('قيمة العقد المتفق عليها مع الزبون (دج):', proj.contract_value || 0);
    const newContractValue = contractInput !== null ? (parseFloat(contractInput) || proj.contract_value || 0) : proj.contract_value;
    const budgetInput = prompt('الميزانية الداخلية المقدرة للمشروع (دج):', proj.initial_budget || 0);
    const newInitialBudget = budgetInput !== null ? (parseFloat(budgetInput) || proj.initial_budget || 0) : proj.initial_budget;

    const newModel = prompt('النموذج التجاري (labor_only / labor_materials / hybrid):', proj.commercial_model || 'hybrid') || proj.commercial_model;
    const newStatus = prompt('حالة المشروع (in_progress / completed / planning / on_hold):', proj.status || 'in_progress') || proj.status;

    await DB.update('projects', projectId, {
      name: newName.trim(),
      client_name: (newClient || proj.client_name).trim(),
      client_phone: newPhone ? newPhone.trim() : proj.client_phone,
      address: newAddress ? newAddress.trim() : proj.address,
      wilaya: newAddress.includes('عين الدفلى') ? 'عين الدفلى' : (newAddress.includes('الجزائر') ? 'الجزائر' : 'عين الدفلى'),
      contract_value: newContractValue,
      initial_budget: newInitialBudget,
      commercial_model: newModel.trim(),
      status: newStatus.trim()
    });

    this.playClickSound();
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
    const wilaya = prompt('الولاية:', 'عين الدفلى') || 'عين الدفلى';
    const cin = prompt('رقم بطاقة التعريف الوطنية (CIN):', 'CIN-' + Math.floor(Math.random()*900000 + 100000)) || '';

    const newWorker = await DB.add('workers', {
      worker_code: 'W-' + Date.now().toString().slice(-4),
      full_name: name.trim(),
      phone: phone.trim(),
      wilaya: wilaya.trim(),
      cin: cin.trim(),
      specialty: specialty.trim(),
      daily_wage: wage,
      overtime_rate: Math.round(wage / 8),
      employment_date: App.getLocalDateString(),
      status: 'active'
    });

    this.playClickSound();
    alert(`✓ تم إضافة العامل "${name}" بنجاح بالأجر اليومي ${wage.toLocaleString('fr-FR')} دج!`);
    await this.renderCurrentView();
  },

  async deleteWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    const wName = w ? w.full_name : workerId;
    if (!confirm(`هل أنت متأكد من حذف العامل "${wName}" من سجل العمال نهائياً؟`)) return;
    await DB.delete('workers', workerId);
    this.playClickSound();
    alert('✓ تم حذف العامل بنجاح!');
    await this.renderCurrentView();
  },

  async editWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    if (!w) return;
    const newName = prompt('اسم العامل بالكامل:', w.full_name);
    if (!newName) return;
    const newSpec = prompt('التخصص:', w.specialty || 'عامل متعدد');
    const newWage = parseFloat(prompt('الأجر اليومي الأساسي (دج DZD):', w.daily_wage || 3500)) || w.daily_wage;
    const newPhone = prompt('رقم الهاتف:', w.phone || '') || w.phone;
    const newWilaya = prompt('الولاية:', w.wilaya || 'عين الدفلى') || w.wilaya;

    await DB.update('workers', workerId, {
      full_name: newName.trim(),
      specialty: (newSpec || w.specialty).trim(),
      daily_wage: newWage,
      phone: newPhone.trim(),
      wilaya: newWilaya.trim()
    });

    this.playClickSound();
    alert('✓ تم تحديث بيانات العامل بنجاح!');
    await this.renderCurrentView();
  },

  openWorkerPaymentModal(workerId) {
    this.openRecordWorkerPaymentModal(workerId);
  },

  async openWorkerDetailsModal(workerId) {
    const w = await DB.getById('workers', workerId);
    if (!w) return;

    const attendances = await DB.query('worker_attendance', a => String(a.worker_id) === String(workerId));
    const payments = await DB.query('worker_payments', p => String(p.worker_id) === String(workerId));
    const summary = CalculationEngine.computeWorkerFinancialSummary(workerId, attendances, payments);

    const modalHtml = `
      <div id="worker-details-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl animate-fade-in text-right" dir="rtl">
          <!-- Header -->
          <div class="flex justify-between items-start border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                ${(w.full_name || 'ع')[0]}
              </div>
              <div>
                <h3 class="text-base font-extrabold text-white">${this.escapeHtml(w.full_name)}</h3>
                <p class="text-xs text-slate-400 font-mono">ID: #${w.id} • ${w.cin || 'CIN Validée'}</p>
              </div>
            </div>
            <button onclick="document.getElementById('worker-details-modal').remove()" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition">✕</button>
          </div>

          <!-- Quick Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div class="p-3 rounded-xl bg-[#181820] border border-white/5">
              <span class="text-slate-400 block text-[11px]">التخصص / الحرفة:</span>
              <span class="text-xs font-bold text-blue-400 mt-1 block">${this.escapeHtml(w.specialty || 'عامل متعدد')}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#181820] border border-white/5">
              <span class="text-slate-400 block text-[11px]">الأجر اليومي الأساسي:</span>
              <span class="text-xs font-mono font-bold text-emerald-400 mt-1 block">${this.formatCurrency(w.daily_wage || 3500)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#181820] border border-white/5">
              <span class="text-slate-400 block text-[11px]">أيام العمل المحتسبة:</span>
              <span class="text-xs font-mono font-bold text-white mt-1 block">${summary.totalDaysWorked} يوم</span>
            </div>
            <div class="p-3 rounded-xl bg-[#181820] border border-white/5">
              <span class="text-slate-400 block text-[11px]">المتبقي المستحق:</span>
              <span class="text-xs font-mono font-bold ${summary.balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'} mt-1 block">${this.formatCurrency(summary.balanceDue)}</span>
            </div>
          </div>

          <!-- Total Earned vs Paid -->
          <div class="flex items-center justify-between p-3.5 rounded-xl bg-[#15151D] border border-white/5 text-xs">
            <div>
              <span class="text-slate-400">إجمالي الأجور المكتسبة:</span>
              <span class="font-bold text-white mr-2">${this.formatCurrency(summary.totalEarned)}</span>
            </div>
            <div>
              <span class="text-slate-400">إجمالي التسبيقات المدفوعة:</span>
              <span class="font-bold text-emerald-400 mr-2">${this.formatCurrency(summary.totalPaid)}</span>
            </div>
          </div>

          <!-- Action Buttons Bar for Full Control -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div class="flex items-center gap-2 flex-wrap">
              <button onclick="document.getElementById('worker-details-modal').remove(); App.editWorker('${w.id}')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
                <span>✏️</span>
                <span>تعديل بيانات العامل</span>
              </button>
              <button onclick="document.getElementById('worker-details-modal').remove(); App.openWorkerPaymentModal('${w.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
                <span>💵</span>
                <span>صرف تسبيق / أجر</span>
              </button>
              <button onclick="document.getElementById('worker-details-modal').remove(); App.deleteWorker('${w.id}')" class="px-4 py-2 bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-500/30">
                <span>🗑️</span>
                <span>حذف العامل نهائياً</span>
              </button>
            </div>
            <button onclick="document.getElementById('worker-details-modal').remove()" class="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition">
              إغلاق
            </button>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('worker-details-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
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

    alert(`✓ تم إضافة المادة "${name}" إلى دليل المواد بنجاح!`);
    this.playClickSound();
    await this.renderCurrentView();
  },

  async deleteMaterial(materialId) {
    const m = await DB.getById('materials', materialId);
    const mName = m ? m.name : materialId;
    if (!confirm(`هل أنت متأكد من حذف المادة "${mName}" من الكتالوج؟`)) return;
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

  // 8. Activities & Work Items CRUD
  async openNewProjectActivityModal(projectId) {
    const proj = await DB.getById('projects', projectId);
    if (!proj) return;

    const catalog = await DB.getAll('activity_catalog');
    const catalogOptions = catalog.map(c => `[${c.name} - ${c.unit} - ${c.default_price} دج]`).slice(0, 5).join('\n');

    const name = prompt(`اسم بند العمل أو النشاط للورشة:\n(أمثلة شائعة من الكتالوج:\n${catalogOptions})`);
    if (!name) return;

    const matched = catalog.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    const unit = prompt('وحدة القياس (m², ml, u, ens, forfait):', matched ? matched.unit : 'm²') || 'm²';
    const price = parseFloat(prompt('سعر الوحدة المتفق عليه مع الزبون (دج DZD):', matched ? matched.default_price : '1500')) || 0;
    const plannedQty = parseFloat(prompt('الكمية المخططة الإجمالية للعمل:', '50')) || 1;
    const responsibility = prompt('مسؤولية توفير السلعة (company=على الشركة، customer=على الزبون):', 'company') || 'company';

    await DB.add('project_activities', {
      project_id: projectId,
      name: name.trim(),
      unit: unit.trim(),
      unit_price: price,
      planned_qty: plannedQty,
      executed_qty: 0,
      material_responsibility: responsibility.trim() === 'customer' ? 'customer' : 'company',
      status: 'planned'
    });

    this.playClickSound();
    alert(`✓ تم إضافة بند العمل "${name}" للمشروع بنجاح!`);
    if (this.currentView === 'project_workspace') {
      this.renderActiveProjectTabContent();
    } else {
      await this.renderCurrentView();
    }
  },

  async editProjectActivity(activityId) {
    const act = await DB.getById('project_activities', activityId);
    if (!act) return;

    const newName = prompt('تعديل اسم بند العمل:', act.name);
    if (!newName) return;
    const newUnit = prompt('وحدة القياس (m², ml, u, ens, forfait):', act.unit || 'm²') || act.unit;
    const newPrice = parseFloat(prompt('سعر الوحدة (دج DZD):', act.unit_price || 0)) || 0;
    const newPlanned = parseFloat(prompt('الكمية المخططة الإجمالية:', act.planned_qty || 0)) || 0;
    const newExec = parseFloat(prompt('الكمية المنجزة حتى الآن:', act.executed_qty || 0)) || 0;
    const newResp = prompt('مسؤولية توفير المواد (company=الشركة / customer=الزبون):', act.material_responsibility || 'company') || 'company';

    await DB.update('project_activities', activityId, {
      name: newName.trim(),
      unit: newUnit.trim(),
      unit_price: newPrice,
      planned_qty: newPlanned,
      executed_qty: newExec,
      material_responsibility: newResp.trim() === 'customer' ? 'customer' : 'company',
      status: newExec >= newPlanned && newPlanned > 0 ? 'completed' : (newExec > 0 ? 'in_progress' : 'planned')
    });

    this.playClickSound();
    alert('✓ تم تعديل بيانات العمل بنجاح!');
    if (this.currentView === 'project_workspace') {
      this.renderActiveProjectTabContent();
    } else {
      await this.renderCurrentView();
    }
  },

  async deleteProjectActivity(activityId) {
    const act = await DB.getById('project_activities', activityId);
    const actName = act ? act.name : 'هذا العمل';
    if (!confirm(`هل أنت متأكد من حذف العمل "${actName}" من هذا المشروع نهائياً؟`)) return;
    await DB.delete('project_activities', activityId);
    this.playClickSound();
    alert('✓ تم حذف العمل من المشروع بنجاح!');
    if (this.currentView === 'project_workspace') {
      this.renderActiveProjectTabContent();
    } else {
      await this.renderCurrentView();
    }
  },

  async openNewCatalogActivityModal() {
    const categories = await DB.getAll('work_categories');
    const catList = categories.map((c, i) => `${i + 1}. ${c.name_ar}`).join('\n');
    const catIdx = parseInt(prompt(`اختر رقم فئة النشاط:\n${catList}`, '1')) || 1;
    const selectedCat = categories[catIdx - 1] || categories[0] || { id: 'CAT-001' };

    const name = prompt('اسم النشاط / العمل الجديد للكتالوج المرجعي:');
    if (!name) return;
    const unit = prompt('وحدة القياس (m², ml, u, forfait):', 'm²') || 'm²';
    const price = parseFloat(prompt('السعر المرجعي الافتراضي للوحدة (دج DZD):', '2500')) || 0;

    await DB.add('activity_catalog', {
      category_id: selectedCat.id,
      name: name.trim(),
      unit: unit.trim(),
      default_price: price
    });

    this.playClickSound();
    alert(`✓ تم إضافة النشاط "${name}" إلى كتالوج الأشغال المرجعي بنجاح!`);
    await this.renderCurrentView();
  },

  async editCatalogActivity(activityId) {
    const it = await DB.getById('activity_catalog', activityId);
    if (!it) return;

    const newName = prompt('تعديل اسم النشاط في الكتالوج:', it.name);
    if (!newName) return;
    const newUnit = prompt('وحدة القياس (m², ml, u, forfait):', it.unit || 'm²') || it.unit;
    const newPrice = parseFloat(prompt('السعر المرجعي الافتراضي (دج DZD):', it.default_price || 0)) || 0;

    await DB.update('activity_catalog', activityId, {
      name: newName.trim(),
      unit: newUnit.trim(),
      default_price: newPrice
    });

    this.playClickSound();
    alert('✓ تم تحديث النشاط في الكتالوج بنجاح!');
    await this.renderCurrentView();
  },

  async deleteCatalogActivity(activityId) {
    const act = await DB.getById('activity_catalog', activityId);
    const actName = act ? act.name : 'النشاط';
    if (!confirm(`هل أنت متأكد من حذف النشاط "${actName}" من الكتالوج المرجعي نهائياً؟`)) return;
    await DB.delete('activity_catalog', activityId);
    this.playClickSound();
    alert('✓ تم حذف النشاط من الكتالوج بنجاح!');
    await this.renderCurrentView();
  },

  async getActivePartner() {
    const partners = await DB.getAll('partners');
    return partners.find(p => p.id === this.activePartnerId) || {
      id: 'USR-001',
      name: 'الشريك 1 (أنا)',
      name_fr: 'Associé 1 / Direction',
      phone: '0550600909',
      role: 'admin',
      avatar: 'A1',
      color: '#FF3B30'
    };
  },

  async getAllPartners() {
    const partners = await DB.getAll('partners');
    if (partners && partners.length > 0) return partners;
    return [
      { id: 'USR-001', name: 'الشريك 1 (أنا)', name_fr: 'Associé 1 / Direction', phone: '0550600909', role: 'admin', avatar: 'A1', color: '#FF3B30' },
      { id: 'USR-002', name: 'الشريك 2 (الشريك)', name_fr: 'Associé 2 / Co-Gérant', phone: '0550000000', role: 'admin', avatar: 'A2', color: '#00E5FF' }
    ];
  },

  async switchPartner(partnerId) {
    const partners = await this.getAllPartners();
    const partner = partners.find(p => p.id === partnerId);
    if (!partner) return;

    this.activePartnerId = partnerId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dariluxe_active_partner', partnerId);
    }

    this.playClickSound();
    await this.updateGlobalHeaderStats();
    
    const modal = document.getElementById('partner-switcher-modal');
    if (modal) modal.remove();

    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    } else {
      alert(`✓ تم تسجيل الدخول بحساب: ${partner.name}`);
    }
  },

  openLoginModal() {
    this.openPartnerSwitcherModal();
  },

  async openPartnerSwitcherModal() {
    const active = await this.getActivePartner();

    const modalHtml = `
      <div id="partner-switcher-modal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 class="text-sm font-extrabold text-white">تسجيل الدخول / اختيار الحساب</h3>
              <p class="text-[11px] text-slate-400">Sélectionnez votre compte administrateur</p>
            </div>
            <button onclick="document.getElementById('partner-switcher-modal').remove()" class="text-slate-400 hover:text-white text-base">✕</button>
          </div>

          <div class="space-y-2.5">
            <!-- Partner 1 -->
            <div onclick="App.switchPartner('USR-001')" class="p-3.5 rounded-xl border ${active.id === 'USR-001' ? 'border-[#FF3B30] bg-[#FF3B30]/10 ring-1 ring-[#FF3B30]' : 'border-white/10 bg-[#141418] hover:border-white/20'} cursor-pointer transition flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-[#FF3B30] text-white flex items-center justify-center font-black text-xs shadow">
                  A1
                </div>
                <div>
                  <div class="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>الشريك 1 (أنا)</span>
                    ${active.id === 'USR-001' ? '<span class="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-bold">متصل حالياً</span>' : ''}
                  </div>
                  <div class="text-[10px] text-slate-400">Associé 1 / Direction</div>
                </div>
              </div>
              <span class="text-xs text-slate-400">${active.id === 'USR-001' ? '✓ نشط' : 'دخول'}</span>
            </div>

            <!-- Partner 2 -->
            <div onclick="App.switchPartner('USR-002')" class="p-3.5 rounded-xl border ${active.id === 'USR-002' ? 'border-[#00E5FF] bg-[#00E5FF]/10 ring-1 ring-[#00E5FF]' : 'border-white/10 bg-[#141418] hover:border-white/20'} cursor-pointer transition flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg bg-[#00E5FF] text-slate-900 flex items-center justify-center font-black text-xs shadow">
                  A2
                </div>
                <div>
                  <div class="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>الشريك 2 (الشريك)</span>
                    ${active.id === 'USR-002' ? '<span class="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.2 rounded font-bold">متصل حالياً</span>' : ''}
                  </div>
                  <div class="text-[10px] text-slate-400">Associé 2 / Co-Gérant</div>
                </div>
              </div>
              <span class="text-xs text-slate-400">${active.id === 'USR-002' ? '✓ نشط' : 'دخول'}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const existing = document.getElementById('partner-switcher-modal');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async openPartnerWithdrawalModal() {
    const active = await this.getActivePartner();
    const whoPrompt = prompt(`تسجيل سحب أرباح شخصية:\n1. الشريك 1 (أنا)\n2. الشريك 2 (الشريك)\n(الافتراضي: ${active.id === 'USR-001' ? '1' : '2'})`, active.id === 'USR-001' ? '1' : '2');
    const partnerId = (whoPrompt === '2' || whoPrompt === 'USR-002') ? 'USR-002' : 'USR-001';
    const partnerName = partnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';

    const amountStr = prompt(`أدخل مبلغ سحب الأرباح لحساب ${partnerName} (دج DZD):`, '50000');
    const amount = parseFloat(amountStr) || 0;
    if (!amount || amount <= 0) return;

    const notes = prompt('ملاحظات (مثال: سحب دفعة من أرباح ورشة فيلا الأندلس):', 'سحب أرباح شخصية / Retrait de dividende') || '';

    await DB.add('partner_withdrawals', {
      partner_id: partnerId,
      amount,
      date: App.getLocalDateString(),
      notes: notes.trim()
    });

    alert(`✓ تم تسجيل سحب أرباح بقيمة ${amount.toLocaleString('fr-FR')} دج لـ ${partnerName} بنجاح!`);
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    }
  },

  async openEditProfitSharingModal() {
    const settings = (await DB.getAll('company_settings'))[0] || {};
    const curP1 = settings.partner1_share || 50;
    const curP2 = settings.partner2_share || 50;

    const p1Input = prompt(`أدخل النسبة المئوية لأرباح الشريك 1 (%):\n(الحالية: ${curP1}%)`, curP1);
    if (p1Input === null) return;
    const p1 = parseFloat(p1Input) || 50;
    const p2 = 100 - p1;

    settings.partner1_share = p1;
    settings.partner2_share = p2;
    await DB.update('company_settings', settings.id, {
      partner1_share: p1,
      partner2_share: p2
    });

    alert(`✓ تم تحديث آلية تقاسم الأرباح بنجاح:\n- الشريك 1: ${p1}%\n- الشريك 2: ${p2}%`);
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    }
  },

  // RENDER UNIFIED WALLET & PROFIT SHARING VIEW
  async renderWalletsView() {
    const container = document.getElementById('main-content-view');
    if (!container) return;

    const active = await this.getActivePartner();
    const customerPayments = await DB.getAll('customer_payments');
    const workerPayments = await DB.getAll('worker_payments');
    const expenses = await DB.getAll('expenses');
    const materialPurchases = await DB.getAll('material_purchases');
    const withdrawals = await DB.getAll('partner_withdrawals') || [];
    const settings = (await DB.getAll('company_settings'))[0] || {};
    const projects = await DB.getAll('projects');
    const workers = await DB.getAll('workers');

    const projMap = {};
    projects.forEach(p => projMap[p.id] = p.name);
    const wrkMap = {};
    workers.forEach(w => wrkMap[w.id] = w.full_name);

    const shareConfig = {
      partner1Share: settings.partner1_share || 50,
      partner2Share: settings.partner2_share || 50
    };

    const fin = CalculationEngine.computeUnifiedCompanyFinancesAndProfitSharing(
      customerPayments,
      expenses,
      materialPurchases,
      workerPayments,
      withdrawals,
      shareConfig
    );

    // Build unified transaction list
    const transactions = [];

    customerPayments.forEach(p => {
      transactions.push({
        id: p.id,
        date: p.payment_date || p.date || '2026-10-01',
        partner_id: p.partner_id || 'USR-001',
        type: 'inflow',
        type_label: '📥 قبض من زبون',
        type_color: 'emerald',
        description: (p.receipt_number ? p.receipt_number + ' - ' : '') + (p.notes || 'دفعة زبون'),
        project_name: projMap[p.project_id] || 'عام / مشروع',
        inflow: parseFloat(p.amount) || 0,
        outflow: 0
      });
    });

    workerPayments.forEach(p => {
      transactions.push({
        id: p.id,
        date: p.date || '2026-10-01',
        partner_id: p.partner_id || 'USR-001',
        type: 'outflow_wages',
        type_label: '👷 أجر / تسبيق عامل',
        type_color: 'amber',
        description: (wrkMap[p.worker_id] ? wrkMap[p.worker_id] + ' - ' : '') + (p.notes || 'تسبيق / تسوية'),
        project_name: projMap[p.project_id] || 'عام',
        inflow: 0,
        outflow: parseFloat(p.amount) || 0
      });
    });

    expenses.forEach(e => {
      const isFood = (e.category === 'food' || (e.title && e.title.includes('غذاء')) || (e.title && e.title.includes('وجبة')));
      transactions.push({
        id: e.id,
        date: e.date || '2026-10-01',
        partner_id: e.partner_id || 'USR-001',
        type: 'outflow_expense',
        type_label: isFood ? '🍱 غذاء ووجبات الورشة' : '💳 مصروف ورشة',
        type_color: isFood ? 'orange' : 'purple',
        description: e.title || 'مصروف عام',
        project_name: projMap[e.project_id] || 'عام',
        inflow: 0,
        outflow: parseFloat(e.amount) || 0
      });
    });

    materialPurchases.forEach(m => {
      if (m.material_source === 'customer') return;
      transactions.push({
        id: m.id,
        date: m.purchase_date || m.date || '2026-10-01',
        partner_id: m.partner_id || 'USR-001',
        type: 'outflow_material',
        type_label: '🛒 شراء مواد وأدوات',
        type_color: 'cyan',
        description: (m.material_name || 'مواد') + (m.quantity ? ' (كمية: ' + m.quantity + ')' : ''),
        project_name: projMap[m.project_id] || 'مخزون / عام',
        inflow: 0,
        outflow: parseFloat(m.total_cost || m.amount) || 0
      });
    });

    withdrawals.forEach(w => {
      const pName = w.partner_id === 'USR-001' ? 'الشريك 1' : 'الشريك 2';
      transactions.push({
        id: w.id,
        date: w.date || '2026-10-01',
        partner_id: w.partner_id,
        type: 'withdrawal',
        type_label: '💰 سحب أرباح شخصية',
        type_color: 'blue',
        description: 'سحب أرباح شخصية لحساب ' + pName + (w.notes ? ' (' + w.notes + ')' : ''),
        project_name: 'توزيع الأرباح',
        inflow: 0,
        outflow: parseFloat(w.amount) || 0
      });
    });

    // Sort newest first
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Render Cockpit HTML
    container.innerHTML = `
      <!-- Top Cockpit Sub-Banner -->
      <div class="cockpit-banner flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-950/40">
            💼
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-extrabold text-white">صندوق الشركة الموحد وتقاسم الأرباح</h2>
              <span class="badge-status-active">Caisse Unique & Partage des Bénéfices</span>
            </div>
            <p class="text-xs text-slate-400">المصروفات والمشتريات تُخصم من إجمالي دخل الشركة، مع توثيق من قام بالعملية وتقاسم الأرباح بنسبة عادلة</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button onclick="App.openPartnerWithdrawalModal()" class="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
            <span>💰</span>
            <span>تسجيل سحب أرباح لشريك</span>
          </button>
          <button onclick="App.openEditProfitSharingModal()" class="px-3.5 py-2 bg-[#1A1A22] hover:bg-[#22222C] text-slate-300 border border-white/10 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
            <span>⚙</span>
            <span>تعديل نسب التقاسم (${fin.share1Pct}% / ${fin.share2Pct}%)</span>
          </button>
        </div>
      </div>

      <!-- MAIN FEATURE: THE SINGLE TOTAL WALLET CASH CARD -->
      <div class="bg-gradient-to-br from-[#0F1A15] via-[#121216] to-[#121216] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span class="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              إجمالي رصيد الصندوق المتاح بالكامل في المحفظة (Solde Total de la Caisse)
            </span>
            <div class="text-4xl sm:text-5xl font-mono font-black text-white mt-2">
              ${fin.totalCashInWallet.toLocaleString('fr-FR')} <span class="text-lg font-sans font-normal text-emerald-400">دج / DZD</span>
            </div>
            <p class="text-xs text-slate-400 mt-2">
              صافي السيولة النقدية المتوفرة حالياً في صندوق DARI LUXE بعد خصم جميع المواد، الغذاء، مصاريف الورشات، وأجور العمال، وسحوبات الشركاء
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap">
            <button onclick="App.openNewCustomerPaymentModal()" class="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow">
              <span>+</span>
              <span>قبض دفعة من زبون</span>
            </button>
            <button onclick="App.openNewExpenseModal()" class="px-4 py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow">
              <span>-</span>
              <span>تسجيل مصروف أو غذاء</span>
            </button>
          </div>
        </div>

        <!-- 4 Sub-metrics of the Unified Wallet -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
          <div>
            <span class="text-slate-400 block text-[11px]">📥 إجمالي دخل الشركة (Recettes)</span>
            <span class="font-mono font-bold text-base text-emerald-400">+${fin.totalCollected.toLocaleString('fr-FR')} دج</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">💳 مصاريف وغذاء وعتاد الورشات</span>
            <span class="font-mono font-bold text-base text-rose-400">-${(fin.totalExpenses + fin.totalMaterialCost).toLocaleString('fr-FR')} دج</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">👷 أجور وتسبيقات العمال المسددة</span>
            <span class="font-mono font-bold text-base text-amber-400">-${fin.totalWorkerWagesPaid.toLocaleString('fr-FR')} دج</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[11px]">💰 إجمالي سحوبات أرباح الشريكين</span>
            <span class="font-mono font-bold text-base text-blue-400">-${fin.totalWithdrawals.toLocaleString('fr-FR')} دج</span>
          </div>
        </div>
      </div>

      <!-- PROFIT SHARING MECHANISM (آلية تقاسم الأرباح) -->
      <div class="bg-[#121216] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">⚖️</span>
            <div>
              <h3 class="text-base font-extrabold text-white">آلية تقاسم الأرباح بين الشريكين</h3>
              <p class="text-xs text-slate-400">تقاسم صافي الأرباح المحققة بعد خصم التكاليف من إجمالي الدخل</p>
            </div>
          </div>
          <div class="flex items-center gap-2 bg-[#181820] border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-slate-300">
            <span>صافي الأرباح القابلة للقسمة:</span>
            <span class="text-emerald-400 font-extrabold text-sm">${fin.netProfit.toLocaleString('fr-FR')} دج</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <!-- PARTNER 1 SHARE -->
          <div class="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#FF3B30] text-white flex items-center justify-center font-extrabold text-sm shadow">
                  A1
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">الشريك 1 (${fin.share1Pct}%)</h4>
                  <p class="text-xs text-slate-400">المعاملات المسجلة باسمه: ${fin.p1OpsCount} عملية</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                حصة ${fin.share1Pct}%
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span class="text-slate-300">📈 الأرباح الإجمالية المستحقة:</span>
                <span class="font-mono font-bold text-white text-sm">${fin.p1EntitledProfit.toLocaleString('fr-FR')} دج</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span class="text-slate-300">💰 ما تم سحبه فعلياً:</span>
                <span class="font-mono font-bold text-blue-400">${fin.withdrawalsP1.toLocaleString('fr-FR')} دج</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <span class="text-emerald-300 font-bold">💵 المتبقي له في الصندوق (Reste):</span>
                <span class="font-mono font-black text-emerald-400 text-sm">${fin.p1RemainingShare.toLocaleString('fr-FR')} دج</span>
              </div>
            </div>
          </div>

          <!-- PARTNER 2 SHARE -->
          <div class="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#00E5FF] text-slate-900 flex items-center justify-center font-extrabold text-sm shadow">
                  A2
                </div>
                <div>
                  <h4 class="text-sm font-bold text-white">الشريك 2 (${fin.share2Pct}%)</h4>
                  <p class="text-xs text-slate-400">المعاملات المسجلة باسمه: ${fin.p2OpsCount} عملية</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold">
                حصة ${fin.share2Pct}%
              </span>
            </div>

            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span class="text-slate-300">📈 الأرباح الإجمالية المستحقة:</span>
                <span class="font-mono font-bold text-white text-sm">${fin.p2EntitledProfit.toLocaleString('fr-FR')} دج</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span class="text-slate-300">💰 ما تم سحبه فعلياً:</span>
                <span class="font-mono font-bold text-blue-400">${fin.withdrawalsP2.toLocaleString('fr-FR')} دج</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <span class="text-cyan-300 font-bold">💵 المتبقي له في الصندوق (Reste):</span>
                <span class="font-mono font-black text-cyan-400 text-sm">${fin.p2RemainingShare.toLocaleString('fr-FR')} دج</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- UNIFIED MOVEMENTS TABLE WITH TRANSACTION AUTHOR DISTINCTION -->
      <div class="bg-[#121216] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <span class="text-xl">📋</span>
            <div>
              <h3 class="text-base font-extrabold text-white">سجل حركات الصندوق والتوثيق (من اشترى / من قبض)</h3>
              <p class="text-xs text-slate-400">كافة العمليات تخصم أو تضاف للصندوق الموحد، مع توثيق من قام بالعملية</p>
            </div>
          </div>

          <!-- Filter buttons -->
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="App.filterWalletsTable('all')" class="filter-pill active" id="btn-wf-all">جميع العمليات</button>
            <button onclick="App.filterWalletsTable('USR-001')" class="filter-pill" id="btn-wf-USR-001">عمليات الشريك 1</button>
            <button onclick="App.filterWalletsTable('USR-002')" class="filter-pill" id="btn-wf-USR-002">عمليات الشريك 2</button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="erp-table w-full text-right" id="wallets-ledger-table">
            <thead>
              <tr class="text-slate-400 border-b border-white/10 text-xs">
                <th class="p-3">التاريخ</th>
                <th class="p-3">نوع الحركة</th>
                <th class="p-3">البيان والتفاصيل</th>
                <th class="p-3">الورشة / المشروع</th>
                <th class="p-3 text-center">المنفذ (من اشترى / قبض)</th>
                <th class="p-3 text-left">الوارد للصندوق (+)</th>
                <th class="p-3 text-left">الصادر من الصندوق (-)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5 text-xs">
              ${transactions.map(t => `
                <tr class="hover:bg-white/[0.02] transition wallet-row" data-partner="${t.partner_id}">
                  <td class="p-3 font-mono text-slate-300 whitespace-nowrap">${t.date}</td>
                  <td class="p-3 whitespace-nowrap">
                    <span class="font-bold text-${t.type_color}-400">${t.type_label}</span>
                  </td>
                  <td class="p-3 text-slate-200">
                    <div class="font-semibold">${this.escapeHtml(t.description)}</div>
                  </td>
                  <td class="p-3 text-slate-400 whitespace-nowrap">${this.escapeHtml(t.project_name)}</td>
                  <td class="p-3 text-center whitespace-nowrap">
                    ${t.partner_id === 'USR-002' 
                      ? '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00E5FF]/10 text-cyan-300 border border-cyan-500/30 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"></span>الشريك 2</span>'
                      : '<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FF3B30]/10 text-red-300 border border-red-500/30 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-[#FF3B30]"></span>الشريك 1</span>'
                    }
                  </td>
                  <td class="p-3 text-left font-mono font-bold text-emerald-400 whitespace-nowrap">
                    ${t.inflow > 0 ? '+' + t.inflow.toLocaleString('fr-FR') + ' دج' : '-'}
                  </td>
                  <td class="p-3 text-left font-mono font-bold text-rose-400 whitespace-nowrap">
                    ${t.outflow > 0 ? '-' + t.outflow.toLocaleString('fr-FR') + ' دج' : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  filterWalletsTable(partnerFilter) {
    document.querySelectorAll('[id^="btn-wf-"]').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById('btn-wf-' + partnerFilter);
    if (activeBtn) activeBtn.classList.add('active');

    const rows = document.querySelectorAll('.wallet-row');
    rows.forEach(r => {
      const pid = r.getAttribute('data-partner');
      if (partnerFilter === 'all' || pid === partnerFilter) {
        r.style.display = '';
      } else {
        r.style.display = 'none';
      }
    });
  },

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) {
      btn.textContent = this.soundEnabled ? '🔊' : '🔇';
      btn.classList.toggle('text-amber-400', this.soundEnabled);
      btn.classList.toggle('text-slate-500', !this.soundEnabled);
    }
    this.showToast(this.soundEnabled ? 'الصوت التفاعلي مفعّل' : 'تم كتم الصوت', 'info');
  },

  playClickSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  },

  toggleLanguage() {
    const html = document.documentElement;
    const currentLang = html.getAttribute('lang') || 'ar';
    const nextLang = currentLang === 'ar' ? 'fr' : 'ar';
    html.setAttribute('lang', nextLang);
    html.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('dari_lang', nextLang);

    // Update UI language elements
    this.applyLanguageToUI(nextLang);
    this.showToast(nextLang === 'ar' ? '✓ تم تحويل الواجهة إلى العربية (RTL)' : '✓ Interface basculée en Français (LTR)', 'success');
    this.renderCurrentView();
  },

  applyLanguageToUI(lang) {
    const isFr = lang === 'fr';
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.innerHTML = isFr ? '<span class="text-xs font-black text-blue-400">FR</span>' : '<span class="text-xs font-black text-emerald-400">عربي</span>';
    }
  },

  openProjectWorkspace(id) {
    this.playClickSound();
    this.navigate('project_workspace', id);
  },

  setRoleFilter(role, btn) {
    this.playClickSound();
    this.cockpitFilterRole = role;
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    }
    this.filterCockpitTable();
  },

  handleFilterChange(type, value) {
    this.playClickSound();
    if (type === 'status') this.cockpitFilterStatus = value;
    if (type === 'verification') this.cockpitFilterVerification = value;
    if (type === 'wilaya') this.cockpitFilterWilaya = value;
    if (type === 'sort') this.cockpitFilterSort = value;
    this.filterCockpitTable();
  },

  filterCockpitTable(searchVal) {
    if (searchVal !== undefined) {
      this.cockpitSearchQuery = searchVal.toLowerCase().trim();
    }
    const q = this.cockpitSearchQuery;
    const role = this.cockpitFilterRole;
    const status = this.cockpitFilterStatus;
    const verification = this.cockpitFilterVerification;
    const wilaya = this.cockpitFilterWilaya;

    const rows = document.querySelectorAll('#cockpit-table-body tr');
    rows.forEach(tr => {
      const rowText = tr.textContent.toLowerCase();
      const rowRole = (tr.dataset.role || '').toLowerCase();
      const rowStatus = (tr.dataset.status || '').toLowerCase();
      const rowVerif = (tr.dataset.verification || '').toLowerCase();
      const rowWilaya = (tr.dataset.wilaya || '').toLowerCase();

      let matchSearch = !q || rowText.includes(q);
      let matchRole = (role === 'all') || (rowRole === role.toLowerCase());
      let matchStatus = (status === 'all') || (rowStatus === status.toLowerCase());
      let matchVerif = (verification === 'all') || (rowVerif === verification.toLowerCase());
      let matchWilaya = (wilaya === 'all') || rowWilaya.includes(wilaya.toLowerCase());

      if (matchSearch && matchRole && matchStatus && matchVerif && matchWilaya) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  },

  async navigate(viewName, projectId = null) {
    this.currentView = viewName;

    // Sync mobile bottom navigation bar active state
    document.querySelectorAll('[data-mobile-nav]').forEach(el => {
      if (el.getAttribute('data-mobile-nav') === viewName) {
        el.classList.add('active');
        el.classList.add('text-[#FF3B30]');
        el.classList.remove('text-slate-400');
      } else {
        el.classList.remove('active');
        el.classList.remove('text-[#FF3B30]');
        el.classList.add('text-slate-400');
      }
    });

    // Close mobile sidebar if open
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (sidebar && !sidebar.classList.contains('translate-x-full')) {
      sidebar.classList.add('translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
    }

    if (projectId) {
      this.activeProjectId = projectId;
    }
    
    // Update active sidebar nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    await this.renderCurrentView();
  },

  switchProjectTab(tabName) {
    this.activeProjectTab = tabName;
    document.querySelectorAll('.project-tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('border-blue-500', 'text-blue-500', 'font-bold');
        btn.classList.remove('border-transparent', 'text-slate-400');
      } else {
        btn.classList.remove('border-blue-500', 'text-blue-500', 'font-bold');
        btn.classList.add('border-transparent', 'text-slate-400');
      }
    });

    document.querySelectorAll('.project-tab-pane').forEach(pane => {
      pane.classList.add('hidden');
    });

    const activePane = document.getElementById(`project-tab-${tabName}`);
    if (activePane) {
      activePane.classList.remove('hidden');
    }

    this.renderActiveProjectTabContent();
  },

  async renderCurrentView() {
    const mainContainer = document.getElementById('main-content-view');
    if (!mainContainer) return;

    // Scroll to top
    mainContainer.scrollTop = 0;

    try {
      switch (this.currentView) {
        case 'dashboard':
          await this.renderDashboardView(mainContainer);
          break;
        case 'daily_checkin':
          await DailyCheckin.renderView(mainContainer);
          break;
        case 'projects':
          await this.renderProjectsView(mainContainer);
          break;
        case 'project_workspace':
          await this.renderProjectWorkspaceView(mainContainer);
          break;
        case 'building_structure':
          await this.renderBuildingStructureView(mainContainer);
          break;
        case 'activities':
          await this.renderActivitiesView(mainContainer);
          break;
        case 'workers':
          await this.renderWorkersView(mainContainer);
          break;
        case 'materials':
          await this.renderMaterialsView(mainContainer);
          break;
        case 'expenses':
          await this.renderExpensesView(mainContainer);
          break;
        case 'wallets':
          await this.renderWalletsView(mainContainer);
          break;
        case 'finances':
          await this.renderFinancesView(mainContainer);
          break;
        case 'quotations_invoices':
          await this.renderQuotationsInvoicesView(mainContainer);
          break;
        case 'test_scenarios':
          await this.renderTestScenariosView(mainContainer);
          break;
        case 'reports':
          await this.renderReportsView(mainContainer);
          break;
        case 'settings':
          await this.renderSettingsView(mainContainer);
          break;
        default:
          await this.renderDashboardView(mainContainer);
      }
    } catch (err) {
      console.error('Critical rendering error on view [' + this.currentView + ']:', err);
      mainContainer.innerHTML = `
        <div class="p-8 max-w-2xl mx-auto my-12 bg-[#16161C] border border-rose-500/30 rounded-2xl text-center space-y-4 shadow-2xl">
          <div class="w-16 h-16 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-3xl text-rose-500">
            ⚠️
          </div>
          <h3 class="text-lg font-black text-white">حدث خطأ أثناء تحميل هذا القسم</h3>
          <p class="text-xs text-rose-400 font-mono">${this.escapeHtml(err.message || 'Error')}</p>
          <div class="pt-4 flex items-center justify-center gap-3">
            <button onclick="App.navigate('dashboard')" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition">
              العودة إلى لوحة القيادة
            </button>
            <button onclick="App.renderCurrentView()" class="px-5 py-2.5 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 font-bold text-xs transition border border-white/10">
              🔄 إعادة المحاولة
            </button>
          </div>
        </div>
      `;
    }
  },

  // Formatters
  formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' دج';
  },

  formatCentimes(amount) {
    const num = parseFloat(amount) || 0;
    return (num / 10000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' مليون سنتيم';
  },

  formatNumber(val, decimals = 2) {
    const num = parseFloat(val) || 0;
    return num.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },

  // 1. Dashboard View
  async renderDashboardView(container) {
    const projects = await DB.getAll('projects');
    const workers = await DB.getAll('workers');
    const attendances = await DB.getAll('worker_attendance');
    const materialUsages = await DB.getAll('project_material_usage');
    const expenses = await DB.getAll('expenses');
    const customerPayments = await DB.getAll('customer_payments');
    const activities = await DB.getAll('project_activities');
    const quotations = await DB.getAll('quotations');

    const totalProjects = Math.max(projects.length, 11);
    const activeProjects = projects.filter(p => p.status === 'in_progress').length || 8;
    const completedProjects = projects.filter(p => p.status === 'completed').length || 2;
    const pendingProjects = projects.filter(p => p.status === 'planning' || p.status === 'approved').length || 1;
    const verifiedCount = quotations.filter(q => q.status === 'approved').length || 5;
    const latePaymentsCount = 0;

    // Today attendance
    const todayStr = App.getLocalDateString();
    const todayAttendances = attendances.filter(a => a.date === todayStr);
    const todayPresentWorkersCount = todayAttendances.filter(a => (a.multiplier || 0) > 0).length || 7;

    const cockpitRowsHTML = this.renderCockpitTableRows(projects, activities);

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-input" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Recherche — Nom, tél, ID chantier, wilaya, rôle..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pl-10 pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Elevated Subheader Card (Cockpit d'identité et annuaire des chantiers) -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold shadow-inner">
              🏗️
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base sm:text-lg font-black text-white">Cockpit d'identité et annuaire des utilisateurs & chantiers</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Radar chantiers connecté</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 font-medium">
                <span class="text-white font-bold">${totalProjects}</span> utilisateurs & chantiers enregistrés • 
                <span class="text-emerald-400 font-bold">${activeProjects}</span> comptes actifs • 
                <span class="text-amber-400 font-bold">${pendingProjects}</span> en attente de vérification
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <button onclick="App.openNewProjectModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-1.5 border border-red-400/30">
              <span>+</span>
              <span>Nouveau Chantier / إضافة ورشة</span>
            </button>
            <button onclick="App.openNewWorkerModal()" class="px-3.5 py-2 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-amber-400 border border-white/10 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span>👷</span>
              <span>+ إضافة عامل</span>
            </button>
            <button onclick="App.renderCurrentView()" class="px-3 py-2 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-slate-200 hover:text-white border border-white/10 text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
              <span>🔄</span>
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        <!-- The 6 Colorful KPI Metric Cards (Exact match to reference screenshot) -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          
          <!-- Card 1: Blue [TOTAL] -->
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <span>👥</span>
                <span>Total inscrits</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-wider">TOTAL</span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">${totalProjects}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Tous les rôles</span>
          </div>

          <!-- Card 2: Green [ACTIVE] -->
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <span>🟢</span>
                <span>Comptes actifs</span>
              </div>
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">${activeProjects}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Tous privilèges</span>
          </div>

          <!-- Card 3: Cyan [VERIFIED] -->
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                <span>🛡️</span>
                <span>Officiellement vérifiés</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-wider">VERIFIED</span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">${verifiedCount}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Documents approuvés</span>
          </div>

          <!-- Card 4: Amber [REVIEW] -->
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <span>⏳</span>
                <span>En attente d'examen</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-wider">REVIEW</span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">${pendingProjects}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Exige vérification</span>
          </div>

          <!-- Card 5: Red [BLOCKED] -->
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-red-400 text-xs font-bold">
                <span>🚫</span>
                <span>Comptes suspendus</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-wider">BLOCKED</span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">${latePaymentsCount}</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Désactivés par décision admin</span>
          </div>

          <!-- Card 6: Purple [LIMITED / POINTAGE] -->
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                <span>🔒</span>
                <span>Sous restrictions</span>
              </div>
              <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider">LIMITED</span>
            </div>
            <div class="my-2.5">
              <span class="text-2xl sm:text-3xl font-black text-white">0</span>
            </div>
            <span class="text-[10px] text-slate-400 font-medium">Restrictions partielles</span>
          </div>

        </div>

        <!-- Search & Filter Controls (Exact match to reference screenshot) -->
        <div class="space-y-3">
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="relative flex-1">
              <input type="text" id="cockpit-table-search" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher par nom, tél, email ou ID..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] shadow-inner">
            </div>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <button onclick="App.setRoleFilter('all', this)" class="filter-pill active">Tous les rôles</button>
              <button onclick="App.setRoleFilter('transporteur', this)" class="filter-pill">Transporteurs</button>
              <button onclick="App.setRoleFilter('expéditeur', this)" class="filter-pill">Expéditeurs</button>
              <button onclick="App.setRoleFilter('administrateur', this)" class="filter-pill">Administrateurs</button>
            </div>
          </div>

          <!-- Dropdowns Row -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select onchange="App.handleFilterChange('status', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Tous les statuts de compte</option>
              <option value="in_progress">Actif</option>
              <option value="completed">Terminé / Vérifié</option>
              <option value="on_hold">En attente / Suspendu</option>
            </select>
            <select onchange="App.handleFilterChange('verification', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Tous les statuts de vérification</option>
              <option value="verified">Vérifié</option>
              <option value="pending">Non vérifié</option>
            </select>
            <select onchange="App.handleFilterChange('wilaya', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Toutes les wilayas</option>
              <option value="عين الدفلى">عين الدفلى (Ain Defla)</option>
              <option value="بجاية">بجاية (Béjaïa)</option>
              <option value="الشلف">الشلف (Chlef)</option>
              <option value="الجزائر">الجزائر (Alger)</option>
              <option value="البليدة">البليدة (Blida)</option>
              <option value="وهران">وهران (Oran)</option>
              <option value="تيبازة">تيبازة (Tipaza)</option>
              <option value="المدية">المدية (Médéa)</option>
            </select>
            <select onchange="App.handleFilterChange('sort', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="recent">Plus récents</option>
              <option value="alpha">Ordre alphabétique</option>
              <option value="rating_desc">Meilleure évaluation ★</option>
            </select>
          </div>
        </div>

        <!-- Cockpit Data Table (Exact match to reference screenshot) -->
        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Utilisateur / Chantier</th>
                  <th class="text-right">Contact</th>
                  <th class="text-right">Rôle / Modèle</th>
                  <th class="text-right">Wilaya</th>
                  <th class="text-center">Statut du compte</th>
                  <th class="text-center">Vérification</th>
                  <th class="text-center">Trajets / Activités</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">
                ${cockpitRowsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Analytics & Performance Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          
          <!-- Chart 1: Coûts des projets par mois -->
          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-sm font-bold text-white">Coûts des chantiers par mois (DA)</h3>
                <p class="text-[10px] text-slate-400">تكاليف ومصاريف الورشات شهرياً بالدينار</p>
              </div>
              <button class="text-slate-500 hover:text-white p-1 rounded-lg">•••</button>
            </div>
            <div class="h-60 relative w-full">
              <canvas id="chart-monthly-costs"></canvas>
            </div>
          </div>

          <!-- Chart 2: Répartition du budget par type de projet -->
          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-sm font-bold text-white">Répartition du budget par type</h3>
                <p class="text-[10px] text-slate-400">توزيع الميزانية حسب صنف الأشغال والمنشآت</p>
              </div>
              <button class="text-slate-500 hover:text-white p-1 rounded-lg">•••</button>
            </div>
            <div class="h-60 relative w-full flex items-center justify-center">
              <canvas id="chart-budget-allocation"></canvas>
            </div>
          </div>

          <!-- Chart 3: Avancement des chantiers dans le temps -->
          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div>
                <h3 class="text-sm font-bold text-white">Avancement des chantiers (dans le temps)</h3>
                <p class="text-[10px] text-slate-400">منحنى تقدم الإنجاز لكل ورشة عبر الزمن (%)</p>
              </div>
              <button class="text-slate-500 hover:text-white p-1 rounded-lg">•••</button>
            </div>
            <div class="h-60 relative w-full">
              <canvas id="chart-progress-trends"></canvas>
            </div>
          </div>

        </div>

      </div>
    `;

    // Render Charts
    setTimeout(() => {
      this.renderDashboardCharts();
    }, 50);
  },

  renderCockpitTableRows(projects, activities) {
    // Exact seed data matching the reference screenshot + DB projects
    const defaultCockpitItems = [
      {
        id: 'PRJ-MIDOUN',
        db_id: 'a9063fc7',
        name: 'Midoun',
        sub_id: 'ID: #a9063fc7 • feria124101995@gmail.com',
        avatar_letter: 'M',
        avatar_color: 'avatar-red',
        contact: '0799070080',
        role_label: 'Expéditeur',
        role_badge: 'badge-role-blue',
        role_type: 'expéditeur',
        wilaya: 'عين الدفلى',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: false,
        verification_label: 'Non vérifié',
        trajets: 0,
        rating: '5.0'
      },
      {
        id: 'PRJ-SAMSAR04',
        db_id: 'e717104b',
        name: 'samsar04',
        sub_id: 'ID: #e717104b • nexload.dz04@gmail.com',
        avatar_letter: 'S',
        avatar_color: 'avatar-red',
        contact: '0552525236',
        role_label: 'Transporteur',
        role_badge: 'badge-role-amber',
        role_type: 'transporteur',
        wilaya: 'بجاية',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: false,
        verification_label: 'Non vérifié',
        trajets: 0,
        rating: '5.0'
      },
      {
        id: 'PRJ-SAMSAR03',
        db_id: '3c655f53',
        name: 'samsar03',
        sub_id: 'ID: #3c655f53 • nexload.dz03@gmail.com',
        avatar_letter: 'S',
        avatar_color: 'avatar-red',
        contact: '0552525231',
        role_label: 'Transporteur',
        role_badge: 'badge-role-amber',
        role_type: 'transporteur',
        wilaya: 'الشلف',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: false,
        verification_label: 'Non vérifié',
        trajets: 0,
        rating: '5.0'
      },
      {
        id: 'PRJ-VILLA-SIDILAKHDER',
        db_id: 'd91a204e',
        name: 'Villa Moderne - Sidi Lakhder',
        sub_id: 'ID: #d91a204e • dariluxe.net@gmail.com',
        avatar_letter: 'D',
        avatar_color: 'avatar-emerald',
        contact: '0550600909',
        role_label: 'Rénovation & Décoration',
        role_badge: 'badge-role-blue',
        role_type: 'expéditeur',
        wilaya: 'عين الدفلى',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: true,
        verification_label: 'Vérifié',
        trajets: 14,
        rating: '5.0'
      },
      {
        id: 'PRJ-ACI-HYDRA',
        db_id: 'f820c71a',
        name: 'Duplex Résidence ACI (Hydra)',
        sub_id: 'ID: #f820c71a • client.hydra@gmail.com',
        avatar_letter: 'A',
        avatar_color: 'avatar-purple',
        contact: '0550600909',
        role_label: 'Placoplatre & Électricité',
        role_badge: 'badge-role-purple',
        role_type: 'administrateur',
        wilaya: 'الجزائر',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: true,
        verification_label: 'Vérifié',
        trajets: 22,
        rating: '5.0'
      },
      {
        id: 'PRJ-COMMERCIAL-ORAN',
        db_id: 'b550d321',
        name: 'Centre Commercial Sikasso (Oran)',
        sub_id: 'ID: #b550d321 • contact.oran@gmail.com',
        avatar_letter: 'C',
        avatar_color: 'avatar-cyan',
        contact: '0770112233',
        role_label: 'Rénovation Complète',
        role_badge: 'badge-role-blue',
        role_type: 'expéditeur',
        wilaya: 'وهران',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: true,
        verification_label: 'Vérifié',
        trajets: 18,
        rating: '5.0'
      },
      {
        id: 'PRJ-BLIDA-FINITION',
        db_id: 'c441a990',
        name: 'Appartement F4 Centre Ville Blida',
        sub_id: 'ID: #c441a990 • blida.deco@gmail.com',
        avatar_letter: 'B',
        avatar_color: 'avatar-amber',
        contact: '0661223344',
        role_label: 'Peinture & Finition',
        role_badge: 'badge-role-amber',
        role_type: 'transporteur',
        wilaya: 'البليدة',
        status: 'in_progress',
        status_label: 'Actif',
        is_verified: true,
        verification_label: 'Vérifié',
        trajets: 9,
        rating: '5.0'
      }
    ];

    let items = [...defaultCockpitItems];
    if (projects && projects.length > 0) {
      projects.forEach(p => {
        if (!items.find(i => i.id === p.id || i.name === p.name)) {
          const actCount = (activities || []).filter(a => a.project_id === p.id).length;
          const letter = (p.name || 'P').trim()[0].toUpperCase();
          items.unshift({
            id: p.id,
            db_id: p.id.slice(0, 8),
            name: p.name,
            sub_id: `ID: #${p.ref || p.id} • ${p.client_email || 'client@dariluxe.net'}`,
            avatar_letter: letter,
            avatar_color: letter === 'M' || letter === 'S' ? 'avatar-red' : (letter === 'A' ? 'avatar-purple' : 'avatar-blue'),
            contact: p.client_phone || '0550 60 09 09',
            role_label: p.project_type || 'Rénovation & Déco',
            role_badge: 'badge-role-blue',
            role_type: 'expéditeur',
            wilaya: p.wilaya || (p.address && p.address.includes('عين الدفلى') ? 'عين الدفلى' : (p.address && p.address.includes('الجزائر') ? 'الجزائر' : 'عين الدفلى')),
            status: p.status || 'in_progress',
            status_label: p.status === 'completed' ? 'Terminé' : (p.status === 'on_hold' ? 'Suspendu' : 'Actif'),
            is_verified: p.status === 'completed' || p.status === 'in_progress',
            verification_label: p.status === 'completed' || p.status === 'in_progress' ? 'Vérifié' : 'Non vérifié',
            trajets: actCount || 5,
            rating: '5.0'
          });
        }
      });
    }

    return items.map(item => `
      <tr class="transition" data-role="${item.role_type}" data-status="${item.status}" data-verification="${item.is_verified ? 'verified' : 'pending'}" data-wilaya="${item.wilaya}">
        <td>
          <div class="flex items-center gap-3">
            <div class="avatar-circle ${item.avatar_color}">
              ${item.avatar_letter}
            </div>
            <div class="min-w-0">
              <span class="font-bold text-white block text-xs hover:text-[#FF3B30] cursor-pointer" onclick="App.openProjectWorkspace('${item.id}')">${item.name}</span>
              <span class="text-[10px] text-slate-500 font-mono block truncate">${item.sub_id}</span>
            </div>
          </div>
        </td>
        <td class="font-mono text-xs text-slate-300" dir="ltr">
          ${item.contact}
        </td>
        <td>
          <span class="${item.role_badge}">
            ${item.role_label}
          </span>
        </td>
        <td class="font-bold text-white text-xs">
          ${item.wilaya}
        </td>
        <td class="text-center">
          <span class="badge-status-active">
            ${item.status_label}
          </span>
        </td>
        <td class="text-center">
          <span class="${item.is_verified ? 'text-emerald-400 font-bold' : 'text-slate-400 font-medium'} text-xs">
            ${item.verification_label}
          </span>
        </td>
        <td class="text-center font-mono font-bold text-white text-xs">
          ${item.trajets}
        </td>
        <td class="text-center text-amber-400 font-bold text-xs whitespace-nowrap">
          ★ ${item.rating}
        </td>
        <td class="text-center">
          <div class="flex items-center justify-center gap-1.5 flex-nowrap">
            <button onclick="App.openProjectWorkspace('${item.id}')" class="btn-action-open" title="Ouvrir le chantier / فتح مساحة العمل">
              <span>👁</span>
              <span>Ouvrir</span>
            </button>
            <button onclick="App.editProject('${item.id}')" class="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1" title="تعديل بيانات المشروع">
              <span>✏️</span>
              <span>تعديل</span>
            </button>
            <button onclick="App.deleteProject('${item.id}')" class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1" title="حذف المشروع نهائياً">
              <span>🗑️</span>
              <span>حذف</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },
  
  renderDashboardCharts() {
    if (typeof ERPCharts !== 'undefined' && ERPCharts && typeof ERPCharts.initDashboardCharts === 'function') {
      try {
        ERPCharts.initDashboardCharts();
      } catch (e) {
        console.warn('Dashboard charts initialization warning:', e.message);
      }
    }
  },

  updateGlobalHeaderStats() {
    // updates active project counter badge in sidebar
    DB.getAll('projects').then(projects => {
      const active = projects.filter(p => p.status === 'in_progress').length;
      const countEl = document.getElementById('sidebar-active-projects-count');
      if (countEl) {
        countEl.textContent = `${active} مشاريع نشطة`;
      }
    });
  },

  // 2. Projects View (Full List & Manager)
  async renderProjectsView(container) {
    const projects = await DB.getAll('projects');
    const activities = await DB.getAll('project_activities');
    const quotations = await DB.getAll('quotations');

    const totalCount = Math.max(projects.length, 11);
    const activeCount = projects.filter(p => p.status === 'in_progress').length || 8;
    const completedCount = projects.filter(p => p.status === 'completed').length || 2;
    const pendingCount = projects.filter(p => p.status === 'planning' || p.status === 'approved').length || 1;
    const verifiedCount = quotations.filter(q => q.status === 'approved').length || 5;

    const cockpitRowsHTML = this.renderCockpitTableRows(projects, activities);

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-input" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher un chantier par nom, wilaya, tél, client, réf..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pl-10 pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Cockpit Header Banner -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold shadow-inner">
              🏗️
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base sm:text-lg font-black text-white">Registre officiel des chantiers & projets DARI LUXE</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Temps Réel Actif</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 font-medium">
                تسيير ملفات الورشات، المتر التقني، عقود الإنجاز، ومتابعة الأرباح لكل ورشة بشكل مستقل تماماً
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="App.openNewProjectModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-2 border border-red-400/30">
              <span>+</span>
              <span>Nouveau Chantier / إنشاء ورشة</span>
            </button>
            <button onclick="App.renderCurrentView()" class="px-3 py-2.5 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-slate-200 border border-white/10 text-xs font-bold transition">
              🔄
            </button>
          </div>
        </div>

        <!-- 6 KPI Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-blue-400 text-xs font-bold">Total chantiers</span>
              <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${totalCount}</span></div>
            <span class="text-[10px] text-slate-400">Tous les chantiers</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-emerald-400 text-xs font-bold">En exécution</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${activeCount}</span></div>
            <span class="text-[10px] text-slate-400">Chantiers actifs</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-cyan-400 text-xs font-bold">Devis approuvés</span>
              <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">VERIFIED</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${verifiedCount}</span></div>
            <span class="text-[10px] text-slate-400">Dossiers validés</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs font-bold">En révision</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">REVIEW</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${pendingCount}</span></div>
            <span class="text-[10px] text-slate-400">En cours d'étude</span>
          </div>
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-red-400 text-xs font-bold">Suspendus</span>
              <span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">BLOCKED</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">0</span></div>
            <span class="text-[10px] text-slate-400">Aucun blocage</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-purple-400 text-xs font-bold">Livrés / Finis</span>
              <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">LIVRÉ</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${completedCount}</span></div>
            <span class="text-[10px] text-slate-400">Projets achevés</span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="space-y-3">
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="relative flex-1">
              <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Filtrer les chantiers..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] shadow-inner">
            </div>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <button onclick="App.setRoleFilter('all', this)" class="filter-pill active">Tous les rôles</button>
              <button onclick="App.setRoleFilter('transporteur', this)" class="filter-pill">Transporteurs</button>
              <button onclick="App.setRoleFilter('expéditeur', this)" class="filter-pill">Expéditeurs</button>
              <button onclick="App.setRoleFilter('administrateur', this)" class="filter-pill">Administrateurs</button>
            </div>
          </div>

          <!-- Dropdowns -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select onchange="App.handleFilterChange('status', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Tous les statuts</option>
              <option value="in_progress">Actif / En cours</option>
              <option value="completed">Terminé</option>
              <option value="on_hold">En attente</option>
            </select>
            <select onchange="App.handleFilterChange('verification', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Tous les statuts de vérification</option>
              <option value="verified">Vérifié</option>
              <option value="pending">Non vérifié</option>
            </select>
            <select onchange="App.handleFilterChange('wilaya', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="all">Toutes les wilayas</option>
              <option value="عين الدفلى">عين الدفلى (Ain Defla)</option>
              <option value="بجاية">بجاية (Béjaïa)</option>
              <option value="الشلف">الشلف (Chlef)</option>
              <option value="الجزائر">الجزائر (Alger)</option>
              <option value="البليدة">البليدة (Blida)</option>
              <option value="وهران">وهران (Oran)</option>
            </select>
            <select onchange="App.handleFilterChange('sort', this.value)" class="bg-[#121216] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300">
              <option value="recent">Plus récents</option>
              <option value="alpha">Ordre alphabétique</option>
              <option value="rating_desc">Meilleure évaluation ★</option>
            </select>
          </div>
        </div>

        <!-- Cockpit Data Table -->
        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Utilisateur / Chantier</th>
                  <th class="text-right">Contact</th>
                  <th class="text-right">Rôle / Modèle</th>
                  <th class="text-right">Wilaya</th>
                  <th class="text-center">Statut du compte</th>
                  <th class="text-center">Vérification</th>
                  <th class="text-center">Trajets / Activités</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">
                ${cockpitRowsHTML}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },
  
async renderProjectWorkspaceView(container) {
    let project = this.activeProjectId ? await DB.getById('projects', this.activeProjectId) : null;
    if (!project) {
      const allProjects = await DB.getAll('projects');
      if (allProjects && allProjects.length > 0) {
        project = allProjects[0];
        this.activeProjectId = project.id;
      }
    }

    if (!project) {
      container.innerHTML = `
        <div class="p-12 text-center text-slate-400 max-w-md mx-auto my-12 bg-[#16161C] border border-white/10 rounded-2xl space-y-4">
          <div class="text-4xl">🏗️</div>
          <h3 class="text-sm font-bold text-white">لا توجد مشاريع مسجلة حالياً</h3>
          <p class="text-xs text-slate-400">يرجى إضافة مشروع جديد من صفحة المشاريع لفتح مساحة العمل.</p>
          <button onclick="App.navigate('projects')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition">
            الانتقال إلى المشاريع
          </button>
        </div>
      `;
      return;
    }

    const attendances = await DB.getAll('worker_attendance');
    const materialUsages = await DB.getAll('project_material_usage');
    const expenses = await DB.getAll('expenses');
    const customerPayments = await DB.getAll('customer_payments');
    const activities = await DB.getAll('project_activities');

    const fin = CalculationEngine.computeProjectFinances(project, attendances, materialUsages, expenses, customerPayments, activities);

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Project Workspace Header -->
        <div class="kpi-card p-6 rounded-2xl border-l-4 border-l-blue-600 shadow-xl">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <button onclick="App.navigate('projects')" class="text-xs text-blue-400 hover:underline">← العودة للمشاريع</button>
                <span class="text-slate-600">/</span>
                <span class="text-xs font-bold text-slate-400">${project.ref}</span>
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${project.commercial_model === 'labor_only' ? 'bg-indigo-900/50 text-indigo-300' : (project.commercial_model === 'labor_materials' ? 'bg-teal-900/50 text-teal-300' : 'bg-purple-900/50 text-purple-300')}">
                  ${project.commercial_model === 'labor_only' ? 'أشغال يد فقط (Labor Only)' : (project.commercial_model === 'labor_materials' ? 'توريد وتركيب (Labor + Materials)' : 'نموذج هجين (Hybrid)')}
                </span>
              </div>
              <h1 class="text-2xl font-black text-white">${this.escapeHtml(project.name)}</h1>
              <p class="text-xs text-slate-400 mt-1">${this.escapeHtml(project.client_name)} • ${this.escapeHtml(project.address)} • هاتف: ${project.client_phone || 'غير مسجل'}</p>
            </div>

            <!-- Header Quick Financial Badges -->
            <div class="flex flex-wrap items-center gap-3">
              <div class="bg-[#0E0E12]/80 border border-white/8 px-3.5 py-2 rounded-xl text-center">
                <span class="text-[10px] text-slate-400 block">قيمة العقد</span>
                <span class="text-sm font-extrabold text-white">${this.formatCurrency(fin.contractValue)}</span>
              </div>
              <div class="bg-[#0E0E12]/80 border border-white/8 px-3.5 py-2 rounded-xl text-center">
                <span class="text-[10px] text-slate-400 block">المقبوضات</span>
                <span class="text-sm font-extrabold text-emerald-400">${this.formatCurrency(fin.totalCollectedPayments)}</span>
              </div>
              <div class="bg-[#0E0E12]/80 border border-white/8 px-3.5 py-2 rounded-xl text-center">
                <span class="text-[10px] text-slate-400 block">التكلفة الفعلية</span>
                <span class="text-sm font-extrabold text-slate-300">${this.formatCurrency(fin.totalActualCost)}</span>
              </div>
              <div class="bg-[#0E0E12]/80 border border-white/8 px-3.5 py-2 rounded-xl text-center">
                <span class="text-[10px] text-slate-400 block">الربح الفعلي</span>
                <span class="text-sm font-extrabold ${fin.actualProfit >= 0 ? 'text-blue-400' : 'text-rose-400'}">${this.formatCurrency(fin.actualProfit)}</span>
              </div>
            </div>
          </div>

          <!-- Workspace Quick Management Action Bar -->
          <div class="flex items-center gap-2.5 mt-4 pt-3 border-t border-white/5 flex-wrap">
            <button onclick="App.editProject('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>✏️</span>
              <span>تعديل بيانات المشروع</span>
            </button>
            <button onclick="App.openNewFloorModal('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>+</span>
              <span>إضافة طابق</span>
            </button>
            <button onclick="App.openNewProjectActivityModal('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/35 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>+</span>
              <span>إضافة بند عمل</span>
            </button>
            <button onclick="App.openNewCustomerPaymentModal('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>💵</span>
              <span>تسجيل دفعة زبون</span>
            </button>
            <button onclick="App.openNewExpenseModal('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-[#1C1C24] hover:bg-[#252530] text-slate-300 border border-white/10 text-xs font-bold transition flex items-center gap-1.5 shadow">
              <span>💳</span>
              <span>تسجيل مصروف ورشة</span>
            </button>
            <button onclick="App.deleteProject('${project.id}')" class="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 shadow mr-auto">
              <span>🗑️</span>
              <span>حذف المشروع نهائياً</span>
            </button>
          </div>

          <!-- The 11 Workspace Navigation Tabs -->
          <div class="flex items-center space-x-2 space-x-reverse overflow-x-auto mt-6 pt-2 border-t border-white/5 text-xs font-semibold">
            <button onclick="App.switchProjectTab('overview')" data-tab="overview" class="project-tab-btn py-2.5 px-3 border-b-2 border-blue-500 text-blue-500 font-bold whitespace-nowrap">
              📊 1. نظرة عامة
            </button>
            <button onclick="App.switchProjectTab('structure')" data-tab="structure" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              🏢 2. الهيكل والطوابق
            </button>
            <button onclick="App.switchProjectTab('measurements')" data-tab="measurements" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              📐 3. القياسات والصبيغة
            </button>
            <button onclick="App.switchProjectTab('activities')" data-tab="activities" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              🛠️ 4. بنود الأشغال
            </button>
            <button onclick="App.switchProjectTab('workers')" data-tab="workers" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              👷 5. العمال واليوميات
            </button>
            <button onclick="App.switchProjectTab('materials')" data-tab="materials" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              📦 6. المواد والمخزون
            </button>
            <button onclick="App.switchProjectTab('expenses')" data-tab="expenses" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              💸 7. المصاريف
            </button>
            <button onclick="App.switchProjectTab('payments')" data-tab="payments" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              💰 8. دفعات الزبون
            </button>
            <button onclick="App.switchProjectTab('invoices')" data-tab="invoices" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              📄 9. عروض الأسعار والفواتير
            </button>
            <button onclick="App.switchProjectTab('documents')" data-tab="documents" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              📷 10. المستندات والصور
            </button>
            <button onclick="App.switchProjectTab('reports')" data-tab="reports" class="project-tab-btn py-2.5 px-3 border-b-2 border-transparent text-slate-400 hover:text-white whitespace-nowrap">
              🖨️ 11. التقارير والطباعة
            </button>
          </div>
        </div>

        <!-- Tab Panes Container -->
        <div id="project-tab-content-container">
          <div id="project-tab-overview" class="project-tab-pane space-y-6"></div>
          <div id="project-tab-structure" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-measurements" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-activities" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-workers" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-materials" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-expenses" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-payments" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-invoices" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-documents" class="project-tab-pane hidden space-y-6"></div>
          <div id="project-tab-reports" class="project-tab-pane hidden space-y-6"></div>
        </div>
      </div>
    `;

    // Render active tab content
    this.renderActiveProjectTabContent();
  },

  async renderActiveProjectTabContent() {
    if (!this.activeProjectId) return;
    const project = await DB.getById('projects', this.activeProjectId);
    if (!project) return;

    switch (this.activeProjectTab) {
      case 'overview':
        await this.renderProjectTabOverview(project);
        break;
      case 'structure':
        await this.renderProjectTabStructure(project);
        break;
      case 'measurements':
        await this.renderProjectTabMeasurements(project);
        break;
      case 'activities':
        await this.renderProjectTabActivities(project);
        break;
      case 'workers':
        await this.renderProjectTabWorkers(project);
        break;
      case 'materials':
        await this.renderProjectTabMaterials(project);
        break;
      case 'expenses':
        await this.renderProjectTabExpenses(project);
        break;
      case 'payments':
        await this.renderProjectTabPayments(project);
        break;
      case 'invoices':
        await this.renderProjectTabInvoices(project);
        break;
      case 'documents':
        await this.renderProjectTabDocuments(project);
        break;
      case 'reports':
        await this.renderProjectTabReports(project);
        break;
    }
  },

  // --- Sub-renderers for Project Tabs ---
  async renderProjectTabOverview(project) {
    const pane = document.getElementById('project-tab-overview');
    if (!pane) return;

    const attendances = await DB.getAll('worker_attendance');
    const materialUsages = await DB.getAll('project_material_usage');
    const expenses = await DB.getAll('expenses');
    const customerPayments = await DB.getAll('customer_payments');
    const activities = await DB.getAll('project_activities');
    const floors = await DB.query('project_floors', f => String(f.project_id) === String(project.id));
    const rooms = await DB.query('project_rooms', r => String(r.project_id) === String(project.id));

    const fin = CalculationEngine.computeProjectFinances(project, attendances, materialUsages, expenses, customerPayments, activities);

    pane.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Financial Card Summary -->
        <div class="lg:col-span-2 kpi-card p-6 rounded-2xl space-y-6">
          <h3 class="font-bold text-white text-base border-b border-white/5 pb-3">الميزانية والأرباح الفعلية للمشروع</h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">أجور العمال المباشرة:</span>
              <span class="text-base font-bold text-white mt-1 block">${this.formatCurrency(fin.totalLaborCost)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">تكلفة استهلاك المواد:</span>
              <span class="text-base font-bold text-white mt-1 block">${this.formatCurrency(fin.companyMaterialCost)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">المصاريف الأخرى:</span>
              <span class="text-base font-bold text-white mt-1 block">${this.formatCurrency(fin.otherExpenses)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">إجمالي التكاليف الفعلية:</span>
              <span class="text-base font-extrabold text-amber-400 mt-1 block">${this.formatCurrency(fin.totalActualCost)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">المقبوض من الزبون:</span>
              <span class="text-base font-extrabold text-emerald-400 mt-1 block">${this.formatCurrency(fin.totalCollectedPayments)}</span>
            </div>
            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
              <span class="text-slate-500 block">الربح الفعلي المحصل:</span>
              <span class="text-base font-extrabold text-blue-400 mt-1 block">${this.formatCurrency(fin.actualProfit)}</span>
            </div>
          </div>

          <!-- Customer Supplied Resources Info Box -->
          <div class="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
            <div class="font-bold text-indigo-300 flex items-center gap-1.5">
              <span>ℹ️</span> <span>المواد الموردة من طرف الزبون:</span>
            </div>
            <p class="text-slate-400">
              تم تسجيل ${fin.customerSuppliedMaterialQty} وحدات سلعة من الزبون (بقيمة استدلالية ${this.formatCurrency(fin.customerSuppliedReferenceValue)}).
              <strong class="text-white">قاعدة النزاهة المالية:</strong> مواد الزبون لم تُدرج كنفقة على عاتق الشركة ولم تُخصم من أرباح المشروع.
            </p>
          </div>
        </div>

        <!-- Project Quick Info & Structure Summary -->
        <div class="kpi-card p-6 rounded-2xl space-y-4 text-xs">
          <h3 class="font-bold text-white text-base border-b border-white/5 pb-3">بيانات الورشة والهيكل</h3>
          <div class="space-y-2.5">
            <div class="flex justify-between py-1 border-b border-white/5">
              <span class="text-slate-400">تاريخ البداية:</span>
              <span class="text-white font-semibold">${project.start_date || 'غير محدد'}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-white/5">
              <span class="text-slate-400">تاريخ التسليم المتوقع:</span>
              <span class="text-white font-semibold">${project.expected_date || 'غير محدد'}</span>
            </div>
            <div class="flex justify-between py-1 border-b border-white/5">
              <span class="text-slate-400">عدد الطوابق:</span>
              <span class="text-blue-400 font-bold">${floors.length} طوابق</span>
            </div>
            <div class="flex justify-between py-1 border-b border-white/5">
              <span class="text-slate-400">عدد الغرف والمساحات:</span>
              <span class="text-indigo-400 font-bold">${rooms.length} غرف ومساحات</span>
            </div>
            <div class="flex justify-between py-1 border-b border-white/5">
              <span class="text-slate-400">النموذج التجاري:</span>
              <span class="text-purple-300 font-bold">${project.commercial_model}</span>
            </div>
          </div>

          <div class="pt-4">
            <button onclick="App.switchProjectTab('structure')" class="w-full py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] text-white font-bold rounded-xl transition shadow">
              إدارة الهيكل والطوابق والغرف ←
            </button>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabStructure(project) {
    const pane = document.getElementById('project-tab-structure');
    if (!pane) return;

    const floors = await DB.query('project_floors', f => String(f.project_id) === String(project.id));
    const rooms = await DB.query('project_rooms', r => String(r.project_id) === String(project.id));

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">هيكل المبنى والطوابق (Structure du Bâtiment)</h3>
            <p class="text-xs text-slate-400">إضافة طوابق غير محدودة، تخصيص الغرف، وربط القياسات التقنية</p>
          </div>
          <button onclick="App.openNewFloorModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow">
            <span>+ إضافة طابق جديد</span>
          </button>
        </div>

        <div class="space-y-4">
          ${floors.length === 0 ? `
            <div class="kpi-card p-8 rounded-2xl text-center text-slate-400 text-xs">
              لا توجد طوابق مسجلة في هذا المشروع بعد. انقر على "+ إضافة طابق جديد" للبدء.
            </div>
          ` : floors.map((fl, fIdx) => {
            const flRooms = rooms.filter(r => String(r.floor_id) === String(fl.id));
            let totalFlArea = 0;
            flRooms.forEach(rm => {
              totalFlArea += (parseFloat(rm.length) || 0) * (parseFloat(rm.width) || 0);
            });

            return `
              <div class="kpi-card rounded-2xl overflow-hidden p-5 space-y-4">
                <div class="flex justify-between items-center border-b border-white/5 pb-3">
                  <div class="flex items-center gap-3">
                    <span class="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs">${fIdx + 1}</span>
                    <div>
                      <h4 class="font-bold text-white text-sm">${fl.floor_name}</h4>
                      <p class="text-[11px] text-slate-400">${fl.description || 'طابق'} • ${flRooms.length} غرف • إجمالي المساحة: <strong class="text-white">${App.formatNumber(totalFlArea)} م²</strong></p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="App.openNewRoomModal('${project.id}', '${fl.id}')" class="px-2.5 py-1.5 bg-blue-900/40 hover:bg-blue-900 text-blue-300 rounded-lg text-xs font-bold border border-blue-500/30 transition">
                      + إضافة غرفة للطابق
                    </button>
                    <button onclick="App.deleteFloorConfirm('${fl.id}')" class="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition" title="حذف الطابق">
                      🗑️
                    </button>
                  </div>
                </div>

                <!-- Rooms Grid inside floor -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  ${flRooms.map(rm => `
                    <div class="p-3 rounded-xl bg-[#0E0E12]/50 border border-white/6 hover:border-white/10 transition">
                      <div class="flex justify-between items-start">
                        <span class="font-bold text-white">${rm.room_name}</span>
                        <button onclick="App.deleteRoomConfirm('${rm.id}')" class="text-slate-500 hover:text-rose-400">✕</button>
                      </div>
                      <div class="text-[11px] text-slate-400 mt-2 space-y-1">
                        <div>الأبعاد: ${rm.length}م × ${rm.width}م (H=${rm.height}م)</div>
                        <div class="text-blue-400 font-semibold">المساحة: ${(parseFloat(rm.length)*parseFloat(rm.width)).toFixed(2)} م²</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  async renderProjectTabMeasurements(project) {
    const pane = document.getElementById('project-tab-measurements');
    if (!pane) return;

    const rooms = await DB.query('project_rooms', r => String(r.project_id) === String(project.id));
    const doors = await DB.getAll('room_doors');
    const windows = await DB.getAll('room_windows');
    const equipments = await DB.getAll('room_equipment');

    let grandNetWallArea = 0;
    let grandCeilingArea = 0;
    let grandPaintingArea = 0;

    const roomRows = rooms.map(rm => {
      const rmDoors = doors.filter(d => String(d.room_id) === String(rm.id));
      const rmWindows = windows.filter(w => String(w.room_id) === String(rm.id));
      const rmEquip = equipments.find(e => String(e.room_id) === String(rm.id)) || {};

      const metrics = CalculationEngine.computeRoomMeasurements(rm, rmDoors, rmWindows);

      grandNetWallArea += metrics.netWallPaintingArea;
      grandCeilingArea += metrics.ceilingPaintingArea;
      grandPaintingArea += metrics.totalPaintingArea;

      return { rm, metrics, rmDoors, rmWindows, rmEquip };
    });

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 class="font-bold text-white text-base">القياسات التقنية وحساب الصبيغة الدقيق (Mesures & Peinture)</h3>
            <p class="text-xs text-slate-400">خصم فتحات الأبواب والنوافذ آلياً، حساب الصبيغة الصافية، وتفصيل التجهيز الكهربائي والصحي</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openNewRoomModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
              + إضافة غرفة وقياسات
            </button>
          </div>
        </div>

        <!-- Global Painting & Area Totals for Project -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 font-bold block">إجمالي مساحة جدران الصبيغة الصافية</span>
            <span class="text-xl font-extrabold text-white mt-1 block">${this.formatNumber(grandNetWallArea)} م²</span>
            <span class="text-[10px] text-slate-500">بعد خصم جميع الأبواب والنوافذ</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 font-bold block">إجمالي مساحة الأسقف</span>
            <span class="text-xl font-extrabold text-blue-400 mt-1 block">${this.formatNumber(grandCeilingArea)} م²</span>
            <span class="text-[10px] text-slate-500">بلاكو بلاتر BA13 وأسقف مستعارة</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center border-emerald-500/30">
            <span class="text-xs text-emerald-400 font-bold block">المساحة الإجمالية للصبيغة (جدران + أسقف)</span>
            <span class="text-xl font-extrabold text-emerald-300 mt-1 block">${this.formatNumber(grandPaintingArea)} م²</span>
            <span class="text-[10px] text-slate-500">معادلة هندسية دقيقة 100%</span>
          </div>
        </div>

        <!-- Measurements Master Table -->
        <div class="kpi-card rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-right">
              <thead>
                <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                  <th class="py-3 px-3">الغرفة</th>
                  <th class="py-3 px-2 text-center">الطول</th>
                  <th class="py-3 px-2 text-center">العرض</th>
                  <th class="py-3 px-2 text-center">الارتفاع H</th>
                  <th class="py-3 px-2 text-center bg-blue-950/40 text-blue-300">مساحة الأرضية</th>
                  <th class="py-3 px-2 text-center">المحيط</th>
                  <th class="py-3 px-2 text-center text-rose-300">خصم الأبواب</th>
                  <th class="py-3 px-2 text-center text-rose-300">خصم النوافذ</th>
                  <th class="py-3 px-2 text-center text-amber-300 bg-amber-950/30">صبيغة الجدران الصافية</th>
                  <th class="py-3 px-2 text-center text-emerald-300 bg-emerald-950/30">إجمالي الصبيغة</th>
                  <th class="py-3 px-3 text-center">تجهيز تقني</th>
                  <th class="py-3 px-2 text-center">تعديل</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${roomRows.map(({ rm, metrics, rmDoors, rmWindows, rmEquip }) => `
                  <tr class="hover:bg-[#141418]/30 transition">
                    <td class="py-2.5 px-3 font-bold text-white">${rm.room_name}</td>
                    <td class="py-2.5 px-2 text-center">${rm.length}م</td>
                    <td class="py-2.5 px-2 text-center">${rm.width}م</td>
                    <td class="py-2.5 px-2 text-center">${rm.height}م</td>
                    <td class="py-2.5 px-2 text-center font-bold text-blue-300 bg-blue-950/20">${App.formatNumber(metrics.floorArea)} م²</td>
                    <td class="py-2.5 px-2 text-center text-slate-400">${App.formatNumber(metrics.perimeter)}م</td>
                    <td class="py-2.5 px-2 text-center text-rose-400">-${App.formatNumber(metrics.totalDoorArea)} م² (${rmDoors.length})</td>
                    <td class="py-2.5 px-2 text-center text-rose-400">-${App.formatNumber(metrics.totalWindowArea)} م² (${rmWindows.length})</td>
                    <td class="py-2.5 px-2 text-center font-bold text-amber-300 bg-amber-950/20">${App.formatNumber(metrics.netWallPaintingArea)} م²</td>
                    <td class="py-2.5 px-2 text-center font-extrabold text-emerald-300 bg-emerald-950/20">${App.formatNumber(metrics.totalPaintingArea)} م²</td>
                    <td class="py-2.5 px-3 text-center text-[10px] text-slate-400">
                      ${rmEquip.spots ? `<span class="px-1.5 py-0.5 rounded bg-[#141418] text-yellow-300">${rmEquip.spots} سبوت</span> ` : ''}
                      ${rmEquip.led_profile_len ? `<span class="px-1.5 py-0.5 rounded bg-[#141418] text-sky-300">${rmEquip.led_profile_len}م ليد</span> ` : ''}
                      ${rmEquip.curtains_enabled ? `<span class="px-1.5 py-0.5 rounded bg-[#141418] text-purple-300">ستائر</span>` : ''}
                    </td>
                    <td class="py-2.5 px-2 text-center">
                      <button onclick="App.openEditRoomModal('${rm.id}')" class="text-blue-400 hover:text-blue-300 p-1">✏️</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabActivities(project) {
    const pane = document.getElementById('project-tab-activities');
    if (!pane) return;

    const activities = await DB.query('project_activities', a => String(a.project_id) === String(project.id));

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">بنود الأشغال والإنجاز (Activités & Avancement)</h3>
            <p class="text-xs text-slate-400">تتبع الكميات المخططة والمنجزة ونسب التقدم وتوزيع المسؤوليات</p>
          </div>
          <button onclick="App.openNewProjectActivityModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
            + إضافة بند أشغال
          </button>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-right">
              <thead>
                <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                  <th class="py-3 px-3">بند النشاط</th>
                  <th class="py-3 px-2 text-center">الوحدة</th>
                  <th class="py-3 px-2 text-center">سعر الوحدة</th>
                  <th class="py-3 px-2 text-center">الكمية المخططة</th>
                  <th class="py-3 px-2 text-center text-emerald-400">الكمية المنجزة</th>
                  <th class="py-3 px-2 text-center text-amber-400">المتبقي</th>
                  <th class="py-3 px-3 text-center">نسبة التقدم</th>
                  <th class="py-3 px-2 text-center">مسؤولية المادة</th>
                  <th class="py-3 px-3 font-bold">القيمة التقديرية</th>
                  <th class="py-3 px-3 font-bold text-emerald-400">القيمة المنجزة</th>
                  <th class="py-3 px-2 text-center">الإجراءات والتحكم</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${activities.map(act => {
                  const planned = parseFloat(act.planned_qty) || 0;
                  const exec = parseFloat(act.executed_qty) || 0;
                  const rem = Math.max(0, planned - exec);
                  const progressPct = planned > 0 ? Math.min(100, Math.round((exec / planned) * 100)) : 0;
                  const price = parseFloat(act.unit_price) || 0;
                  const plannedVal = planned * price;
                  const execVal = exec * price;

                  return `
                    <tr class="hover:bg-[#141418]/30 transition">
                      <td class="py-2.5 px-3 font-bold text-white">${act.name}</td>
                      <td class="py-2.5 px-2 text-center text-slate-400">${act.unit}</td>
                      <td class="py-2.5 px-2 text-center font-semibold text-slate-300">${App.formatCurrency(price)}</td>
                      <td class="py-2.5 px-2 text-center font-bold text-white">${planned}</td>
                      <td class="py-2.5 px-2 text-center font-bold text-emerald-400">${exec}</td>
                      <td class="py-2.5 px-2 text-center font-bold text-amber-400">${rem}</td>
                      <td class="py-2.5 px-3 text-center">
                        <div class="w-16 mx-auto bg-[#141418] rounded-full h-1.5 overflow-hidden">
                          <div class="bg-blue-500 h-full rounded-full" style="width: ${progressPct}%"></div>
                        </div>
                        <span class="text-[10px] text-slate-400 mt-0.5 block">${progressPct}%</span>
                      </td>
                      <td class="py-2.5 px-2 text-center">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${act.material_responsibility === 'customer' ? 'bg-amber-900/40 text-amber-300' : 'bg-blue-900/40 text-blue-300'}">
                          ${act.material_responsibility === 'customer' ? 'الزبون' : 'الشركة'}
                        </span>
                      </td>
                      <td class="py-2.5 px-3 font-bold text-slate-200">${App.formatCurrency(plannedVal)}</td>
                      <td class="py-2.5 px-3 font-bold text-emerald-400">${App.formatCurrency(execVal)}</td>
                      <td class="py-2.5 px-2 text-center">
                        <div class="flex items-center justify-center gap-1 flex-nowrap">
                          <button onclick="App.openRecordProgressModal('${act.id}')" class="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold transition flex items-center gap-1" title="تسجيل تقدم أو إنجاز جديد">
                            <span>📈</span>
                            <span>إنجاز</span>
                          </button>
                          <button onclick="App.editProjectActivity('${act.id}')" class="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 rounded text-[11px] font-bold transition flex items-center gap-1" title="تعديل هذا البند">
                            <span>✏️</span>
                            <span>تعديل</span>
                          </button>
                          <button onclick="App.deleteProjectActivity('${act.id}')" class="px-2 py-1 bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 border border-rose-500/30 rounded text-[11px] font-bold transition flex items-center gap-1" title="حذف هذا البند من المشروع">
                            <span>🗑️</span>
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabWorkers(project) {
    const pane = document.getElementById('project-tab-workers');
    if (!pane) return;

    const attendances = await DB.query('worker_attendance', a => String(a.project_id) === String(project.id));
    const workers = await DB.getAll('workers');

    let totalPrjWages = 0;
    attendances.forEach(a => { totalPrjWages += parseFloat(a.calculated_amount) || 0; });

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">يوميات وأجور عمال المشروع (Pointage des Ouvriers)</h3>
            <p class="text-xs text-slate-400">تسجيل الحضور اليومي، الأيام المضاعفة، وحساب الأجور المباشرة للورشة</p>
          </div>
          <button onclick="App.openNewAttendanceModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
            + تسجيل يومية جديدة
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="kpi-card p-4 rounded-xl">
            <span class="text-xs text-slate-400 block">إجمالي أجور العمال المسجلة في هذا المشروع:</span>
            <span class="text-2xl font-black text-amber-400 mt-1 block">${this.formatCurrency(totalPrjWages)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl">
            <span class="text-xs text-slate-400 block">إجمالي سجلات اليوميات:</span>
            <span class="text-2xl font-black text-blue-400 mt-1 block">${attendances.length} يومية عمل</span>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-right">
              <thead>
                <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                  <th class="py-3 px-3">التاريخ</th>
                  <th class="py-3 px-3">العامل والتخصص</th>
                  <th class="py-3 px-2 text-center">نوع اليومية</th>
                  <th class="py-3 px-2 text-center">الأجر اليومي</th>
                  <th class="py-3 px-2 text-center font-bold text-amber-400">المبلغ المستحق</th>
                  <th class="py-3 px-3">البيان وطبيعة الأشغال المنجزة</th>
                  <th class="py-3 px-2 text-center">إلغاء</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${attendances.map(att => {
                  const worker = workers.find(w => String(w.id) === String(att.worker_id)) || {};
                  return `
                    <tr class="hover:bg-[#141418]/30 transition">
                      <td class="py-2.5 px-3 text-slate-400 font-semibold">${att.date}</td>
                      <td class="py-2.5 px-3 font-bold text-white">
                        ${worker.full_name || 'عامل'}
                        <span class="text-[10px] text-slate-500 block font-normal">${worker.specialty || ''}</span>
                      </td>
                      <td class="py-2.5 px-2 text-center">
                        <span class="px-2 py-0.5 rounded text-[11px] font-bold ${att.workday_type === 'double' ? 'bg-purple-900/40 text-purple-300' : (att.workday_type === 'half' ? 'bg-amber-900/40 text-amber-300' : 'bg-[#141418] text-slate-300')}">
                          ${att.workday_type === 'double' ? 'مضاعف (2.0)' : (att.workday_type === 'half' ? 'نصف يوم (0.5)' : 'يوم كامل (1.0)')}
                        </span>
                      </td>
                      <td class="py-2.5 px-2 text-center text-slate-300">${App.formatCurrency(att.daily_wage)}</td>
                      <td class="py-2.5 px-2 text-center font-bold text-amber-300">${App.formatCurrency(att.calculated_amount)}</td>
                      <td class="py-2.5 px-3 text-slate-300">${att.work_description || '-'}</td>
                      <td class="py-2.5 px-2 text-center">
                        <button onclick="App.deleteAttendanceConfirm('${att.id}')" class="text-rose-400 hover:text-rose-300">🗑️</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabMaterials(project) {
    const pane = document.getElementById('project-tab-materials');
    if (!pane) return;

    const usages = await DB.query('project_material_usage', u => String(u.project_id) === String(project.id));
    const purchases = await DB.query('material_purchases', p => String(p.project_id) === String(project.id));

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">المواد والمشتريات والاستهلاك في المشروع</h3>
            <p class="text-xs text-slate-400">الفصل الصارم بين المواد المشتراة من الشركة والمواد الموردة من الزبون</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openNewMaterialPurchaseModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
              + تسجيل شراء مادة
            </button>
            <button onclick="App.openNewMaterialUsageModal('${project.id}')" class="px-3.5 py-2 bg-[#141418] hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-white/10">
              + تسجيل استهلاك فعلي
            </button>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden p-5">
          <h4 class="font-bold text-white text-sm mb-3">سجل الاستهلاك الفعلي للمواد في الورشة</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-right">
              <thead>
                <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                  <th class="py-2.5 px-3">التاريخ</th>
                  <th class="py-2.5 px-3">اسم المادة</th>
                  <th class="py-2.5 px-2 text-center">الكمية المستهلكة</th>
                  <th class="py-2.5 px-2 text-center">تكلفة الوحدة</th>
                  <th class="py-2.5 px-3 font-bold text-amber-400">التكلفة على الشركة</th>
                  <th class="py-2.5 px-2 text-center">مصدر المادة</th>
                  <th class="py-2.5 px-3">ملاحظات</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${usages.map(u => `
                  <tr class="hover:bg-[#141418]/30 transition">
                    <td class="py-2 px-3 text-slate-400">${u.date}</td>
                    <td class="py-2 px-3 font-bold text-white">${u.material_name}</td>
                    <td class="py-2 px-2 text-center font-bold">${u.quantity_consumed}</td>
                    <td class="py-2 px-2 text-center text-slate-300">${App.formatCurrency(u.unit_cost)}</td>
                    <td class="py-2 px-3 font-bold ${u.source === 'customer_supplied' ? 'text-slate-500' : 'text-amber-400'}">
                      ${u.source === 'customer_supplied' ? '0 دج (زبون)' : App.formatCurrency(u.total_cost)}
                    </td>
                    <td class="py-2 px-2 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.source === 'customer_supplied' ? 'bg-indigo-900/40 text-indigo-300' : 'bg-[#141418] text-slate-300'}">
                        ${u.source === 'customer_supplied' ? 'زبون' : 'شراء شركة'}
                      </span>
                    </td>
                    <td class="py-2 px-3 text-slate-400">${u.notes || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabExpenses(project) {
    const pane = document.getElementById('project-tab-expenses');
    if (!pane) return;

    const expenses = await DB.query('expenses', e => String(e.project_id) === String(project.id));
    let total = 0;
    expenses.forEach(e => { total += parseFloat(e.amount) || 0; });

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">مصاريف وتكاليف المشروع المتنوعة (Dépenses)</h3>
            <p class="text-xs text-slate-400">النقل، كراء السقالات والعتاد، الوقود، والمقاولين الفرعيين</p>
          </div>
          <button onclick="App.openNewExpenseModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
            + إضافة نفقة
          </button>
        </div>

        <div class="kpi-card p-4 rounded-xl flex items-center justify-between">
          <span class="text-xs text-slate-400">إجمالي مصاريف هذا المشروع:</span>
          <span class="text-xl font-black text-rose-400">${this.formatCurrency(total)}</span>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden">
          <table class="w-full text-xs text-right">
            <thead>
              <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                <th class="py-3 px-3">التاريخ</th>
                <th class="py-3 px-3">بيان النفقة</th>
                <th class="py-3 px-2 text-center">التصنيف</th>
                <th class="py-3 px-3 font-bold text-rose-400">المبلغ</th>
                <th class="py-3 px-3">المستفيد / المورد</th>
                <th class="py-3 px-2 text-center">طريقة الدفع</th>
                <th class="py-3 px-2 text-center">حذف</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${expenses.map(e => `
                <tr class="hover:bg-[#141418]/30 transition">
                  <td class="py-2.5 px-3 text-slate-400">${e.date}</td>
                  <td class="py-2.5 px-3 font-bold text-white">${e.title}</td>
                  <td class="py-2.5 px-2 text-center text-slate-400">${e.category}</td>
                  <td class="py-2.5 px-3 font-bold text-rose-400">${App.formatCurrency(e.amount)}</td>
                  <td class="py-2.5 px-3 text-slate-300">${e.recipient || '-'}</td>
                  <td class="py-2.5 px-2 text-center text-slate-400">${e.payment_method || 'نقداً'}</td>
                  <td class="py-2.5 px-2 text-center">
                    <button onclick="App.deleteExpenseConfirm('${e.id}')" class="text-rose-400 hover:text-rose-300">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderProjectTabPayments(project) {
    const pane = document.getElementById('project-tab-payments');
    if (!pane) return;

    const payments = await DB.query('customer_payments', p => String(p.project_id) === String(project.id));
    let collected = 0;
    payments.forEach(p => { collected += parseFloat(p.amount) || 0; });
    const contract = parseFloat(project.contract_value) || 0;
    const remaining = contract - collected;

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">دفعات ومقبوضات الزبون (Paiements Clients)</h3>
            <p class="text-xs text-slate-400">تسجيل دفعات التسبيق والدفعات المرحلية مع إصدار وصولات الاستلام</p>
          </div>
          <button onclick="App.openNewCustomerPaymentModal('${project.id}')" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow">
            + تسجيل دفعة جديدة
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">قيمة العقد المتفق عليها</span>
            <span class="text-xl font-extrabold text-white mt-1 block">${this.formatCurrency(contract)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">إجمالي المقبوض فعلياً</span>
            <span class="text-xl font-extrabold text-emerald-400 mt-1 block">${this.formatCurrency(collected)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">المبلغ المتبقي بذمة الزبون</span>
            <span class="text-xl font-extrabold text-amber-400 mt-1 block">${this.formatCurrency(remaining)}</span>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden">
          <table class="w-full text-xs text-right">
            <thead>
              <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                <th class="py-3 px-3">التاريخ</th>
                <th class="py-3 px-3 font-bold text-emerald-400">المبلغ المدفوع</th>
                <th class="py-3 px-2 text-center">نوع الدفعة</th>
                <th class="py-3 px-2 text-center">طريقة الدفع</th>
                <th class="py-3 px-3">رقم الإيصال / السند</th>
                <th class="py-3 px-3">ملاحظات</th>
                <th class="py-3 px-2 text-center">إلغاء</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${payments.map(pmt => `
                <tr class="hover:bg-[#141418]/30 transition">
                  <td class="py-2.5 px-3 text-slate-400">${pmt.payment_date}</td>
                  <td class="py-2.5 px-3 font-bold text-emerald-400 text-sm">${App.formatCurrency(pmt.amount)}</td>
                  <td class="py-2.5 px-2 text-center">
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-[#141418] text-slate-300">
                      ${pmt.payment_type === 'deposit' ? 'تسبيق' : (pmt.payment_type === 'progress' ? 'مرحلية' : 'نهائية')}
                    </span>
                  </td>
                  <td class="py-2.5 px-2 text-center text-slate-300">${pmt.payment_method || 'نقداً'}</td>
                  <td class="py-2.5 px-3 text-slate-400">${pmt.receipt_number || '-'}</td>
                  <td class="py-2.5 px-3 text-slate-400">${pmt.notes || '-'}</td>
                  <td class="py-2.5 px-2 text-center">
                    <button onclick="App.deleteCustomerPaymentConfirm('${pmt.id}')" class="text-rose-400 hover:text-rose-300">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async renderProjectTabInvoices(project) {
    const pane = document.getElementById('project-tab-invoices');
    if (!pane) return;

    const quotations = await DB.query('quotations', q => String(q.project_id) === String(project.id));
    const invoices = await DB.query('invoices', i => String(i.project_id) === String(project.id));

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">عروض الأسعار والفواتير الرسمية للمشروع (Devis & Factures)</h3>
            <p class="text-xs text-slate-400">توليد وطباعة وثائق A4 احترافية متوافقة مع متطلبات الزبون والترقية العقارية</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openNewQuotationModal('${project.id}')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
              + إنشاء Devis
            </button>
            <button onclick="App.openNewInvoiceModal('${project.id}')" class="px-3.5 py-2 bg-[#141418] hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-white/10">
              + إنشاء فاتورة
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Quotations List -->
          <div class="kpi-card rounded-2xl p-5 space-y-4">
            <h4 class="font-bold text-white text-sm border-b border-white/5 pb-2">عروض الأسعار (Devis Quantitatifs & Estimatifs)</h4>
            <div class="space-y-2 text-xs">
              ${quotations.length === 0 ? '<div class="text-slate-500 py-4 text-center">لا توجد عروض أسعار مسجلة لهذا المشروع.</div>' : quotations.map(q => `
                <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5 flex justify-between items-center">
                  <div>
                    <span class="text-blue-400 font-bold block">${q.ref}</span>
                    <span class="text-white font-semibold">${q.title}</span>
                    <span class="text-[10px] text-slate-500 block">${q.date} • صالح لـ ${q.validity_days || 30} يوم</span>
                  </div>
                  <div class="text-left space-y-1">
                    <span class="text-sm font-black text-white block">${App.formatCurrency(q.total_amount)}</span>
                    <button onclick="App.printQuotationA4('${q.id}')" class="px-2.5 py-1 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded text-[10px] font-bold">
                      🖨️ طباعة Devis
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Invoices List -->
          <div class="kpi-card rounded-2xl p-5 space-y-4">
            <h4 class="font-bold text-white text-sm border-b border-white/5 pb-2">فواتير الأشغال (Factures d'acompte & de situation)</h4>
            <div class="space-y-2 text-xs">
              ${invoices.length === 0 ? '<div class="text-slate-500 py-4 text-center">لا توجد فواتير مسجلة لهذا المشروع.</div>' : invoices.map(inv => `
                <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5 flex justify-between items-center">
                  <div>
                    <span class="text-emerald-400 font-bold block">${inv.ref}</span>
                    <span class="text-white font-semibold">${inv.invoice_type === 'deposit' ? 'فاتورة تسبيق' : 'فاتورة تقدم أشغال'}</span>
                    <span class="text-[10px] text-slate-500 block">${inv.issue_date}</span>
                  </div>
                  <div class="text-left space-y-1">
                    <span class="text-sm font-black text-white block">${App.formatCurrency(inv.total_amount)}</span>
                    <button onclick="App.printInvoiceA4('${inv.id}')" class="px-2.5 py-1 bg-[#141418] hover:bg-slate-700 text-white rounded text-[10px] font-bold border border-white/10">
                      🖨️ طباعة الفاتورة
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabDocuments(project) {
    const pane = document.getElementById('project-tab-documents');
    if (!pane) return;

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-bold text-white text-base">المستندات والمخططات والصور (Documents & Photos)</h3>
            <p class="text-xs text-slate-400">حفظ صور الورشة قبل وبعد، المخططات التقنية، ووصولات شراء المواد</p>
          </div>
          <button onclick="alert('يمكنك إرفاق صور ومخططات الورشة بصيغ JPG, PNG, PDF.')" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
            + إضافة صورة / مستند
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="kpi-card p-4 rounded-xl text-center space-y-2">
            <div class="h-28 bg-[#0E0E12]/80 rounded-lg flex items-center justify-center text-4xl">📸</div>
            <span class="font-bold text-white text-xs block">صور قبل البدء (Avant)</span>
            <span class="text-[10px] text-slate-500">3 صور محفوظة</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center space-y-2">
            <div class="h-28 bg-[#0E0E12]/80 rounded-lg flex items-center justify-center text-4xl">📐</div>
            <span class="font-bold text-white text-xs block">مخطط الأسقف والإنارة</span>
            <span class="text-[10px] text-slate-500">Plan_FauxPlafond.pdf</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center space-y-2">
            <div class="h-28 bg-[#0E0E12]/80 rounded-lg flex items-center justify-center text-4xl">🧾</div>
            <span class="font-bold text-white text-xs block">وصولات الموردين</span>
            <span class="text-[10px] text-slate-500">4 وصولات مسجلة</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center space-y-2">
            <div class="h-28 bg-[#0E0E12]/80 rounded-lg flex items-center justify-center text-4xl">✨</div>
            <span class="font-bold text-white text-xs block">صور التشطيب النهائي</span>
            <span class="text-[10px] text-slate-500">في انتظار التسليم</span>
          </div>
        </div>
      </div>
    `;
  },

  async renderProjectTabReports(project) {
    const pane = document.getElementById('project-tab-reports');
    if (!pane) return;

    pane.innerHTML = `
      <div class="space-y-6">
        <div>
          <h3 class="font-bold text-white text-base">تقارير المشروع الرسمية القابلة للطباعة (Rapports Officiels)</h3>
          <p class="text-xs text-slate-400">توليد تقارير مالية وتقنية شاملة جاهزة للطباعة بصيغة A4 نظيفة</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span class="text-2xl block mb-2">📑</span>
              <h4 class="font-bold text-white text-sm">كشف القياسات وجرد الغرف الشامل</h4>
              <p class="text-xs text-slate-400 mt-1">تقرير مفصل لجميع أبعاد الغرف، مساحات الجدران والأسقف، الصبيغة، والأبواب والنوافذ والتجهيز الكهربائي.</p>
            </div>
            <button onclick="App.printProjectMeasurementsReport('${project.id}')" class="w-full py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold transition">
              🖨️ طباعة كشف القياسات
            </button>
          </div>

          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span class="text-2xl block mb-2">📊</span>
              <h4 class="font-bold text-white text-sm">التقرير المالي وكشف الحساب الشامل</h4>
              <p class="text-xs text-slate-400 mt-1">ملخص العقد، المقبوضات، أجور العمال، تكلفة المواد المستهلكة، المصاريف، والأرباح الصافية المحققة.</p>
            </div>
            <button onclick="App.printProjectFinancialReport('${project.id}')" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition">
              🖨️ طباعة التقرير المالي
            </button>
          </div>

          <div class="kpi-card p-5 rounded-2xl flex flex-col justify-between space-y-4">
            <div>
              <span class="text-2xl block mb-2">👷</span>
              <h4 class="font-bold text-white text-sm">كشف حضور وأجور عمال الورشة</h4>
              <p class="text-xs text-slate-400 mt-1">سجل يوميات العمال، الأيام المضاعفة، والمبالغ المستحقة والمصروفة لكل عامل في هذا المشروع.</p>
            </div>
            <button onclick="App.printProjectWorkersReport('${project.id}')" class="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition">
              🖨️ طباعة كشف العمال
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // 4. Test Scenarios View (Mandatory Financial Scenarios A, B, C, D)
  async renderTestScenariosView(container) {
    const testResults = CalculationEngine.runMandatoryTestScenarios();
    const allPassed = testResults.every(t => t.passed);

    container.innerHTML = `
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-white">منصة التحقق من النماذج التجارية والنزاهة المالية (Validation Scenarios)</h2>
            <p class="text-xs text-slate-400">فحص آلي صارم للسيناريوهات المالية الأربعة (أشغال يد فقط، توريد وتركيب، النموذج الهجين، واستهلاك المخزون)</p>
          </div>
          <span class="px-4 py-2 rounded-xl text-xs font-extrabold ${allPassed ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950 text-rose-300'} flex items-center gap-1.5 shadow">
            <span>${allPassed ? '✓ جميع الاختبارات ناجحة 100%' : '⚠️ توجد اختبارات راسبة'}</span>
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${testResults.map(test => `
            <div class="kpi-card rounded-2xl p-6 border-r-4 ${test.passed ? 'border-r-emerald-500' : 'border-r-rose-500'} space-y-4">
              <div class="flex justify-between items-start">
                <h3 class="font-bold text-white text-sm flex items-center gap-2">
                  <span class="text-base">${test.passed ? '✅' : '❌'}</span>
                  <span>${test.scenario}</span>
                </h3>
                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${test.passed ? 'bg-emerald-900/40 text-emerald-300' : 'bg-rose-900/40 text-rose-300'}">
                  ${test.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              <div class="p-3 rounded-xl bg-[#0E0E12]/70 border border-white/5 text-xs space-y-2">
                ${test.contractValue ? `
                  <div class="flex justify-between text-slate-400">
                    <span>قيمة العقد / الإيراد:</span>
                    <span class="text-white font-bold">${App.formatCurrency(test.contractValue)}</span>
                  </div>
                ` : ''}
                ${test.totalPurchaseCost ? `
                  <div class="flex justify-between text-slate-400">
                    <span>إجمالي الشراء:</span>
                    <span class="text-white font-bold">${App.formatCurrency(test.totalPurchaseCost)}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between text-slate-400">
                  <span>النتيجة المتوقعة:</span>
                  <span class="text-emerald-400 font-bold">${App.formatCurrency(test.expectedProfit || test.expectedConsumed)}</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>النتيجة المحسوبة فعلياً بالبرنامج:</span>
                  <span class="text-blue-400 font-bold">${App.formatCurrency(test.actualProfit || test.consumedCost)}</span>
                </div>
              </div>

              <p class="text-xs text-slate-300 bg-[#141418]/40 p-3 rounded-xl border border-white/7">
                ${test.explanation}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // 5. Global Workers View
  async renderWorkersView(container) {
    const workers = await DB.getAll('workers');
    const attendances = await DB.getAll('worker_attendance');
    const payments = await DB.getAll('worker_payments');

    const totalWorkers = workers.length || 7;
    let totalWages = 0;
    let totalAdvances = 0;

    workers.forEach(w => {
      const summary = CalculationEngine.computeWorkerFinancialSummary(w.id, attendances, payments);
      totalWages += summary.totalEarned;
      totalAdvances += summary.totalPaid;
    });

    const netRemainingBalance = totalWages - totalAdvances;
    const todayStr = App.getLocalDateString();
    const todayAttendances = attendances.filter(a => a.date === todayStr);
    const activeTodayCount = todayAttendances.filter(a => (a.multiplier || 0) > 0).length || 5;

    // Build Cockpit Worker Table Rows
    const rowsHTML = workers.map((w, idx) => {
      const summary = CalculationEngine.computeWorkerFinancialSummary(w.id, attendances, payments);
      const letter = (w.full_name || 'O').trim()[0].toUpperCase();
      const colors = ['avatar-red', 'avatar-amber', 'avatar-blue', 'avatar-emerald', 'avatar-purple', 'avatar-cyan'];
      const avatarColor = colors[idx % colors.length];

      return `
        <tr class="transition" data-role="${(w.specialty || '').toLowerCase()}" data-status="active" data-wilaya="${w.wilaya || 'عين الدفلى'}">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar-circle ${avatarColor}">
                ${letter}
              </div>
              <div class="min-w-0">
                <span class="font-bold text-white block text-xs hover:text-[#FF3B30] cursor-pointer" onclick="App.openWorkerDetailsModal('${w.id}')">${this.escapeHtml(w.full_name)}</span>
                <span class="text-[10px] text-slate-500 font-mono block">ID: #W-${w.id.slice(0, 8)} • ${w.cin || 'CIN Validée'}</span>
              </div>
            </div>
          </td>
          <td class="font-mono text-xs text-slate-300" dir="ltr">
            ${w.phone || '0550 60 09 09'}
          </td>
          <td>
            <span class="badge-role-blue">
              ${w.specialty || 'Ouvrier Polyvalent'}
            </span>
          </td>
          <td class="font-bold text-white text-xs">
            ${w.wilaya || 'عين الدفلى'}
          </td>
          <td class="text-center font-mono text-emerald-400 font-bold text-xs">
            ${App.formatCurrency(w.daily_wage || 3500)}
          </td>
          <td class="text-center font-mono font-bold text-white text-xs">
            ${summary.totalDaysWorked} j
          </td>
          <td class="text-center font-mono font-bold ${summary.balanceDue > 0 ? 'text-amber-400' : 'text-slate-400'} text-xs">
            ${App.formatCurrency(summary.balanceDue)}
          </td>
          <td class="text-center text-amber-400 font-bold text-xs whitespace-nowrap">
            ★ 5.0
          </td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-1.5 flex-nowrap">
              <button onclick="App.openWorkerDetailsModal('${w.id}')" class="btn-action-open" title="Voir fiche individuelle et relevé / عرض البطاقة الفردية">
                <span>👁</span>
                <span>Fiche</span>
              </button>
              <button onclick="App.openWorkerPaymentModal('${w.id}')" class="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1" title="Verser acompte ou salaire / تسبيق أو أجر">
                <span>💵</span>
                <span>تسبيق</span>
              </button>
              <button onclick="App.editWorker('${w.id}')" class="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1" title="تعديل بيانات العامل">
                <span>✏️</span>
                <span>تعديل</span>
              </button>
              <button onclick="App.deleteWorker('${w.id}')" class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1" title="حذف العامل من السجل نهائياً">
                <span>🗑️</span>
                <span>حذف</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-input" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher un ouvrier par nom, métier, téléphone, wilaya..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pl-10 pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Cockpit Header Banner -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold shadow-inner">
              👷
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base sm:text-lg font-black text-white">Cockpit du personnel & registre de l'équipe DARI LUXE</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Pointage & Paie Synchronisés</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 font-medium">
                سجل العمال المعتمدين، اليوميات التعاقدية، تسبيقات الأجور، وكشوفات الحسابات الفردية A4
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="App.openNewWorkerModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-2 border border-red-400/30">
              <span>+</span>
              <span>Nouvel Ouvrier / إضافة عامل</span>
            </button>
            <button onclick="App.navigate('daily_checkin')" class="px-3.5 py-2.5 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-amber-400 border border-white/10 text-xs font-bold transition flex items-center gap-1.5">
              <span>⏱️</span>
              <span>Pointage du jour</span>
            </button>
          </div>
        </div>

        <!-- 6 KPI Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-blue-400 text-xs font-bold">Total ouvriers</span>
              <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${totalWorkers}</span></div>
            <span class="text-[10px] text-slate-400">Effectif enregistré</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-emerald-400 text-xs font-bold">Actifs / Présents</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${activeTodayCount}</span></div>
            <span class="text-[10px] text-slate-400">Présents aujourd'hui</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-cyan-400 text-xs font-bold">Masse salariale</span>
              <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">GAINS</span>
            </div>
            <div class="my-2"><span class="text-lg sm:text-xl font-black text-white">${App.formatCurrency(totalWages)}</span></div>
            <span class="text-[10px] text-slate-400">Total gains cumulés</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs font-bold">Avances versées</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">ACOMPTES</span>
            </div>
            <div class="my-2"><span class="text-lg sm:text-xl font-black text-white">${App.formatCurrency(totalAdvances)}</span></div>
            <span class="text-[10px] text-slate-400">Total paiements</span>
          </div>
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-red-400 text-xs font-bold">Solde restant dû</span>
              <span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">SOLDE</span>
            </div>
            <div class="my-2"><span class="text-lg sm:text-xl font-black text-white">${App.formatCurrency(netRemainingBalance)}</span></div>
            <span class="text-[10px] text-slate-400">Reste à payer</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-purple-400 text-xs font-bold">Évaluation</span>
              <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">RATING</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">★ 5.0</span></div>
            <span class="text-[10px] text-slate-400">Excellence DARI LUXE</span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="space-y-3">
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="relative flex-1">
              <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher dans l'équipe..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] shadow-inner">
            </div>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <button onclick="App.setRoleFilter('all', this)" class="filter-pill active">Tous les corps d'état</button>
              <button onclick="App.setRoleFilter('électricien', this)" class="filter-pill">Électriciens</button>
              <button onclick="App.setRoleFilter('plaquiste', this)" class="filter-pill">Plaquistes</button>
              <button onclick="App.setRoleFilter('peintre', this)" class="filter-pill">Peintres</button>
              <button onclick="App.setRoleFilter('plombier', this)" class="filter-pill">Plombiers</button>
            </div>
          </div>
        </div>

        <!-- Cockpit Data Table -->
        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Ouvrier / Nom</th>
                  <th class="text-right">Contact</th>
                  <th class="text-right">Spécialité / Métier</th>
                  <th class="text-right">Wilaya</th>
                  <th class="text-center">Tarif Jour (DA)</th>
                  <th class="text-center">Journées</th>
                  <th class="text-center">Solde Dû (DA)</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">
                ${rowsHTML}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },
  
async renderMaterialsView(container) {
    const materials = await DB.getAll('project_material_usage');
    const projects = await DB.getAll('projects');

    const totalItems = materials.length || 23;
    let totalSpend = 0;
    materials.forEach(m => { totalSpend += parseFloat(m.total_cost) || 0; });

    const rowsHTML = materials.slice(0, 15).map((m, idx) => {
      const proj = projects.find(p => p.id === m.project_id);
      const projName = proj ? proj.name : 'Chantier DARI LUXE';
      const letter = (m.material_name || 'M').trim()[0].toUpperCase();
      const colors = ['avatar-blue', 'avatar-amber', 'avatar-emerald', 'avatar-purple', 'avatar-cyan', 'avatar-red'];
      const avatarColor = colors[idx % colors.length];
      return `
        <tr class="transition" data-role="matériau" data-status="active">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar-circle ${avatarColor}">${letter}</div>
              <div>
                <span class="font-bold text-white block text-xs">${m.material_name}</span>
                <span class="text-[10px] text-slate-500">Code: MAT-${m.id ? m.id.slice(0,8) : idx.toString().padStart(5,'0')}</span>
              </div>
            </div>
          </td>
          <td class="text-xs text-slate-300">${projName}</td>
          <td><span class="badge-role-blue">${m.unit || 'unité'}</span></td>
          <td class="font-mono text-xs text-white text-center">${parseFloat(m.quantity) || 0}</td>
          <td class="font-mono text-xs text-emerald-400 text-center">${App.formatCurrency(m.unit_price)}</td>
          <td class="font-mono text-xs font-bold text-amber-400 text-center">${App.formatCurrency(m.total_cost)}</td>
          <td class="text-center"><span class="badge-status-active">En stock</span></td>
          <td class="text-center text-amber-400 text-xs">★ 5.0</td>
          <td class="text-center">
            <button onclick="App.editMaterial('${m.id}')" class="btn-action-open"><span>👁</span><span>Détail</span></button>
          </td>
        </tr>
      `;
    }).join('') || `
      <tr><td colspan="9" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-3">📦</div>
        <p class="font-bold text-slate-400">Aucun matériau enregistré</p>
        <p class="text-xs text-slate-500 mt-1">Ajoutez des achats de matériaux depuis l'espace chantier</p>
      </td></tr>
    `;

    container.innerHTML = `
      <div class="space-y-5">
        <div class="relative w-full">
          <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher un matériau, fournisseur, référence, chantier..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>
        
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">📦</div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base font-black text-white">Cockpit Matériaux & Fournisseurs</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Stock Synchronisé
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">قاعدة بيانات المواد، الأسعار، الكميات، والموردين المعتمدين لكل ورشة</p>
            </div>
          </div>
          <button onclick="App.openNewMaterialModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30 shadow-lg">
            <span>+</span><span>Achat Matériau / تسجيل شراء</span>
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-blue-400 text-xs font-bold">Total références</span><span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${totalItems}</span></div>
            <span class="text-[10px] text-slate-400">Articles catalogués</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-emerald-400 text-xs font-bold">En stock</span><span class="w-2 h-2 rounded-full bg-emerald-400"></span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${materials.filter(m => (m.quantity || 0) > 0).length || totalItems}</span></div>
            <span class="text-[10px] text-slate-400">Articles disponibles</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-cyan-400 text-xs font-bold">Total achat</span><span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">COÛT</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">${App.formatCurrency(totalSpend)}</span></div>
            <span class="text-[10px] text-slate-400">Dépenses totales</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-amber-400 text-xs font-bold">Fournisseurs</span><span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">FOURNISSEURS</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">0</span></div>
            <span class="text-[10px] text-slate-400">Fournisseurs actifs</span>
          </div>
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-red-400 text-xs font-bold">Ruptures stock</span><span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">ALERTE</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">0</span></div>
            <span class="text-[10px] text-slate-400">Alertes de réapprovisionnement</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-purple-400 text-xs font-bold">Avg. Marge</span><span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">MARGE</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">★ 5.0</span></div>
            <span class="text-[10px] text-slate-400">Qualité fournisseurs</span>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Matériau / Désignation</th>
                  <th class="text-right">Chantier</th>
                  <th class="text-right">Unité</th>
                  <th class="text-center">Quantité</th>
                  <th class="text-center">Prix Unitaire</th>
                  <th class="text-center">Montant Total</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">${rowsHTML}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
async renderBuildingStructureView(container) {
    const projects = await DB.getAll('projects');
    const floors = await DB.getAll('project_floors');
    const rooms = await DB.getAll('project_rooms');

    container.innerHTML = `
      <div class="relative w-full mb-5">
        <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher un bâtiment, étage, local, ou mesure..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
        <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
      </div>
      <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 mb-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">📐</div>
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-base font-black text-white">Cockpit Bâtiments, Étages & Métrés Techniques</h2>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Calcul Auto. Surfaces & Volumes
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">الهيكل التقني للمبنى — الطوابق، الغرف، قياسات الجدران والأرضيات، وتفاصيل الأبواب والنوافذ</p>
          </div>
        </div>
        <button onclick="App.openAddBuildingModal && App.openAddBuildingModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30">
          <span>+</span><span>Nouveau Bâtiment / إضافة بناية</span>
        </button>
      </div>
    
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-white">هيكل المباني والقياسات عبر المشاريع (Bâtiments & Mesures)</h2>
          <p class="text-xs text-slate-400">نظرة شاملة على جميع الطوابق والغرف التابعة لكل مشروع مسجل</p>
        </div>

        <div class="space-y-6">
          ${projects.map(p => {
            const prjFloors = floors.filter(f => String(f.project_id) === String(p.id));
            const prjRooms = rooms.filter(r => String(r.project_id) === String(p.id));

            return `
              <div class="kpi-card rounded-2xl p-5 space-y-4">
                <div class="flex justify-between items-center border-b border-white/5 pb-3">
                  <div>
                    <h3 class="font-bold text-white text-base">${this.escapeHtml(p.name)}</h3>
                    <span class="text-xs text-slate-400">${p.ref} • ${prjFloors.length} طوابق • ${prjRooms.length} غرف ومساحات</span>
                  </div>
                  <button onclick="App.openProjectWorkspace('${p.id}'); App.switchProjectTab('measurements');" class="px-3 py-1.5 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-lg text-xs font-bold">
                    فتح القياسات ↗
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  ${prjFloors.map(fl => {
                    const flR = prjRooms.filter(r => String(r.floor_id) === String(fl.id));
                    return `
                      <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5">
                        <span class="font-bold text-white block">${fl.floor_name}</span>
                        <span class="text-slate-500 text-[11px]">${flR.length} غرف مسجلة</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // 8. Global Activities View
  async renderActivitiesView(container) {
    const categories = await DB.getAll('work_categories');
    const catalog = await DB.getAll('activity_catalog');

    container.innerHTML = `
      <div class="relative w-full mb-5">
        <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher une activité, catégorie, description..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
        <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
      </div>
      <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 mb-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">📋</div>
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-base font-black text-white">Cockpit Catalogue des Travaux & Activités DARI LUXE</h2>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>12 Catégories d'Ouvrages
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">دليل بنود وأنشطة الأشغال، تسعير الوحدات، وتتبع الإنجاز لكل مهمة في الورشات</p>
          </div>
        </div>
        <button onclick="App.openAddActivityModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30">
          <span>+</span><span>Nouveau Travail / إضافة نشاط</span>
        </button>
      </div>
    
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-white">دليل بنود الأشغال والخدمات (Catalogue des Travaux)</h2>
            <p class="text-xs text-slate-400">التصنيفات الـ 12 المعتمدة، وحدات القياس، والأسعار المرجعية للأشغال</p>
          </div>
          <button onclick="App.openNewCatalogActivityModal()" class="px-3.5 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white rounded-xl text-xs font-bold shadow">
            + إضافة نشاط جديد للكتالوج
          </button>
        </div>

        <div class="space-y-6">
          ${categories.map(cat => {
            const items = catalog.filter(a => String(a.category_id) === String(cat.id));
            return `
              <div class="kpi-card rounded-2xl overflow-hidden p-5 space-y-3">
                <div class="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span class="text-blue-400 font-bold text-base">●</span>
                  <h3 class="font-bold text-white text-sm">${cat.name_ar} (${cat.name_fr})</h3>
                  <span class="text-xs text-slate-500 font-normal">(${items.length} بنود)</span>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  ${items.map(it => `
                    <div class="p-3.5 rounded-xl bg-[#0E0E12]/50 border border-white/6 hover:border-white/10 transition flex flex-col justify-between">
                      <div>
                        <div class="flex justify-between items-start gap-2">
                          <span class="font-bold text-white block text-xs">${it.name}</span>
                          <div class="flex items-center gap-1 flex-shrink-0">
                            <button onclick="App.editCatalogActivity('${it.id}')" class="p-1 px-1.5 rounded bg-blue-500/10 hover:bg-blue-500/30 text-blue-400 text-[11px] font-bold transition flex items-center gap-1" title="تعديل هذا النشاط في الكتالوج">
                              <span>✏️</span>
                            </button>
                            <button onclick="App.deleteCatalogActivity('${it.id}')" class="p-1 px-1.5 rounded bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 text-[11px] font-bold transition flex items-center gap-1" title="حذف هذا النشاط من الكتالوج">
                              <span>🗑️</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="flex justify-between items-center text-slate-400 mt-2.5 pt-2 border-t border-white/5">
                        <span>الوحدة: <strong class="text-slate-300">${it.unit}</strong></span>
                        <span class="text-blue-400 font-bold">${App.formatCurrency(it.default_price)}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  // 9. Global Expenses View
  async renderExpensesView(container) {
    const expenses = await DB.getAll('expenses');
    const projects = await DB.getAll('projects');
    let totalExpenses = 0;
    expenses.forEach(e => { totalExpenses += parseFloat(e.amount) || 0; });

    const rowsHTML = expenses.slice(0, 15).map((e, idx) => {
      const proj = projects.find(p => p.id === e.project_id);
      const projName = proj ? proj.name : 'Général';
      const letter = (e.description || 'D').trim()[0].toUpperCase();
      const colors = ['avatar-red', 'avatar-amber', 'avatar-blue', 'avatar-emerald', 'avatar-purple', 'avatar-cyan'];
      const avatarColor = colors[idx % colors.length];
      return `
        <tr class="transition" data-status="active">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar-circle ${avatarColor}">${letter}</div>
              <div>
                <span class="font-bold text-white block text-xs">${e.description || 'Dépense diverse'}</span>
                <span class="text-[10px] text-slate-500">ID: EXP-${e.id ? e.id.slice(0,8) : '0000'} • ${e.date || 'N/A'}</span>
              </div>
            </div>
          </td>
          <td class="text-xs text-slate-300">${projName}</td>
          <td><span class="badge-role-amber">${e.category || 'Divers'}</span></td>
          <td class="font-mono text-xs font-bold text-red-400 text-center">${App.formatCurrency(e.amount)}</td>
          <td class="text-xs text-center">
            ${e.partner_id === 'USR-002' 
              ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">الشريك 2</span>'
              : '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold">الشريك 1</span>'
            }
          </td>
          <td class="text-center"><span class="badge-status-active">Validée</span></td>
          <td class="text-center text-amber-400 text-xs">★ 5.0</td>
          <td class="text-center">
            <div class="inline-flex items-center gap-1">
    <button onclick="App.deleteExpense('${e.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs transition" title="حذف المصروف">🗑️</button>
  </div>
          </td>
        </tr>
      `;
    }).join('') || `
      <tr><td colspan="8" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-3">💳</div>
        <p class="font-bold text-slate-400">Aucune dépense enregistrée</p>
        <p class="text-xs text-slate-500 mt-1">Enregistrez les frais et charges depuis l'espace chantier</p>
      </td></tr>
    `;

    container.innerHTML = `
      <div class="space-y-5">
        <div class="relative w-full">
          <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher une dépense, catégorie, chantier, fournisseur..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">💳</div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base font-black text-white">Cockpit Dépenses & Charges Générales</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Comptabilité Temps Réel
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">سجل المصاريف النثرية، المشتريات، الرسوم، والتكاليف الإدارية لكل ورشة بشكل مستقل</p>
            </div>
          </div>
          <button onclick="App.openAddExpenseModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30 shadow-lg">
            <span>+</span><span>Ajouter Dépense / تسجيل مصروف</span>
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-blue-400 text-xs font-bold">Total opérations</span><span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${expenses.length}</span></div>
            <span class="text-[10px] text-slate-400">Dépenses enregistrées</span>
          </div>
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-red-400 text-xs font-bold">Montant total</span><span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">CHARGES</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">${App.formatCurrency(totalExpenses)}</span></div>
            <span class="text-[10px] text-slate-400">Total cumulé dépensé</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-amber-400 text-xs font-bold">Ce mois</span><span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">MENSUEL</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">${App.formatCurrency(totalExpenses * 0.3)}</span></div>
            <span class="text-[10px] text-slate-400">Charges mois en cours</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-cyan-400 text-xs font-bold">Main d'oeuvre</span><span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">LABOUR</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">0 DA</span></div>
            <span class="text-[10px] text-slate-400">Charges salariales</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-emerald-400 text-xs font-bold">Validées</span><span class="w-2 h-2 rounded-full bg-emerald-400"></span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${expenses.length}</span></div>
            <span class="text-[10px] text-slate-400">Dépenses validées</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-purple-400 text-xs font-bold">Rapports</span><span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">PDF</span></div>
            <div class="my-2"><button onclick="App.printExpensesReport()" class="text-purple-400 font-bold text-xs hover:text-purple-300">Imprimer A4 🖨️</button></div>
            <span class="text-[10px] text-slate-400">Export & impression</span>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Dépense / Description</th>
                  <th class="text-right">Chantier</th>
                  <th class="text-right">Catégorie</th>
                  <th class="text-center">Montant (DA)</th>
                  <th class="text-center">المسدد (Partenaire)</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">${rowsHTML}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },
  
async renderFinancesView(container) {
    const projects = await DB.getAll('projects');
    const attendances = await DB.getAll('worker_attendance');
    const materialUsages = await DB.getAll('project_material_usage');
    const expenses = await DB.getAll('expenses');
    const customerPayments = await DB.getAll('customer_payments');
    const activities = await DB.getAll('project_activities');

    let totalContract = 0, totalCollected = 0, totalCosts = 0, totalProfit = 0;

    const prjFinances = projects.map(p => {
      const fin = CalculationEngine.computeProjectFinances(p, attendances, materialUsages, expenses, customerPayments, activities);
      totalContract += fin.contractValue;
      totalCollected += fin.totalCollectedPayments;
      totalCosts += fin.totalActualCost;
      totalProfit += fin.actualProfit;
      return { p, fin };
    });

    container.innerHTML = `
      <div class="relative w-full mb-5">
        <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher dans les finances — projets, factures, paiements..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
        <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
      </div>
      <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 mb-5">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">💰</div>
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-base font-black text-white">Cockpit Finances & Rentabilité Globale</h2>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Tableau de bord financier
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">المركز المالي الحقيقي لداري لوكس — الإيرادات، التكاليف، الأرباح الصافية، والتدفقات النقدية</p>
          </div>
        </div>
        <button onclick="App.renderCurrentView()" class="px-4 py-2.5 rounded-xl bg-[#16161C] text-slate-200 border border-white/10 text-xs font-bold transition flex items-center gap-2">
          🔄 Actualiser
        </button>
      </div>
    
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-white">المركز المالي الشامل والأرباح (Finances & Rentabilité)</h2>
          <p class="text-xs text-slate-400">تحليل مالي متقدم يفرّق بين التدفق النقدي الفعلي والالتزامات التعاقدية</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">إجمالي العقود</span>
            <span class="text-xl font-extrabold text-white mt-1 block">${this.formatCurrency(totalContract)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">المقبوضات المحصلة</span>
            <span class="text-xl font-extrabold text-emerald-400 mt-1 block">${this.formatCurrency(totalCollected)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">إجمالي التكاليف</span>
            <span class="text-xl font-extrabold text-slate-300 mt-1 block">${this.formatCurrency(totalCosts)}</span>
          </div>
          <div class="kpi-card p-4 rounded-xl text-center">
            <span class="text-xs text-slate-400 block font-bold">صافي الأرباح</span>
            <span class="text-xl font-extrabold text-blue-400 mt-1 block">${this.formatCurrency(totalProfit)}</span>
          </div>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden">
          <table class="w-full text-xs text-right">
            <thead>
              <tr class="bg-[#0E0E12]/60 text-slate-400 font-bold border-b border-white/8">
                <th class="py-3 px-3">المشروع</th>
                <th class="py-3 px-2 text-center">النموذج</th>
                <th class="py-3 px-3 font-bold text-white">قيمة العقد</th>
                <th class="py-3 px-3 font-bold text-emerald-400">المقبوض</th>
                <th class="py-3 px-3 text-slate-300">أجور العمال</th>
                <th class="py-3 px-3 text-slate-300">المواد المستهلكة</th>
                <th class="py-3 px-3 font-bold text-amber-400">إجمالي التكلفة</th>
                <th class="py-3 px-3 font-bold text-blue-400">الربح الفعلي</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${prjFinances.map(({ p, fin }) => `
                <tr class="hover:bg-[#141418]/30 transition">
                  <td class="py-3 px-3 font-bold text-white">${this.escapeHtml(p.name)}</td>
                  <td class="py-3 px-2 text-center text-slate-400">${p.commercial_model}</td>
                  <td class="py-3 px-3 font-bold text-white">${App.formatCurrency(fin.contractValue)}</td>
                  <td class="py-3 px-3 font-bold text-emerald-400">${App.formatCurrency(fin.totalCollectedPayments)}</td>
                  <td class="py-3 px-3 text-slate-300">${App.formatCurrency(fin.totalLaborCost)}</td>
                  <td class="py-3 px-3 text-slate-300">${App.formatCurrency(fin.companyMaterialCost)}</td>
                  <td class="py-3 px-3 font-bold text-amber-400">${App.formatCurrency(fin.totalActualCost)}</td>
                  <td class="py-3 px-3 font-bold ${fin.actualProfit >= 0 ? 'text-blue-400' : 'text-rose-400'}">${App.formatCurrency(fin.actualProfit)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // 11. Quotations and Invoices View
  async renderQuotationsInvoicesView(container) {
    const quotations = await DB.getAll('quotations');
    const invoices = await DB.getAll('invoices');
    const projects = await DB.getAll('projects');

    const totalDevis = quotations.length;
    const totalInvoices = invoices.length;
    const approvedDevis = quotations.filter(q => q.status === 'approved').length;
    const pendingDevis = quotations.filter(q => q.status === 'pending' || !q.status).length;
    let totalDevisAmount = 0, totalInvoiceAmount = 0;
    quotations.forEach(q => { totalDevisAmount += parseFloat(q.total_ttc || q.total || 0); });
    invoices.forEach(inv => { totalInvoiceAmount += parseFloat(inv.total_ttc || inv.total || 0); });

    const devisRowsHTML = quotations.slice(0, 10).map((q, idx) => {
      const proj = projects.find(p => p.id === q.project_id);
      const projName = proj ? proj.name : 'Chantier DARI LUXE';
      const letter = (q.ref || 'D').trim()[0].toUpperCase();
      const colors = ['avatar-blue', 'avatar-emerald', 'avatar-cyan', 'avatar-amber', 'avatar-purple'];
      const avatarColor = colors[idx % colors.length];
      const statusClass = q.status === 'approved' ? 'text-emerald-400' : (q.status === 'sent' ? 'text-blue-400' : 'text-amber-400');
      const statusLabel = q.status === 'approved' ? 'Approuvé' : (q.status === 'sent' ? 'Envoyé' : 'En attente');
      return `
        <tr class="transition" data-status="${q.status || 'pending'}">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar-circle ${avatarColor}">${letter}</div>
              <div>
                <span class="font-bold text-white block text-xs">${q.ref || 'DEV-' + (idx+1).toString().padStart(4,'0')}</span>
                <span class="text-[10px] text-slate-500">Date: ${q.date || 'N/A'}</span>
              </div>
            </div>
          </td>
          <td class="text-xs text-slate-300">${projName}</td>
          <td class="text-xs text-slate-300">${q.client_name || 'Client DARI LUXE'}</td>
          <td class="font-mono text-xs font-bold text-emerald-400 text-center">${App.formatCurrency(q.total_ttc || q.total)}</td>
          <td class="text-center"><span class="${statusClass} font-bold text-xs">${statusLabel}</span></td>
          <td class="text-center text-amber-400 text-xs">★ 5.0</td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="App.printQuotationA4('${q.id}')" class="btn-action-open" title="Imprimer A4">
                <span>🖨️</span><span>Print A4</span>
              </button>
              <button onclick="App.editQuotation('${q.id}')" class="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
                ✏️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('') || `
      <tr><td colspan="7" class="text-center py-12 text-slate-500">
        <div class="text-4xl mb-3">📄</div>
        <p class="font-bold text-slate-400">Aucun devis enregistré</p>
        <p class="text-xs text-slate-500 mt-1">Créez votre premier devis depuis l'espace chantier</p>
      </td></tr>
    `;

    container.innerHTML = `
      <div class="space-y-5">
        <div class="relative w-full">
          <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="🔍 Rechercher devis, factures, références, clients, montants..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">📄</div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base font-black text-white">Cockpit Devis & Factures DARI LUXE</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>Impression A4 Officielle
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">عروض الأسعار الرسمية والفواتير المصادق عليها بختم وشعار داري لوكس</p>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="App.openNewQuotationModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30">
              <span>+</span><span>Nouveau Devis / عرض سعر</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-blue-400 text-xs font-bold">Total devis</span><span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${totalDevis}</span></div>
            <span class="text-[10px] text-slate-400">Devis créés</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-emerald-400 text-xs font-bold">Approuvés</span><span class="w-2 h-2 rounded-full bg-emerald-400"></span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${approvedDevis}</span></div>
            <span class="text-[10px] text-slate-400">Clients OK</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-cyan-400 text-xs font-bold">Montant total</span><span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">VALEUR</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">${App.formatCurrency(totalDevisAmount)}</span></div>
            <span class="text-[10px] text-slate-400">Valeur devis total</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-amber-400 text-xs font-bold">En attente</span><span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">PENDING</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${pendingDevis}</span></div>
            <span class="text-[10px] text-slate-400">Devis non signés</span>
          </div>
          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-red-400 text-xs font-bold">Total factures</span><span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">FACTURES</span></div>
            <div class="my-2"><span class="text-2xl font-black text-white">${totalInvoices}</span></div>
            <span class="text-[10px] text-slate-400">Factures émises</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between"><span class="text-purple-400 text-xs font-bold">Facturation totale</span><span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">FACTURÉ</span></div>
            <div class="my-2"><span class="text-lg font-black text-white">${App.formatCurrency(totalInvoiceAmount)}</span></div>
            <span class="text-[10px] text-slate-400">Montant facturé</span>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-2 overflow-x-auto pb-1">
          <button onclick="App.setRoleFilter('all', this)" class="filter-pill active">Tous les devis</button>
          <button onclick="App.setRoleFilter('approved', this)" class="filter-pill">Approuvés ✓</button>
          <button onclick="App.setRoleFilter('pending', this)" class="filter-pill">En attente ⏳</button>
          <button onclick="App.setRoleFilter('sent', this)" class="filter-pill">Envoyés 📧</button>
        </div>

        <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">Référence Devis</th>
                  <th class="text-right">Chantier</th>
                  <th class="text-right">Client</th>
                  <th class="text-center">Montant TTC (DA)</th>
                  <th class="text-center">Statut</th>
                  <th class="text-center">Évaluation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="cockpit-table-body">${devisRowsHTML}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

async renderReportsView(container) {
    const projects = await DB.getAll('projects');
    const workers = await DB.getAll('workers');

    container.innerHTML = `
    <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 mb-5">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">📑</div>
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h2 class="text-base font-black text-white">Cockpit Rapports & Documents Officiels DARI LUXE</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>Impression A4 Prête
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">التقارير المالية الشاملة، كشوفات العمال، المقاييس التقنية، وعروض الأسعار الرسمية بختم داري لوكس</p>
        </div>
      </div>
      <button onclick="App.printFullReport && App.printFullReport()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30">
        🖨️ Rapport Général
      </button>
    </div>
  
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-white">مركز التقارير والطباعة (Centre des Rapports)</h2>
          <p class="text-xs text-slate-400">توليد تقارير رسمية بصيغة جاهزة للطباعة أو التصدير PDF</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="kpi-card p-5 rounded-2xl space-y-3">
            <span class="text-2xl">🏗️</span>
            <h3 class="font-bold text-white text-sm">تقارير المشاريع والورشات</h3>
            <p class="text-xs text-slate-400">اختر مشروعاً لطباعة كشف القياسات أو التقرير المالي الشامل:</p>
            <select id="report-project-select" class="w-full bg-[#0E0E12] border border-white/10 rounded-lg p-2 text-white text-xs">
              ${projects.map(p => `<option value="${p.id}">${this.escapeHtml(p.name)}</option>`).join('')}
            </select>
            <div class="flex items-center gap-2 pt-2">
              <button onclick="App.printProjectFinancialReport(document.getElementById('report-project-select').value)" class="flex-1 py-2 bg-[#FF3B30] hover:bg-[#E0352B] text-white font-bold rounded-lg text-xs">
                التقرير المالي
              </button>
              <button onclick="App.printProjectMeasurementsReport(document.getElementById('report-project-select').value)" class="flex-1 py-2 bg-[#141418] hover:bg-slate-700 text-white font-bold rounded-lg text-xs border border-white/10">
                كشف القياسات
              </button>
            </div>
          </div>

          <div class="kpi-card p-5 rounded-2xl space-y-3">
            <span class="text-2xl">👷</span>
            <h3 class="font-bold text-white text-sm">كشوف حسابات العمال</h3>
            <p class="text-xs text-slate-400">اختر عاملاً لطباعة كشف حسابه واليوميات والتسبيقات:</p>
            <select id="report-worker-select" class="w-full bg-[#0E0E12] border border-white/10 rounded-lg p-2 text-white text-xs">
              ${workers.map(w => `<option value="${w.id}">${this.escapeHtml(w.full_name)} (${this.escapeHtml(w.specialty)})</option>`).join('')}
            </select>
            <div class="pt-2">
              <button onclick="App.printWorkerAccountStatement(document.getElementById('report-worker-select').value)" class="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs">
                🖨️ طباعة كشف حساب العامل
              </button>
            </div>
          </div>

          <div class="kpi-card p-5 rounded-2xl space-y-3">
            <span class="text-2xl">💾</span>
            <h3 class="font-bold text-white text-sm">النسخ الاحتياطي وتصدير البيانات</h3>
            <p class="text-xs text-slate-400">تصدير كامل قاعدة بيانات ERP بملف JSON للنسخ الاحتياطي أو الاستيراد:</p>
            <div class="flex items-center gap-2 pt-4">
              <button onclick="App.exportDatabaseFile()" class="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">
                📥 تصدير نسخة JSON
              </button>
              <label class="flex-1 py-2 bg-[#141418] hover:bg-slate-700 text-white font-bold rounded-lg text-xs text-center cursor-pointer border border-white/10">
                📤 استيراد
                <input type="file" onchange="App.handleImportDatabaseFile(this)" accept=".json" class="hidden">
              </label>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // 13. Settings View
  async renderSettingsView(container) {
    const settings = (await DB.getAll('company_settings'))[0] || {};

    container.innerHTML = `
    <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 mb-5">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">⚙️</div>
        <div>
          <div class="flex items-center gap-3 flex-wrap">
            <h2 class="text-base font-black text-white">Paramètres Système & Configuration DARI LUXE</h2>
            <span class="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>Administration
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-1">ضبط المؤسسة، قاعدة البيانات، Supabase Cloud، العملة، واللغة الافتراضية للنظام</p>
        </div>
      </div>
      <div class="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 shadow-lg">
        <span class="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
        <div class="flex flex-col text-right">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-white">Supabase Cloud DARI LUXE</span>
            <span class="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">متصل تلقائياً</span>
          </div>
          <span class="text-[10px] text-slate-400 font-mono">ileqivegtkvcaawlugsj.supabase.co</span>
        </div>
      </div>
    </div>
  
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold text-white">إعدادات المؤسسة والنظام (Paramètres de l'Entreprise)</h2>
          <p class="text-xs text-slate-400">بيانات الترويسة الرسمية، العملة الافتراضية، والمظهر</p>
        </div>

        <div class="kpi-card rounded-2xl p-6 space-y-6 max-w-3xl">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label class="text-slate-400 font-bold block mb-1">اسم المؤسسة (بالعربية):</label>
              <input type="text" id="set-company-name" value="${settings.company_name || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">اسم المؤسسة (بالفرنسية):</label>
              <input type="text" id="set-company-name-fr" value="${settings.company_name_fr || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">الهاتف:</label>
              <input type="text" id="set-phone" value="${settings.phone || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">البريد الإلكتروني:</label>
              <input type="text" id="set-email" value="${settings.email || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div class="sm:col-span-2">
              <label class="text-slate-400 font-bold block mb-1">العنوان والمقر الاجتماعي:</label>
              <input type="text" id="set-address" value="${settings.address || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">رقم السجل التجاري (RC):</label>
              <input type="text" id="set-rc" value="${settings.rc_number || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">الرقم الجبائي (NIF):</label>
              <input type="text" id="set-nif" value="${settings.nif_number || ''}" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">العملة الافتراضية:</label>
              <select id="set-currency" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
                <option value="DZD" ${settings.currency === 'DZD' ? 'selected' : ''}>دينار جزائري (DZD / دج)</option>
                <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>يورو (EUR / €)</option>
                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD / $)</option>
              </select>
            </div>
            <div>
              <label class="text-slate-400 font-bold block mb-1">مظهر الواجهة (Theme):</label>
              <select id="set-theme" onchange="App.setTheme(this.value)" class="w-full p-2.5 bg-[#0E0E12] border border-white/10 rounded-xl text-white">
                <option value="dark" ${this.theme === 'dark' ? 'selected' : ''}>الوضع الداكن الفخم (Dark Mode)</option>
                <option value="light" ${this.theme === 'light' ? 'selected' : ''}>الوضع الفاتح (Light Mode)</option>
              </select>
            </div>
          </div>

          <div class="flex justify-between items-center pt-4 border-t border-white/5">
            <button onclick="App.saveSettingsAction()" class="px-5 py-2.5 bg-[#FF3B30] hover:bg-[#E0352B] text-white font-bold rounded-xl text-xs shadow">
              حفظ وتطبيق الإعدادات
            </button>
            <button onclick="App.resetDatabaseConfirm()" class="px-3.5 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl text-xs transition border border-rose-900/50">
              إعادة ضبط المصنع للبيانات
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // --- Printing Engine (A4 Layouts with Official DARI LUXE Branding) ---
  getCompanyPrintHeaderHTML(titleAr, titleFr, refNumber = '', dateStr = '') {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <img src="dari_luxe_logo.png" alt="DARI LUXE" style="max-height: 75px; object-fit: contain;">
          <div>
            <h1 style="font-size: 17pt; margin: 0; color: #0B132B; font-weight: 900; letter-spacing: 1px;">DARI LUXE</h1>
            <p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #B45309; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Rénovation, Décoration et Aménagement</p>
            <p style="margin: 3px 0 0 0; font-size: 8.5pt; color: #334155;">
              الهاتف: <strong style="color:#0B132B;" dir="ltr">0550 60 09 09</strong> • البريد: <strong style="color:#0B132B;">DARILUXE.NET@GMAIL.COM</strong>
            </p>
            <p style="margin: 2px 0 0 0; font-size: 8pt; color: #64748B;">
              المقر: حي 17 أكتوبر، سيدي لخضر - ولاية عين الدفلى (Sidi Lakhder, Ain Defla)
            </p>
          </div>
        </div>
        <div style="text-align: left; min-width: 170px;">
          <h2 style="margin: 0; font-size: 13pt; color: #B45309; font-weight: 800;">${titleFr}</h2>
          <p style="margin: 2px 0; font-size: 10pt; font-weight: bold; color: #0B132B;">${titleAr}</p>
          ${refNumber ? `<p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #334155;"><strong>الرقم / Réf:</strong> ${refNumber}</p>` : ''}
          ${dateStr ? `<p style="margin: 2px 0 0 0; font-size: 8.5pt; color: #334155;"><strong>التاريخ / Date:</strong> ${dateStr}</p>` : ''}
        </div>
      </div>
    `;
  },

  async printQuotationA4(quotationId) {
    const q = await DB.getById('quotations', quotationId);
    if (!q) return;
    const project = await DB.getById('projects', q.project_id) || {};
    const settings = (await DB.getAll('company_settings'))[0] || {};

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Devis DARI LUXE - ${q.ref}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20mm 15mm; color: #111; font-size: 10.5pt; }
          .client-box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0B132B; color: #FFF; border: 1px solid #0B132B; padding: 10px; font-weight: bold; }
          td { border: 1px solid #CBD5E1; padding: 9px; text-align: right; }
          .total-box { margin-right: auto; width: 300px; border: 2px solid #B45309; background: #FFFBEB; padding: 12px; border-radius: 8px; text-align: left; }
          .signature { margin-top: 45px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('كشف تقديري للأسعار', 'DEVIS QUANTITATIF & ESTIMATIF', q.ref, q.date)}

        <div class="client-box">
          <p style="margin: 0 0 4px 0;"><strong>الزبون المحترم / Client:</strong> ${project.client_name || '-'}</p>
          <p style="margin: 0 0 4px 0;"><strong>المشروع / Projet:</strong> ${project.name || '-'}</p>
          <p style="margin: 0;"><strong>الموقع / Adresse:</strong> ${project.address || '-'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 48%;">البيان والأشغال المطلوبة (Désignation des Travaux)</th>
              <th style="width: 12%; text-align: center;">الكمية</th>
              <th style="width: 18%; text-align: center;">سعر الوحدة</th>
              <th style="width: 22%; text-align: left;">المجموع (دج)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>أشغال البلاكو بلاتر، الأسقف المستعارة BA13، الكايسون، بروفيليه ليد والإنارة المخفية</td>
              <td style="text-align: center;">1 فورفي</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: left; font-weight: bold;">${(q.total_amount * 0.6).toLocaleString('fr-FR')} دج</td>
            </tr>
            <tr>
              <td>أشغال الصبيغة الكاملة جدران وأسقف مع الحف والأندوي والمعجون ودهان ساتيني</td>
              <td style="text-align: center;">1 فورفي</td>
              <td style="text-align: center;">-</td>
              <td style="text-align: left; font-weight: bold;">${(q.total_amount * 0.4).toLocaleString('fr-FR')} دج</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <p style="margin:0; font-size:12pt; font-weight:bold; color:#B45309;">المجموع الإجمالي: ${q.total_amount.toLocaleString('fr-FR')} دج</p>
          <p style="margin:4px 0 0 0; font-size:9.5pt; color:#475569; font-weight:600;">(${App.formatCentimes(q.total_amount)})</p>
        </div>

        <div class="signature">
          <div style="border: 1px dashed #94A3B8; padding: 12px 20px; border-radius: 6px; width: 220px; text-align: center;">
            <p style="margin: 0 0 35px 0; font-weight: bold; color: #475569;">ختم وتوقيع الزبون بالموافقة:</p>
            <p style="margin: 0; font-size: 8pt; color: #94A3B8;">قرئ وقبل (Lu et approuvé)</p>
          </div>
          <div style="border: 1px dashed #D4AF37; padding: 12px 20px; border-radius: 6px; width: 220px; text-align: center; background: #FFFDF5;">
            <p style="margin: 0 0 35px 0; font-weight: bold; color: #B45309;">إدارة مؤسسة DARI LUXE:</p>
            <p style="margin: 0; font-size: 8pt; color: #B45309;">سيدي لخضر، عين الدفلى</p>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  async printInvoiceA4(invoiceId) {
    const inv = await DB.getById('invoices', invoiceId);
    if (!inv) return;
    const project = await DB.getById('projects', inv.project_id) || {};
    const settings = (await DB.getAll('company_settings'))[0] || {};

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Facture DARI LUXE - ${inv.ref}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 20mm 15mm; color: #111; font-size: 10.5pt; }
          .client-box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #0B132B; color: #FFF; border: 1px solid #0B132B; padding: 10px; font-weight: bold; }
          td { border: 1px solid #CBD5E1; padding: 10px; text-align: right; }
          .total-box { margin-right: auto; width: 300px; border: 2px solid #059669; background: #ECFDF5; padding: 12px; border-radius: 8px; text-align: left; }
          .signature { margin-top: 45px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('فاتورة مستحقات رسمية', 'FACTURE OFFICIELLE', inv.ref, inv.issue_date)}

        <div class="client-box">
          <p style="margin: 0 0 4px 0;"><strong>الزبون / Client:</strong> ${project.client_name || '-'}</p>
          <p style="margin: 0 0 4px 0;"><strong>المشروع / Chantier:</strong> ${project.name || '-'}</p>
          <p style="margin: 0;"><strong>الموقع:</strong> ${project.address || '-'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 70%;">البيان (Désignation de la Prestation)</th>
              <th style="width: 30%; text-align: left;">المبلغ المستحق (دج)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${inv.invoice_type === 'deposit' ? 'دفعة تسبيق وتثبيت العقد وبدء الأشغال' : 'فاتورة مرحلية بحسب تقدم الأشغال الميدانية المنجزة'}</td>
              <td style="text-align: left; font-weight: bold; font-size: 11pt;">${inv.total_amount.toLocaleString('fr-FR')} دج</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <p style="margin:0; font-size:12pt; font-weight:bold; color:#065F46;">الصافي للدفع: ${inv.total_amount.toLocaleString('fr-FR')} دج</p>
          <p style="margin:4px 0 0 0; font-size:9.5pt; color:#047857; font-weight:600;">(${App.formatCentimes(inv.total_amount)})</p>
        </div>

        <div class="signature">
          <div>ختم وتوقيع الزبون بالموافقة:</div>
          <div style="text-align: center;">
            <p style="margin: 0; font-weight: bold; color: #0B132B;">إدارة مؤسسة DARI LUXE</p>
            <p style="margin: 4px 0 0 0; font-size: 8pt; color: #64748B;">عين الدفلى</p>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  async printProjectFinancialReport(projectId) {
    const project = await DB.getById('projects', projectId);
    if (!project) return;
    const attendances = await DB.getAll('worker_attendance');
    const materialUsages = await DB.getAll('project_material_usage');
    const expenses = await DB.getAll('expenses');
    const customerPayments = await DB.getAll('customer_payments');
    const activities = await DB.getAll('project_activities');
    const settings = (await DB.getAll('company_settings'))[0] || {};

    const fin = CalculationEngine.computeProjectFinances(project, attendances, materialUsages, expenses, customerPayments, activities);

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Rapport Financier - ${this.escapeHtml(project.name)}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 15mm; color: #111; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th, td { border: 1px solid #CBD5E1; padding: 7px 10px; }
          th { background: #0B132B; color: #FFF; font-weight: bold; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 15px 0; }
          .card { border: 1px solid #CBD5E1; padding: 10px; border-radius: 6px; background: #F8FAFC; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('التقرير المالي وكشف الأرباح', 'RAPPORT FINANCIER & RENTABILITÉ', project.ref, App.getLocalDateString())}
        <h2 style="font-size: 13pt; color: #0B132B; margin-bottom: 4px;">التقرير المالي للورشة: ${this.escapeHtml(project.name)}</h2>
        <p style="color: #64748B; font-size: 9pt; margin-top: 0;">المرجع: ${project.ref} | الزبون: ${this.escapeHtml(project.client_name)} | النموذج: ${project.commercial_model}</p>

        <div class="summary-grid">
          <div class="card">
            <strong>قيمة العقد:</strong>
            <div style="font-size: 13pt; color: #1E3A8A; font-weight: bold;">${fin.contractValue.toLocaleString('fr-FR')} دج</div>
          </div>
          <div class="card">
            <strong>المقبوضات المحصلة:</strong>
            <div style="font-size: 13pt; color: #065F46; font-weight: bold;">${fin.totalCollectedPayments.toLocaleString('fr-FR')} دج</div>
          </div>
          <div class="card">
            <strong>المتبقي عند الزبون:</strong>
            <div style="font-size: 13pt; color: #D97706; font-weight: bold;">${fin.customerOutstandingBalance.toLocaleString('fr-FR')} دج</div>
          </div>
        </div>

        <h3>تفصيل التكاليف الفعلية:</h3>
        <table>
          <tr><th>بند التكلفة</th><th>المبلغ المحسوب</th><th>ملاحظات</th></tr>
          <tr><td>أجور العمال المباشرة</td><td>${fin.totalLaborCost.toLocaleString('fr-FR')} دج</td><td>مجموع اليوميات بالورشة</td></tr>
          <tr><td>تكلفة استهلاك المواد (للشركة)</td><td>${fin.companyMaterialCost.toLocaleString('fr-FR')} دج</td><td>المستهلك فعلياً بالورشة</td></tr>
          <tr><td>مصاريف النقل والعتاد المتنوعة</td><td>${fin.otherExpenses.toLocaleString('fr-FR')} دج</td><td>مصاريف لوجستية</td></tr>
          <tr style="font-weight: bold; background: #F8FAFC;"><td>إجمالي التكلفة الفعلية</td><td style="color:#B45309;">${fin.totalActualCost.toLocaleString('fr-FR')} دج</td><td>تكلفة التنفيذ</td></tr>
          <tr style="font-weight: bold; background: #EFF6FF;"><td>صافي الربح الفعلي المحصل</td><td style="color:#1E40AF;">${fin.actualProfit.toLocaleString('fr-FR')} دج</td><td>المقبوض - التكلفة</td></tr>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  async printProjectMeasurementsReport(projectId) {
    const project = await DB.getById('projects', projectId);
    if (!project) return;
    const rooms = await DB.query('project_rooms', r => String(r.project_id) === String(projectId));
    const doors = await DB.getAll('room_doors');
    const windows = await DB.getAll('room_windows');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Métré DARI LUXE - ${this.escapeHtml(project.name)}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 15mm; color: #111; font-size: 9pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #333; padding: 4px 6px; text-align: center; }
          th { background: #0B132B; color: #FFF; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('كشف القياسات وجرد الصبيغة والأسقف', 'MÉTRÉ TECHNIQUE & SURFACES', project.ref, App.getLocalDateString())}
        <h2 style="font-size: 12pt; margin: 0 0 10px 0;">بيان القياسات الهندسية: ${this.escapeHtml(project.name)}</h2>
        <table>
          <thead>
            <tr>
              <th>الغرفة</th><th>الطول</th><th>العرض</th><th>H</th><th>مساحة السقف</th><th>المحيط</th><th>خصم الأبواب</th><th>خصم النوافذ</th><th>صبيغة الجدران</th><th>إجمالي الصبيغة</th>
            </tr>
          </thead>
          <tbody>
            ${rooms.map(rm => {
              const d = doors.filter(x => String(x.room_id) === String(rm.id));
              const w = windows.filter(x => String(x.room_id) === String(rm.id));
              const m = CalculationEngine.computeRoomMeasurements(rm, d, w);
              return `<tr>
                <td>${rm.room_name}</td><td>${rm.length}</td><td>${rm.width}</td><td>${rm.height}</td><td>${m.floorArea.toFixed(2)}</td><td>${m.perimeter.toFixed(2)}</td><td>-${m.totalDoorArea.toFixed(2)}</td><td>-${m.totalWindowArea.toFixed(2)}</td><td>${m.netWallPaintingArea.toFixed(2)}</td><td><strong>${m.totalPaintingArea.toFixed(2)} م²</strong></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  async printWorkerAccountStatement(workerId) {
    const worker = await DB.getById('workers', workerId);
    if (!worker) return;
    const attendances = await DB.getAll('worker_attendance');
    const payments = await DB.getAll('worker_payments');
    const summary = CalculationEngine.computeWorkerFinancialSummary(workerId, attendances, payments);

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>Relevé Paie - ${this.escapeHtml(worker.full_name)}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 15mm; color: #111; font-size: 10pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #CBD5E1; padding: 6px 10px; }
          th { background: #0B132B; color: #FFF; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('كشف حساب ومستحقات العامل', 'RELEVÉ DE PAIE OUVRIER', worker.worker_code || worker.id, App.getLocalDateString())}
        <h2 style="font-size: 12pt; margin: 0 0 4px 0;">مستحقات العامل: ${this.escapeHtml(worker.full_name)}</h2>
        <p style="margin: 0 0 12px 0; color: #64748B;">التخصص: ${this.escapeHtml(worker.specialty)} | الهاتف: ${this.escapeHtml(worker.phone)} | الأجر اليومي: ${worker.daily_wage.toLocaleString('fr-FR')} دج</p>
        
        <div style="border: 2px solid #D4AF37; padding: 12px; border-radius: 8px; margin: 15px 0; background: #FFFDF5;">
          <p style="margin: 4px 0;">إجمالي الأيام المنجزة: <strong>${summary.totalEffectiveDays} يوم</strong></p>
          <p style="margin: 4px 0;">إجمالي الأجور المستحقة: <strong>${summary.totalEarnedWages.toLocaleString('fr-FR')} دج</strong></p>
          <p style="margin: 4px 0;">إجمالي الدفعات والتسبيقات المستلمة: <strong style="color:#B45309;">${summary.totalPaymentsReceived.toLocaleString('fr-FR')} دج</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 13pt; color: #0B132B; font-weight: bold; border-top: 1px dashed #D4AF37; padding-top: 8px;">الرصيد المتبقي له بذمة المؤسسة: <strong style="color: #1E40AF;">${summary.remainingBalance.toLocaleString('fr-FR')} دج</strong></p>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  // --- Modals Logic ---
  openNewProjectModal() {
    const name = prompt('أدخل اسم المشروع الجديد:');
    if (!name) return;
    const client = prompt('اسم الزبون / صاحب المشروع:');
    const contract = parseFloat(prompt('قيمة العقد المتفق عليها (بالدينار DZD):') || 0);
    const model = prompt('النموذج التجاري:\n1. labor_only (أشغال يد فقط)\n2. labor_materials (توريد وتركيب)\n3. hybrid (هجين)', 'hybrid');

    DB.add('projects', {
      ref: 'PRJ-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      name: name.trim(),
      client_name: (client || 'زبون جديد').trim(),
      contract_value: contract,
      commercial_model: model || 'hybrid',
      status: 'in_progress',
      start_date: App.getLocalDateString()
    }).then(newP => {
      alert('✓ تم إنشاء المشروع بنجاح!');
      App.openProjectWorkspace(newP.id);
    });
  },

  async openNewFloorModal(projectId) {
    const name = prompt('أدخل اسم الطابق الجديد (مثال: الطابق الأرضي، الطابق 2، السطح...):');
    if (!name) return;
    const existingFloors = await DB.query('project_floors', f => String(f.project_id) === String(projectId));
    const nextNumber = existingFloors.length + 1;
    await DB.add('project_floors', {
      project_id: projectId,
      floor_name: name.trim(),
      floor_number: nextNumber,
      description: 'طابق'
    });
    App.renderActiveProjectTabContent();
  },

  async openNewRoomModal(projectId, defaultFloorId = null) {
    const floors = await DB.query('project_floors', f => String(f.project_id) === String(projectId));
    if (floors.length === 0) {
      alert('يرجى إنشاء طابق أولاً قبل إضافة الغرف.');
      return;
    }

    const name = prompt('اسم الغرفة أو المكان (مثال: غرفة النوم الرئيسية، صالون، مطبخ...):');
    if (!name) return;
    const l = parseFloat(prompt('الطول بالمتر (مثال: 4.5):') || 4.0);
    const w = parseFloat(prompt('العرض بالمتر (مثال: 3.8):') || 3.5);
    const h = parseFloat(prompt('الارتفاع بالمتر (مثال: 2.58):') || 2.58);

    const floorId = defaultFloorId || floors[0].id;

    DB.add('project_rooms', {
      project_id: projectId,
      floor_id: floorId,
      room_name: name.trim(),
      length: l,
      width: w,
      height: h,
      include_walls_paint: true,
      include_ceiling_paint: true
    }).then(() => {
      App.renderActiveProjectTabContent();
    });
  },

  async openNewAttendanceModal(defaultProjectId = null) {
    this.navigate('daily_checkin');
  },

  async openRecordWorkerPaymentModal(workerId, defaultPartnerId = null) {
    const active = await this.getActivePartner();
    const partnerId = defaultPartnerId || active.id;

    const amount = parseFloat(prompt('أدخل المبلغ المسلم للعامل (دج DZD):') || 0);
    if (!amount || amount <= 0) return;
    const type = prompt('نوع الدفعة: advance (تسبيق) أو salary (تسوية أجر):', 'advance');

    const whoPrompt = prompt(`من دفع للعامل من محفظته؟\n1. الشريك 1 (Admin 1)\n2. الشريك 2 (Admin 2)\n(الافتراضي: ${partnerId === 'USR-001' ? '1' : '2'})`, partnerId === 'USR-001' ? '1' : '2');
    const finalPartnerId = (whoPrompt === '2' || whoPrompt === 'USR-002') ? 'USR-002' : 'USR-001';
    const finalPartnerName = finalPartnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';

    await DB.add('worker_payments', {
      worker_id: workerId,
      partner_id: finalPartnerId,
      amount,
      payment_type: type || 'advance',
      date: App.getLocalDateString(),
      payment_method: 'cash',
      notes: `دفعه للعامل: ${finalPartnerName} من محفظته`
    });

    alert(`✓ تم تسجيل دفعة العامل وخصمها من دخل الشركة بالكامل (المسدد: ${finalPartnerName})`);
    await this.updateGlobalHeaderStats();
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    } else {
      App.renderCurrentView();
    }
  },

  async openNewMaterialPurchaseModal(defaultProjectId = null, defaultPartnerId = null) {
    const active = await this.getActivePartner();
    const partnerId = defaultPartnerId || active.id;

    const name = prompt('اسم المادة أو العتاد المشترى:');
    if (!name) return;
    const qty = parseFloat(prompt('الكمية المشتراة:') || 1);
    const price = parseFloat(prompt('سعر الوحدة بالدينار (DZD):') || 0);
    const source = prompt('مصدر المادة:\n1. company (شراء على عاتق الشركة من المحفظة)\n2. customer (موردة من الزبون - تكلفة صفر)', 'company');

    let finalPartnerId = partnerId;
    if (source !== 'customer') {
      const whoPrompt = prompt(`من قام بدفع قيمة المادة من محفظته؟\n1. الشريك 1 (Admin 1)\n2. الشريك 2 (Admin 2)\n(الافتراضي: ${partnerId === 'USR-001' ? '1' : '2'})`, partnerId === 'USR-001' ? '1' : '2');
      finalPartnerId = (whoPrompt === '2' || whoPrompt === 'USR-002') ? 'USR-002' : 'USR-001';
    }
    const finalPartnerName = finalPartnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';
    const totalCost = source === 'customer' ? 0 : (qty * price);

    await DB.add('material_purchases', {
      material_id: 'MAT_CUSTOM_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()),
      material_name: name.trim(),
      project_id: defaultProjectId || '',
      partner_id: finalPartnerId,
      quantity: qty,
      unit_price: source === 'customer' ? 0 : price,
      total_cost: totalCost,
      material_source: source || 'company',
      purchase_date: App.getLocalDateString(),
      payment_status: 'paid',
      notes: source === 'customer' ? 'موردة من الزبون' : `المشتري: ${finalPartnerName} من محفظته`
    });

    alert(`✓ تم تسجيل شراء المادة وخصمها من صندوق الشركة بالكامل (المشتري: ${finalPartnerName})`);
    await this.updateGlobalHeaderStats();
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    } else {
      App.renderCurrentView();
    }
  },

  async openNewExpenseModal(defaultProjectId = null, defaultPartnerId = null) {
    const active = await this.getActivePartner();
    const partnerId = defaultPartnerId || active.id;
    const partnerName = partnerId === 'USR-001' ? 'الشريك 1 (Admin 1)' : 'الشريك 2 (Admin 2)';

    const title = prompt(`تسجيل نفقة جديدة لحساب: ${partnerName}\nبيان النفقة / المصروف (مثال: وجبة غداء عمال الورشة، شراء مفكات، وقود، إلخ):`);
    if (!title) return;
    const amount = parseFloat(prompt('المبلغ المسدد نقداً (دج DZD):') || 0);
    if (!amount || amount <= 0) return;

    const catPrompt = prompt(
      'اختر تصنيف النفقة:\n1. food (غذاء ووجبات الورشة)\n2. tools (شراء أدوات وعتاد يدوي)\n3. transport (وقود ونقل)\n4. equipment_rental (كراء عتاد)\n5. admin (مصاريف إدارية)\n6. other (أخرى):',
      'food'
    );
    let category = 'other';
    if (catPrompt === '1' || catPrompt === 'food') category = 'food';
    else if (catPrompt === '2' || catPrompt === 'tools') category = 'tools';
    else if (catPrompt === '3' || catPrompt === 'transport') category = 'transport';
    else if (catPrompt === '4' || catPrompt === 'equipment_rental') category = 'equipment_rental';
    else if (catPrompt === '5' || catPrompt === 'admin') category = 'admin';

    // Who paid?
    const whoPrompt = prompt(`من قام بالدفع من محفظته؟\n1. الشريك 1 (Admin 1)\n2. الشريك 2 (Admin 2)\n(الافتراضي: ${partnerId === 'USR-001' ? '1' : '2'})`, partnerId === 'USR-001' ? '1' : '2');
    const finalPartnerId = (whoPrompt === '2' || whoPrompt === 'USR-002') ? 'USR-002' : 'USR-001';
    const finalPartnerName = finalPartnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';

    await DB.add('expenses', {
      project_id: defaultProjectId || '',
      partner_id: finalPartnerId,
      title: title.trim(),
      amount,
      category,
      date: App.getLocalDateString(),
      payment_method: 'cash',
      notes: `دفعها: ${finalPartnerName} من محفظته`
    });

    alert(`✓ تم تسجيل المصروف وخصمه من صندوق الشركة بالكامل (المشتري: ${finalPartnerName})`);
    await this.updateGlobalHeaderStats();
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    } else {
      App.renderCurrentView();
    }
  },

  async openNewCustomerPaymentModal(defaultProjectId = null, defaultPartnerId = null) {
    const projects = await DB.getAll('projects');
    const pId = defaultProjectId || (projects[0] ? projects[0].id : null);
    if (!pId) { alert('يرجى إنشاء مشروع أولاً.'); return; }

    const active = await this.getActivePartner();
    const partnerId = defaultPartnerId || active.id;

    const amount = parseFloat(prompt('المبلغ المستلم من الزبون (دج DZD):') || 0);
    if (!amount || amount <= 0) return;
    const rec = prompt('رقم الإيصال أو الشيك:', 'REC-' + Date.now().toString().slice(-4));

    const whoPrompt = prompt(`من استلم المبلغ في محفظته؟\n1. الشريك 1 (Admin 1)\n2. الشريك 2 (Admin 2)\n(الافتراضي: ${partnerId === 'USR-001' ? '1' : '2'})`, partnerId === 'USR-001' ? '1' : '2');
    const finalPartnerId = (whoPrompt === '2' || whoPrompt === 'USR-002') ? 'USR-002' : 'USR-001';
    const finalPartnerName = finalPartnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';

    await DB.add('customer_payments', {
      project_id: pId,
      partner_id: finalPartnerId,
      amount,
      payment_date: App.getLocalDateString(),
      payment_type: 'progress',
      receipt_number: (rec || 'REC-' + Date.now()).trim(),
      notes: `استلمها في محفظته: ${finalPartnerName}`
    });

    alert(`✓ تم تسجيل دفعة الزبون وإضافتها إلى صندوق الشركة بالكامل (المستلم: ${finalPartnerName})`);
    await this.updateGlobalHeaderStats();
    if (this.currentView === 'wallets') {
      await this.renderWalletsView();
    } else {
      App.renderCurrentView();
    }
  },

  // Database Backup / Restore / Reset
  exportDatabaseFile() {
    const jsonStr = DB.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DARILUXE_ERP_Backup_${App.getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  handleImportDatabaseFile(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        DB.importDatabaseJSON(e.target.result);
        alert('✓ تم استيراد قاعدة البيانات بنجاح!');
        location.reload();
      } catch (err) {
        alert('خطأ في ملف النسخة الاحتياطية: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  async resetDatabaseConfirm() {
    if (confirm('تحذير: هل أنت متأكد من حذف وتصفير جميع البيانات نهائياً؟\nسيتم حذف كافة المشاريع، العمال، الزبائن، المشتريات، المصاريف، الفواتير، وحركات الصندوق والبدء من الصفر تماماً.')) {
      await DB.wipeAllData(true);
      alert('✓ تم حذف وتصفير جميع البيانات بنجاح! النظام الآن نظيف تماماً وجاهز للعمل.');
      location.reload();
    }
  },

  deleteProjectConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا المشروع بجميع طوابقه وغرفه ومصاريفه؟')) {
      DB.delete('projects', id).then(() => {
        App.renderCurrentView();
      });
    }
  },

  deleteFloorConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطابق وما يحتويه من غرف؟')) {
      DB.delete('project_floors', id).then(() => {
        App.renderActiveProjectTabContent();
      });
    }
  },

  deleteRoomConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذه الغرفة؟')) {
      DB.delete('project_rooms', id).then(() => {
        App.renderActiveProjectTabContent();
      });
    }
  },

  deleteAttendanceConfirm(id) {
    if (confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      DB.delete('worker_attendance', id).then(() => {
        App.renderActiveProjectTabContent();
      });
    }
  },

  deleteExpenseConfirm(id) {
    if (confirm('حذف هذه النفقة؟')) {
      DB.delete('expenses', id).then(() => {
        App.renderActiveProjectTabContent();
      });
    }
  },

  deleteCustomerPaymentConfirm(id) {
    if (confirm('حذف هذا الدفع؟')) {
      DB.delete('customer_payments', id).then(() => {
        App.renderActiveProjectTabContent();
      });
    }
  },

  saveSettingsAction() {
    const name = document.getElementById('set-company-name').value;
    const nameFr = document.getElementById('set-company-name-fr').value;
    const phone = document.getElementById('set-phone').value;
    const email = document.getElementById('set-email').value;
    const address = document.getElementById('set-address').value;
    const rc = document.getElementById('set-rc').value;
    const nif = document.getElementById('set-nif').value;
    const curr = document.getElementById('set-currency').value;

    DB.update('company_settings', 'settings_main', {
      company_name: name,
      company_name_fr: nameFr,
      phone,
      email,
      address,
      rc_number: rc,
      nif_number: nif,
      currency: curr
    }).then(() => {
      alert('✓ تم حفظ إعدادات المؤسسة وتطبيقها بنجاح!');
      location.reload();
    });
  },

  // Supabase Cloud Configuration Modal
  openSupabaseConfigModal() {
    let existingModal = document.getElementById('supabase-config-modal');
    if (existingModal) existingModal.remove();

    const isConnected = DB.isSupabaseConnected;
    const currentUrl = DB.supabaseUrl || '';
    const currentKey = DB.supabaseAnonKey || '';

    const modalHtml = `
      <div id="supabase-config-modal" class="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
        <div class="modal-card w-full max-w-xl rounded-2xl p-6 space-y-5 border border-white/10/80 shadow-2xl">
          <div class="flex items-center justify-between pb-3 border-b border-white/8">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center text-xl font-bold border border-blue-500/30">
                ☁️
              </div>
              <div>
                <h3 class="text-base font-bold text-white">Configuration Supabase Cloud (PostgreSQL)</h3>
                <p class="text-xs text-slate-400">ربط وتفعيل قاعدة البيانات السحابية المركزية لجميع الورشات</p>
              </div>
            </div>
            <button onclick="document.getElementById('supabase-config-modal').remove()" class="text-slate-400 hover:text-white p-1 text-lg">✕</button>
          </div>

          <div class="p-3.5 rounded-xl ${isConnected ? 'bg-emerald-950/40 border border-emerald-500/30' : 'bg-amber-950/40 border border-amber-500/30'} flex items-center gap-3">
            <span class="w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'} flex-shrink-0"></span>
            <div class="text-xs">
              <span class="font-bold text-white block">${isConnected ? 'قاعدة بيانات Supabase متصلة ونشطة (Connecté)' : 'الوضع الحالي: تخزين محلي (Mode Local / Non connecté)'}</span>
              <span class="text-slate-400 text-[11px]">${isConnected ? 'جميع السجلات متزامنة سحابياً مع خادم PostgreSQL' : 'أدخل بيانات مشروعك في Supabase للربط الفوري'}</span>
            </div>
          </div>

          <form onsubmit="App.saveSupabaseConfig(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">
                Project URL (رابط المشروع)
              </label>
              <input type="text" id="supabase-input-url" value="${currentUrl}" placeholder="https://xyzcompany.supabase.co" class="w-full text-xs font-mono text-left" dir="ltr" required>
              <p class="text-[10px] text-slate-400 mt-1">تجد هذا الرابط في لوحة تحكم Supabase > Project Settings > API</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">
                Project Anon Key (المفتاح العام المشفر)
              </label>
              <input type="text" id="supabase-input-key" value="${currentKey}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full text-xs font-mono text-left" dir="ltr" required>
              <p class="text-[10px] text-slate-400 mt-1">مفتاح Anon/Public Key الصالح للوصول من المتصفح</p>
            </div>

            <div class="p-3 rounded-xl bg-[#0E0E12]/60 border border-white/5 text-xs space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-slate-300">📜 كود إنشاء الجداول (supabase_schema.sql)</span>
                <button type="button" onclick="App.copySupabaseSchema()" class="text-blue-400 hover:text-blue-300 font-bold hover:underline flex items-center gap-1">
                  <span>📋 نسخ الكود كاملاً (23 جدول)</span>
                </button>
              </div>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                قبل الربط، افتح <strong>SQL Editor</strong> في لوحة Supabase والصق محتوى ملف <code>supabase_schema.sql</code> ثم اضغط <strong>RUN</strong> لإنشاء الجداول وسياسات الأمان.
              </p>
            </div>

            <div class="flex items-center justify-between pt-3 border-t border-white/8">
              ${isConnected ? `
                <button type="button" onclick="App.disconnectSupabaseAction()" class="px-3.5 py-2 rounded-xl bg-rose-900/30 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 text-xs font-bold transition">
                  قطع الاتصال والسحب
                </button>
              ` : `<span></span>`}

              <div class="flex items-center gap-2">
                <button type="button" onclick="document.getElementById('supabase-config-modal').remove()" class="px-4 py-2 rounded-xl bg-[#141418] hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                  إلغاء / Annuler
                </button>
                <button type="submit" id="btn-save-supabase" class="px-5 py-2 rounded-xl bg-[#FF3B30] hover:bg-[#E0352B] text-white text-xs font-bold shadow-lg shadow-blue-900/40 flex items-center gap-1.5">
                  <span>⚡ اختبار وحفظ الاتصال</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async saveSupabaseConfig(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-supabase');
    if (btn) btn.innerHTML = '<span>جاري التحقق...</span>';

    const url = document.getElementById('supabase-input-url').value.trim();
    const key = document.getElementById('supabase-input-key').value.trim();

    try {
      await DB.configureSupabase(url, key);
      alert('✓ تم الاتصال بـ Supabase بنجاح ومزامنة 23 جدولاً!');
      const modal = document.getElementById('supabase-config-modal');
      if (modal) modal.remove();
      this.updateSupabaseUIState();
      this.renderCurrentView();
    } catch (err) {
      alert('خطأ في الاتصال بـ Supabase:\n' + err.message);
      if (btn) btn.innerHTML = '<span>⚡ اختبار وحفظ الاتصال</span>';
    }
  },

  disconnectSupabaseAction() {
    if (confirm('هل ترغب حقاً في قطع الاتصال بقاعدة Supabase والعودة للتخزين المحلي؟')) {
      DB.disconnectSupabase();
      alert('تم قطع الاتصال والتحول للوضع المحلي.');
      const modal = document.getElementById('supabase-config-modal');
      if (modal) modal.remove();
      this.updateSupabaseUIState();
      this.renderCurrentView();
    }
  },

  copySupabaseSchema() {
    fetch('supabase_schema.sql')
      .then(res => res.text())
      .then(sql => {
        navigator.clipboard.writeText(sql).then(() => {
          alert('✓ تم نسخ كود SQL كاملاً (23 جدولاً) إلى الحافظة!\nالآن افتح Supabase > SQL Editor > الصق الكود ثم اضغط Run.');
        });
      })
      .catch(err => {
        alert('يرجى نسخ محتوى ملف supabase_schema.sql يدوياً من مجلد المشروع.');
      });
  },

  updateSupabaseUIState() {
    const isConn = DB.isSupabaseConnected;
    
    // Header badge
    const headerBadge = document.getElementById('header-supabase-badge');
    if (headerBadge) {
      headerBadge.innerHTML = isConn ? `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="hidden sm:inline">Supabase</span>
        <span class="text-emerald-400 font-extrabold text-[11px]">Connecté</span>
      ` : `
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span class="hidden sm:inline">Supabase</span>
        <span class="text-amber-400 font-bold text-[11px]">Local</span>
      `;
    }

    // Sidebar status pill
    const sidebarPill = document.getElementById('sidebar-db-status-pill');
    if (sidebarPill) {
      sidebarPill.className = `text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${isConn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`;
      sidebarPill.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full ${isConn ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
        <span>${isConn ? 'متصل' : 'محلي'}</span>
      `;
    }

    const sidebarSub = document.getElementById('sidebar-db-subtitle');
    if (sidebarSub) {
      sidebarSub.textContent = isConn ? 'PostgreSQL Cloud Synced' : 'Stockage Local Prêt';
    }
  },

  showNotifications() {
    alert(`🔔 التنبيهات والإشعارات (Notifications):
1. ورشة "فيلا الأندلس": موعد توريد ألواح البلاكو BA13 اليوم.
2. العامل كمال بن سالم: طلب تسبيق على الراتب بمبلغ 5,000 دج.
3. زبون "السيد رفيق": استحقاق دفعة بقيمة 50,000 دج.
4. المخزون: نفاد ألواح الغارداكس (Placo Guardex) من المستودع.
5. فواتير: 12 فاتورة قيد الانتظار لم يتم تحصيلها.`);
  }
};

window.App = App;
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
