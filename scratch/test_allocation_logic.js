// scratch/test_allocation_logic.js
const assert = require('assert');

// Mock data structures
const mockCategories = [
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

function calculateBudgetAllocationData(mode, projects, activities, categories) {
  let totalBudget = 0;
  let items = [];

  // Determine total project contract value
  const totalProjectValue = (projects || []).reduce((sum, p) => sum + (parseFloat(p.contract_value) || 0), 0);

  if (mode === 'cost_nature') {
    // Mode: Service (Main d'oeuvre) vs Matériaux
    let laborTotal = 0;
    let materialTotal = 0;

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
      // Benchmark Algerian Finishing standard
      laborTotal = 4200000;
      materialTotal = 5800000;
    }

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
    // Mode: Type of Construction / Work
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
    // Default Mode: Categories (Placoplâtre, Peinture, etc.)
    const catBuckets = {};
    categories.forEach(c => {
      catBuckets[c.id] = {
        id: c.id,
        name: c.name,
        name_fr: c.name_fr,
        icon: c.icon,
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
      // If no activities yet, use totalProjectValue or benchmark ratio
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

    // Sort descending by amount
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

  // Format Total
  let totalFormatted = '';
  if (totalBudget >= 1000000) {
    totalFormatted = (totalBudget / 1000000).toFixed(2) + 'M دج';
  } else {
    totalFormatted = Math.round(totalBudget).toLocaleString('fr-FR') + ' دج';
  }

  const centimesFormatted = ((totalBudget / 10000)).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' م. سنتيم';

  return {
    mode,
    totalBudget,
    totalFormatted,
    centimesFormatted,
    items,
    labels: items.map(i => `${i.name_fr} (${i.percentage}%)`),
    values: items.map(i => i.percentage),
    amounts: items.map(i => i.amount),
    centimes: items.map(i => i.centimes),
    colors: items.map(i => i.color)
  };
}

// Test cases
console.log('Testing categories mode...');
const resCat = calculateBudgetAllocationData('categories', [], [], mockCategories);
assert(resCat.items.length > 0, 'Items should not be empty');
console.log('Categories Total:', resCat.totalFormatted, resCat.centimesFormatted);
console.log('Top Category:', resCat.items[0].name, resCat.items[0].percentage + '%');

console.log('\nTesting project_types mode...');
const resProj = calculateBudgetAllocationData('project_types', [], [], mockCategories);
assert(resProj.items.length === 4, 'Should have 4 project types');
console.log('Project Types Total:', resProj.totalFormatted);

console.log('\nTesting cost_nature mode...');
const resNature = calculateBudgetAllocationData('cost_nature', [], [], mockCategories);
assert(resNature.items.length === 2, 'Should have 2 natures');
console.log('Nature Total:', resNature.totalFormatted);
console.log('Labor:', resNature.items[0].amount, resNature.items[0].percentage + '%');
console.log('Materials:', resNature.items[1].amount, resNature.items[1].percentage + '%');

console.log('\nAll tests passed successfully!');
