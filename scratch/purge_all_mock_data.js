// scratch/purge_all_mock_data.js
const fs = require('fs');
const path = require('path');

const chartsPath = path.join(__dirname, '../js/charts.js');
const appPath = path.join(__dirname, '../js/app.js');

// 1. Update charts.js - PURGE ALL FAKE DATA COMPLETELY
let chartsCode = fs.readFileSync(chartsPath, 'utf8');

// Replace renderMonthlyCostsChart
const oldMonthlyCostsRegex = /\/\/ 1\. Coûts des projets par mois[\s\S]*?\/\/ 2\. Répartition du budget/m;
const newMonthlyCosts = `// 1. Coûts des projets par mois (DA) - 100% REAL DATA ONLY
  renderMonthlyCostsChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const costs = data.costs || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const hasData = costs.some(c => c > 0);

    const parent = ctx.parentElement;
    if (!hasData && parent) {
      parent.innerHTML = \`
        <div class="h-60 w-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-2">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-xs font-bold text-white">لا توجد تكاليف أو مصاريف مسجلة</p>
          <p class="text-[10px] text-slate-400 mt-1">Aucune dépense ou paiement enregistré ce mois-ci.</p>
        </div>
      \`;
      return;
    }

    if (typeof Chart !== 'undefined') {
      this.instances[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Coûts (DA) / التكاليف',
              data: costs,
              backgroundColor: '#2563EB',
              hoverBackgroundColor: '#3B82F6',
              borderRadius: 6,
              borderSkipped: false,
              barPercentage: 0.55,
              categoryPercentage: 0.8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                color: '#94A3B8',
                font: { family: 'Cairo, Inter', size: 11, weight: 'bold' },
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: false
              }
            },
            tooltip: {
              backgroundColor: '#080D1E',
              titleColor: '#FFFFFF',
              bodyColor: '#3B82F6',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              padding: 10,
              callbacks: {
                label: (c) => \` \${(c.raw).toLocaleString('fr-FR')} دج\`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#64748B',
                font: { family: 'Inter, Cairo', size: 10, weight: '600' }
              }
            },
            y: {
              grid: {
                color: 'rgba(255, 255, 255, 0.05)',
                drawBorder: false
              },
              ticks: {
                color: '#64748B',
                font: { family: 'Inter', size: 10 },
                callback: (v) => (v === 0 ? '0' : (v / 1000000).toFixed(0) + 'M')
              }
            }
          }
        }
      });
    }
  },

  // 2. Répartition du budget`;

chartsCode = chartsCode.replace(oldMonthlyCostsRegex, newMonthlyCosts);

// Replace renderProgressTrendsChart
const oldProgressRegex = /\/\/ 3\. Avancement des projets[\s\S]*?renderFallbackBar/m;
const newProgress = `// 3. Avancement des projets (dans le temps) - 100% REAL DATA ONLY
  renderProgressTrendsChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const datasets = data.datasets || [];

    const parent = ctx.parentElement;
    if (datasets.length === 0 && parent) {
      parent.innerHTML = \`
        <div class="h-60 w-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-2">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-xs font-bold text-white">لا توجد ورشات نشطة حالياً</p>
          <p class="text-[10px] text-slate-400 mt-1">Aucun chantier actif pour suivre l'avancement temporel.</p>
        </div>
      \`;
      return;
    }

    if (typeof Chart !== 'undefined') {
      this.instances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#94A3B8',
                font: { family: 'Cairo, Inter', size: 10, weight: '600' },
                boxWidth: 10,
                boxHeight: 10,
                padding: 10
              }
            },
            tooltip: {
              backgroundColor: '#080D1E',
              titleColor: '#FFFFFF',
              bodyColor: '#38BDF8',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                label: (ctx) => \` \${ctx.dataset.label}: \${ctx.raw}%\`
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.03)' },
              ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: {
                color: '#64748B',
                font: { family: 'Inter', size: 10 },
                callback: (v) => v + '%'
              }
            }
          }
        }
      });
    }
  },

  renderFallbackBar`;

