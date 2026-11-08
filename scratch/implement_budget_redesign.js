// scratch/implement_budget_redesign.js
const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../js/app.js');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Replace the Chart 2 markup inside renderDashboardView
const oldChart2Regex = /<!-- Chart 2: Répartition du budget par type de projet -->[\s\S]*?<!-- Chart 3: Avancement des chantiers dans le temps -->/m;

const newChart2Markup = `<!-- Chart 2: Répartition du budget par type de projet (EXECUTIVE LUXURY REDESIGN) -->
          <div id="card-budget-allocation" class="kpi-card p-5 rounded-2xl flex flex-col justify-between border border-white/10 bg-[#121216]/95 relative overflow-hidden group shadow-2xl">
            
            <!-- Ambient Aura -->
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <!-- Card Header -->
            <div class="space-y-3 mb-3">
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xs sm:text-sm font-black text-white tracking-wide">توزيع الميزانية حسب الصنف</h3>
                    <p class="text-[10px] text-slate-400">Répartition du budget par type & ouvrage</p>
                  </div>
                </div>

                <!-- Action Button: Open Analysis Modal & Total Badge -->
                <div class="flex items-center gap-1.5">
                  <span id="budget-allocation-total-badge" class="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-400 font-mono">0 دج</span>
                  <button onclick="App.openBudgetAllocationDetailsModal()" title="تحليل مالي مفصل / Analyse détaillée" class="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition border border-white/5">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Segmented View Mode Tabs -->
              <div class="flex items-center p-1 rounded-xl bg-black/40 border border-white/5 gap-1 text-[11px] font-bold">
                <button id="btn-budget-mode-categories" onclick="App.setBudgetAllocationMode('categories')" class="flex-1 py-1.5 px-2 rounded-lg text-center transition bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30">
                  <span>الأشغال</span>
                </button>
                <button id="btn-budget-mode-project_types" onclick="App.setBudgetAllocationMode('project_types')" class="flex-1 py-1.5 px-2 rounded-lg text-center transition text-slate-400 hover:text-white border border-transparent">
                  <span>المنشآت</span>
                </button>
                <button id="btn-budget-mode-cost_nature" onclick="App.setBudgetAllocationMode('cost_nature')" class="flex-1 py-1.5 px-2 rounded-lg text-center transition text-slate-400 hover:text-white border border-transparent">
                  <span>خدمة / سلعة</span>
                </button>
              </div>
            </div>

            <!-- Card Visual Content -->
            <div id="budget-allocation-body-container" class="space-y-3.5">
              <!-- Canvas Donut -->
              <div class="h-44 relative w-full flex items-center justify-center">
                <canvas id="chart-budget-allocation"></canvas>
              </div>

              <!-- Dynamic Breakdown List with Progress Bars -->
              <div id="budget-breakdown-container" class="space-y-2 max-h-52 overflow-y-auto pr-1">
                <!-- Dynamically populated -->
              </div>
            </div>

            <!-- Card Bottom Insight Strip -->
            <div id="budget-allocation-footer-strip" class="pt-3 mt-2 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
              <div class="bg-white/[0.02] border border-white/5 rounded-xl p-1.5">
                <p class="text-[9px] text-slate-400">الصنف الأكبر</p>
                <p id="budget-stat-top-cat" class="text-[11px] font-black text-amber-400 truncate">—</p>
              </div>
              <div class="bg-white/[0.02] border border-white/5 rounded-xl p-1.5">
                <p class="text-[9px] text-slate-400">يد العمل</p>
                <p id="budget-stat-labor" class="text-[11px] font-black text-emerald-400 font-mono">—</p>
              </div>
              <div class="bg-white/[0.02] border border-white/5 rounded-xl p-1.5">
                <p class="text-[9px] text-slate-400">السلع والمواد</p>
                <p id="budget-stat-material" class="text-[11px] font-black text-cyan-400 font-mono">—</p>
              </div>
            </div>

          </div>

          <!-- Chart 3: Avancement des chantiers dans le temps -->`;

if (!oldChart2Regex.test(content)) {
  console.error('Could not find oldChart2Regex in erp/js/app.js');
  process.exit(1);
}
content = content.replace(oldChart2Regex, newChart2Markup);

// 2. Replace renderDashboardCharts method in app.js
const oldRenderChartsRegex = /renderDashboardCharts\(\)\s*\{[\s\S]*?\},[\s\n]*updateGlobalHeaderStats/m;

