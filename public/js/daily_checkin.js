
/**
 * SECURITY: Escape HTML to prevent XSS from user data in innerHTML
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Daily Worker Check-In & Attendance Management Module (نظام التحضير اليومي السريع للعمال)
 * Handles fast daily pointage, multipliers (normal 1.0, half 0.5, double 2.0, absent 0),
 * worksite assignments, instant cash advances, monthly attendance matrices, and printable sheets.
 */

const DailyCheckin = {
  selectedDate: new Intl.DateTimeFormat('fr-CA', { timeZone: 'Africa/Algiers' }).format(new Date()),
  state: {}, // workerId -> { status, multiplier, daily_wage, calculated_amount, project_id, advance_given, work_description }
  currentMonth: new Intl.DateTimeFormat('fr-CA', { timeZone: 'Africa/Algiers' }).format(new Date()).slice(0, 7), // YYYY-MM

  async initDateState(date) {
    this.selectedDate = date;
    const workers = await DB.getAll('workers');
    const projects = await DB.getAll('projects');
    const attendances = await DB.query('worker_attendance', a => a.date === date);
    const payments = await DB.query('worker_payments', p => p.date === date && p.payment_type === 'advance');

    const defaultProjectId = projects[0] ? projects[0].id : '';

    this.state = {};
    workers.forEach(w => {
      const existingAtt = attendances.find(a => String(a.worker_id) === String(w.id));
      const existingAdv = payments.find(p => String(p.worker_id) === String(w.id));

      if (existingAtt) {
        this.state[w.id] = {
          worker_id: w.id,
          worker_name: w.full_name,
          specialty: w.specialty,
          workday_type: existingAtt.workday_type || 'normal',
          // FIX: Preserve 0 multiplier for absent workers — do NOT default absent to 1.0
          multiplier: (existingAtt.workday_type === 'absent')
            ? 0
            : (existingAtt.multiplier !== undefined && !isNaN(parseFloat(existingAtt.multiplier))
                ? parseFloat(existingAtt.multiplier)
                : 1.0),
          daily_wage: parseFloat(existingAtt.daily_wage || w.daily_wage) || 0,
          calculated_amount: parseFloat(existingAtt.calculated_amount) || 0,
          project_id: existingAtt.project_id || defaultProjectId,
          advance_given: existingAdv ? parseFloat(existingAdv.amount) || 0 : 0,
          commission: parseFloat(existingAtt.commission) || 0,
          work_description: existingAtt.work_description || ''
        };
      } else {
        // Default: Present (Normal 1.0)
        const wage = parseFloat(w.daily_wage) || 0;
        this.state[w.id] = {
          worker_id: w.id,
          worker_name: w.full_name,
          specialty: w.specialty,
          workday_type: 'normal',
          multiplier: 1.0,
          daily_wage: wage,
          calculated_amount: wage,
          project_id: defaultProjectId,
          advance_given: 0,
          work_description: 'أشغال ورشة يومية'
        };
      }
    });
  },

  async renderView(container) {
    if (!this.state || Object.keys(this.state).length === 0) {
      await this.initDateState(this.selectedDate);
    }

    const workers = await DB.getAll('workers');
    const projects = await DB.getAll('projects');

    // Compute day totals
    let countFull = 0, countOneAndHalf = 0, countHalf = 0, countDouble = 0, countAbsent = 0, totalCommissionsToday = 0;
    let totalWagesToday = 0;
    let totalAdvancesToday = 0;

    Object.values(this.state).forEach(st => {
      totalWagesToday += parseFloat(st.calculated_amount) || 0;
      totalAdvancesToday += parseFloat(st.advance_given) || 0;
      totalCommissionsToday += parseFloat(st.commission) || 0;

      if (st.workday_type === 'absent' || st.multiplier === 0) countAbsent++;
      else if (st.workday_type === 'one_and_half' || st.multiplier === 1.5) countOneAndHalf++;
      else if (st.workday_type === 'half' || st.multiplier === 0.5) countHalf++;
      else if (st.workday_type === 'double' || st.multiplier === 2.0) countDouble++;
      else countFull++;
    });

    const isConnected = DB.isSupabaseConnected;

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Cockpit Checkin Header Banner -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-checkin" placeholder="🔍 Rechercher un ouvrier pour le pointage journalier..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl">⏱️</div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base font-black text-white">Cockpit Pointage Journalier des Ouvriers / التحضير اليومي السريع</h2>
                <span class="px-2.5 py-0.5 rounded-full ${isConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'} text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}"></span>
                  <span>${isConnected ? 'Supabase Cloud Connecté' : 'Mode Local Permanent'}</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">Pointage des chantiers, demi-journées, heures sup, calcul instantané des paies / حضور الورشات والتسبيقات</p>
            </div>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <button onclick="DailyCheckin.changeDay(-1)" class="px-3 py-2 bg-[#121216] hover:bg-[#1E1E26] text-white rounded-xl text-xs font-bold border border-white/10 transition">
              ← Hier
            </button>
            <input type="date" value="${this.selectedDate}" onchange="DailyCheckin.changeDayDate(this.value)" class="bg-[#121216] border border-white/10 text-white font-bold px-3 py-2 rounded-xl text-xs focus:border-[#FF3B30]">
            <button onclick="DailyCheckin.changeDay(1)" class="px-3 py-2 bg-[#121216] hover:bg-[#1E1E26] text-white rounded-xl text-xs font-bold border border-white/10 transition">
              Demain →
            </button>
            <button onclick="DailyCheckin.setToday()" class="px-3.5 py-2 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF453A] rounded-xl text-xs font-bold border border-[#FF3B30]/30 transition">
              📅 Aujourd'hui
            </button>
            <button onclick="DailyCheckin.saveAllAndPrint()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3B30] to-[#E0352B] text-white font-bold text-xs flex items-center gap-2 border border-red-400/30">
              🖨️ Feuille de pointage A4
            </button>
          </div>
        </div>

        <!-- Today Summary Cockpit 6 KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-blue-400 text-xs font-bold">Total inscrits</span>
              <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${workers.length}</span></div>
            <span class="text-[10px] text-slate-400">Effectif total</span>
          </div>

          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-emerald-400 text-xs font-bold">Journée (1.0)</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${countFull}</span></div>
            <span class="text-[10px] text-slate-400">Présents à temps plein</span>
          </div>

          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-cyan-400 text-xs font-bold">Demi-journée (0.5)</span>
              <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">DEMI</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${countHalf}</span></div>
            <span class="text-[10px] text-slate-400">Présents mi-temps</span>
          </div>

          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs font-bold">Double (2.0)</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">DOUBLE</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${countDouble}</span></div>
            <span class="text-[10px] text-slate-400">Heures sup & urgences</span>
          </div>

          <div class="kpi-card metric-box-red p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-red-400 text-xs font-bold">Absents (0.0)</span>
              <span class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-black">ABSENT</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${countAbsent}</span></div>
            <span class="text-[10px] text-slate-400">Ouvriers absents</span>
          </div>

          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-purple-400 text-xs font-bold">Masse Paie Jour</span>
              <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">SALAIRE</span>
            </div>
            <div class="my-2"><span class="text-lg sm:text-xl font-black text-white">${App.formatCurrency(totalWagesToday)}</span></div>
            <span class="text-[10px] text-slate-400">Total salaires du jour</span>
          </div>
        </div>

        <!-- Checkin Actions Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#121216] border border-white/5 rounded-2xl border border-slate-700/60 shadow-lg">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-300 font-bold">تحضير تاريخ: <span class="text-blue-400 font-black">${this.selectedDate}</span></span>
            <span class="text-xs text-slate-500">•</span>
            <span class="text-xs text-slate-400">إجمالي العمال في الفريق: <strong class="text-white">${workers.length} عمال</strong></span>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="DailyCheckin.markAllFullDay()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition">
              ✓ تعيين الكل حاضر (1.0)
            </button>
            <button onclick="DailyCheckin.printDailyCheckinSheet()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
              <span>🖨️ طباعة ورقة التحضير A4</span>
            </button>
            <button onclick="DailyCheckin.showMonthlyMatrixModal()" class="px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900 text-purple-300 rounded-lg text-xs font-bold border border-purple-500/30 transition flex items-center gap-1.5">
              <span>📅 شبكة الشهر كاملة</span>
            </button>
            <button onclick="DailyCheckin.saveCheckin()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-900/40 transition flex items-center gap-1.5">
              <span>💾 حفظ التحضير اليومي فوراً</span>
            </button>
          </div>
        </div>

        <!-- Workers Checkin Interactive Table -->
        <div class="kpi-card rounded-2xl overflow-hidden shadow-xl">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-right">
              <thead>
                <tr class="bg-slate-900/80 text-slate-400 font-bold border-b border-slate-700/80">
                  <th class="py-3.5 px-4">العامل والتخصص</th>
                  <th class="py-3.5 px-3">الورشة / المشروع</th>
                  <th class="py-3.5 px-3 text-center">نوع اليومية (انقر للتعيين السريع)</th>
                  <th class="py-3.5 px-2 text-center">الأجر اليومي</th>
                  <th class="py-3.5 px-3 text-center font-extrabold text-blue-400">الأجر المستحق اليوم</th>
                  <th class="py-3.5 px-3 text-center text-amber-400">تسبيق نقدي فوري</th>
                  <th class="py-3.5 px-4">الأشغال والمهام المنجزة اليوم</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${workers.map(w => {
                  const item = this.state[w.id] || {
                    workday_type: 'normal',
                    multiplier: 1.0,
                    daily_wage: w.daily_wage,
                    calculated_amount: w.daily_wage,
                    project_id: projects[0] ? projects[0].id : '',
                    advance_given: 0,
                    commission: 0,
                    work_description: ''
                  };

                  return `
                    <tr class="hover:bg-slate-800/40 transition ${item.workday_type === 'absent' ? 'opacity-60 bg-rose-950/10' : ''}">
                      <!-- Worker info -->
                      <td class="py-3 px-4 font-bold text-white">
                        <div class="flex items-center gap-2.5">
                          <div class="w-8 h-8 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/20">
                            👷
                          </div>
                          <div>
                            <span class="font-bold text-white block text-sm">${escapeHtml(w.full_name)}</span>
                            <span class="text-[10px] text-slate-400 block">${escapeHtml(w.specialty)} • ${w.phone || ''}</span>
                          </div>
                        </div>
                      </td>

                      <!-- Project Selection for the day -->
                      <td class="py-3 px-3">
                        <select onchange="DailyCheckin.updateWorkerField('${w.id}', 'project_id', this.value)" class="bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white w-44 font-semibold">
                          ${projects.map(p => `
                            <option value="${p.id}" ${String(p.id) === String(item.project_id) ? 'selected' : ''}>
                              ${p.name.length > 25 ? p.name.substring(0, 25) + '...' : p.name}
                            </option>
                          `).join('')}
                        </select>
                      </td>

                      <!-- Quick Multiplier Selector Buttons -->
                      <td class="py-3 px-3 text-center">
                        <div class="inline-flex rounded-xl p-1 bg-slate-900 border border-slate-800 gap-1">
                          <button onclick="DailyCheckin.setWorkerStatus('${w.id}', 'normal')" class="px-2 py-1 rounded-lg text-xs font-bold transition ${item.workday_type === 'normal' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يوم كامل">
                            يوم (1.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('${w.id}', 'one_and_half')" class="px-2 py-1 rounded-lg text-xs font-bold transition ${item.workday_type === 'one_and_half' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يوم ونصف">
                            يوم ونصف (1.5)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('${w.id}', 'double')" class="px-2 py-1 rounded-lg text-xs font-bold transition ${item.workday_type === 'double' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="يومان مضاعف">
                            يومان (2.0)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('${w.id}', 'half')" class="px-2 py-1 rounded-lg text-xs font-bold transition ${item.workday_type === 'half' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="نصف يوم">
                            نصف (0.5)
                          </button>
                          <button onclick="DailyCheckin.setWorkerStatus('${w.id}', 'absent')" class="px-2 py-1 rounded-lg text-xs font-bold transition ${item.workday_type === 'absent' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}" title="غائب">
                            غائب (0)
                          </button>
                        </div>
                      </td>

                      <!-- Daily Wage Base -->
                      <td class="py-3 px-2 text-center text-slate-300 font-semibold">
                        ${App.formatCurrency(item.daily_wage)}
                      </td>

                      <!-- Commission / Bonus Input -->
                      <td class="py-3 px-2 text-center">
                        <input type="number" step="500" min="0" value="${item.commission || ''}" placeholder="+0 دج" onchange="DailyCheckin.updateWorkerCommission('${w.id}', parseFloat(this.value) || 0)" class="w-24 bg-slate-900 border border-emerald-500/40 rounded-lg p-1.5 text-center font-bold text-emerald-400 text-xs focus:ring-1 focus:ring-emerald-500" title="عمولة إضافية أو مكافأة إنتاجية للعامل">
                      </td>

                      <!-- Calculated Amount for Today -->
                      <td class="py-3 px-3 text-center font-black text-sm ${item.calculated_amount > 0 ? 'text-blue-400' : 'text-slate-500'}">
                        ${App.formatCurrency(item.calculated_amount)}
                      </td>

                      <!-- Cash Advance Given on the Spot -->
                      <td class="py-3 px-3 text-center">
                        <div class="inline-flex items-center gap-1">
                          <input type="number" step="500" value="${item.advance_given || ''}" placeholder="0 دج" onchange="DailyCheckin.updateWorkerField('${w.id}', 'advance_given', parseFloat(this.value) || 0)" class="w-24 bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-center font-bold text-amber-300 text-xs focus:ring-1 focus:ring-amber-500">
                        </div>
                      </td>

                      <!-- Work Description -->
                      <td class="py-3 px-4">
                        <input type="text" value="${item.work_description || ''}" placeholder="تفاصيل الأشغال المنجزة اليوم..." onchange="DailyCheckin.updateWorkerField('${w.id}', 'work_description', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white placeholder-slate-600">
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

  setWorkerStatus(workerId, type) {
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
    // FIX: Preserve actual multiplier (including 0 for absent)
    const mult = (this.state[workerId].multiplier !== undefined && !isNaN(parseFloat(this.state[workerId].multiplier)))
      ? parseFloat(this.state[workerId].multiplier)
      : 1.0;
    this.state[workerId].calculated_amount = (baseWage * mult) + comm;

    this.renderView(document.getElementById('main-content-view'));
  },

  updateWorkerField(workerId, field, val) {
    if (!this.state[workerId]) return;
    this.state[workerId][field] = val;
    if (field === 'advance_given') {
      this.renderView(document.getElementById('main-content-view'));
    }
  },

  markAllFullDay() {
    Object.values(this.state).forEach(st => {
      st.workday_type = 'normal';
      st.multiplier = 1.0;
      st.calculated_amount = (st.daily_wage || 0) * 1.0;
    });
    this.renderView(document.getElementById('main-content-view'));
  },

  changeDay(offset) {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + offset);
    // FIX: Use Algeria local date (UTC+1) to avoid day skew after midnight
    const newDateStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Africa/Algiers' }).format(d);
    this.changeDayDate(newDateStr);
  },

  setToday() {
    const todayStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'Africa/Algiers' }).format(new Date());
    this.changeDayDate(todayStr);
  },

  async changeDayDate(newDateStr) {
    this.selectedDate = newDateStr;
    await this.initDateState(newDateStr);
    this.renderView(document.getElementById('main-content-view'));
  },

  async saveCheckin() {
    const activePartnerId = (typeof App !== 'undefined' && App.activePartnerId) || 'USR-001';
    const entries = Object.values(this.state).map(st => ({
      ...st,
      date: this.selectedDate,
      partner_id: activePartnerId
    }));

    try {
      const result = await DB.recordDailyCheckin(entries);
      alert(`✓ تم بنجاح حفظ التحضير اليومي لتاريخ ${this.selectedDate}!\n- عدد الحضور المسجل: ${result.savedAttendances.length}\n- عدد التسبيقات المسجلة: ${result.savedPayments.length}\nتم الحفظ في قاعدة بيانات SQLite.`);
      await this.initDateState(this.selectedDate);
      this.renderView(document.getElementById('main-content-view'));
    } catch (err) {
      alert('حدث خطأ أثناء الحفظ: ' + err.message);
    }
  },

  // Printable A4 Attendance Sheet
  async printDailyCheckinSheet() {
    const workers = await DB.getAll('workers');
    const projects = await DB.getAll('projects');
    const settings = (await DB.getAll('company_settings'))[0] || {};

    let totalWages = 0;
    let totalAdvances = 0;
    let totalCommissions = 0;

    const rows = workers.map(w => {
      const item = this.state[w.id] || { workday_type: 'normal', multiplier: 1.0, calculated_amount: w.daily_wage, advance_given: 0, commission: 0 };
      const prj = projects.find(p => String(p.id) === String(item.project_id)) || {};
      totalWages += parseFloat(item.calculated_amount) || 0;
      totalAdvances += parseFloat(item.advance_given) || 0;
      totalCommissions += parseFloat(item.commission) || 0;

      const statusLabels = {
        normal: 'يوم (1.0)',
        one_and_half: 'يوم ونصف (1.5)',
        half: 'نصف يوم (0.5)',
        double: 'مضاعف (2.0)',
        absent: 'غائب (0)'
      };

      return `
        <tr>
          <td style="font-weight:bold;">${escapeHtml(w.full_name)}</td>
          <td>${escapeHtml(w.specialty)}</td>
          <td>${prj.name || 'الورشة العامة'}</td>
          <td style="text-align:center;">${statusLabels[item.workday_type] || 'حاضر'}</td>
          <td style="text-align:center;">${(item.daily_wage || 0).toLocaleString('fr-FR')} دج</td>
          <td style="text-align:center; color:#059669; font-weight:bold;">${item.commission ? '+' + item.commission.toLocaleString('fr-FR') + ' دج' : '-'}</td>
          <td style="text-align:center; font-weight:bold;">${(item.calculated_amount || 0).toLocaleString('fr-FR')} دج</td>
          <td style="text-align:center; color:#B45309;">${item.advance_given ? item.advance_given.toLocaleString('fr-FR') + ' دج' : '-'}</td>
          <td>${item.work_description || ''}</td>
          <td style="width: 100px;"></td>
        </tr>
      `;
    }).join('');

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>ورقة التحضير اليومي للعمال - ${this.selectedDate}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 10mm 15mm; color: #111; font-size: 9.5pt; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-bottom: 15px; }
          .header h1 { font-size: 14pt; margin: 0; color: #0B132B; font-weight: 900; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #333; padding: 5px 8px; font-size: 9pt; }
          th { background: #0B132B; color: #FFF; font-weight: bold; }
          .footer-summary { margin-top: 20px; display: flex; justify-content: space-between; font-size: 10pt; }
          .sign-box { border: 1px solid #999; padding: 10px; width: 200px; text-align: center; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 12px;">
            <img src="dari_luxe_logo.png" alt="DARI LUXE" style="max-height: 55px; object-fit: contain;">
            <div>
              <h1 style="font-size: 14pt; margin: 0; color: #0B132B; font-weight: 900;">DARI LUXE</h1>
              <p style="margin: 2px 0 0 0; font-size: 8pt; color: #B45309; font-weight: bold;">RÉNOVATION & AMÉNAGEMENT — داري لوكس</p>
              <p style="margin: 2px 0 0 0; font-size: 7.5pt; color: #555;">0550 60 09 09 • DARILUXE.NET@GMAIL.COM • سيدي لخضر - عين الدفلى (17 أكتوبر)</p>
            </div>
          </div>
          <div style="text-align:left;">
            <h2 style="margin:0; font-size:11pt; color:#B45309; font-weight: 800;">FEUILLE DE POINTAGE JOURNALIER</h2>
            <p style="margin:2px 0 0 0; font-weight: bold; color: #0B132B;">ورقة التحضير وإثبات الأجور</p>
            <p style="margin:2px 0 0 0; font-size: 8.5pt;"><strong>التاريخ:</strong> ${this.selectedDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>اسم العامل</th>
              <th>التخصص</th>
              <th>الورشة / المشروع</th>
              <th style="text-align:center;">الحالة</th>
              <th style="text-align:center;">الأجر الأساسي</th>
              <th style="text-align:center;">عمولة / بريم</th>
              <th style="text-align:center;">المستحق اليوم</th>
              <th style="text-align:center;">التسبيق</th>
              <th>الأشغال المنجزة</th>
              <th style="text-align:center;">إمضاء العامل</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="footer-summary">
          <div>
            <p><strong>مجموع أجور اليوم:</strong> ${totalWages.toLocaleString('fr-FR')} دج</p>
            <p><strong>مجموع العمولات والمكافآت:</strong> ${totalCommissions.toLocaleString('fr-FR')} دج</p>
            <p><strong>مجموع التسبيقات المسلمة:</strong> ${totalAdvances.toLocaleString('fr-FR')} دج</p>
          </div>
          <div class="sign-box">
            <span>تأشيرة وإمضاء رئيس الورشة / المدير</span>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 250);
  },

  // Monthly Matrix View (عرض شبكة الحضور الشهرية)
  async showMonthlyMatrixModal() {
    const workers = await DB.getAll('workers');
    const attendances = await DB.getAll('worker_attendance');

    const yearMonth = this.currentMonth; // e.g. '2026-11'
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    // Build days array [1..31]
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const modalHtml = `
      <div id="monthly-matrix-modal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-[#0B132B] border border-slate-700/80 rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          
          <div class="p-5 border-b border-slate-800 flex justify-between items-center bg-[#080D1E]">
            <div class="flex items-center gap-3">
              <span class="text-2xl">📅</span>
              <div>
                <h3 class="text-base font-black text-white">شبكة وجدول الحضور الشهري للعمال (Matrice Mensuelle)</h3>
                <p class="text-xs text-slate-400">تتبع حضور جميع العمال يوم بيوم على مدار الشهر</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <input type="month" value="${this.currentMonth}" onchange="DailyCheckin.changeMonth(this.value)" class="bg-[#121216] border border-white/5 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold">
              <button onclick="document.getElementById('monthly-matrix-modal').remove()" class="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>
          </div>

          <div class="p-5 overflow-auto flex-1">
            <table class="w-full text-[11px] text-right border-collapse">
              <thead>
                <tr class="bg-slate-900/90 text-slate-400 font-bold border-b border-slate-700">
                  <th class="py-2.5 px-3 sticky right-0 bg-[#080D1E] z-10 w-44">العامل</th>
                  ${days.map(d => `<th class="py-2 px-1 text-center w-7 border-l border-slate-800">${d}</th>`).join('')}
                  <th class="py-2 px-3 text-center bg-blue-950/40 text-blue-300 font-bold">المجموع</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                ${workers.map(w => {
                  let totalMonthDays = 0;
                  const dayCells = days.map(d => {
                    const dateStr = `${yearMonth}-${String(d).padStart(2, '0')}`;
                    const att = attendances.find(a => String(a.worker_id) === String(w.id) && a.date === dateStr);
                    if (!att) return `<td class="py-2 px-1 text-center text-slate-700 border-l border-slate-800/60">-</td>`;

                    const mult = parseFloat(att.multiplier) || 0;
                    totalMonthDays += mult;

                    let badge = '';
                    if (mult === 1.0) badge = `<span class="w-5 h-5 rounded bg-emerald-600 text-white inline-flex items-center justify-center font-bold text-[10px]">1</span>`;
                    else if (mult === 1.5) badge = `<span class="w-5 h-5 rounded bg-blue-600 text-white inline-flex items-center justify-center font-bold text-[10px]">1.5</span>`;
                    else if (mult === 0.5) badge = `<span class="w-5 h-5 rounded bg-amber-600 text-white inline-flex items-center justify-center font-bold text-[10px]">½</span>`;
                    else if (mult === 2.0) badge = `<span class="w-5 h-5 rounded bg-purple-600 text-white inline-flex items-center justify-center font-bold text-[10px]">2</span>`;
                    else badge = `<span class="w-5 h-5 rounded bg-blue-600 text-white inline-flex items-center justify-center font-bold text-[10px]">${mult}</span>`;

                    return `<td class="py-2 px-1 text-center border-l border-slate-800/60">${badge}</td>`;
                  }).join('');

                  return `
                    <tr class="hover:bg-slate-800/40">
                      <td class="py-2.5 px-3 font-bold text-white sticky right-0 bg-[#0B132B] z-10">
                        ${escapeHtml(w.full_name)}
                        <span class="text-[10px] text-slate-500 block font-normal">${escapeHtml(w.specialty)}</span>
                      </td>
                      ${dayCells}
                      <td class="py-2.5 px-3 text-center font-black text-blue-400 bg-blue-950/20 text-xs">
                        ${totalMonthDays.toFixed(1)} يوم
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>

          <div class="p-4 border-t border-slate-800 bg-[#080D1E] flex justify-between items-center text-xs">
            <div class="flex items-center gap-4 text-slate-400">
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-600 inline-block"></span> يوم كامل (1.0)</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-600 inline-block"></span> نصف يوم (0.5)</span>
              <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-purple-600 inline-block"></span> يوم مضاعف (2.0)</span>
            </div>
            <button onclick="document.getElementById('monthly-matrix-modal').remove()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold">
              إغلاق
            </button>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  async changeMonth(newMonth) {
    this.currentMonth = newMonth;
    const oldModal = document.getElementById('monthly-matrix-modal');
    if (oldModal) oldModal.remove();
    await this.showMonthlyMatrixModal();
  }
};

window.DailyCheckin = DailyCheckin;
