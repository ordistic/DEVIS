/**
 * Professional Charting Module for Al-Itqan BTP PRO
 * Exactly matches the reference dashboard layout:
 * 1. Coûts des projets par mois (DA) - Rounded Bar Chart
 * 2. Répartition du budget par type de projet - Donut Chart with Center Total
 * 3. Avancement des projets (dans le temps) - Multi-line Progress Tracking Chart
 */

const ERPCharts = {
  instances: {},

  initDashboardCharts(monthlyCostsData, budgetAllocationData, progressData) {
    this.renderMonthlyCostsChart('chart-monthly-costs', monthlyCostsData);
    this.renderBudgetAllocationChart('chart-budget-allocation', budgetAllocationData);
    this.renderProgressTrendsChart('chart-progress-trends', progressData);
  },

  // 1. Coûts des projets par mois (DA) - 100% REAL DATA ONLY
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
      parent.innerHTML = `
        <div class="h-60 w-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-2">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-xs font-bold text-white">لا توجد تكاليف أو مصاريف مسجلة</p>
          <p class="text-[10px] text-slate-400 mt-1">Aucune dépense ou paiement enregistré ce mois-ci.</p>
        </div>
      `;
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
                label: (c) => ` ${(c.raw).toLocaleString('fr-FR')} دج`
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

  // 2. Répartition du budget par type de projet (Executive DARI LUXE Redesign)
  renderBudgetAllocationChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || [
      'Placoplâtre BA13 (26%)',
      'Peinture & Déco (18%)',
      'Carrelage & Marbre (16%)',
      'Électricité & LED (14%)',
      'Plomberie & Chauffage (11%)',
      'Menuiserie Alu & Bois (7%)',
      'Maçonnerie & Gros Œuvre (4%)',
      'Smart Home (2%)',
      'Étanchéité (2%)'
    ];
    const values = data.values || [26, 18, 16, 14, 11, 7, 4, 2, 2];
    const colors = data.colors || [
      '#F59E0B', '#EC4899', '#10B981', '#3B82F6', '#06B6D4',
      '#8B5CF6', '#FF3B30', '#14B8A6', '#6366F1'
    ];

    if (typeof Chart !== 'undefined') {
      // Center Text Plugin for Donut Chart
      const centerTextPlugin = {
        id: 'centerTextBudget',
        beforeDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.restore();
          
          const fontSize = Math.min(width, height) / 9.5;
          ctx.font = `800 ${fontSize}px Cairo, Inter, sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF';
          
          const text = data.totalFormatted || '15.8M دج';
          const textX = width / 2;
          const textY = height / 2 - (data.centimesFormatted ? 10 : 6);
          ctx.fillText(text, textX, textY);
          
          if (data.centimesFormatted) {
            ctx.font = `700 ${fontSize * 0.46}px Cairo, Inter, sans-serif`;
            ctx.fillStyle = '#F59E0B'; // Amber Gold
            ctx.fillText(data.centimesFormatted, textX, textY + fontSize * 0.85);
          }
          
          ctx.font = `600 ${fontSize * 0.40}px Cairo, Inter, sans-serif`;
          ctx.fillStyle = '#94A3B8';
          ctx.fillText('Total / الإجمالي', textX, textY + fontSize * (data.centimesFormatted ? 1.45 : 0.95));
          
          ctx.save();
        }
      };

      this.instances[canvasId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderWidth: 2.5,
            borderColor: '#121216',
            hoverOffset: 7
          }]
        },
        plugins: [centerTextPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: data.hideLegend !== undefined ? !data.hideLegend : false,
              position: 'bottom',
              labels: {
                color: '#CBD5E1',
                font: { family: 'Cairo, Inter', size: 10, weight: '600' },
                boxWidth: 10,
                boxHeight: 10,
                padding: 8
              }
            },
            tooltip: {
              backgroundColor: '#0A0A0C',
              titleColor: '#FFFFFF',
              bodyColor: '#F59E0B',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              borderWidth: 1,
              padding: 10,
              displayColors: true,
              callbacks: {
                label: (ctx) => {
                  const idx = ctx.dataIndex;
                  const amt = data.amounts && data.amounts[idx] ? (data.amounts[idx]).toLocaleString('fr-FR') + ' دج' : '';
                  const ctm = data.centimes && data.centimes[idx] ? ' (' + data.centimes[idx] + ')' : '';
                  return ` ${ctx.label}: ${ctx.raw}% ${amt ? '• ' + amt + ctm : ''}`;
                }
              }
            }
          },
          cutout: '74%'
        }
      });
    }
  },

  // 3. Avancement des projets (dans le temps) - 100% REAL DATA ONLY
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
      parent.innerHTML = `
        <div class="h-60 w-full flex flex-col items-center justify-center p-4 text-center">
          <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-2">
            <svg class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p class="text-xs font-bold text-white">لا توجد ورشات نشطة حالياً</p>
          <p class="text-[10px] text-slate-400 mt-1">Aucun chantier actif pour suivre l'avancement temporel.</p>
        </div>
      `;
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
                label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}%`
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

  renderFallbackBar(ctx, labels, costs) {
    const parent = ctx.parentElement;
    if (!parent) return;
    parent.innerHTML = `
      <div class="flex items-end justify-between h-48 gap-1 pt-6 px-2">
        ${costs.map((c, i) => `
          <div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            <div class="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition" style="height: ${(c / 12000000) * 100}%" title="${c.toLocaleString()} DA"></div>
            <span class="text-[9px] text-slate-400 font-semibold">${labels[i]}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
};