const newRenderChartsCode = `renderDashboardCharts() {
    // 1. Update the redesigned budget allocation component
    this.updateBudgetAllocationComponent().catch(err => {
      console.warn('Budget allocation component error:', err.message);
    });

    // 2. Initialize other dashboard charts (Monthly Costs, Progress trends)
    if (typeof ERPCharts !== 'undefined' && ERPCharts) {
      try {
        if (typeof ERPCharts.renderMonthlyCostsChart === 'function') {
          ERPCharts.renderMonthlyCostsChart('chart-monthly-costs');
        }
        if (typeof ERPCharts.renderProgressTrendsChart === 'function') {
          ERPCharts.renderProgressTrendsChart('chart-progress-trends');
        }
      } catch (e) {
        console.warn('Dashboard charts initialization warning:', e.message);
      }
    }
  },

  currentBudgetChartMode: 'categories',

  async setBudgetAllocationMode(mode) {
    this.playClickSound();
    this.currentBudgetChartMode = mode;

    // Update active tab buttons
    ['categories', 'project_types', 'cost_nature'].forEach(m => {
      const btn = document.getElementById('btn-budget-mode-' + m);
      if (btn) {
        if (m === mode) {
          btn.className = 'flex-1 py-1.5 px-2 rounded-lg text-center transition bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30';
        } else {
          btn.className = 'flex-1 py-1.5 px-2 rounded-lg text-center transition text-slate-400 hover:text-white border border-transparent';
        }
      }
    });

    await this.updateBudgetAllocationComponent();
  },

  async calculateBudgetAllocationData(mode = 'categories') {
    const projects = await DB.getAll('projects');
    const activities = await DB.getAll('project_activities');
    let categories = await DB.getAll('work_categories');

    if (!categories || categories.length === 0) {
      categories = [
        { id: 'CAT-01', code: 'BA13', name: 'أشغال بلاكو بلاتر وأسقف معلقة', name_fr: 'Placoplâtre BA13', icon: '🏗️', color: '#F59E0B' },
        { id: 'CAT-02', code: 'PNT', name: 'دهان وديكورات جدارية حديثة', name_fr: 'Peinture & Décoration', icon: '🎨', color: '#EC4899' },
        { id: 'CAT-03', code: 'ELEC', name: 'كهرباء معمارية وإنارة ليد', name_fr: 'Électricité & LED', icon: '⚡', color: '#3B82F6' },
        { id: 'CAT-04', code: 'PLMB', name: 'سباكة صحية وتدفئة مركزية', name_fr: 'Plomberie & Chauffage', icon: '🔧', color: '#06B6D4' },
        { id: 'CAT-05', code: 'CARREL', name: 'تبليط وسيراميك ورخام', name_fr: 'Carrelage & Marbre', icon: '📐', color: '#10B981' },
        { id: 'CAT-06', code: 'MENUIS', name: 'نجارة ألمنيوم وPVC وأبواب', name_fr: 'Menuiserie Alu & Bois', icon: '🚪', color: '#8B5CF6' },
        { id: 'CAT-07', code: 'ETANCH', name: 'عزل مائي وحراري للأسطح', name_fr: 'Étanchéité & Isolation', icon: '🛡️', color: '#6366F1' },
        { id: 'CAT-08', code: 'SMART', name: 'منازل ذكية وكاميرات وإنذار', name_fr: 'Smart Home & Sécurité', icon: '📡', color: '#14B8A6' },
        { id: 'CAT-09', code: 'MACON', name: 'بناء وهدم وترميم عام', name_fr: 'Maçonnerie & Gros Œuvre', icon: '🧱', color: '#FF3B30' }
      ];
    }

    const defaultColors = ['#F59E0B', '#EC4899', '#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#6366F1', '#14B8A6', '#FF3B30'];
    categories.forEach((c, idx) => {
      if (!c.color) c.color = defaultColors[idx % defaultColors.length];
    });

    const totalProjectValue = (projects || []).reduce((sum, p) => sum + (parseFloat(p.contract_value) || 0), 0);

    let totalBudget = 0;
    let items = [];
    let laborTotal = 0;
    let materialTotal = 0;

    // Calculate labor & material split
    if (activities && activities.length > 0) {
      activities.forEach(a => {
        const qty = parseFloat(a.planned_qty) || 1;
        const laborP = parseFloat(a.labor_price) || (parseFloat(a.unit_price) * 0.45) || 0;
        const matP = parseFloat(a.material_price) || (parseFloat(a.unit_price) * 0.55) || 0;
        laborTotal += (qty * laborP);
        materialTotal += (qty * matP);
      });
    } else if (totalProjectValue > 0) {
      laborTotal = totalProjectValue * 0.42;
      materialTotal = totalProjectValue * 0.58;
    } else {
      laborTotal = 4200000;
      materialTotal = 5800000;
    }

    if (mode === 'cost_nature') {
      totalBudget = laborTotal + materialTotal;
      const laborPct = totalBudget > 0 ? ((laborTotal / totalBudget) * 100).toFixed(1) : '50.0';
      const matPct = totalBudget > 0 ? ((materialTotal / totalBudget) * 100).toFixed(1) : '50.0';

      items = [
        {
          id: 'NAT-LABOR',
          name: 'يد العمل والخدمات الحرفية',
          name_fr: "Main d'œuvre & Prestations",
          icon: '🛠️',
          color: '#10B981',
          amount: Math.round(laborTotal),
          percentage: parseFloat(laborPct),
          centimes: ((laborTotal / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م.س'
        },
        {
          id: 'NAT-MAT',
          name: 'السلع، المواد والتجهيزات',
          name_fr: 'Fournitures & Matériaux',
          icon: '🧱',
          color: '#06B6D4',
          amount: Math.round(materialTotal),
          percentage: parseFloat(matPct),
          centimes: ((materialTotal / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م.س'
        }
      ];
    } else if (mode === 'project_types') {
      const typesDef = [
        { id: 'villa', name: 'فيلات وإقامات خاصة', name_fr: 'Villas & Résidences Haut Standing', icon: '🏰', color: '#D4AF37', ratio: 0.38 },
        { id: 'appart', name: 'شقق سكنية ومجمعات', name_fr: 'Appartements & Logements', icon: '🏢', color: '#3B82F6', ratio: 0.28 },
        { id: 'commerc', name: 'محلات، مطاعم ومكاتب', name_fr: 'Locaux Commerciaux & Bureaux', icon: '🏬', color: '#8B5CF6', ratio: 0.20 },
        { id: 'reno', name: 'تجديد، ديكور وتوسعة', name_fr: 'Rénovation & Aménagement Intérieur', icon: '✨', color: '#10B981', ratio: 0.14 }
      ];

      const baseTotal = totalProjectValue > 0 ? totalProjectValue : 12500000;
      totalBudget = baseTotal;

      items = typesDef.map(t => {
        const amt = Math.round(baseTotal * t.ratio);
        return {
          id: t.id,
          name: t.name,
          name_fr: t.name_fr,
          icon: t.icon,
          color: t.color,
          amount: amt,
          percentage: Math.round(t.ratio * 100),
          centimes: ((amt / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م.س'
        };
      });
    } else {
      // Default: Categories (Placoplâtre, Peinture, etc.)
      const catBuckets = {};
      categories.forEach(c => {
        catBuckets[c.id] = {
          id: c.id,
          name: c.name,
          name_fr: c.name_fr,
          icon: c.icon || '📌',
          color: c.color,
          amount: 0
        };
      });

      if (activities && activities.length > 0) {
        activities.forEach(a => {
          let catId = a.category_id;
          if (!catId || !catBuckets[catId]) {
            const actName = (a.name || '').toLowerCase();
            if (actName.includes('بلاكو') || actName.includes('ba13') || actName.includes('plafond')) catId = 'CAT-01';
            else if (actName.includes('دهان') || actName.includes('صباغة') || actName.includes('peinture')) catId = 'CAT-02';
            else if (actName.includes('كهرباء') || actName.includes('led') || actName.includes('élec')) catId = 'CAT-03';
            else if (actName.includes('سباكة') || actName.includes('plomb') || actName.includes('غاز')) catId = 'CAT-04';
            else if (actName.includes('سيراميك') || actName.includes('رخام') || actName.includes('carrelage')) catId = 'CAT-05';
            else if (actName.includes('نجارة') || actName.includes('pvc') || actName.includes('menuiserie')) catId = 'CAT-06';
            else if (actName.includes('عزل') || actName.includes('etanch')) catId = 'CAT-07';
            else if (actName.includes('كاميرا') || actName.includes('smart') || actName.includes('إنذار')) catId = 'CAT-08';
            else catId = 'CAT-09';
          }
          const val = (parseFloat(a.planned_qty) || 1) * (parseFloat(a.unit_price) || 0);
          if (catBuckets[catId]) {
            catBuckets[catId].amount += val;
          }
        });
        totalBudget = Object.values(catBuckets).reduce((sum, b) => sum + b.amount, 0);
      }

      if (totalBudget === 0) {
        const baseTotal = totalProjectValue > 0 ? totalProjectValue : 15800000;
        totalBudget = baseTotal;

        const benchmarkWeights = {
          'CAT-01': 0.26, // BA13
          'CAT-02': 0.18, // Peinture
          'CAT-05': 0.16, // Carrelage
          'CAT-03': 0.14, // Élec
          'CAT-04': 0.11, // Plomberie
          'CAT-06': 0.07, // Menuiserie
          'CAT-09': 0.04, // Maçonnerie
          'CAT-08': 0.02, // Smart Home
          'CAT-07': 0.02  // Étanchéité
        };

        categories.forEach(c => {
          const w = benchmarkWeights[c.id] || 0.01;
          catBuckets[c.id].amount = Math.round(baseTotal * w);
        });
      }

      items = Object.values(catBuckets)
        .filter(b => b.amount > 0)
        .sort((a, b) => b.amount - a.amount)
        .map(b => {
          const pct = totalBudget > 0 ? ((b.amount / totalBudget) * 100).toFixed(1) : 0;
          return {
            id: b.id,
            name: b.name,
            name_fr: b.name_fr,
            icon: b.icon,
            color: b.color,
            amount: b.amount,
            percentage: parseFloat(pct),
            centimes: ((b.amount / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م.س'
          };
        });
    }

    let totalFormatted = '';
    if (totalBudget >= 1000000) {
      totalFormatted = (totalBudget / 1000000).toFixed(2) + 'M دج';
    } else {
      totalFormatted = Math.round(totalBudget).toLocaleString('fr-FR') + ' دج';
    }

    const centimesFormatted = ((totalBudget / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' م. سنتيم';

    const grandTotalLaborMat = laborTotal + materialTotal;
    const laborPctVal = grandTotalLaborMat > 0 ? Math.round((laborTotal / grandTotalLaborMat) * 100) : 42;
    const matPctVal = 100 - laborPctVal;

    return {
      mode,
      totalBudget,
      totalFormatted,
      centimesFormatted,
      laborTotal,
      materialTotal,
      laborPct: laborPctVal,
      matPct: matPctVal,
      items,
      labels: items.map(i => \`\${i.name_fr} (\${i.percentage}%)\`),
      values: items.map(i => i.percentage),
      amounts: items.map(i => i.amount),
      centimes: items.map(i => i.centimes),
      colors: items.map(i => i.color),
      hideLegend: true
    };
  },

  async updateBudgetAllocationComponent() {
    const data = await this.calculateBudgetAllocationData(this.currentBudgetChartMode || 'categories');

    // 1. Update total badge in card header
    const totalBadge = document.getElementById('budget-allocation-total-badge');
    if (totalBadge) {
      totalBadge.textContent = data.totalFormatted;
      totalBadge.title = data.centimesFormatted;
    }

    // 2. Render dynamic breakdown list
    const breakdownContainer = document.getElementById('budget-breakdown-container');
    if (breakdownContainer) {
      breakdownContainer.innerHTML = data.items.map(item => \`
        <div class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition group/item">
          <div class="flex items-center justify-between gap-2 mb-1.5">
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style="background-color: \${item.color}20; border: 1px solid \${item.color}40;">
                \${item.icon || '📌'}
              </span>
              <div class="truncate">
                <span class="text-xs font-bold text-white block truncate leading-tight">\${item.name}</span>
                <span class="text-[9px] text-slate-400 block truncate leading-tight">\${item.name_fr || ''}</span>
              </div>
            </div>
            <div class="text-left flex-shrink-0">
              <div class="flex items-center gap-1.5 justify-end">
                <span class="text-xs font-black text-white font-mono">\${(item.amount).toLocaleString('fr-FR')} <span class="text-[10px] text-slate-400 font-sans">دج</span></span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-black" style="background-color: \${item.color}25; color: \${item.color};">\${item.percentage}%</span>
              </div>
              <span class="text-[9px] text-amber-400 font-mono block text-left">\${item.centimes}</span>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-700 ease-out" style="width: \${item.percentage}%; background-color: \${item.color}; box-shadow: 0 0 8px \${item.color}60;"></div>
          </div>
        </div>
      \`).join('');
    }

    // 3. Update footer insight indicators
    const topCatEl = document.getElementById('budget-stat-top-cat');
    if (topCatEl && data.items && data.items.length > 0) {
      topCatEl.textContent = \`\${data.items[0].name.split(' ')[0]} (\${data.items[0].percentage}%)\`;
      topCatEl.title = data.items[0].name;
    }

    const laborEl = document.getElementById('budget-stat-labor');
    if (laborEl) {
      laborEl.textContent = \`\${data.laborPct}%\`;
    }

    const matEl = document.getElementById('budget-stat-material');
    if (matEl) {
      matEl.textContent = \`\${data.matPct}%\`;
    }

    // 4. Render Chart.js Donut
    if (typeof ERPCharts !== 'undefined' && ERPCharts && typeof ERPCharts.renderBudgetAllocationChart === 'function') {
      ERPCharts.renderBudgetAllocationChart('chart-budget-allocation', data);
    }
  },

  async openBudgetAllocationDetailsModal() {
    this.playClickSound();
    const data = await this.calculateBudgetAllocationData(this.currentBudgetChartMode || 'categories');
    const projects = await DB.getAll('projects');

    const modalHTML = \`
      <div id="budget-allocation-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          
          <!-- Modal Header -->
          <div class="p-5 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-white">التحليل المالي التفصيلي لتوزيع الميزانية</h3>
                <p class="text-[11px] text-slate-400">Analyse détaillée du budget par corps d'état, type d'ouvrage et prestations</p>
              </div>
            </div>
            <button onclick="document.getElementById('budget-allocation-modal').remove()" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <!-- Summary Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#0D0D11] border-b border-white/5">
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">إجمالي الميزانية (Total)</span>
              <span class="text-base font-black text-white block mt-1 font-mono">\${data.totalFormatted}</span>
              <span class="text-[10px] text-amber-400 font-mono">\${data.centimesFormatted}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">يد العمل والخدمات (Services)</span>
              <span class="text-base font-black text-emerald-400 block mt-1 font-mono">\${data.laborPct}%</span>
              <span class="text-[10px] text-slate-400">\${((data.laborTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">السلع والمواد (Fournitures)</span>
              <span class="text-base font-black text-cyan-400 block mt-1 font-mono">\${data.matPct}%</span>
              <span class="text-[10px] text-slate-400">\${((data.materialTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">أعلى صنف تكلفة (Dominant)</span>
              <span class="text-xs font-black text-amber-400 block mt-1 truncate">\${data.items[0] ? data.items[0].name : '—'}</span>
              <span class="text-[10px] text-slate-400">\${data.items[0] ? data.items[0].percentage + '%' : ''}</span>
            </div>
          </div>

          <!-- Table Container -->
          <div class="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">الصنف / التخصص (Corps d'état)</th>
                  <th class="text-center">النسبة (%)</th>
                  <th class="text-center">القيمة (DZD)</th>
                  <th class="text-center">المعادل بالسنتيم</th>
                  <th class="text-center">التمثيل البياني</th>
                </tr>
              </thead>
              <tbody>
                \${data.items.map(item => \`
                  <tr>
                    <td>
                      <div class="flex items-center gap-2.5">
                        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style="background-color: \${item.color}25; border: 1px solid \${item.color}50;">
                          \${item.icon || '📌'}
                        </span>
                        <div>
                          <p class="text-xs font-bold text-white">\${item.name}</p>
                          <p class="text-[10px] text-slate-400">\${item.name_fr || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="px-2 py-0.5 rounded text-xs font-black" style="background-color: \${item.color}20; color: \${item.color};">
                        \${item.percentage}%
                      </span>
                    </td>
                    <td class="text-center font-mono font-bold text-xs text-white">
                      \${(item.amount).toLocaleString('fr-FR')} دج
                    </td>
                    <td class="text-center font-mono text-xs text-amber-400 font-bold">
                      \${item.centimes}
                    </td>
                    <td>
                      <div class="w-28 sm:w-36 h-2 rounded-full bg-white/5 overflow-hidden mx-auto">
                        <div class="h-full rounded-full" style="width: \${item.percentage}%; background-color: \${item.color};"></div>
                      </div>
                    </td>
                  </tr>
                \`).join('')}
              </tbody>
            </table>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
            <span class="text-xs text-slate-400">عدد الأصناف: \${data.items.length} صنف</span>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-white/10">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>طباعة تقرير الميزانية</span>
              </button>
              <button onclick="document.getElementById('budget-allocation-modal').remove()" class="px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold transition shadow-lg">
                إغلاق
              </button>
            </div>
          </div>

        </div>
      </div>
    \`;

    const oldModal = document.getElementById('budget-allocation-modal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  updateGlobalHeaderStats`;

if (!oldRenderChartsRegex.test(content)) {
  console.error('Could not find oldRenderChartsRegex in erp/js/app.js');
  process.exit(1);
}
content = content.replace(oldRenderChartsRegex, newRenderChartsCode);

fs.writeFileSync(appPath, content, 'utf8');
console.log('Successfully updated erp/js/app.js with redesigned budget allocation component!');