chartsCode = chartsCode.replace(oldProgressRegex, newProgress);
fs.writeFileSync(chartsPath, chartsCode, 'utf8');
console.log('✓ charts.js purged of all mock data!');

// 2. Update app.js: 100% real calculations only
let appCode = fs.readFileSync(appPath, 'utf8');

const oldAppBlockRegex = /renderDashboardCharts\(\)\s*\{[\s\S]*?updateGlobalHeaderStats/m;

const newAppBlock = `renderDashboardCharts() {
    // 1. Budget Allocation: 100% Real DB Data
    this.updateBudgetAllocationComponent().catch(err => {
      console.warn('Budget allocation component error:', err.message);
    });

    // 2. Real Monthly Costs Chart
    this.getMonthlyCostsData().then(costsData => {
      if (typeof ERPCharts !== 'undefined' && ERPCharts && typeof ERPCharts.renderMonthlyCostsChart === 'function') {
        ERPCharts.renderMonthlyCostsChart('chart-monthly-costs', costsData);
      }
    }).catch(e => console.warn('Monthly costs chart warning:', e.message));

    // 3. Real Progress Trends Chart
    this.getProgressTrendsData().then(progressData => {
      if (typeof ERPCharts !== 'undefined' && ERPCharts && typeof ERPCharts.renderProgressTrendsChart === 'function') {
        ERPCharts.renderProgressTrendsChart('chart-progress-trends', progressData);
      }
    }).catch(e => console.warn('Progress trends chart warning:', e.message));
  },

  async getMonthlyCostsData() {
    const expenses = await DB.getAll('expenses');
    const workerPayments = await DB.getAll('worker_payments');
    const purchases = await DB.getAll('material_purchases');

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const costs = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const currentYear = new Date().getFullYear();

    const addCost = (dateStr, amt) => {
      if (!dateStr || !amt) return;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime()) && d.getFullYear() === currentYear) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) costs[m] += (parseFloat(amt) || 0);
      }
    };

    expenses.forEach(e => addCost(e.date || e.created_at, e.amount));
    workerPayments.forEach(p => addCost(p.payment_date || p.date, p.amount));
    purchases.forEach(p => addCost(p.purchase_date || p.date, p.total_amount || p.amount));

    return { labels: months, costs };
  },

  async getProgressTrendsData() {
    const projects = await DB.getAll('projects');
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    if (!projects || projects.length === 0) {
      return { labels: months, datasets: [] };
    }

    const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4'];
    const datasets = projects.slice(0, 5).map((p, idx) => {
      const color = colors[idx % colors.length];
      const prog = Math.min(100, Math.max(0, parseFloat(p.progress || 0)));
      const dPoints = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, prog];
      return {
        label: \`\${p.name} (\${prog}%)\`,
        data: dPoints,
        borderColor: color,
        backgroundColor: color + '15',
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointRadius: 3,
        tension: 0.3
      };
    });

    return { labels: months, datasets };
  },

  currentBudgetChartMode: 'categories',

  async setBudgetAllocationMode(mode) {
    this.playClickSound();
    this.currentBudgetChartMode = mode;

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

  // 100% REAL DATA CALCULATION — ZERO FAKE OR SIMULATED NUMBERS
  async calculateBudgetAllocationData(mode = 'categories') {
    const projects = await DB.getAll('projects');
    const activities = await DB.getAll('project_activities');
    let categories = await DB.getAll('work_categories') || [];

    const defaultColors = ['#F59E0B', '#EC4899', '#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#6366F1', '#14B8A6', '#FF3B30'];
    categories.forEach((c, idx) => {
      if (!c.color) c.color = defaultColors[idx % defaultColors.length];
    });

    let totalBudget = 0;
    let items = [];
    let laborTotal = 0;
    let materialTotal = 0;

    // Calculate labor & material only from actual activities in DB
    if (activities && activities.length > 0) {
      activities.forEach(a => {
        const qty = parseFloat(a.planned_qty || a.executed_qty) || 1;
        const laborP = parseFloat(a.labor_price) || 0;
        const matP = parseFloat(a.material_price) || 0;
        laborTotal += (qty * laborP);
        materialTotal += (qty * matP);
      });
    }

    if (mode === 'cost_nature') {
      totalBudget = laborTotal + materialTotal;
      if (totalBudget > 0) {
        const laborPct = ((laborTotal / totalBudget) * 100).toFixed(1);
        const matPct = ((materialTotal / totalBudget) * 100).toFixed(1);
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
      }
    } else if (mode === 'project_types') {
      // Group strictly by real projects registered in DB
      if (projects && projects.length > 0) {
        const typeBuckets = {};
        projects.forEach(p => {
          const pVal = parseFloat(p.contract_value) || 0;
          if (pVal > 0) {
            const pType = p.project_type || p.commercial_model || 'ورشة عامة';
            if (!typeBuckets[pType]) {
              typeBuckets[pType] = {
                name: p.name || pType,
                name_fr: pType,
                icon: '🏗️',
                color: '#3B82F6',
                amount: 0
              };
            }
            typeBuckets[pType].amount += pVal;
          }
        });

        totalBudget = Object.values(typeBuckets).reduce((s, b) => s + b.amount, 0);

        if (totalBudget > 0) {
          const colors = ['#D4AF37', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#06B6D4'];
          items = Object.values(typeBuckets).map((t, idx) => {
            const pct = ((t.amount / totalBudget) * 100).toFixed(1);
            return {
              id: 'TYPE-' + idx,
              name: t.name,
              name_fr: t.name_fr,
              icon: t.icon,
              color: colors[idx % colors.length],
              amount: Math.round(t.amount),
              percentage: parseFloat(pct),
              centimes: ((t.amount / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م.س'
            };
          });
        }
      }
    } else {
      // Default: Categories — strictly from real activities in DB
      if (activities && activities.length > 0) {
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
          const val = (parseFloat(a.planned_qty || a.executed_qty) || 1) * (parseFloat(a.unit_price) || 0);
          if (catBuckets[catId]) {
            catBuckets[catId].amount += val;
          }
        });

        totalBudget = Object.values(catBuckets).reduce((sum, b) => sum + b.amount, 0);

        if (totalBudget > 0) {
          items = Object.values(catBuckets)
            .filter(b => b.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .map(b => {
              const pct = ((b.amount / totalBudget) * 100).toFixed(1);
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
      }
    }

    // IF totalBudget is 0: Strictly 0! NO FAKE FALLBACKS!
    let totalFormatted = '0 دج';
    let centimesFormatted = '0 م. سنتيم';
    let laborPctVal = 0;
    let matPctVal = 0;

    if (totalBudget > 0) {
      if (totalBudget >= 1000000) {
        totalFormatted = (totalBudget / 1000000).toFixed(2) + 'M دج';
      } else {
        totalFormatted = Math.round(totalBudget).toLocaleString('fr-FR') + ' دج';
      }
      centimesFormatted = ((totalBudget / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' م. سنتيم';
      const grandTotalLaborMat = laborTotal + materialTotal;
      if (grandTotalLaborMat > 0) {
        laborPctVal = Math.round((laborTotal / grandTotalLaborMat) * 100);
        matPctVal = 100 - laborPctVal;
      }
    }

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
      labels: items.map(i => \`\${i.name_fr || i.name} (\${i.percentage}%)\`),
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

    // 2. Body Container: Clean Empty State if 0, or Canvas + List if real data
    const bodyContainer = document.getElementById('budget-allocation-body-container');
    if (!bodyContainer) return;

    if (data.totalBudget === 0 || !data.items || data.items.length === 0) {
      bodyContainer.innerHTML = \`
        <div class="h-60 w-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
            <svg class="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p class="text-xs font-bold text-white">لا توجد ميزانية مسجلة حتى الآن</p>
          <p class="text-[11px] text-slate-400 mt-1 max-w-xs">قاعدة البيانات لا تحتوي على أشغال أو عقود ورشات مسجلة حالياً.</p>
          <button onclick="App.openNewProjectModal()" class="mt-3 px-4 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5">
            <span>+</span>
            <span>إضافة ورشة جديدة</span>
          </button>
        </div>
      \`;

      // Reset footer indicators
      const topCatEl = document.getElementById('budget-stat-top-cat');
      if (topCatEl) topCatEl.textContent = '—';
      const laborEl = document.getElementById('budget-stat-labor');
      if (laborEl) laborEl.textContent = '0%';
      const matEl = document.getElementById('budget-stat-material');
      if (matEl) matEl.textContent = '0%';

      if (typeof ERPCharts !== 'undefined' && ERPCharts && ERPCharts.instances && ERPCharts.instances['chart-budget-allocation']) {
        ERPCharts.instances['chart-budget-allocation'].destroy();
      }
      return;
    }

    // Restore chart and list layout when data exists
    bodyContainer.innerHTML = \`
      <div class="h-44 relative w-full flex items-center justify-center">
        <canvas id="chart-budget-allocation"></canvas>
      </div>
      <div id="budget-breakdown-container" class="space-y-2 max-h-52 overflow-y-auto pr-1">
        \${data.items.map(item => \`
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
        \`).join('')}
      </div>
    \`;

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

    if (data.totalBudget === 0 || !data.items || data.items.length === 0) {
      alert('لا توجد ميزانية أو أشغال مسجلة في قاعدة البيانات حالياً لعرض تفاصيلها.');
      return;
    }

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
                <h3 class="text-sm font-black text-white">التحليل المالي الحقيقي لتوزيع الميزانية</h3>
                <p class="text-[11px] text-slate-400">بيانات مستخرجة مباشرة من قاعدة بيانات الورشات والأشغال المسجلة</p>
              </div>
            </div>
            <button onclick="document.getElementById('budget-allocation-modal').remove()" class="text-slate-400 hover:text-white p-1 rounded-lg">✕</button>
          </div>

          <!-- Summary Strip -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-[#0D0D11] border-b border-white/5">
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">إجمالي الميزانية الفعلية</span>
              <span class="text-base font-black text-white block mt-1 font-mono">\${data.totalFormatted}</span>
              <span class="text-[10px] text-amber-400 font-mono">\${data.centimesFormatted}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">يد العمل الحرفية</span>
              <span class="text-base font-black text-emerald-400 block mt-1 font-mono">\${data.laborPct}%</span>
              <span class="text-[10px] text-slate-400">\${((data.laborTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">السلع ومواد البناء</span>
              <span class="text-base font-black text-cyan-400 block mt-1 font-mono">\${data.matPct}%</span>
              <span class="text-[10px] text-slate-400">\${((data.materialTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">أعلى صنف في التكلفة</span>
              <span class="text-xs font-black text-amber-400 block mt-1 truncate">\${data.items[0] ? data.items[0].name : '—'}</span>
              <span class="text-[10px] text-slate-400">\${data.items[0] ? data.items[0].percentage + '%' : ''}</span>
            </div>
          </div>

          <!-- Table Container -->
          <div class="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <table class="erp-table">
              <thead>
                <tr>
                  <th class="text-right">الصنف المسجل في الورشات</th>
                  <th class="text-center">النسبة (%)</th>
                  <th class="text-center">القيمة الفعلية (DZD)</th>
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
            <span class="text-xs text-slate-400">عدد الأصناف الفعلية: \${data.items.length}</span>
            <div class="flex items-center gap-2">
              <button onclick="window.print()" class="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 border border-white/10">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>طباعة التقرير</span>
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

if (!oldAppBlockRegex.test(appCode)) {
  console.error('Could not find oldAppBlockRegex in app.js');
  process.exit(1);
}

appCode = appCode.replace(oldAppBlockRegex, newAppBlock);
fs.writeFileSync(appPath, appCode, 'utf8');
console.log('✓ app.js purged of all mock data!');
