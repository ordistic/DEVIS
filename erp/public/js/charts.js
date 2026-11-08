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

  // 1. Coûts des projets par mois (DA)
  renderMonthlyCostsChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const costs = data.costs || [5200000, 6800000, 7500000, 8900000, 11200000, 9400000, 10500000, 6200000, 7800000, 8400000, 7100000, 5900000];

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
                label: (ctx) => ` ${(ctx.raw).toLocaleString('fr-FR')} دج`
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
    } else {
      this.renderFallbackBar(ctx, labels, costs);
    }
  },

  // 2. Répartition du budget par type de projet
  renderBudgetAllocationChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || [
      'Bâtiments résidentiels (15.75M DA)',
      'Bâtiments commerciaux (11.25M DA)',
      'Infrastructures & Rénov (9.00M DA)',
      'Finition & Plafonds (6.75M DA)',
      'Autres travaux (2.25M DA)'
    ];
    const values = data.values || [35, 25, 20, 15, 5];
    const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#06B6D4'];

    if (typeof Chart !== 'undefined') {
      // Center Text Plugin for Donut Chart
      const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
          const { width, height, ctx } = chart;
          ctx.restore();
          
          const fontSize = Math.min(width, height) / 10;
          ctx.font = `800 ${fontSize}px Inter, Cairo, sans-serif`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF';
          
          const text = data.totalFormatted || '45M DA';
          const textX = width / 2;
          const textY = height / 2 - 8;
          ctx.fillText(text, textX, textY);
          
          ctx.font = `600 ${fontSize * 0.55}px Inter, Cairo, sans-serif`;
          ctx.fillStyle = '#94A3B8';
          ctx.fillText('Total / الإجمالي', textX, textY + fontSize * 0.9);
          
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
            borderWidth: 3,
            borderColor: '#111C44',
            hoverOffset: 6
          }]
        },
        plugins: [centerTextPlugin],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: '#CBD5E1',
                font: { family: 'Cairo, Inter', size: 10, weight: '600' },
                boxWidth: 10,
                boxHeight: 10,
                padding: 12
              }
            },
            tooltip: {
              backgroundColor: '#080D1E',
              titleColor: '#FFFFFF',
              bodyColor: '#38BDF8',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
              callbacks: {
                label: (c) => ` ${c.label}: ${c.raw}%`
              }
            }
          },
          cutout: '72%'
        }
      });
    }
  },

  // 3. Avancement des projets (dans le temps)
  renderProgressTrendsChart(canvasId, data = {}) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (this.instances[canvasId]) {
      this.instances[canvasId].destroy();
    }

    const labels = data.labels || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const datasets = data.datasets || [
      {
        label: 'Résidence Hydra (85%)',
        data: [25, 38, 50, 62, 70, 78, 85, 88, 92, 95, 98, 100],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#2563EB',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Centre Commercial Oran (65%)',
        data: [15, 22, 32, 45, 52, 60, 65, 72, 78, 85, 90, 95],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#8B5CF6',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
      },
      {
        label: 'École Primaire / Villa Tipaza (70%)',
        data: [8, 18, 28, 38, 48, 58, 65, 70, 75, 82, 88, 92],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#10B981',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
      },
      {
        label: 'Rénovation Décorative Alger (45%)',
        data: [5, 10, 18, 24, 30, 36, 42, 45, 52, 60, 68, 75],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#F59E0B',
        pointRadius: 3,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: false
      }
    ];

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
              grid: { display: false },
              ticks: { color: '#64748B', font: { family: 'Inter', size: 10 } }
            },
            y: {
              min: 0,
              max: 100,
              grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
              ticks: {
                color: '#64748B',
                font: { family: 'Inter', size: 10 },
                stepSize: 25,
                callback: (v) => v + '%'
              }
            }
          }
        }
      });
    }
  },

  // Fallback simple renderer
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
