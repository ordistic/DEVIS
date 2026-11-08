// scratch/update_charts.js
const fs = require('fs');
const path = require('path');

const chartsPath = path.join(__dirname, '../js/charts.js');
let content = fs.readFileSync(chartsPath, 'utf8');

// Replace renderBudgetAllocationChart in charts.js
const oldBudgetRegex = /\/\/ 2\. Répartition du budget par type de projet[\s\S]*?\/\/ 3\. Avancement des projets/m;

const newBudgetSection = `// 2. Répartition du budget par type de projet (Executive DARI LUXE Redesign)
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
          ctx.font = \`800 \${fontSize}px Cairo, Inter, sans-serif\`;
          ctx.textBaseline = 'middle';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#FFFFFF';
          
          const text = data.totalFormatted || '15.8M دج';
          const textX = width / 2;
          const textY = height / 2 - (data.centimesFormatted ? 10 : 6);
          ctx.fillText(text, textX, textY);
          
          if (data.centimesFormatted) {
            ctx.font = \`700 \${fontSize * 0.46}px Cairo, Inter, sans-serif\`;
            ctx.fillStyle = '#F59E0B'; // Amber Gold
            ctx.fillText(data.centimesFormatted, textX, textY + fontSize * 0.85);
          }
          
          ctx.font = \`600 \${fontSize * 0.40}px Cairo, Inter, sans-serif\`;
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
                  return \` \${ctx.label}: \${ctx.raw}% \${amt ? '• ' + amt + ctm : ''}\`;
                }
              }
            }
          },
          cutout: '74%'
        }
      });
    }
  },

  // 3. Avancement des projets`;

if (!oldBudgetRegex.test(content)) {
  console.error('Could not find old budget regex in charts.js');
  process.exit(1);
}

content = content.replace(oldBudgetRegex, newBudgetSection);
fs.writeFileSync(chartsPath, content, 'utf8');
console.log('Successfully updated erp/js/charts.js');
