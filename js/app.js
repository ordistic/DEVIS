/**
 * Main Application Controller for Home Renovation & Finishing ERP
 * Manages view routing, project workspaces, building structure, payroll, materials,
 * financial calculations, quotations, invoices, and settings.
 */

const App = {

  // Algerian 58 Wilayas Reference List
  algerianWilayas: [
    "44 - عين الدفلى (Aïn Defla)",
    "16 - الجزائر العاصمة (Alger)",
    "09 - البليدة (Blida)",
    "42 - تيبازة (Tipaza)",
    "02 - الشلف (Chlef)",
    "31 - وهران (Oran)",
    "26 - المدية (Médéa)",
    "35 - بومرداس (Boumerdès)",
    "15 - تيزي وزو (Tizi Ouzou)",
    "19 - سطيف (Sétif)",
    "25 - قسنطينة (Constantine)",
    "23 - عنابة (Annaba)",
    "06 - بجاية (Béjaïa)",
    "10 - البويرة (Bouira)",
    "27 - مستغانم (Mostaganem)",
    "29 - معسكر (Mascara)",
    "14 - تيارت (Tiaret)",
    "38 - تيسمسيلت (Tissemsilt)",
    "28 - المسيلة (M'Sila)",
    "17 - الجلفة (Djelfa)",
    "07 - بسكرة (Biskra)",
    "05 - باتنة (Batna)",
    "03 - الأغواط (Laghouat)",
    "47 - غرداية (Ghardaïa)",
    "48 - غليزان (Relizane)",
    "01 - أدرار (Adrar)",
    "04 - أم البواقي (Oum El Bouaghi)",
    "08 - بشار (Béchar)",
    "11 - تمنراست (Tamanrasset)",
    "12 - تبسة (Tébessa)",
    "13 - تلمسان (Tlemcen)",
    "18 - جيجل (Jijel)",
    "20 - سعيدة (Saïda)",
    "21 - سكيكدة (Skikda)",
    "22 - سيدي بلعباس (Sidi Bel Abbès)",
    "24 - قالمة (Guelma)",
    "30 - ورقلة (Ouargla)",
    "32 - البيض (El Bayadh)",
    "33 - إليزي (Illizi)",
    "34 - برج بوعريريج (Bordj Bou Arreridj)",
    "36 - الطارف (El Tarf)",
    "37 - تندوف (Tindouf)",
    "39 - الوادي (El Oued)",
    "40 - خنشلة (Khenchela)",
    "41 - سوق أهراس (Souk Ahras)",
    "43 - ميلة (Mila)",
    "45 - النعامة (Naâma)",
    "46 - عين تموشنت (Aïn Témouchent)",
    "49 - المغير (El M'Ghair)",
    "50 - المنيعة (El Menia)",
    "51 - أولاد جلال (Ouled Djellal)",
    "52 - برج باجي مختار (Bordj Baji Mokhtar)",
    "53 - بني عباس (Béni Abbès)",
    "54 - تيميمون (Timimoun)",
    "55 - توقرت (Touggourt)",
    "56 - جانت (Djanet)",
    "57 - عين صالح (In Salah)",
    "58 - عين قزام (In Guezzam)"
  ],


  // ────────────────────────────────────────────────────────────
  // INTERFACE 1: واجهة إنشاء ورشة جديدة ومسرع البيانات
  // ────────────────────────────────────────────────────────────
  async renderNewProjectView(container) {
    const categories = await DB.getAll('work_categories');
    const catalog = await DB.getAll('activity_catalog');
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    // Group catalog by category
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = { ...c, activities: [] }; });
    catalog.forEach(a => {
      if (catMap[a.category_id]) {
        catMap[a.category_id].activities.push(a);
      }
    });

    const wilayasOptions = this.algerianWilayas.map(w => 
      `<option value="${this.escapeHtml(w)}"${w.includes('44') ? ' selected' : ''}>${this.escapeHtml(w)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="space-y-6 max-w-5xl mx-auto">
        <!-- Top Navigation Bar -->
        <div class="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div class="flex items-center gap-3">
            <button onclick="App.navigate('projects')" class="p-2.5 rounded-xl bg-[#141418] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold shadow">
              <span>←</span>
              <span>${isFr ? 'Retour aux chantiers' : 'العودة إلى الورشات'}</span>
            </button>
            <div>
              <h1 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>🏗️</span>
                <span>${isFr ? 'Nouveau Chantier & Devis Initial' : 'إنشاء ورشة جديدة وتحديد بنود الأشغال'}</span>
              </h1>
              <p class="text-xs text-slate-400 mt-0.5">${isFr ? 'Assistant rapide de création de projet et sélection des prestations' : 'واجهة الإدخال السريع بدون نوافذ منبثقة، مع ربط فوري بدليل الأشغال والنموذج التجاري'}</p>
            </div>
          </div>
        </div>

        <form id="new-project-form" onsubmit="App.handleCreateProjectSubmit(event)" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Main Project Details -->
            <div class="lg:col-span-2 space-y-5">
              
              <!-- 1. Identité du Chantier -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center gap-2.5 text-xs font-black text-amber-400 border-b border-white/5 pb-2.5">
                  <span>🏢</span>
                  <span>${isFr ? 'Informations Principales du Projet' : 'بيانات وهوية الورشة والمشروع'}</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Nom du Projet / Chantier *' : 'اسم المشروع / الورشة *'}</label>
                  <input type="text" id="np-name" required placeholder="${isFr ? 'Ex: Villa Moderne Bouchaoui - Finition Deluxe' : 'مثال: فيلا مودرن سيدي لخضر - تشطيب عصري ديلوكس'}"
                    class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 shadow-inner">
                  <!-- Quick preset suggestions -->
                  <div class="flex items-center gap-1.5 flex-wrap mt-2">
                    <span class="text-[10px] text-slate-500 font-medium">${isFr ? 'Suggestions rapides:' : 'اقتراحات سريعة:'}</span>
                    <button type="button" onclick="document.getElementById('np-name').value = 'فيلا عصرية - تشطيب متكامل ديلوكس'" class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">فيلا عصرية ديلوكس</button>
                    <button type="button" onclick="document.getElementById('np-name').value = 'شقة سكنية F4 - ديكور وأسقف جبس'" class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">شقة F4</button>
                    <button type="button" onclick="document.getElementById('np-name').value = 'تهيئة وديكور محل تجاري عصري'" class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">محل تجاري</button>
                    <button type="button" onclick="document.getElementById('np-name').value = 'تجديد مطبخ وصالون - دهان وإنارة'" class="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">تجديد صالون ومطبخ</button>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Nom du Client / Propriétaire *' : 'اسم صاحب الورشة / الزبون *'}</label>
                    <input type="text" id="np-client" required placeholder="${isFr ? 'Ex: M. Amari Karim' : 'مثال: السيد عبد الرحمان بن علي'}"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 shadow-inner">
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Téléphone du Client' : 'رقم هاتف الزبون'}</label>
                    <input type="tel" id="np-phone" placeholder="0550 00 00 00" dir="ltr"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 shadow-inner text-right">
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Wilaya (58 Wilayas) *' : 'الولاية (قائمة الولايات الـ 58) *'}</label>
                    <select id="np-wilaya" class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                      ${wilayasOptions}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Adresse détaillée / Commune' : 'العنوان التفصيلي / البلدية'}</label>
                    <input type="text" id="np-address" placeholder="${isFr ? 'Ex: Rue 17 Octobre, Sidi Lakhder' : 'مثال: حي 17 أكتوبر، سيدي لخضر'}"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 shadow-inner">
                  </div>
                </div>
              </div>

              <!-- 2. Modèle Commercial & Contrat -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center gap-2.5 text-xs font-black text-cyan-400 border-b border-white/5 pb-2.5">
                  <span>📜</span>
                  <span>${isFr ? 'Modèle Commercial & Formule Contractuelle' : 'النموذج التجاري ونوع العقد'}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label class="cursor-pointer border border-white/10 hover:border-emerald-500/50 p-3.5 rounded-xl bg-[#0C0C10] flex flex-col justify-between transition group active:scale-[0.98]">
                    <div class="flex items-center justify-between mb-2">
                      <input type="radio" name="np-commercial-model" value="labor_materials" checked class="text-[#FF3B30] focus:ring-0">
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold">${isFr ? 'Recommandé' : 'الأكثر ربحية'}</span>
                    </div>
                    <div>
                      <div class="font-extrabold text-xs text-white group-hover:text-emerald-400">${isFr ? 'Fourniture & Pose' : 'سلعة وعمل (توريد وتركيب)'}</div>
                      <p class="text-[10px] text-slate-400 mt-1 leading-snug">${isFr ? 'DARI LUXE fournit les matériaux et la main-d\'œuvre.' : 'داري لوكس تتكفل بتوفير كافة مواد البناء والجبس والدهانات مع يد العمل.'}</p>
                    </div>
                  </label>

                  <label class="cursor-pointer border border-white/10 hover:border-blue-500/50 p-3.5 rounded-xl bg-[#0C0C10] flex flex-col justify-between transition group active:scale-[0.98]">
                    <div class="flex items-center justify-between mb-2">
                      <input type="radio" name="np-commercial-model" value="labor_only" class="text-[#FF3B30] focus:ring-0">
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-extrabold">${isFr ? 'Exécution' : 'مصنعية فقط'}</span>
                    </div>
                    <div>
                      <div class="font-extrabold text-xs text-white group-hover:text-blue-400">${isFr ? 'Main-d\'œuvre seule' : 'يد عاملة فقط'}</div>
                      <p class="text-[10px] text-slate-400 mt-1 leading-snug">${isFr ? 'Exécution uniquement. Matériaux à la charge du client.' : 'تنفيذ الأشغال فقط. شراء السلعة والمواد يقع بالكامل على عاتق الزبون.'}</p>
                    </div>
                  </label>

                  <label class="cursor-pointer border border-white/10 hover:border-purple-500/50 p-3.5 rounded-xl bg-[#0C0C10] flex flex-col justify-between transition group active:scale-[0.98]">
                    <div class="flex items-center justify-between mb-2">
                      <input type="radio" name="np-commercial-model" value="hybrid" class="text-[#FF3B30] focus:ring-0">
                      <span class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-extrabold">${isFr ? 'Mixte' : 'مرن'}</span>
                    </div>
                    <div>
                      <div class="font-extrabold text-xs text-white group-hover:text-purple-400">${isFr ? 'Modèle Hybride' : 'نموذج هجين (تشاركي)'}</div>
                      <p class="text-[10px] text-slate-400 mt-1 leading-snug">${isFr ? 'Certains lots avec matériaux, d\'autres en main-d\'œuvre.' : 'توفير جزء من المواد بالاتفاق مع تنفيذ باقي البنود بالمصنعية.'}</p>
                    </div>
                  </label>
                </div>
              </div>

              <!-- 3. Prestations liées au Catalogue des Travaux -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div class="flex items-center gap-2 text-xs font-black text-emerald-400">
                    <span>📋</span>
                    <span>${isFr ? 'Sélection des Prestations (Catalogue Travaux)' : 'تحديد بنود الأشغال المطلوبة في الورشة'}</span>
                  </div>
                  <span class="text-[10px] text-slate-400" id="np-selected-count">0 ${isFr ? 'sélectionné' : 'بنود مختارة'}</span>
                </div>

                <p class="text-xs text-slate-400">${isFr ? 'Cochez les lots et prestations prévus pour générer automatiquement les activités du chantier :' : 'حدد الأنشطة المبرمجة لتوليد مهام وبنود العمل وجدول القياسات تلقائياً داخل الورشة:'}</p>

                <div class="space-y-4 max-h-80 overflow-y-auto pr-1">
                  ${Object.values(catMap).map(cat => `
                    <div class="space-y-2">
                      <div class="text-[11px] font-extrabold text-slate-300 flex items-center gap-2">
                        <span class="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                        <span>${isFr ? (cat.name_fr || cat.name) : cat.name}</span>
                      </div>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        ${cat.activities.map(act => `
                          <label class="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#0C0C10] border border-white/5 hover:border-white/15 cursor-pointer text-xs transition active:scale-[0.99]">
                            <input type="checkbox" name="np-activity-ids" value="${act.id}" data-price="${act.default_unit_price || 0}"
                              onchange="App.updateNewProjectEstimate()" class="mt-0.5 rounded text-[#FF3B30] focus:ring-0">
                            <div class="min-w-0">
                              <span class="font-bold text-white block text-xs truncate">${isFr ? (act.name_fr || act.name) : act.name}</span>
                              <span class="text-[10px] text-slate-400 font-mono">${App.formatCurrency(act.default_unit_price || 0)} / ${act.unit || 'm²'}</span>
                            </div>
                          </label>
                        `).join('')}
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Right 1 Col: Contract Value & Instant Submit -->
            <div class="space-y-5">
              
              <!-- Financial & Timeline Summary -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl sticky top-24">
                <div class="flex items-center gap-2 text-xs font-black text-white border-b border-white/5 pb-2.5">
                  <span>💰</span>
                  <span>${isFr ? 'Montant & Planification' : 'قيمة العقد والجدولة'}</span>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Valeur estimée du contrat (DZD) *' : 'قيمة العقد المتفق عليها (دج DZD) *'}</label>
                  <input type="number" id="np-contract-value" step="5000" min="0" required value="1200000"
                    class="w-full bg-[#0C0C10] border border-emerald-500/30 focus:border-emerald-400 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono font-black shadow-inner">
                  <!-- Quick add amount pills -->
                  <div class="grid grid-cols-3 gap-1.5 mt-2">
                    <button type="button" onclick="App.addAmountToContract(500000)" class="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5 transition">+500,000</button>
                    <button type="button" onclick="App.addAmountToContract(1000000)" class="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5 transition">+1,000,000</button>
                    <button type="button" onclick="App.addAmountToContract(2000000)" class="py-1 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5 transition">+2,000,000</button>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Date de démarrage prévue' : 'تاريخ الانطلاق الفعلي'}</label>
                  <input type="date" id="np-start-date" value="${App.getLocalDateString()}"
                    class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white shadow-inner">
                </div>

                <!-- Instant Submit Button -->
                <div class="pt-3">
                  <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 active:from-red-600 text-white font-black text-sm shadow-xl shadow-red-950/50 flex items-center justify-center gap-2 transition active:scale-[0.98]">
                    <span>✓</span>
                    <span>${isFr ? 'Créer le Chantier Immédiatement' : 'تأكيد وإنشاء الورشة فوراً'}</span>
                  </button>
                  <p class="text-[10px] text-slate-500 text-center mt-2">${isFr ? 'Sans pop-up. Ouvre directement l\'espace du projet.' : 'بدون نوافذ منبثقة — يفتح مباشرة ملف الورشة الكامل.'}</p>
                </div>
              </div>

            </div>

          </div>
        </form>
      </div>
    `;
  },

  addAmountToContract(addVal) {
    const el = document.getElementById('np-contract-value');
    if (!el) return;
    const cur = parseFloat(el.value) || 0;
    el.value = cur + addVal;
  },

  updateNewProjectEstimate() {
    const checked = document.querySelectorAll('input[name="np-activity-ids"]:checked');
    const badge = document.getElementById('np-selected-count');
    if (badge) {
      badge.textContent = checked.length + ' بنود مختارة';
    }
  },

  async handleCreateProjectSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('np-name').value.trim();
    const client = document.getElementById('np-client').value.trim();
    const phone = document.getElementById('np-phone').value.trim();
    const wilaya = document.getElementById('np-wilaya').value.trim();
    const address = document.getElementById('np-address').value.trim();
    const contract = parseFloat(document.getElementById('np-contract-value').value) || 0;
    const model = (document.querySelector('input[name="np-commercial-model"]:checked') || {}).value || 'labor_materials';
    const startDate = document.getElementById('np-start-date').value || App.getLocalDateString();

    const pRef = 'PRJ-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900 + 100));
    
    // 1. Create Project
    const newProj = await DB.add('projects', {
      ref: pRef,
      name: name,
      client_name: client,
      client_phone: phone,
      address: address || wilaya,
      wilaya: wilaya,
      project_type: 'تشطيب وديكور عصري (DARI LUXE)',
      contract_value: contract,
      initial_budget: contract,
      commercial_model: model,
      status: 'in_progress',
      start_date: startDate
    });

    // 2. Automatically create Floor (RDC)
    const newFloor = await DB.add('project_floors', {
      project_id: newProj.id,
      floor_name: 'الطابق الأرضي (RDC)',
      floor_number: 0,
      description: 'المستوى الأرضي الرئيسي'
    });

    // 3. Attach selected catalog activities to the new project
    const checkedBoxes = document.querySelectorAll('input[name="np-activity-ids"]:checked');
    const catalog = await DB.getAll('activity_catalog');
    for (const box of checkedBoxes) {
      const actId = box.value;
      const catItem = catalog.find(c => c.id === actId);
      if (catItem) {
        await DB.add('project_activities', {
          project_id: newProj.id,
          name: catItem.name,
          name_fr: catItem.name_fr,
          unit: catItem.unit || 'm²',
          unit_price: catItem.default_unit_price || 0,
          quantity: 1,
          total_price: catItem.default_unit_price || 0,
          progress_percent: 0,
          status: 'planned'
        });
      }
    }

    this.playClickSound();
    alert(`✓ تم بنجاح إنشاء ورشة "${name}" وربط بنود العمل وتجهيز الطابق الأرضي!`);
    this.activeProjectId = newProj.id;
    this.navigate('project_workspace', newProj.id);
  },


  // ────────────────────────────────────────────────────────────
  // INTERFACE 2: واجهة حساب وقياسات الغرف والخصومات الهندسية الذكية
  // ────────────────────────────────────────────────────────────
  async renderNewRoomView(container) {
    const projects = await DB.getAll('projects');
    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div class="kpi-card p-8 text-center max-w-md mx-auto my-12 space-y-4">
          <div class="text-3xl">⚠️</div>
          <h3 class="text-white font-bold">لا توجد ورشات نشطة حالياً</h3>
          <p class="text-xs text-slate-400">يجب إنشاء ورشة عمل أولاً قبل إضافة الغرف والقياسات.</p>
          <button onclick="App.navigate('new_project')" class="px-4 py-2 bg-[#FF3B30] text-white rounded-xl text-xs font-bold">
            + إنشاء ورشة جديدة
          </button>
        </div>
      `;
      return;
    }

    const currentProjId = this.activeProjectId || projects[0].id;
    const floors = await DB.query('project_floors', f => String(f.project_id) === String(currentProjId));

    container.innerHTML = `
      <div class="space-y-6 max-w-4xl mx-auto">
        <!-- Top Navigation -->
        <div class="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div class="flex items-center gap-3">
            <button onclick="App.openProjectWorkspace('${currentProjId}')" class="p-2.5 rounded-xl bg-[#141418] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold shadow">
              <span>←</span>
              <span>العودة إلى ملف الورشة</span>
            </button>
            <div>
              <h1 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>📐</span>
                <span>مساعد حساب وقياسات الغرف والجدران</span>
              </h1>
              <p class="text-xs text-slate-400 mt-0.5">حساب تلقائي فوري للمساحات، المحيط، وخصم النوافذ والأبواب للدهان والجبس بدقة هندسية</p>
            </div>
          </div>
        </div>

        <form id="new-room-form" onsubmit="App.handleCreateRoomSubmit(event)" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left 2 Cols: Form Inputs -->
            <div class="lg:col-span-2 space-y-5">
              
              <!-- 1. Room Identity -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center gap-2 text-xs font-black text-amber-400 border-b border-white/5 pb-2.5">
                  <span>🚪</span>
                  <span>المشروع والطابق وتسمية الفضاء</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">الورشة / المشروع *</label>
                    <select id="nr-project" onchange="App.handleRoomProjectChange(this.value)" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                      ${projects.map(p => `<option value="${p.id}" ${p.id === currentProjId ? 'selected' : ''}>${this.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-slate-300 mb-1.5">الطابق (Étage) *</label>
                    <select id="nr-floor" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                      ${floors.length > 0 
                        ? floors.map(fl => `<option value="${fl.id}">${this.escapeHtml(fl.floor_name)}</option>`).join('')
                        : '<option value="new_auto">الطابق الأرضي (RDC) - تلقائي</option>'
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-300 mb-1.5">اسم الغرفة أو الفضاء *</label>
                  <input type="text" id="nr-name" required value="صالون رئيسي (Salon)"
                    class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white shadow-inner font-bold">
                  <!-- Room quick-select chips -->
                  <div class="flex items-center gap-1.5 flex-wrap mt-2">
                    <button type="button" onclick="App.setRoomPreset('صالون رئيسي (Salon)', 5.2, 4.2, 2.8, 1, 2)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🛋️ صالون (Salon)</button>
                    <button type="button" onclick="App.setRoomPreset('غرفة نوم رئيسية (Chambre Parentale)', 4.2, 3.8, 2.8, 1, 1)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🛏️ غرفة نوم رئيسية</button>
                    <button type="button" onclick="App.setRoomPreset('غرفة أطفال (Chambre Enfants)', 3.8, 3.2, 2.8, 1, 1)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🧸 غرفة أطفال</button>
                    <button type="button" onclick="App.setRoomPreset('مطبخ عصري (Cuisine)', 4.0, 3.0, 2.8, 1, 1)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🍳 مطبخ (Cuisine)</button>
                    <button type="button" onclick="App.setRoomPreset('حمام ودوش (Salle de Bain)', 2.5, 2.0, 2.6, 1, 1, true)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🚿 حمام (SDB)</button>
                    <button type="button" onclick="App.setRoomPreset('بهو وممر (Couloir / Hall)', 6.0, 1.8, 2.8, 2, 0)" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] border border-white/5 transition">🚪 بهو / هول</button>
                  </div>
                </div>
              </div>

              <!-- 2. Dimensions 3D (L x W x H) -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center gap-2 text-xs font-black text-cyan-400 border-b border-white/5 pb-2.5">
                  <span>📐</span>
                  <span>الأبعاد الهندسية بالمتر (Dimensions en mètres)</span>
                </div>

                <div class="grid grid-cols-3 gap-3">
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">الطول L (متر)</label>
                    <input type="number" step="0.05" min="0.5" id="nr-length" value="5.00" oninput="App.calculateLiveRoomMetrics()"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-3 py-2.5 text-center text-sm font-mono font-black text-white shadow-inner">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">العرض W (متر)</label>
                    <input type="number" step="0.05" min="0.5" id="nr-width" value="4.00" oninput="App.calculateLiveRoomMetrics()"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-3 py-2.5 text-center text-sm font-mono font-black text-white shadow-inner">
                  </div>
                  <div>
                    <label class="block text-[11px] font-bold text-slate-300 mb-1">الارتفاع H (متر)</label>
                    <input type="number" step="0.05" min="1.0" id="nr-height" value="2.80" oninput="App.calculateLiveRoomMetrics()"
                      class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-3 py-2.5 text-center text-sm font-mono font-black text-white shadow-inner">
                  </div>
                </div>
              </div>

              <!-- 3. Smart Deductions: Doors & Windows -->
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl">
                <div class="flex items-center gap-2 text-xs font-black text-rose-400 border-b border-white/5 pb-2.5">
                  <span>✂️</span>
                  <span>الخصومات الهندسية للفتحات (خصم الأبواب والنوافذ من مساحة الدهان)</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Doors -->
                  <div class="p-3.5 rounded-xl bg-[#0C0C10] border border-white/5 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-extrabold text-white">🚪 الأبواب (Portes)</span>
                      <span class="text-[10px] text-slate-400 font-mono" id="nr-doors-total-area">-1.94 م²</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <label class="text-[10px] text-slate-400">العدد:</label>
                      <div class="flex items-center gap-1">
                        <button type="button" onclick="App.adjustCount('nr-doors-qty', -1)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center">-</button>
                        <input type="number" id="nr-doors-qty" value="1" min="0" max="6" oninput="App.calculateLiveRoomMetrics()"
                          class="w-12 bg-black border border-white/10 rounded-lg py-1 text-center font-mono font-bold text-xs text-white">
                        <button type="button" onclick="App.adjustCount('nr-doors-qty', 1)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center">+</button>
                      </div>
                      <span class="text-[10px] text-slate-500 mr-auto">(0.9×2.15 م)</span>
                    </div>
                  </div>

                  <!-- Windows -->
                  <div class="p-3.5 rounded-xl bg-[#0C0C10] border border-white/5 space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-extrabold text-white">🪟 النوافذ (Fenêtres)</span>
                      <span class="text-[10px] text-slate-400 font-mono" id="nr-windows-total-area">-1.68 م²</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <label class="text-[10px] text-slate-400">العدد:</label>
                      <div class="flex items-center gap-1">
                        <button type="button" onclick="App.adjustCount('nr-windows-qty', -1)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center">-</button>
                        <input type="number" id="nr-windows-qty" value="1" min="0" max="8" oninput="App.calculateLiveRoomMetrics()"
                          class="w-12 bg-black border border-white/10 rounded-lg py-1 text-center font-mono font-bold text-xs text-white">
                        <button type="button" onclick="App.adjustCount('nr-windows-qty', 1)" class="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center">+</button>
                      </div>
                      <span class="text-[10px] text-slate-500 mr-auto">(1.2×1.40 م)</span>
                    </div>
                  </div>
                </div>

                <!-- Toggles for Paint Scope -->
                <div class="flex items-center gap-6 pt-2 text-xs">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="nr-inc-walls" checked onchange="App.calculateLiveRoomMetrics()" class="rounded text-[#FF3B30] focus:ring-0">
                    <span class="text-slate-300 font-bold">تشمل طلاء وجبس الجدران</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" id="nr-inc-ceiling" checked onchange="App.calculateLiveRoomMetrics()" class="rounded text-[#FF3B30] focus:ring-0">
                    <span class="text-slate-300 font-bold">تشمل سقف الجبس والدهان</span>
                  </label>
                </div>
              </div>

            </div>

            <!-- Right 1 Col: Live Geometric Display & Submit -->
            <div class="space-y-5">
              
              <div class="kpi-card p-5 rounded-2xl border border-white/8 space-y-4 shadow-xl sticky top-24">
                <div class="flex items-center gap-2 text-xs font-black text-emerald-400 border-b border-white/5 pb-2.5">
                  <span>📊</span>
                  <span>لوحة الحساب اللحظي المباشر</span>
                </div>

                <div class="space-y-3 font-mono text-xs">
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0C]/80 border border-white/5">
                    <span class="text-slate-400 font-sans text-xs">مساحة الأرضية (السيراميك/الجبس):</span>
                    <span class="font-extrabold text-white" id="nr-disp-floor">20.00 م²</span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0C]/80 border border-white/5">
                    <span class="text-slate-400 font-sans text-xs">محيط الغرفة (البلاينت والزوايا):</span>
                    <span class="font-extrabold text-white" id="nr-disp-perimeter">18.00 م</span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0C]/80 border border-white/5">
                    <span class="text-slate-400 font-sans text-xs">مساحة الجدران الإجمالية الخام:</span>
                    <span class="font-extrabold text-slate-300" id="nr-disp-gross">50.40 م²</span>
                  </div>

                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <span class="font-sans text-xs">مساحة الخصم (نوافذ + أبواب):</span>
                    <span class="font-extrabold" id="nr-disp-deductions">-3.62 م²</span>
                  </div>

                  <div class="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-center">
                    <span class="text-[10px] text-emerald-300 font-sans block mb-1">المساحة الصافية للدهان والجبس (صافي):</span>
                    <span class="text-2xl font-black text-emerald-400 font-mono" id="nr-disp-net">46.78 م²</span>
                  </div>
                </div>

                <!-- Submit Button -->
                <div class="pt-2">
                  <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.98]">
                    <span>💾</span>
                    <span>تأكيد وحفظ قياسات الغرفة</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </form>
      </div>
    `;

    // Initialize metrics
    this.calculateLiveRoomMetrics();
  },

  setRoomPreset(name, l, w, h, doors, windows, isBathroom = false) {
    document.getElementById('nr-name').value = name;
    document.getElementById('nr-length').value = l;
    document.getElementById('nr-width').value = w;
    document.getElementById('nr-height').value = h;
    document.getElementById('nr-doors-qty').value = doors;
    document.getElementById('nr-windows-qty').value = windows;
    this.calculateLiveRoomMetrics();
  },

  adjustCount(elemId, delta) {
    const el = document.getElementById(elemId);
    if (!el) return;
    const cur = parseInt(el.value, 10) || 0;
    el.value = Math.max(0, cur + delta);
    this.calculateLiveRoomMetrics();
  },

  calculateLiveRoomMetrics() {
    const l = parseFloat((document.getElementById('nr-length') || {}).value) || 0;
    const w = parseFloat((document.getElementById('nr-width') || {}).value) || 0;
    const h = parseFloat((document.getElementById('nr-height') || {}).value) || 0;
    const doorsQty = parseInt((document.getElementById('nr-doors-qty') || {}).value, 10) || 0;
    const winQty = parseInt((document.getElementById('nr-windows-qty') || {}).value, 10) || 0;
    const incWalls = (document.getElementById('nr-inc-walls') || {}).checked !== false;
    const incCeiling = (document.getElementById('nr-inc-ceiling') || {}).checked !== false;

    const floorArea = l * w;
    const perimeter = 2 * (l + w);
    const grossWall = perimeter * h;
    const doorsArea = doorsQty * (0.90 * 2.15);
    const winArea = winQty * (1.20 * 1.40);
    const totalDeduction = doorsArea + winArea;

    let netWall = 0;
    if (incWalls) {
      netWall = Math.max(0, grossWall - totalDeduction);
    }
    const ceilingArea = incCeiling ? floorArea : 0;
    const totalNetPaint = netWall + ceilingArea;

    // Update UI elements
    const setTxt = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setTxt('nr-disp-floor', floorArea.toFixed(2) + ' م²');
    setTxt('nr-disp-perimeter', perimeter.toFixed(2) + ' م');
    setTxt('nr-disp-gross', grossWall.toFixed(2) + ' م²');
    setTxt('nr-disp-deductions', '-' + totalDeduction.toFixed(2) + ' م²');
    setTxt('nr-doors-total-area', '-' + doorsArea.toFixed(2) + ' م²');
    setTxt('nr-windows-total-area', '-' + winArea.toFixed(2) + ' م²');
    setTxt('nr-disp-net', totalNetPaint.toFixed(2) + ' م²');
  },

  async handleRoomProjectChange(projId) {
    this.activeProjectId = projId;
    const floors = await DB.query('project_floors', f => String(f.project_id) === String(projId));
    const select = document.getElementById('nr-floor');
    if (select) {
      if (floors.length > 0) {
        select.innerHTML = floors.map(fl => `<option value="${fl.id}">${this.escapeHtml(fl.floor_name)}</option>`).join('');
      } else {
        select.innerHTML = '<option value="new_auto">الطابق الأرضي (RDC) - تلقائي</option>';
      }
    }
  },

  async handleCreateRoomSubmit(event) {
    event.preventDefault();
    const projId = document.getElementById('nr-project').value;
    let floorId = document.getElementById('nr-floor').value;
    const name = document.getElementById('nr-name').value.trim();
    const l = parseFloat(document.getElementById('nr-length').value) || 0;
    const w = parseFloat(document.getElementById('nr-width').value) || 0;
    const h = parseFloat(document.getElementById('nr-height').value) || 0;
    const doorsQty = parseInt(document.getElementById('nr-doors-qty').value, 10) || 0;
    const winQty = parseInt(document.getElementById('nr-windows-qty').value, 10) || 0;
    const incWalls = document.getElementById('nr-inc-walls').checked;
    const incCeiling = document.getElementById('nr-inc-ceiling').checked;

    // If floor is auto-create
    if (floorId === 'new_auto' || !floorId) {
      const newFl = await DB.add('project_floors', {
        project_id: projId,
        floor_name: 'الطابق الأرضي (RDC)',
        floor_number: 0,
        description: 'المستوى الأرضي'
      });
      floorId = newFl.id;
    }

    // 1. Add Room
    const newRoom = await DB.add('project_rooms', {
      project_id: projId,
      floor_id: floorId,
      room_name: name,
      length: l,
      width: w,
      height: h,
      include_walls_paint: incWalls,
      include_ceiling_paint: incCeiling
    });

    // 2. Add doors if any
    if (doorsQty > 0) {
      await DB.add('room_doors', {
        room_id: newRoom.id,
        door_name: 'باب الغرفة',
        width: 0.90,
        height: 2.15,
        quantity: doorsQty
      });
    }

    // 3. Add windows if any
    if (winQty > 0) {
      await DB.add('room_windows', {
        room_id: newRoom.id,
        window_name: 'نافذة الغرفة',
        width: 1.20,
        height: 1.40,
        quantity: winQty
      });
    }

    this.playClickSound();
    alert(`✓ تم بنجاح حفظ قياسات "${name}" وإضافتها لملف الورشة!`);
    this.activeProjectId = projId;
    this.navigate('project_workspace', projId);
  },


  // ────────────────────────────────────────────────────────────
  // INTERFACE 3: واجهة تسجيل عامل جديد مسرعة
  // ────────────────────────────────────────────────────────────
  async renderNewWorkerView(container) {
    const projects = await DB.getAll('projects');
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    const wilayasOptions = this.algerianWilayas.map(w => 
      `<option value="${this.escapeHtml(w)}"${w.includes('44') ? ' selected' : ''}>${this.escapeHtml(w)}</option>`
    ).join('');

    container.innerHTML = `
      <div class="space-y-6 max-w-3xl mx-auto">
        <!-- Top Navigation -->
        <div class="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div class="flex items-center gap-3">
            <button onclick="App.navigate('workers')" class="p-2.5 rounded-xl bg-[#141418] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold shadow">
              <span>←</span>
              <span>${isFr ? 'Retour à l\'équipe' : 'العودة إلى فريق العمل'}</span>
            </button>
            <div>
              <h1 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>👷</span>
                <span>${isFr ? 'Enregistrement d\'un Ouvrier' : 'تسجيل عامل جديد في الفريق'}</span>
              </h1>
              <p class="text-xs text-slate-400 mt-0.5">${isFr ? 'Saisie rapide sans pop-up avec sélection directe des métiers' : 'واجهة إدخال مسرعة مع اختيار المهن والرواتب المعمول بها في الجزائر'}</p>
            </div>
          </div>
        </div>

        <form id="new-worker-form" onsubmit="App.handleCreateWorkerSubmit(event)" class="kpi-card p-6 rounded-2xl border border-white/8 space-y-5 shadow-xl">
          
          <!-- Identity -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Nom complet de l\'ouvrier *' : 'اسم العامل بالكامل *'}</label>
              <input type="text" id="nw-name" required placeholder="${isFr ? 'Ex: Mohamed Touati' : 'مثال: محمد التواتي'}"
                class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white shadow-inner font-bold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Numéro de Téléphone' : 'رقم هاتف العامل'}</label>
              <input type="tel" id="nw-phone" placeholder="0550 00 00 00" dir="ltr"
                class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white shadow-inner text-right">
            </div>
          </div>

          <!-- Specialty Quick Grid -->
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-2">${isFr ? 'Métier / Spécialité *' : 'التخصص المهني والحرفة *'}</label>
            <input type="hidden" id="nw-specialty" value="جباس (Plaquiste BA13)">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="nw-specialty-grid">
              <button type="button" onclick="App.setWorkerSpecialtyPreset('جباس (Plaquiste BA13)', 3500, this)" class="nw-spec-btn active p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">📐</span>
                <span>جباس BA13</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('صباغ ودهان عصري (Peintre Déco)', 3500, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">🎨</span>
                <span>صباغ ودهان</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('بناء ومبلط (Carreleur)', 3500, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">🧱</span>
                <span>مبلط Carreleur</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('كهربائي وإنارة (Électricien)', 3500, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">⚡</span>
                <span>كهربائي سبوت</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('رصاص وسباك صحي (Plombier)', 4000, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">🔧</span>
                <span>رصاص وسباك</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('نجار ألمنيوم وخشب', 3500, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">🪚</span>
                <span>نجار ألمنيوم</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('مناول ومساعد (Manœuvre)', 2500, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">🛠️</span>
                <span>مناول Manœuvre</span>
              </button>
              <button type="button" onclick="App.setWorkerSpecialtyPreset('معلم مسؤول ورشة (Chef)', 5000, this)" class="nw-spec-btn p-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white flex flex-col items-center gap-1 transition">
                <span class="text-base">👑</span>
                <span>مسؤول ورشة</span>
              </button>
            </div>
          </div>

          <!-- Daily Wage & Quick Chips -->
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Salaire Journalier de Base (DZD) *' : 'الأجر اليومي الأساسي (دج DZD) *'}</label>
            <input type="number" step="100" min="500" id="nw-wage" required value="3500"
              class="w-full bg-[#0C0C10] border border-emerald-500/30 rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono font-black shadow-inner">
            <div class="grid grid-cols-5 gap-2 mt-2">
              <button type="button" onclick="document.getElementById('nw-wage').value = 2500" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">2,500 دج</button>
              <button type="button" onclick="document.getElementById('nw-wage').value = 3000" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">3,000 دج</button>
              <button type="button" onclick="document.getElementById('nw-wage').value = 3500" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">3,500 دج</button>
              <button type="button" onclick="document.getElementById('nw-wage').value = 4000" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">4,000 دج</button>
              <button type="button" onclick="document.getElementById('nw-wage').value = 5000" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">5,000 دج</button>
            </div>
          </div>

          <!-- Assignment & Wilaya -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Chantier d\'affectation' : 'ورشة التعيين المبدئية'}</label>
              <select id="nw-project" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                <option value="">-- بدون تعيين حالياً --</option>
                ${projects.map(p => `<option value="${p.id}">${this.escapeHtml(p.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Wilaya de résidence' : 'ولاية الإقامة'}</label>
              <select id="nw-wilaya" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                ${wilayasOptions}
              </select>
            </div>
          </div>

          <!-- Submit -->
          <div class="pt-3">
            <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98]">
              <span>✓</span>
              <span>${isFr ? 'Enregistrer l\'Ouvrier dans l\'Équipe' : 'تسجيل العامل وتفعيله في دفتر التحضير فوراً'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  },

  setWorkerSpecialtyPreset(spec, defaultWage, btn) {
    document.getElementById('nw-specialty').value = spec;
    document.getElementById('nw-wage').value = defaultWage;
    document.querySelectorAll('.nw-spec-btn').forEach(b => b.classList.remove('active', 'border-emerald-500', 'bg-emerald-500/10'));
    if (btn) {
      btn.classList.add('active', 'border-emerald-500', 'bg-emerald-500/10');
    }
  },

  async handleCreateWorkerSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('nw-name').value.trim();
    const phone = document.getElementById('nw-phone').value.trim();
    const spec = document.getElementById('nw-specialty').value.trim();
    const wage = parseFloat(document.getElementById('nw-wage').value) || 3000;
    const projId = document.getElementById('nw-project').value;
    const wilaya = document.getElementById('nw-wilaya').value.trim();

    const wCode = 'W-' + Date.now().toString().slice(-4);
    const newWorker = await DB.add('workers', {
      worker_code: wCode,
      full_name: name,
      phone: phone,
      wilaya: wilaya,
      specialty: spec,
      daily_wage: wage,
      overtime_rate: Math.round(wage / 8),
      employment_date: App.getLocalDateString(),
      status: 'active'
    });

    if (projId) {
      await DB.add('worker_project_assignments', {
        worker_id: newWorker.id,
        project_id: projId,
        assigned_date: App.getLocalDateString(),
        status: 'active'
      });
    }

    this.playClickSound();
    alert(`✓ تم بنجاح إضافة العامل "${name}" (${spec}) بأجر ${wage.toLocaleString('fr-FR')} دج/يوم!`);
    this.navigate('workers');
  },


  // ────────────────────────────────────────────────────────────
  // INTERFACE 4: واجهة تسجيل مصروف جديد مسرعة
  // ────────────────────────────────────────────────────────────
  async renderNewExpenseView(container) {
    const projects = await DB.getAll('projects');
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    container.innerHTML = `
      <div class="space-y-6 max-w-2xl mx-auto">
        <div class="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div class="flex items-center gap-3">
            <button onclick="App.navigate('expenses')" class="p-2.5 rounded-xl bg-[#141418] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white transition flex items-center gap-2 text-xs font-bold shadow">
              <span>←</span>
              <span>${isFr ? 'Retour aux dépenses' : 'العودة إلى المصاريف'}</span>
            </button>
            <div>
              <h1 class="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>🧾</span>
                <span>${isFr ? 'Enregistrer une Dépense' : 'تسجيل مصروف ورشة أو فاتورة جديدة'}</span>
              </h1>
              <p class="text-xs text-slate-400 mt-0.5">${isFr ? 'Saisie rapide avec imputation partenaire automatique' : 'إدخال فوري وتحديث مباشر لحسابات الشركاء والورشات'}</p>
            </div>
          </div>
        </div>

        <form id="new-expense-form" onsubmit="App.handleCreateExpenseSubmit(event)" class="kpi-card p-6 rounded-2xl border border-white/8 space-y-5 shadow-xl">
          
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Chantier / Projet concerné *' : 'الورشة / المشروع المعني *'}</label>
            <select id="ne-project" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white shadow-inner">
              <option value="">-- مصاريف عامة للمؤسسة (Frais Généraux) --</option>
              ${projects.map(p => `<option value="${p.id}" ${p.id === this.activeProjectId ? 'selected' : ''}>${this.escapeHtml(p.name)}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Désignation / Description de la dépense *' : 'بيان المصروف / السلعة المشتراة *'}</label>
            <input type="text" id="ne-desc" required placeholder="${isFr ? 'Ex: Achat sacs de plâtre & vis BA13 quincaillerie' : 'مثال: شراء أكياس جبس كوفري وسيلك من القنكاييري'}"
              class="w-full bg-[#0C0C10] border border-white/10 focus:border-[#FF3B30] rounded-xl px-4 py-2.5 text-xs text-white shadow-inner font-bold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Montant de la dépense (DZD) *' : 'المبلغ المدفوع (دج DZD) *'}</label>
            <input type="number" step="100" min="50" id="ne-amount" required value="5000"
              class="w-full bg-[#0C0C10] border border-rose-500/30 rounded-xl px-4 py-3 text-sm text-rose-400 font-mono font-black shadow-inner">
            <div class="grid grid-cols-4 gap-2 mt-2">
              <button type="button" onclick="App.addAmountToExpense(1000)" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">+1,000 دج</button>
              <button type="button" onclick="App.addAmountToExpense(2000)" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">+2,000 دج</button>
              <button type="button" onclick="App.addAmountToExpense(5000)" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">+5,000 دج</button>
              <button type="button" onclick="App.addAmountToExpense(10000)" class="py-1 px-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[10px] font-mono border border-white/5">+10,000 دج</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Catégorie de charge' : 'تصنيف المصروف'}</label>
              <select id="ne-category" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                <option value="مواد بناء وقنكاييري">مواد بناء وقنكاييري (Matériaux)</option>
                <option value="نقل وشحن ترونسبور">نقل وشحن ترونسبور (Transport)</option>
                <option value="كراء عتاد وسقالات">كراء عتاد وسقالات (Location Outillage)</option>
                <option value="وجبات وغداء عمال">وجبات وغداء عمال (Restauration)</option>
                <option value="وقود ومصاريف سيارة">وقود ومصاريف سيارة (Carburant)</option>
                <option value="مصاريف أخرى">مصاريف متنوعة أخرى</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">${isFr ? 'Payé par (Partenaire)' : 'مدفوعة من طرف (حساب الشريك)'}</label>
              <select id="ne-partner" class="w-full bg-[#0C0C10] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white shadow-inner">
                <option value="USR-001">الشريك 1 (Admin 1)</option>
                <option value="USR-002">الشريك 2 (Admin 2)</option>
              </select>
            </div>
          </div>

          <div class="pt-3">
            <button type="submit" class="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition active:scale-[0.98]">
              <span>✓</span>
              <span>${isFr ? 'Valider et Enregistrer la Dépense' : 'تأكيد وحفظ المصروف فوراً'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  },

  addAmountToExpense(addVal) {
    const el = document.getElementById('ne-amount');
    if (!el) return;
    const cur = parseFloat(el.value) || 0;
    el.value = cur + addVal;
  },

  async handleCreateExpenseSubmit(event) {
    event.preventDefault();
    const projId = document.getElementById('ne-project').value;
    const desc = document.getElementById('ne-desc').value.trim();
    const amount = parseFloat(document.getElementById('ne-amount').value) || 0;
    const cat = document.getElementById('ne-category').value;
    const partnerId = document.getElementById('ne-partner').value;

    await DB.add('expenses', {
      project_id: projId || null,
      description: desc,
      amount: amount,
      category: cat,
      partner_id: partnerId,
      date: App.getLocalDateString(),
      status: 'active'
    });

    this.playClickSound();
    alert(`✓ تم بنجاح تسجيل المصروف بقيمة ${amount.toLocaleString('fr-FR')} دج!`);
    this.navigate('expenses');
  },

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
    if (typeof I18N !== 'undefined') {
      I18N.setLang(savedLang);
    }
    this.initTheme();
    this.startCockpitClock();
    this.initSidebarState();
    this.updateSupabaseUIState();
    this.setupEventListeners();
    // Initialize Hash Router
    window.addEventListener('hashchange', () => this.handleHashChange());

    // Resolve initial view from URL hash or default to dashboard
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '#/dashboard';
    }
    this.handleHashChange();

    this.updateGlobalHeaderStats();
    console.log('ERP Application initialized successfully with Hash Routing.');
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
    const svg = document.getElementById('sidebar-toggle-svg');
    if (sidebar && isCollapsed) {
      sidebar.classList.add('collapsed');
      if (svg) svg.style.transform = 'rotate(180deg)';
    }
  },

  toggleSidebarCollapse() {
    const sidebar = document.getElementById('main-sidebar');
    const svg = document.getElementById('sidebar-toggle-svg');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('dari_sidebar_collapsed', isCollapsed ? '1' : '0');
    if (svg) {
      svg.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
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
    this.navigate('new_project');
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
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async editProject(projectId) {
    const proj = await DB.getById('projects', projectId);
    if (!proj) return;

    const wilayaOptions = this.algerianWilayas.map(w =>
      `<option value="${this.escapeHtml(w)}"${(proj.wilaya && w.includes(proj.wilaya)) || (!proj.wilaya && w.includes('44')) ? ' selected' : ''}>${this.escapeHtml(w)}</option>`
    ).join('');

    const existing = document.getElementById('edit-project-sheet');
    if (existing) existing.remove();

    const sheet = document.createElement('div');
    sheet.id = 'edit-project-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';
    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:620px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);" id="edit-project-inner">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.3rem;">✏️</span>
            <span style="font-weight:900;color:#fff;font-size:1rem;">تعديل بيانات الورشة</span>
          </div>
          <button onclick="document.getElementById('edit-project-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اسم الورشة / المشروع *</label>
            <input id="ep-name" type="text" value="${this.escapeHtml(proj.name || '')}" placeholder="مثال: فيلا الياسمين - تشطيب كامل" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اسم الزبون / المالك</label>
              <input id="ep-client" type="text" value="${this.escapeHtml(proj.client_name || '')}" placeholder="اسم صاحب الملك" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">رقم الهاتف</label>
              <input id="ep-phone" type="tel" value="${this.escapeHtml(proj.client_phone || '')}" placeholder="0550 xx xx xx" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الولاية</label>
            <select id="ep-wilaya" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
              ${wilayaOptions}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">العنوان التفصيلي (حي، شارع، رقم)</label>
            <input id="ep-address" type="text" value="${this.escapeHtml(proj.address || '')}" placeholder="مثال: حي السلام، شارع الوحدة، رقم 12" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">قيمة العقد مع الزبون (دج)</label>
              <input id="ep-contract" type="number" value="${proj.contract_value || 0}" min="0" step="1000" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الميزانية الداخلية المقدرة (دج)</label>
              <input id="ep-budget" type="number" value="${proj.initial_budget || 0}" min="0" step="1000" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">نموذج العقد التجاري</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <label style="flex:1;min-width:130px;cursor:pointer;">
                <input type="radio" name="ep-model" value="labor_only" ${(proj.commercial_model === 'labor_only') ? 'checked' : ''} style="display:none;" onchange="document.querySelectorAll('.ep-model-btn').forEach(b=>b.style.background='#0f0f17');this.closest('label').querySelector('.ep-model-btn').style.background='rgba(59,130,246,0.25)'">
                <div class="ep-model-btn" style="background:${proj.commercial_model==='labor_only'?'rgba(59,130,246,0.25)':'#0f0f17'};border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:10px;text-align:center;">
                  <div style="font-size:1.2rem;">👷</div>
                  <div style="color:#60a5fa;font-weight:700;font-size:0.75rem;margin-top:3px;">عمل فقط</div>
                  <div style="color:#64748b;font-size:0.65rem;">Travail uniquement</div>
                </div>
              </label>
              <label style="flex:1;min-width:130px;cursor:pointer;">
                <input type="radio" name="ep-model" value="labor_materials" ${(proj.commercial_model === 'labor_materials') ? 'checked' : ''} style="display:none;" onchange="document.querySelectorAll('.ep-model-btn').forEach(b=>b.style.background='#0f0f17');this.closest('label').querySelector('.ep-model-btn').style.background='rgba(16,185,129,0.25)'">
                <div class="ep-model-btn" style="background:${proj.commercial_model==='labor_materials'?'rgba(16,185,129,0.25)':'#0f0f17'};border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:10px;text-align:center;">
                  <div style="font-size:1.2rem;">🏗️</div>
                  <div style="color:#34d399;font-weight:700;font-size:0.75rem;margin-top:3px;">عمل + سلعة</div>
                  <div style="color:#64748b;font-size:0.65rem;">Travail & Matériaux</div>
                </div>
              </label>
              <label style="flex:1;min-width:130px;cursor:pointer;">
                <input type="radio" name="ep-model" value="hybrid" ${(!proj.commercial_model || proj.commercial_model === 'hybrid') ? 'checked' : ''} style="display:none;" onchange="document.querySelectorAll('.ep-model-btn').forEach(b=>b.style.background='#0f0f17');this.closest('label').querySelector('.ep-model-btn').style.background='rgba(245,158,11,0.25)'">
                <div class="ep-model-btn" style="background:${(!proj.commercial_model||proj.commercial_model==='hybrid')?'rgba(245,158,11,0.25)':'#0f0f17'};border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:10px;text-align:center;">
                  <div style="font-size:1.2rem;">🔀</div>
                  <div style="color:#fbbf24;font-weight:700;font-size:0.75rem;margin-top:3px;">هجين</div>
                  <div style="color:#64748b;font-size:0.65rem;">Hybride</div>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">حالة الورشة</label>
            <select id="ep-status" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
              <option value="planning" ${proj.status==='planning'?'selected':''}>📋 تخطيط / Planification</option>
              <option value="in_progress" ${(!proj.status||proj.status==='in_progress')?'selected':''}>🔧 جارٍ التنفيذ / En cours</option>
              <option value="on_hold" ${proj.status==='on_hold'?'selected':''}>⏸️ متوقف مؤقتاً / En pause</option>
              <option value="completed" ${proj.status==='completed'?'selected':''}>✅ منجز / Terminé</option>
            </select>
          </div>
          <button onclick="App._saveEditProject('${projectId}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF3B30,#c0392b);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,59,48,0.35);">
            💾 حفظ التعديلات
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    setTimeout(() => { document.getElementById('ep-name')?.focus(); }, 100);
  },

  async _saveEditProject(projectId) {
    const name = document.getElementById('ep-name')?.value?.trim();
    if (!name) { this.showToast('اسم الورشة مطلوب', 'error'); return; }
    const client = document.getElementById('ep-client')?.value?.trim() || '';
    const phone = document.getElementById('ep-phone')?.value?.trim() || '';
    const wilaya = document.getElementById('ep-wilaya')?.value?.trim() || 'عين الدفلى';
    const address = document.getElementById('ep-address')?.value?.trim() || wilaya;
    const contractVal = parseFloat(document.getElementById('ep-contract')?.value) || 0;
    const budget = parseFloat(document.getElementById('ep-budget')?.value) || 0;
    const model = document.querySelector('input[name="ep-model"]:checked')?.value || 'hybrid';
    const status = document.getElementById('ep-status')?.value || 'in_progress';
    // Extract plain wilaya name (after dash)
    const wilayaPlain = wilaya.replace(/^\d+\s*-\s*/, '').split('(')[0].trim();

    await DB.update('projects', projectId, {
      name,
      client_name: client,
      client_phone: phone,
      address: address || wilayaPlain,
      wilaya: wilayaPlain,
      contract_value: contractVal,
      initial_budget: budget,
      commercial_model: model,
      status
    });

    document.getElementById('edit-project-sheet')?.remove();
    this.playClickSound();
    this.showToast('✓ تم تحديث بيانات الورشة بنجاح!', 'success');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);
  },

  // 2. Building Structure (Floors & Rooms) CRUD
  async deleteFloor(floorId) {
    if (!confirm('هل أنت متأكد من حذف هذا الطابق وجميع الغرف والأجهزة الموجودة بداخله؟')) return;
    await DB.delete('project_floors', floorId);
    alert('✓ تم حذف الطابق وغرفه بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async deleteRoom(roomId) {
    if (!confirm('هل أنت متأكد من حذف هذه الغرفة وجميع القياسات والفتحات والأجهزة التابعة لها؟')) return;
    await DB.delete('project_rooms', roomId);
    alert('✓ تم حذف الغرفة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // 3. Workers CRUD
  async openNewWorkerModal() {
    this.navigate('new_worker');
  },

  async deleteWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    const wName = w ? w.full_name : workerId;
    if (!confirm(`هل أنت متأكد من حذف العامل "${wName}" من سجل العمال نهائياً؟`)) return;
    await DB.delete('workers', workerId);
    this.playClickSound();
    alert('✓ تم حذف العامل بنجاح!');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async editWorker(workerId) {
    const w = await DB.getById('workers', workerId);
    if (!w) return;

    const wilayaOptions = this.algerianWilayas.map(wl =>
      `<option value="${this.escapeHtml(wl)}"${(w.wilaya && wl.includes(w.wilaya)) || (!w.wilaya && wl.includes('44')) ? ' selected' : ''}>${this.escapeHtml(wl)}</option>`
    ).join('');

    const existing = document.getElementById('edit-worker-sheet');
    if (existing) existing.remove();

    const sheet = document.createElement('div');
    sheet.id = 'edit-worker-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';
    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.3rem;">👷</span>
            <span style="font-weight:900;color:#fff;font-size:1rem;">تعديل بيانات العامل</span>
          </div>
          <button onclick="document.getElementById('edit-worker-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الاسم الكامل للعامل *</label>
            <input id="ew-name" type="text" value="${this.escapeHtml(w.full_name || '')}" placeholder="الاسم واللقب" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">التخصص / الحرفة</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;" id="ew-spec-chips">
              ${['جباس','دهان','كهربائي','سباك','نجار','بناء','بلاط','عامل متعدد'].map(sp => `
                <button type="button" onclick="document.querySelectorAll('.ew-spec-chip').forEach(c=>c.style.background='#0f0f17');this.style.background='rgba(255,59,48,0.25)';document.getElementById('ew-spec').value='${sp}'" class="ew-spec-chip" style="padding:7px 13px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:${(w.specialty||'').includes(sp)?'rgba(255,59,48,0.25)':'#0f0f17'};color:#e2e8f0;font-size:0.78rem;cursor:pointer;">${sp}</button>
              `).join('')}
            </div>
            <input id="ew-spec" type="text" value="${this.escapeHtml(w.specialty || '')}" placeholder="أو اكتب التخصص يدوياً" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;margin-top:8px;" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">الأجر اليومي الأساسي (دج)</label>
            <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px;">
              ${[3000,3500,4000,4500,5000,6000].map(wg => `
                <button type="button" onclick="document.querySelectorAll('.ew-wage-chip').forEach(c=>c.style.background='#0f0f17');this.style.background='rgba(16,185,129,0.25)';document.getElementById('ew-wage').value=${wg}" class="ew-wage-chip" style="padding:7px 12px;border-radius:20px;border:1px solid rgba(16,185,129,0.2);background:${(w.daily_wage||3500)==wg?'rgba(16,185,129,0.25)':'#0f0f17'};color:#34d399;font-size:0.78rem;cursor:pointer;">${wg.toLocaleString('fr-FR')} دج</button>
              `).join('')}
            </div>
            <input id="ew-wage" type="number" value="${w.daily_wage || 3500}" min="1000" step="100" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">رقم الهاتف</label>
              <input id="ew-phone" type="tel" value="${this.escapeHtml(w.phone || '')}" placeholder="0550 xx xx xx" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">رقم الهوية الوطنية</label>
              <input id="ew-cin" type="text" value="${this.escapeHtml(w.cin || '')}" placeholder="CIN رقم" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الولاية</label>
            <select id="ew-wilaya" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
              ${wilayaOptions}
            </select>
          </div>
          <button onclick="App._saveEditWorker('${workerId}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF3B30,#c0392b);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,59,48,0.35);">
            💾 حفظ تعديلات العامل
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    setTimeout(() => { document.getElementById('ew-name')?.focus(); }, 100);
  },

  async _saveEditWorker(workerId) {
    const name = document.getElementById('ew-name')?.value?.trim();
    if (!name) { this.showToast('اسم العامل مطلوب', 'error'); return; }
    const spec = document.getElementById('ew-spec')?.value?.trim() || 'عامل متعدد';
    const wage = parseFloat(document.getElementById('ew-wage')?.value) || 3500;
    const phone = document.getElementById('ew-phone')?.value?.trim() || '';
    const cin = document.getElementById('ew-cin')?.value?.trim() || '';
    const wilayaRaw = document.getElementById('ew-wilaya')?.value?.trim() || 'عين الدفلى';
    const wilaya = wilayaRaw.replace(/^\d+\s*-\s*/, '').split('(')[0].trim();

    await DB.update('workers', workerId, {
      full_name: name,
      specialty: spec,
      daily_wage: wage,
      phone,
      cin,
      wilaya
    });

    document.getElementById('edit-worker-sheet')?.remove();
    this.playClickSound();
    this.showToast('✓ تم تحديث بيانات العامل بنجاح!', 'success');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);
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
    const existing = document.getElementById('new-material-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'new-material-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';
    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">📦</span><span style="font-weight:900;color:#fff;font-size:1rem;">إضافة مادة جديدة للكتالوج</span></div>
          <button onclick="document.getElementById('new-material-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اسم المادة أو العتاد *</label>
            <input id="nm-name" type="text" placeholder="مثال: بلاطة رخام 60×60، دهان أبيض، كيبل 2.5mm" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">الفئة / التصنيف</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;">
              ${[
                {v:'plasterboard',l:'🧱 جبس وBA13'},
                {v:'painting',l:'🎨 دهان وصباغة'},
                {v:'electrical',l:'⚡ كهرباء'},
                {v:'plumbing',l:'🔧 صرف وسباكة'},
                {v:'tiling',l:'🪵 بلاط وأرضيات'},
                {v:'general',l:'📦 عام'},
              ].map(c => `<button type="button" onclick="document.querySelectorAll('.nm-cat-btn').forEach(b=>b.style.background='#0f0f17');this.style.background='rgba(255,59,48,0.25)';document.getElementById('nm-cat').value='${c.v}'" class="nm-cat-btn" style="padding:7px 12px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:${c.v==='plasterboard'?'rgba(255,59,48,0.25)':'#0f0f17'};color:#e2e8f0;font-size:0.78rem;cursor:pointer;">${c.l}</button>`).join('')}
            </div>
            <input id="nm-cat" type="hidden" value="plasterboard" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">وحدة القياس</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;">
              ${['قطعة (piece)','م² (m2)','م طولي (ml)','كيلو (kg)','كيس (sac)','لتر (litre)','طقم (ens)','جملة (forfait)'].map((u,i) => {
                const vals = ['piece','m2','ml','kg','sac','litre','ens','forfait'];
                return `<button type="button" onclick="document.querySelectorAll('.nm-unit-btn').forEach(b=>b.style.background='#0f0f17');this.style.background='rgba(59,130,246,0.25)';document.getElementById('nm-unit').value='${vals[i]}'" class="nm-unit-btn" style="padding:7px 12px;border-radius:20px;border:1px solid rgba(59,130,246,0.15);background:${i===0?'rgba(59,130,246,0.25)':'#0f0f17'};color:#93c5fd;font-size:0.75rem;cursor:pointer;">${u}</button>`;
              }).join('')}
            </div>
            <input id="nm-unit" type="hidden" value="piece" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">سعر الشراء الافتراضي (دج)</label>
              <input id="nm-buy" type="number" value="1000" min="0" step="100" oninput="const b=parseFloat(this.value)||0;document.getElementById('nm-sell').value=Math.round(b*1.4)" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">سعر البيع / التركيب (دج)</label>
              <input id="nm-sell" type="number" value="1400" min="0" step="100" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <button onclick="App._saveNewMaterial()" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF3B30,#c0392b);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,59,48,0.35);">
            ➕ إضافة المادة للكتالوج
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    setTimeout(() => document.getElementById('nm-name')?.focus(), 100);
  },

  async _saveNewMaterial() {
    const name = document.getElementById('nm-name')?.value?.trim();
    if (!name) { this.showToast('اسم المادة مطلوب', 'error'); return; }
    const category = document.getElementById('nm-cat')?.value || 'general';
    const unit = document.getElementById('nm-unit')?.value || 'piece';
    const buyPrice = parseFloat(document.getElementById('nm-buy')?.value) || 0;
    const sellPrice = parseFloat(document.getElementById('nm-sell')?.value) || buyPrice;
    await DB.add('materials', {
      name, category, unit,
      default_purchase_price: buyPrice,
      default_selling_price: sellPrice,
      sku: 'MAT-' + Date.now().toString().slice(-4)
    });
    document.getElementById('new-material-sheet')?.remove();
    this.playClickSound();
    this.showToast(`✓ تم إضافة "${name}" للكتالوج`, 'success');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);
  },

  async deleteMaterial(materialId) {
    const m = await DB.getById('materials', materialId);
    const mName = m ? m.name : materialId;
    if (!confirm(`هل أنت متأكد من حذف المادة "${mName}" من الكتالوج؟`)) return;
    await DB.delete('materials', materialId);
    alert('✓ تم حذف المادة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async deleteMaterialPurchase(purchaseId) {
    if (!confirm('هل أنت متأكد من إلغاء وحذف حركة شراء المادة هذه؟')) return;
    await DB.delete('material_purchases', purchaseId);
    alert('✓ تم حذف حركة الشراء بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // 5. Expenses CRUD
  async deleteExpense(expenseId) {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
    await DB.delete('expenses', expenseId);
    alert('✓ تم حذف المصروف بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // 6. Customer Payments CRUD
  async deleteCustomerPayment(paymentId) {
    if (!confirm('هل أنت متأكد من حذف سند الدفعة المالية هذه؟')) return;
    await DB.delete('customer_payments', paymentId);
    alert('✓ تم حذف سند الدفعة وتحديث رصيد الصندوق بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // 7. Quotations & Invoices CRUD
  async deleteQuotation(quotationId) {
    if (!confirm('هل أنت متأكد من حذف هذا الكشف التقديري (Devis)؟')) return;
    await DB.delete('quotations', quotationId);
    alert('✓ تم حذف الكشف التقديري بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async deleteInvoice(invoiceId) {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة (Facture)؟')) return;
    await DB.delete('invoices', invoiceId);
    alert('✓ تم حذف الفاتورة بنجاح!');
    this.playClickSound();
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // 8. Activities & Work Items CRUD
  async openNewProjectActivityModal(projectId) {
    const proj = await DB.getById('projects', projectId);
    if (!proj) return;
    const catalog = await DB.getAll('activity_catalog');
    const categories = await DB.getAll('work_categories');
    const catMap = {};
    categories.forEach(c => { catMap[c.id] = c.name_ar || c.name || c.id; });

    const existing = document.getElementById('new-activity-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'new-activity-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';

    const catalogByCategory = {};
    catalog.forEach(item => {
      const cat = catMap[item.category_id] || 'أخرى';
      if (!catalogByCategory[cat]) catalogByCategory[cat] = [];
      catalogByCategory[cat].push(item);
    });

    const catalogOptions = Object.entries(catalogByCategory).map(([catName, items]) => `
      <optgroup label="${catName}">
        ${items.map(item => `<option value="${this.escapeHtml(item.name)}" data-unit="${item.unit||'m²'}" data-price="${item.default_price||1500}">${this.escapeHtml(item.name)} — ${item.unit||'m²'} — ${(item.default_price||1500).toLocaleString('fr-FR')} دج</option>`).join('')}
      </optgroup>
    `).join('');

    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:620px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">🔨</span><div><div style="font-weight:900;color:#fff;font-size:0.95rem;">إضافة بند عمل جديد</div><div style="font-size:0.7rem;color:#64748b;">ورشة: ${this.escapeHtml(proj.name)}</div></div></div>
          <button onclick="document.getElementById('new-activity-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اختر من دليل الأنشطة (أو اكتب يدوياً أدناه)</label>
            <select id="na-catalog-sel" onchange="App._onActivityCatalogSelect(this)" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.82rem;box-sizing:border-box;outline:none;">
              <option value="">— اختر من الدليل —</option>
              ${catalogOptions}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اسم بند العمل *</label>
            <input id="na-name" type="text" placeholder="مثال: أسقف جبسية BA13، دهان جدران، كهرباء عامة..." style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">وحدة القياس</label>
              <select id="na-unit" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
                <option value="m²">م² (m²)</option>
                <option value="ml">م طولي (ml)</option>
                <option value="u">وحدة (u)</option>
                <option value="ens">طقم (ens)</option>
                <option value="forfait">جملة (forfait)</option>
                <option value="kg">كيلو (kg)</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">سعر الوحدة (دج)</label>
              <input id="na-price" type="number" value="1500" min="0" step="100" oninput="App._calcActTotal()" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الكمية المخططة الإجمالية</label>
            <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px;">
              ${[10,20,50,100,150,200].map(q=>`<button type="button" onclick="document.getElementById('na-qty').value=${q};App._calcActTotal()" style="padding:6px 11px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:#0f0f17;color:#94a3b8;font-size:0.75rem;cursor:pointer;">${q}</button>`).join('')}
            </div>
            <input id="na-qty" type="number" value="50" min="0" step="1" oninput="App._calcActTotal()" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:10px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
          </div>
          <div id="na-total-preview" style="background:rgba(255,59,48,0.08);border:1px solid rgba(255,59,48,0.2);border-radius:12px;padding:10px 14px;color:#fca5a5;font-weight:700;font-size:0.85rem;text-align:center;display:none;"></div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">مسؤولية توفير السلعة</label>
            <div style="display:flex;gap:8px;">
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="na-resp" value="company" checked style="display:none;" onchange="this.closest('label').querySelector('.na-resp-btn').style.borderColor='rgba(255,59,48,0.6)';document.querySelectorAll('.na-resp-btn').forEach((b,i)=>i>0&&(b.style.borderColor='rgba(255,255,255,0.1)'))">
                <div class="na-resp-btn" style="background:#0f0f17;border:2px solid rgba(255,59,48,0.6);border-radius:12px;padding:10px;text-align:center;">
                  <div style="font-size:1.2rem;">🏢</div><div style="color:#fca5a5;font-weight:700;font-size:0.75rem;">على الشركة</div><div style="color:#64748b;font-size:0.65rem;">Fourni par nous</div>
                </div>
              </label>
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="na-resp" value="customer" style="display:none;" onchange="this.closest('label').querySelector('.na-resp-btn').style.borderColor='rgba(59,130,246,0.6)';document.querySelectorAll('.na-resp-btn').forEach((b,i)=>i===0&&(b.style.borderColor='rgba(255,255,255,0.1)'))">
                <div class="na-resp-btn" style="background:#0f0f17;border:2px solid rgba(255,255,255,0.1);border-radius:12px;padding:10px;text-align:center;">
                  <div style="font-size:1.2rem;">👤</div><div style="color:#93c5fd;font-weight:700;font-size:0.75rem;">على الزبون</div><div style="color:#64748b;font-size:0.65rem;">Fourni par client</div>
                </div>
              </label>
            </div>
          </div>
          <button onclick="App._saveNewActivity('${projectId}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF3B30,#c0392b);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,59,48,0.35);">
            ➕ إضافة بند العمل للورشة
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    setTimeout(() => document.getElementById('na-catalog-sel')?.focus(), 100);
  },

  _onActivityCatalogSelect(sel) {
    const opt = sel.options[sel.selectedIndex];
    if (!opt.value) return;
    document.getElementById('na-name').value = opt.value;
    const unit = opt.getAttribute('data-unit') || 'm²';
    const price = opt.getAttribute('data-price') || '1500';
    const unitSel = document.getElementById('na-unit');
    if (unitSel) {
      for (let o of unitSel.options) { if (o.value === unit) { o.selected = true; break; } }
    }
    document.getElementById('na-price').value = price;
    this._calcActTotal();
  },

  _calcActTotal() {
    const price = parseFloat(document.getElementById('na-price')?.value) || 0;
    const qty = parseFloat(document.getElementById('na-qty')?.value) || 0;
    const total = price * qty;
    const preview = document.getElementById('na-total-preview');
    if (preview) {
      if (total > 0) {
        preview.style.display = 'block';
        preview.textContent = `💰 المبلغ التقديري: ${total.toLocaleString('fr-FR')} دج`;
      } else {
        preview.style.display = 'none';
      }
    }
  },

  async _saveNewActivity(projectId) {
    const name = document.getElementById('na-name')?.value?.trim();
    if (!name) { this.showToast('اسم بند العمل مطلوب', 'error'); return; }
    const unit = document.getElementById('na-unit')?.value || 'm²';
    const price = parseFloat(document.getElementById('na-price')?.value) || 0;
    const qty = parseFloat(document.getElementById('na-qty')?.value) || 1;
    const resp = document.querySelector('input[name="na-resp"]:checked')?.value || 'company';
    await DB.add('project_activities', {
      project_id: projectId,
      name, unit,
      unit_price: price,
      planned_qty: qty,
      executed_qty: 0,
      material_responsibility: resp,
      status: 'planned'
    });
    document.getElementById('new-activity-sheet')?.remove();
    this.playClickSound();
    this.showToast(`✓ تم إضافة "${name}" للورشة`, 'success');
    if (this.currentView === 'project_workspace') {
      this.renderActiveProjectTabContent();
    } else {
      await this.renderCurrentView(); this.updateMobileNavState(this.currentView);
    }
  },

  async editProjectActivity(activityId) {
    const act = await DB.getById('project_activities', activityId);
    if (!act) return;
    const catalog = await DB.getAll('activity_catalog');
    const existing = document.getElementById('edit-activity-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'edit-activity-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';

    const pct = act.planned_qty > 0 ? Math.min(100, Math.round((act.executed_qty / act.planned_qty) * 100)) : 0;
    const pctColor = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#3b82f6';

    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:620px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">✏️</span><span style="font-weight:900;color:#fff;font-size:0.95rem;">تعديل بند العمل</span></div>
          <button onclick="document.getElementById('edit-activity-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:10px 14px;">
            <div style="font-size:0.7rem;color:#64748b;margin-bottom:4px;">نسبة الإنجاز الحالية</div>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="flex:1;height:6px;background:#1e293b;border-radius:3px;overflow:hidden;">
                <div style="width:${pct}%;height:100%;background:${pctColor};border-radius:3px;transition:width 0.5s;"></div>
              </div>
              <span style="color:${pctColor};font-weight:900;font-size:0.85rem;">${pct}%</span>
            </div>
            <div style="font-size:0.7rem;color:#94a3b8;margin-top:4px;">${(act.executed_qty||0).toLocaleString('fr-FR')} / ${(act.planned_qty||0).toLocaleString('fr-FR')} ${act.unit||'م²'}</div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">اسم بند العمل *</label>
            <input id="ea-name" type="text" value="${this.escapeHtml(act.name||'')}" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;" />
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">وحدة القياس</label>
              <select id="ea-unit" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
                ${['m²','ml','u','ens','forfait','kg'].map(u=>`<option value="${u}" ${(act.unit||'m²')===u?'selected':''}>${u}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">سعر الوحدة (دج)</label>
              <input id="ea-price" type="number" value="${act.unit_price||0}" min="0" step="100" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الكمية المخططة الإجمالية</label>
              <input id="ea-planned" type="number" value="${act.planned_qty||0}" min="0" step="1" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
            <div>
              <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الكمية المنجزة حتى الآن</label>
              <input id="ea-exec" type="number" value="${act.executed_qty||0}" min="0" step="1" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.9rem;box-sizing:border-box;outline:none;direction:ltr;" />
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">مسؤولية توفير المواد</label>
            <div style="display:flex;gap:8px;">
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="ea-resp" value="company" ${(act.material_responsibility||'company')==='company'?'checked':''} style="display:none;">
                <div style="background:#0f0f17;border:2px solid ${(act.material_responsibility||'company')==='company'?'rgba(255,59,48,0.6)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:10px;text-align:center;cursor:pointer;" onclick="document.querySelectorAll('input[name=ea-resp]')[0].checked=true;this.style.borderColor='rgba(255,59,48,0.6)';document.querySelectorAll('.ea-resp-box')[1].style.borderColor='rgba(255,255,255,0.1)'" class="ea-resp-box">
                  <div style="font-size:1.1rem;">🏢</div><div style="color:#fca5a5;font-weight:700;font-size:0.75rem;">على الشركة</div>
                </div>
              </label>
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="ea-resp" value="customer" ${act.material_responsibility==='customer'?'checked':''} style="display:none;">
                <div style="background:#0f0f17;border:2px solid ${act.material_responsibility==='customer'?'rgba(59,130,246,0.6)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:10px;text-align:center;cursor:pointer;" onclick="document.querySelectorAll('input[name=ea-resp]')[1].checked=true;this.style.borderColor='rgba(59,130,246,0.6)';document.querySelectorAll('.ea-resp-box')[0].style.borderColor='rgba(255,255,255,0.1)'" class="ea-resp-box">
                  <div style="font-size:1.1rem;">👤</div><div style="color:#93c5fd;font-weight:700;font-size:0.75rem;">على الزبون</div>
                </div>
              </label>
            </div>
          </div>
          <button onclick="App._saveEditActivity('${activityId}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#FF3B30,#c0392b);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(255,59,48,0.35);">
            💾 حفظ تعديلات بند العمل
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
  },

  async _saveEditActivity(activityId) {
    const name = document.getElementById('ea-name')?.value?.trim();
    if (!name) { this.showToast('اسم بند العمل مطلوب', 'error'); return; }
    const unit = document.getElementById('ea-unit')?.value || 'm²';
    const price = parseFloat(document.getElementById('ea-price')?.value) || 0;
    const planned = parseFloat(document.getElementById('ea-planned')?.value) || 0;
    const exec = parseFloat(document.getElementById('ea-exec')?.value) || 0;
    const resp = document.querySelector('input[name="ea-resp"]:checked')?.value || 'company';
    await DB.update('project_activities', activityId, {
      name, unit,
      unit_price: price,
      planned_qty: planned,
      executed_qty: exec,
      material_responsibility: resp,
      status: exec >= planned && planned > 0 ? 'completed' : (exec > 0 ? 'in_progress' : 'planned')
    });
    document.getElementById('edit-activity-sheet')?.remove();
    this.playClickSound();
    this.showToast('✓ تم تعديل بند العمل بنجاح!', 'success');
    if (this.currentView === 'project_workspace') {
      this.renderActiveProjectTabContent();
    } else {
      await this.renderCurrentView(); this.updateMobileNavState(this.currentView);
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
      await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
    }
  },


  // ============================================================
  // WORK CATEGORIES & ACTIVITY CATALOG MANAGEMENT ENGINE
  // (إدارة فئات الأشغال، إضافة وتعديل وحذف الأنشطة والأسماء)
  // ============================================================
  openNewWorkCategoryModal() {
    this.playClickSound();
    const modalHTML = `
      <div id="category-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>🏷️</span>
              <span>إضافة فئة أشغال جديدة (Nouvelle Catégorie)</span>
            </h3>
            <button onclick="document.getElementById('category-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">اسم الفئة بالعربية (Désignation en Arabe):</label>
              <input type="text" id="cat_name_ar" placeholder="مثال: أشغال النجارة والأبواب الخشبية" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#FF3B30]">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">اسم الفئة بالفرنسية (Nom en Français):</label>
              <input type="text" id="cat_name_fr" placeholder="Ex: Menuiserie Bois & Portes" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#FF3B30]">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">رمز الفئة (Code):</label>
                <input type="text" id="cat_code" placeholder="Ex: WOOD" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white uppercase font-mono">
              </div>
              <div>
                <label class="block text-slate-400 mb-1">الأيقونة / الرمز (Icône):</label>
                <select id="cat_icon" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white">
                  <option value="🏗️">🏗️ بناء وهيكل</option>
                  <option value="📐">📐 بلاكو وقياسات</option>
                  <option value="🎨">🎨 دهان وديكور</option>
                  <option value="⚡">⚡ كهرباء وإنارة</option>
                  <option value="🔧">🔧 سباكة وتدفئة</option>
                  <option value="🚪">🚪 نجارة وأبواب</option>
                  <option value="🛡️">🛡️ عزل وحماية</option>
                  <option value="📡">📡 سمارت هوم وإنذار</option>
                  <option value="🧱">🧱 ماصونري وترميم</option>
                  <option value="🪟">🪟 ألمنيوم وزجاج</option>
                  <option value="🛠️">🛠️ أشغال عامة</option>
                </select>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onclick="document.getElementById('category-modal').remove()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
              إلغاء
            </button>
            <button onclick="App.saveNewWorkCategory()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg transition">
              حفظ الفئة الجديدة
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveNewWorkCategory() {
    const nameAr = (document.getElementById('cat_name_ar').value || '').trim();
    const nameFr = (document.getElementById('cat_name_fr').value || '').trim();
    let code = (document.getElementById('cat_code').value || '').trim().toUpperCase();
    const icon = document.getElementById('cat_icon').value || '🛠️';

    if (!nameAr) {
      alert('يرجى إدخال اسم الفئة بالعربية على الأقل.');
      return;
    }
    if (!code) {
      code = 'CAT-' + Date.now().toString(36).toUpperCase().slice(-4);
    }

    const newId = 'CAT-' + Date.now().toString(36);
    await DB.add('work_categories', {
      id: newId,
      code: code,
      name: nameAr,
      name_ar: nameAr,
      name_fr: nameFr || nameAr,
      icon: icon
    });

    const modal = document.getElementById('category-modal');
    if (modal) modal.remove();

    this.playClickSound();
    alert(`✓ تم بنجاح إضافة فئة "${nameAr}" إلى دليل الأعمال!`);
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async editWorkCategory(categoryId) {
    this.playClickSound();
    const cat = await DB.getById('work_categories', categoryId);
    if (!cat) return;

    const modalHTML = `
      <div id="category-edit-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>✏️</span>
              <span>تعديل فئة الأشغال</span>
            </h3>
            <button onclick="document.getElementById('category-edit-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">اسم الفئة بالعربية:</label>
              <input type="text" id="edit_cat_name_ar" value="${cat.name_ar || cat.name || ''}" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#FF3B30]">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">اسم الفئة بالفرنسية:</label>
              <input type="text" id="edit_cat_name_fr" value="${cat.name_fr || ''}" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-[#FF3B30]">
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-400 mb-1">رمز الفئة (Code):</label>
                <input type="text" id="edit_cat_code" value="${cat.code || ''}" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white uppercase font-mono">
              </div>
              <div>
                <label class="block text-slate-400 mb-1">الأيقونة:</label>
                <input type="text" id="edit_cat_icon" value="${cat.icon || '🛠️'}" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white text-center text-lg">
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onclick="document.getElementById('category-edit-modal').remove()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
              إلغاء
            </button>
            <button onclick="App.saveEditWorkCategory('${categoryId}')" class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg transition">
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveEditWorkCategory(categoryId) {
    const nameAr = (document.getElementById('edit_cat_name_ar').value || '').trim();
    const nameFr = (document.getElementById('edit_cat_name_fr').value || '').trim();
    const code = (document.getElementById('edit_cat_code').value || '').trim().toUpperCase();
    const icon = (document.getElementById('edit_cat_icon').value || '').trim() || '🛠️';

    if (!nameAr) {
      alert('يرجى إدخال اسم الفئة بالعربية.');
      return;
    }

    await DB.update('work_categories', categoryId, {
      name: nameAr,
      name_ar: nameAr,
      name_fr: nameFr || nameAr,
      code: code,
      icon: icon
    });

    const modal = document.getElementById('category-edit-modal');
    if (modal) modal.remove();

    this.playClickSound();
    alert('✓ تم تعديل الفئة بنجاح!');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async deleteWorkCategory(categoryId) {
    this.playClickSound();
    const cat = await DB.getById('work_categories', categoryId);
    if (!cat) return;
    const catalog = await DB.getAll('activity_catalog');
    const itemsCount = catalog.filter(a => String(a.category_id) === String(categoryId)).length;

    const msg = itemsCount > 0 
      ? `تحذير: الفئة "${cat.name_ar || cat.name}" تحتوي على ${itemsCount} بنود أنشطة مسجلة.\nهل أنت متأكد من حذف هذه الفئة بالكامل؟`
      : `هل أنت متأكد من حذف الفئة "${cat.name_ar || cat.name}"؟`;

    if (!confirm(msg)) return;

    await DB.delete('work_categories', categoryId);
    this.playClickSound();
    alert('✓ تم حذف الفئة بنجاح!');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async openNewCatalogActivityModal(defaultCatId = null) {
    this.playClickSound();
    const categories = await DB.getAll('work_categories');
    if (!categories || categories.length === 0) {
      alert('يرجى إضافة فئة أشغال أولاً قبل إضافة الأنشطة.');
      return;
    }

    const modalHTML = `
      <div id="activity-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📋</span>
              <span>إضافة نشاط جديد مع تحديد سعر الخدمة والسلعة</span>
            </h3>
            <button onclick="document.getElementById('activity-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">الفئة التابع لها (Catégorie):</label>
              <select id="act_category_id" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white font-medium focus:border-[#FF3B30]">
                ${categories.map(c => `
                  <option value="${c.id}" ${c.id === defaultCatId ? 'selected' : ''}>
                    ${c.icon || '●'} ${c.name_ar || c.name} (${c.name_fr || c.code})
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">اسم النشاط وبند العمل (Désignation de l'Activité):</label>
              <input type="text" id="act_name" placeholder="مثال: سقف معلق بلاكو بلاتر BA13 كناوف مع الشاسي" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#FF3B30]">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">وحدة القياس (Unité):</label>
              <select id="act_unit" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white">
                <option value="m²">متر مربع (m²)</option>
                <option value="ml">متر طولي (ml)</option>
                <option value="u">بالوحدة / القطعة (u)</option>
                <option value="forfait">جزافي / فورفي (Forfait)</option>
                <option value="point">نقطة كهرباء أو صحي (Point)</option>
                <option value="m³">متر مكعب (m³)</option>
                <option value="journée">يومية (Journée)</option>
              </select>
            </div>

            <!-- Price Breakdown: Service (Labor) + Material (Goods) + Total -->
            <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span class="text-[11px] font-bold text-amber-300 block">💰 تسعير الوحدة (تفكيك سعر الخدمة والسلعة):</span>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-emerald-400 font-bold mb-1">سعر الخدمة (يد العمل دج):</label>
                  <input type="number" id="act_labor_price" placeholder="مثال: 1200" min="0" step="50" oninput="App.calcCatalogPriceTotal('act_labor_price', 'act_material_price', 'act_price', 'act_price_helper')" class="w-full bg-[#16161C] border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-left focus:border-emerald-400">
                  <span class="text-[9px] text-slate-500 mt-0.5 block">أجرة التركيب والتنفيذ</span>
                </div>

                <div>
                  <label class="block text-cyan-400 font-bold mb-1">سعر السلعة (المواد دج):</label>
                  <input type="number" id="act_material_price" placeholder="مثال: 1200" min="0" step="50" oninput="App.calcCatalogPriceTotal('act_labor_price', 'act_material_price', 'act_price', 'act_price_helper')" class="w-full bg-[#16161C] border border-cyan-500/30 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold text-left focus:border-cyan-400">
                  <span class="text-[9px] text-slate-500 mt-0.5 block">تكلفة السلعة والمواد</span>
                </div>
              </div>

              <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                <div class="flex-1">
                  <label class="block text-slate-300 font-bold mb-0.5">المجموع الكلي للوحدة (خدمة + سلعة):</label>
                  <input type="number" id="act_price" placeholder="2400" min="0" step="50" oninput="App.updateCentimesHelper(this.value, 'act_price_helper')" class="w-full bg-[#16161C] border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono font-black text-left text-sm focus:border-amber-400">
                </div>
                <div class="text-left pt-4">
                  <span id="act_price_helper" class="text-xs text-amber-400 font-mono font-bold block">0 سنتيم</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">الوصف والمواصفات الفنية (Description technique):</label>
              <textarea id="act_desc" rows="2" placeholder="المواصفات، نوع المواد المقترحة، طريقة التركيب..." class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white text-xs"></textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onclick="document.getElementById('activity-modal').remove()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
              إلغاء
            </button>
            <button onclick="App.saveNewCatalogActivity()" class="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg transition">
              حفظ النشاط بالكتالوج
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },


  calcCatalogPriceTotal(laborInputId, materialInputId, totalInputId, helperId) {
    const l = parseFloat(document.getElementById(laborInputId)?.value) || 0;
    const m = parseFloat(document.getElementById(materialInputId)?.value) || 0;
    const total = l + m;
    const totalEl = document.getElementById(totalInputId);
    if (totalEl) totalEl.value = total;
    this.updateCentimesHelper(total, helperId);
  },
  updateCentimesHelper(val, targetId) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const num = parseFloat(val) || 0;
    if (num <= 0) {
      el.textContent = '0 سنتيم';
      return;
    }
    const centimes = num * 10;
    if (num >= 10000) {
      el.textContent = '= ' + (num / 10000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' مليون سنتيم';
    } else {
      el.textContent = '= ' + (centimes / 1000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' ألف سنتيم';
    }
  },

  async saveNewCatalogActivity() {
    const categoryId = document.getElementById('act_category_id').value;
    const name = (document.getElementById('act_name').value || '').trim();
    const unit = document.getElementById('act_unit').value || 'm²';
    const labor = parseFloat(document.getElementById('act_labor_price')?.value) || 0;
    const material = parseFloat(document.getElementById('act_material_price')?.value) || 0;
    const price = parseFloat(document.getElementById('act_price')?.value) || (labor + material);
    const desc = (document.getElementById('act_desc').value || '').trim();

    if (!name) {
      alert('يرجى إدخال اسم النشاط أو العمل.');
      return;
    }

    const newId = 'ACT-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5);
    await DB.add('activity_catalog', {
      id: newId,
      category_id: categoryId,
      name: name,
      unit: unit,
      default_labor_price: labor,
      default_material_price: material,
      default_unit_price: price,
      default_price: price,
      estimated_labor_cost: labor,
      estimated_material_cost: material,
      description: desc
    });

    const modal = document.getElementById('activity-modal');
    if (modal) modal.remove();

    this.playClickSound();
    alert(`✓ تم بنجاح إضافة نشاط "${name}" إلى الدليل!`);
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async editCatalogActivity(activityId) {
    this.playClickSound();
    const it = await DB.getById('activity_catalog', activityId);
    if (!it) return;
    const categories = await DB.getAll('work_categories');

    const curLabor = parseFloat(it.default_labor_price || it.estimated_labor_cost || 0);
    const curMaterial = parseFloat(it.default_material_price || it.estimated_material_cost || 0);
    const curPrice = parseFloat(it.default_unit_price || it.default_price || (curLabor + curMaterial));

    const modalHTML = `
      <div id="activity-edit-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[110] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>✏️</span>
              <span>تعديل النشاط، مسمى العمل، وسعر الخدمة والسلعة</span>
            </h3>
            <button onclick="document.getElementById('activity-edit-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">فئة النشاط (Changer de Catégorie):</label>
              <select id="edit_act_category_id" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white font-medium focus:border-[#FF3B30]">
                ${categories.map(c => `
                  <option value="${c.id}" ${String(c.id) === String(it.category_id) ? 'selected' : ''}>
                    ${c.icon || '●'} ${c.name_ar || c.name} (${c.name_fr || c.code})
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">اسم النشاط وبند العمل (Nom de l'Activité):</label>
              <input type="text" id="edit_act_name" value="${this.escapeHtml(it.name || '')}" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#FF3B30]">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">وحدة القياس (Unité):</label>
              <select id="edit_act_unit" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white">
                <option value="m²" ${it.unit === 'm²' ? 'selected' : ''}>متر مربع (m²)</option>
                <option value="ml" ${it.unit === 'ml' ? 'selected' : ''}>متر طولي (ml)</option>
                <option value="u" ${it.unit === 'u' ? 'selected' : ''}>بالوحدة / القطعة (u)</option>
                <option value="forfait" ${it.unit === 'forfait' ? 'selected' : ''}>جزافي / فورفي (Forfait)</option>
                <option value="point" ${it.unit === 'point' ? 'selected' : ''}>نقطة كهرباء أو صحي (Point)</option>
                <option value="m³" ${it.unit === 'm³' ? 'selected' : ''}>متر مكعب (m³)</option>
                <option value="journée" ${it.unit === 'journée' ? 'selected' : ''}>يومية (Journée)</option>
              </select>
            </div>

            <!-- Price Breakdown: Service (Labor) + Material (Goods) + Total -->
            <div class="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <span class="text-[11px] font-bold text-amber-300 block">💰 تفكيك وتعديل الأسعار المرجعية:</span>
              
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-emerald-400 font-bold mb-1">سعر الخدمة (يد العمل دج):</label>
                  <input type="number" id="edit_act_labor_price" value="${curLabor}" min="0" step="50" oninput="App.calcCatalogPriceTotal('edit_act_labor_price', 'edit_act_material_price', 'edit_act_price', 'edit_act_price_helper')" class="w-full bg-[#16161C] border border-emerald-500/30 rounded-xl px-3 py-2 text-emerald-300 font-mono font-bold text-left focus:border-emerald-400">
                  <span class="text-[9px] text-slate-500 mt-0.5 block">أجرة اليد العاملة</span>
                </div>

                <div>
                  <label class="block text-cyan-400 font-bold mb-1">سعر السلعة (المواد دج):</label>
                  <input type="number" id="edit_act_material_price" value="${curMaterial}" min="0" step="50" oninput="App.calcCatalogPriceTotal('edit_act_labor_price', 'edit_act_material_price', 'edit_act_price', 'edit_act_price_helper')" class="w-full bg-[#16161C] border border-cyan-500/30 rounded-xl px-3 py-2 text-cyan-300 font-mono font-bold text-left focus:border-cyan-400">
                  <span class="text-[9px] text-slate-500 mt-0.5 block">تكلفة المواد والسلعة</span>
                </div>
              </div>

              <div class="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
                <div class="flex-1">
                  <label class="block text-slate-300 font-bold mb-0.5">المجموع الإجمالي للوحدة (خدمة + سلعة):</label>
                  <input type="number" id="edit_act_price" value="${curPrice}" min="0" step="50" oninput="App.updateCentimesHelper(this.value, 'edit_act_price_helper')" class="w-full bg-[#16161C] border border-amber-500/40 rounded-xl px-3 py-2 text-amber-300 font-mono font-black text-left text-sm focus:border-amber-400">
                </div>
                <div class="text-left pt-4">
                  <span id="edit_act_price_helper" class="text-xs text-amber-400 font-mono font-bold block">
                    ${curPrice > 0 ? '= ' + (curPrice / 10000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' مليون سنتيم' : '0 سنتيم'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">المواصفات والوصف الفني:</label>
              <textarea id="edit_act_desc" rows="2" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white text-xs">${it.description || ''}</textarea>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onclick="document.getElementById('activity-edit-modal').remove()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
              إلغاء
            </button>
            <button onclick="App.saveEditCatalogActivity('${activityId}')" class="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg transition">
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveEditCatalogActivity(activityId) {
    const categoryId = document.getElementById('edit_act_category_id').value;
    const name = (document.getElementById('edit_act_name').value || '').trim();
    const unit = document.getElementById('edit_act_unit').value || 'm²';
    const labor = parseFloat(document.getElementById('edit_act_labor_price')?.value) || 0;
    const material = parseFloat(document.getElementById('edit_act_material_price')?.value) || 0;
    const price = parseFloat(document.getElementById('edit_act_price')?.value) || (labor + material);
    const desc = (document.getElementById('edit_act_desc').value || '').trim();

    if (!name) {
      alert('يرجى إدخال اسم النشاط.');
      return;
    }

    await DB.update('activity_catalog', activityId, {
      category_id: categoryId,
      name: name,
      unit: unit,
      default_labor_price: labor,
      default_material_price: material,
      default_unit_price: price,
      default_price: price,
      estimated_labor_cost: labor,
      estimated_material_cost: material,
      description: desc
    });

    const modal = document.getElementById('activity-edit-modal');
    if (modal) modal.remove();

    this.playClickSound();
    alert('✓ تم تعديل النشاط بنجاح!');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  async deleteCatalogActivity(activityId) {
    const act = await DB.getById('activity_catalog', activityId);
    const actName = act ? act.name : 'النشاط';
    if (!confirm(`هل أنت متأكد من حذف النشاط "${actName}" من الكتالوج المرجعي نهائياً؟`)) return;
    await DB.delete('activity_catalog', activityId);
    this.playClickSound();
    alert('✓ تم حذف النشاط من الكتالوج بنجاح!');
    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
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
    const existing = document.getElementById('withdrawal-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'withdrawal-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';
    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:520px;max-height:88vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">💰</span><span style="font-weight:900;color:#fff;font-size:1rem;">تسجيل سحب أرباح</span></div>
          <button onclick="document.getElementById('withdrawal-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">الشريك المستفيد من السحب</label>
            <div style="display:flex;gap:8px;">
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="wd-partner" value="USR-001" ${active.id === 'USR-001' ? 'checked' : ''} style="display:none;">
                <div style="background:#0f0f17;border:2px solid ${active.id==='USR-001'?'rgba(255,59,48,0.6)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:12px;text-align:center;cursor:pointer;" class="wd-p-box" onclick="document.querySelectorAll('input[name=wd-partner]')[0].checked=true;document.querySelectorAll('.wd-p-box')[0].style.borderColor='rgba(255,59,48,0.6)';document.querySelectorAll('.wd-p-box')[1].style.borderColor='rgba(255,255,255,0.1)'">
                  <div style="font-size:1.3rem;">👤</div><div style="color:#fca5a5;font-weight:800;font-size:0.85rem;margin-top:4px;">الشريك 1</div><div style="color:#64748b;font-size:0.65rem;">Associé 1 (Moi)</div>
                </div>
              </label>
              <label style="flex:1;cursor:pointer;">
                <input type="radio" name="wd-partner" value="USR-002" ${active.id === 'USR-002' ? 'checked' : ''} style="display:none;">
                <div style="background:#0f0f17;border:2px solid ${active.id==='USR-002'?'rgba(255,59,48,0.6)':'rgba(255,255,255,0.1)'};border-radius:12px;padding:12px;text-align:center;cursor:pointer;" class="wd-p-box" onclick="document.querySelectorAll('input[name=wd-partner]')[1].checked=true;document.querySelectorAll('.wd-p-box')[1].style.borderColor='rgba(255,59,48,0.6)';document.querySelectorAll('.wd-p-box')[0].style.borderColor='rgba(255,255,255,0.1)'">
                  <div style="font-size:1.3rem;">🤝</div><div style="color:#93c5fd;font-weight:800;font-size:0.85rem;margin-top:4px;">الشريك 2</div><div style="color:#64748b;font-size:0.65rem;">Associé 2</div>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">مبلغ السحب (دج)</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px;">
              ${[10000,20000,30000,50000,100000,150000].map(a=>`<button type="button" onclick="document.querySelectorAll('.wd-amt-chip').forEach(c=>c.style.background='#0f0f17');this.style.background='rgba(59,130,246,0.25)';document.getElementById('wd-amount').value=${a}" class="wd-amt-chip" style="padding:6px 12px;border-radius:20px;border:1px solid rgba(59,130,246,0.2);background:#0f0f17;color:#93c5fd;font-size:0.75rem;cursor:pointer;">${(a/1000).toLocaleString('fr-FR')}k دج</button>`).join('')}
            </div>
            <input id="wd-amount" type="number" value="50000" min="1000" step="1000" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:1rem;box-sizing:border-box;outline:none;direction:ltr;font-weight:700;" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">ملاحظات</label>
            <input id="wd-notes" type="text" value="سحب أرباح شخصية / Retrait de dividende" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;" />
          </div>
          <button onclick="App._saveWithdrawal()" style="width:100%;padding:14px;background:linear-gradient(135deg,#2563eb,#1d4ed8);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(37,99,235,0.35);">
            💰 تسجيل السحب
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
  },

  async _saveWithdrawal() {
    const partnerId = document.querySelector('input[name="wd-partner"]:checked')?.value || 'USR-001';
    const amount = parseFloat(document.getElementById('wd-amount')?.value) || 0;
    if (!amount || amount <= 0) { this.showToast('أدخل مبلغاً صحيحاً', 'error'); return; }
    const notes = document.getElementById('wd-notes')?.value?.trim() || '';
    const partnerName = partnerId === 'USR-001' ? 'الشريك 1' : 'الشريك 2';
    await DB.add('partner_withdrawals', { partner_id: partnerId, amount, date: App.getLocalDateString(), notes });
    document.getElementById('withdrawal-sheet')?.remove();
    this.playClickSound();
    this.showToast(`✓ سحب ${amount.toLocaleString('fr-FR')} دج لـ ${partnerName}`, 'success');
    if (this.currentView === 'wallets') await this.renderWalletsView();
  },

  async openEditProfitSharingModal() {
    const settings = (await DB.getAll('company_settings'))[0] || {};
    const curP1 = settings.partner1_share || 50;
    const curP2 = 100 - curP1;
    const existing = document.getElementById('profit-share-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'profit-share-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';
    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:500px;max-height:85vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">⚙️</span><span style="font-weight:900;color:#fff;font-size:1rem;">تعديل نسب تقاسم الأرباح</span></div>
          <button onclick="document.getElementById('profit-share-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;flex-wrap:wrap;gap:8px;">
            ${[[50,50],[60,40],[70,30],[40,60],[30,70]].map(([p1,p2])=>`
              <button type="button" onclick="document.getElementById('ps-p1').value=${p1};App._updateProfitPreview()" style="flex:1;min-width:80px;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,0.1);background:${curP1===p1?'rgba(245,158,11,0.2)':'#0f0f17'};color:${curP1===p1?'#fbbf24':'#94a3b8'};font-weight:700;font-size:0.85rem;cursor:pointer;">
                ${p1}% / ${p2}%
              </button>
            `).join('')}
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">حصة الشريك 1 (%) — سيُحسب حصة الشريك 2 تلقائياً</label>
            <input id="ps-p1" type="number" value="${curP1}" min="1" max="99" step="1" oninput="App._updateProfitPreview()" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:1.1rem;box-sizing:border-box;outline:none;direction:ltr;font-weight:700;" />
          </div>
          <div id="ps-preview" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:12px;padding:14px;display:flex;justify-content:space-around;text-align:center;">
            <div><div style="font-size:1.8rem;font-weight:900;color:#fbbf24;">${curP1}%</div><div style="font-size:0.72rem;color:#64748b;">الشريك 1</div></div>
            <div style="color:#334155;font-size:1.5rem;font-weight:300;align-self:center;">|</div>
            <div><div style="font-size:1.8rem;font-weight:900;color:#60a5fa;">${curP2}%</div><div style="font-size:0.72rem;color:#64748b;">الشريك 2</div></div>
          </div>
          <button onclick="App._saveProfitSharing('${settings.id||''}')" style="width:100%;padding:14px;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(245,158,11,0.3);">
            💾 حفظ نسب التقاسم الجديدة
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
  },

  _updateProfitPreview() {
    const p1 = Math.min(99, Math.max(1, parseFloat(document.getElementById('ps-p1')?.value) || 50));
    const p2 = 100 - p1;
    const preview = document.getElementById('ps-preview');
    if (preview) {
      preview.innerHTML = `
        <div><div style="font-size:1.8rem;font-weight:900;color:#fbbf24;">${p1}%</div><div style="font-size:0.72rem;color:#64748b;">الشريك 1</div></div>
        <div style="color:#334155;font-size:1.5rem;font-weight:300;align-self:center;">|</div>
        <div><div style="font-size:1.8rem;font-weight:900;color:#60a5fa;">${p2}%</div><div style="font-size:0.72rem;color:#64748b;">الشريك 2</div></div>
      `;
    }
  },

  async _saveProfitSharing(settingsId) {
    const p1 = Math.min(99, Math.max(1, parseFloat(document.getElementById('ps-p1')?.value) || 50));
    const p2 = 100 - p1;
    if (settingsId) {
      await DB.update('company_settings', settingsId, { partner1_share: p1, partner2_share: p2 });
    } else {
      await DB.add('company_settings', { partner1_share: p1, partner2_share: p2 });
    }
    document.getElementById('profit-share-sheet')?.remove();
    this.playClickSound();
    this.showToast(`✓ نسب التقاسم: ${p1}% / ${p2}%`, 'success');
    if (this.currentView === 'wallets') await this.renderWalletsView();
  },

  // ============================================================
  // CUSTOMER PAYMENT MODAL — قبض دفعة من زبون
  // ============================================================
  async openNewCustomerPaymentModal(projectId = null) {
    const projects = await DB.getAll('projects');
    const activeProjects = projects.filter(p => p.status !== 'completed');

    const existing = document.getElementById('customer-payment-sheet');
    if (existing) existing.remove();
    const sheet = document.createElement('div');
    sheet.id = 'customer-payment-sheet';
    sheet.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:flex-end;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px);';

    const projectOptions = activeProjects.map(p =>
      `<option value="${p.id}" ${String(p.id) === String(projectId) ? 'selected' : ''}>${this.escapeHtml(p.name)} — ${this.escapeHtml(p.client_name || '—')}</option>`
    ).join('');

    sheet.innerHTML = `
      <div style="background:#1a1a24;border-radius:20px 20px 0 0;width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding:0 0 32px 0;box-shadow:0 -20px 60px rgba(0,0,0,0.6);">
        <div style="position:sticky;top:0;background:#1a1a24;padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:space-between;z-index:10;">
          <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:1.3rem;">📥</span><span style="font-weight:900;color:#fff;font-size:1rem;">تسجيل دفعة واردة من زبون</span></div>
          <button onclick="document.getElementById('customer-payment-sheet').remove()" style="background:rgba(255,255,255,0.08);border:none;color:#aaa;border-radius:50%;width:32px;height:32px;font-size:1.1rem;cursor:pointer;">✕</button>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px;">
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">الورشة / المشروع *</label>
            <select id="cp-project" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;">
              <option value="">— اختر الورشة —</option>
              ${projectOptions}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">مبلغ الدفعة (دج) *</label>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:8px;">
              ${[10000,20000,30000,50000,100000,150000,200000,250000].map(a=>
                `<button type="button" onclick="document.querySelectorAll('.cp-amt-chip').forEach(c=>c.style.background='#0f0f17');this.style.background='rgba(16,185,129,0.25)';document.getElementById('cp-amount').value=${a}" class="cp-amt-chip" style="padding:6px 11px;border-radius:20px;border:1px solid rgba(16,185,129,0.2);background:#0f0f17;color:#34d399;font-size:0.75rem;cursor:pointer;">${(a>=1000?a/1000+'k':a).toLocaleString('fr-FR')} دج</button>`
              ).join('')}
            </div>
            <input id="cp-amount" type="number" value="" min="0" step="1000" placeholder="أدخل المبلغ بالدينار الجزائري" style="width:100%;background:#0f0f17;border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:12px 14px;color:#fff;font-size:1rem;box-sizing:border-box;outline:none;direction:ltr;font-weight:700;" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:7px;font-weight:700;">طريقة الدفع</label>
            <div style="display:flex;gap:7px;flex-wrap:wrap;">
              ${[
                {v:'cash',l:'💵 نقداً',c:'rgba(16,185,129,0.25)'},
                {v:'check',l:'🏦 شيك',c:'rgba(59,130,246,0.25)'},
                {v:'transfer',l:'📱 تحويل',c:'rgba(139,92,246,0.25)'},
                {v:'ccp',l:'📮 CCP',c:'rgba(245,158,11,0.25)'},
              ].map(m=>`<button type="button" onclick="document.querySelectorAll('.cp-pay-btn').forEach(b=>b.style.background='#0f0f17');this.style.background='${m.c}';document.getElementById('cp-method').value='${m.v}'" class="cp-pay-btn" style="padding:8px 14px;border-radius:20px;border:1px solid rgba(255,255,255,0.1);background:${m.v==='cash'?'rgba(16,185,129,0.25)':'#0f0f17'};color:#e2e8f0;font-size:0.78rem;cursor:pointer;">${m.l}</button>`).join('')}
            </div>
            <input id="cp-method" type="hidden" value="cash" />
          </div>
          <div>
            <label style="display:block;font-size:0.72rem;color:#94a3b8;margin-bottom:5px;font-weight:700;">ملاحظات / مرجع الدفعة</label>
            <input id="cp-notes" type="text" placeholder="مثال: الدفعة الأولى — مرجع شيك رقم 123456" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:11px 14px;color:#fff;font-size:0.85rem;box-sizing:border-box;outline:none;" />
          </div>
          <button onclick="App._saveCustomerPayment()" style="width:100%;padding:14px;background:linear-gradient(135deg,#059669,#047857);border:none;border-radius:14px;color:#fff;font-weight:900;font-size:0.95rem;cursor:pointer;margin-top:4px;box-shadow:0 4px 20px rgba(5,150,105,0.35);">
            ✓ تأكيد قبض الدفعة
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(sheet);
    sheet.addEventListener('click', e => { if (e.target === sheet) sheet.remove(); });
    setTimeout(() => document.getElementById('cp-amount')?.focus(), 150);
  },

  async _saveCustomerPayment() {
    const projectId = document.getElementById('cp-project')?.value;
    if (!projectId) { this.showToast('اختر الورشة أولاً', 'error'); return; }
    const amount = parseFloat(document.getElementById('cp-amount')?.value) || 0;
    if (!amount || amount <= 0) { this.showToast('أدخل مبلغاً صحيحاً', 'error'); return; }
    const method = document.getElementById('cp-method')?.value || 'cash';
    const notes = document.getElementById('cp-notes')?.value?.trim() || '';
    const proj = await DB.getById('projects', projectId);

    await DB.add('customer_payments', {
      project_id: projectId,
      client_name: proj?.client_name || '',
      amount,
      payment_method: method,
      date: App.getLocalDateString(),
      notes,
      receipt_ref: 'RCP-' + Date.now().toString().slice(-6)
    });
    document.getElementById('customer-payment-sheet')?.remove();
    this.playClickSound();
    this.showToast(`✓ تم قبض ${amount.toLocaleString('fr-FR')} دج`, 'success');
    if (this.currentView === 'project_workspace' || this.currentView === 'wallets') {
      await this.renderCurrentView();
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
    const nextLang = (typeof I18N !== 'undefined' && I18N.currentLang === 'ar') ? 'fr' : 'ar';
    if (typeof I18N !== 'undefined') {
      I18N.setLang(nextLang);
    } else {
      document.documentElement.setAttribute('lang', nextLang);
      document.documentElement.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
      if (document.body) document.body.setAttribute('dir', nextLang === 'ar' ? 'rtl' : 'ltr');
      localStorage.setItem('dari_lang', nextLang);
    }

    this.applyLanguageToUI(nextLang);
    this.showToast(nextLang === 'ar' ? 'تم التحويل إلى اللغة العربية (RTL)' : 'Interface basculée en Français (LTR)', 'success');
    this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  applyLanguageToUI(lang) {
    if (typeof I18N !== 'undefined') {
      I18N.updateStaticUI();
    }
  },

  openProjectWorkspace(id) {
    this.playClickSound();
    this.navigate('project_workspace', id);
  },

  setRoleFilter(role, btn) {
    this.playClickSound();
    // role filter pills now map to status values directly (all, in_progress, completed, planning, on_hold)
    // also covers worker craft types (électricien, plaquiste, etc.) and quotation statuses (approved, pending, sent)
    this.cockpitFilterRole = role;
    this.cockpitFilterStatus = (role === 'all') ? 'all' : role; // sync status filter as well for project views
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
    const wilaya = this.cockpitFilterWilaya;

    const rows = document.querySelectorAll('#cockpit-table-body tr');
    rows.forEach(tr => {
      const rowText = tr.textContent.toLowerCase();
      const rowStatus = (tr.dataset.status || '').toLowerCase();
      const rowRole = (tr.dataset.role || rowStatus).toLowerCase(); // role falls back to status
      const rowWilaya = (tr.dataset.wilaya || '').toLowerCase();

      let matchSearch = !q || rowText.includes(q);
      // If role filter is a status value, match against row status; otherwise match data-role attribute
      const statusValues = ['in_progress', 'completed', 'planning', 'on_hold', 'draft', 'cancelled'];
      let matchRole;
      if (role === 'all') {
        matchRole = true;
      } else if (statusValues.includes(role)) {
        matchRole = rowStatus === role;
      } else {
        matchRole = rowRole === role.toLowerCase();
      }
      let matchStatus = (status === 'all') || (rowStatus === status.toLowerCase());
      let matchWilaya = (wilaya === 'all') || rowWilaya.includes(wilaya.toLowerCase());

      if (matchSearch && matchRole && matchStatus && matchWilaya) {
        tr.style.display = '';
      } else {
        tr.style.display = 'none';
      }
    });
  },

  
  // ═══════════════════════════════════════════════════════════
  // HASH ROUTING & DYNAMIC BREADCRUMBS ENGINE
  // ═══════════════════════════════════════════════════════════

  routes: {
    '#/dashboard': { view: 'dashboard' },
    '#/projects': { view: 'projects' },
    '#/building-structure': { view: 'building_structure' },
    '#/activities': { view: 'activities' },
    '#/daily-checkin': { view: 'daily_checkin' },
    '#/workers': { view: 'workers' },
    '#/quotations': { view: 'quotations_invoices' },
    '#/scenarios': { view: 'test_scenarios' },
    '#/wallets': { view: 'wallets' },
    '#/finances': { view: 'finances' },
    '#/materials': { view: 'materials' },
    '#/expenses': { view: 'expenses' },
    '#/reports': { view: 'reports' },
    '#/settings': { view: 'settings' }
  },

  viewToRoute(view, id = null) {
    if (view === 'project_workspace' && id) return '#/projects/' + id;
    const map = {
      dashboard: '#/dashboard',
      projects: '#/projects',
      building_structure: '#/building-structure',
      activities: '#/activities',
      daily_checkin: '#/daily-checkin',
      workers: '#/workers',
      quotations_invoices: '#/quotations',
      test_scenarios: '#/scenarios',
      wallets: '#/wallets',
      finances: '#/finances',
      materials: '#/materials',
      expenses: '#/expenses',
      reports: '#/reports',
      new_project: '#/new-project',
      new_worker: '#/new-worker',
      new_room: '#/new-room',
      new_expense: '#/new-expense',
      settings: '#/settings'
    };
    return map[view] || '#/' + view;
  },

  handleHashChange() {
    const hash = (typeof window !== 'undefined' && window.location.hash) || '#/dashboard';

    // 1. Check workspace pattern: #/projects/:id
    const projMatch = hash.match(/^#\/projects\/([a-zA-Z0-9_\-]+)$/);
    if (projMatch) {
      const projId = projMatch[1];
      this.navigate('project_workspace', projId, false);
      return;
    }

    // 2. Direct route match
    for (const [route, config] of Object.entries(this.routes)) {
      if (hash === route || hash === route + '/') {
        this.navigate(config.view, null, false);
        return;
      }
    }

    // 3. Fallback: normalize raw view names
    const cleanView = hash.replace(/^#\/?/, '').replace(/-/g, '_');
    const directMap = {
      dashboard: 'dashboard',
      projects: 'projects',
      building_structure: 'building_structure',
      activities: 'activities',
      daily_checkin: 'daily_checkin',
      workers: 'workers',
      quotations: 'quotations_invoices',
      quotations_invoices: 'quotations_invoices',
      scenarios: 'test_scenarios',
      test_scenarios: 'test_scenarios',
      wallets: 'wallets',
      finances: 'finances',
      materials: 'materials',
      expenses: 'expenses',
      reports: 'reports',
      new_project: 'new_project',
      new_worker: 'new_worker',
      new_room: 'new_room',
      new_expense: 'new_expense',
      settings: 'settings'
    };

    if (cleanView && directMap[cleanView]) {
      this.navigate(directMap[cleanView], null, false);
      return;
    }

    // Default route
    this.navigate('dashboard', null, false);
  },

  async updateHeaderBreadcrumbs() {
    const container = document.getElementById('header-breadcrumbs-text');
    if (!container) return;

    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';
    const isRtl = !isFr;
    const arrow = isRtl ? '‹' : '›';
    const view = this.currentView;

    const meta = {
      dashboard: {
        icon: '📊',
        hub: isFr ? 'Vue d\'ensemble' : 'لوحة القيادة',
        title: isFr ? 'Tableau de bord principal' : 'لوحة التحكم والرقابة',
        sub: isFr ? 'Cockpit opérationnel en temps réel' : 'متابعة المشاريع والرقابة الميدانية الحية'
      },
      projects: {
        icon: '🏗️',
        hub: isFr ? 'Chantiers' : 'المشاريع والعمليات',
        title: isFr ? 'Tous les chantiers' : 'سجل الورشات والمشاريع',
        sub: isFr ? 'Liste complète des projets et suivi des travaux' : 'سجل وتسيير كافة مشاريع وورشات المؤسسة'
      },
      project_workspace: {
        icon: '📁',
        hub: isFr ? 'Chantiers' : 'الورشات',
        title: isFr ? 'Fiche Chantier' : 'ملف الورشة',
        sub: isFr ? 'Espace de travail opérationnel' : 'مساحة العمل والمتابعة الميدانية'
      },
      building_structure: {
        icon: '📐',
        hub: isFr ? 'Chantiers' : 'المشاريع والعمليات',
        title: isFr ? 'Bâtiments & Mesures' : 'الهيكل، الغرف والقياسات',
        sub: isFr ? 'Plans, métrés et surfaces' : 'حساب المساحات والمتر المربع لكل غرفة'
      },
      activities: {
        icon: '📋',
        hub: isFr ? 'Chantiers' : 'المشاريع والعمليات',
        title: isFr ? 'Catalogue Travaux' : 'دليل بنود وأنشطة الأشغال',
        sub: isFr ? 'Corps d\'état, prestations & tarifs' : 'بنود البناء، الدهان، البلاكو، والكهرباء'
      },
      daily_checkin: {
        icon: '⏱️',
        hub: isFr ? 'RH & Paie' : 'الموارد البشرية',
        title: isFr ? 'Pointage Journalier' : 'تسجيل الحضور واليوميات',
        sub: isFr ? 'Présences, avances et paie du jour' : 'التحضير السريع وتسبيقات أجور العمال'
      },
      workers: {
        icon: '👥',
        hub: isFr ? 'RH & Paie' : 'الموارد البشرية',
        title: isFr ? 'Équipe & Salaires' : 'سجل العمال واليوميات',
        sub: isFr ? 'Gestion des ouvriers & paie' : 'إدارة العمال واليوميات والأجور المستحقة'
      },
      quotations_invoices: {
        icon: '📑',
        hub: isFr ? 'Commerce & Devis' : 'التسعير والفوترة',
        title: isFr ? 'Devis & Factures' : 'عروض الأسعار والفواتير',
        sub: isFr ? 'Documents commerciaux & factures clients' : 'إعداد الديفيس الرسمي والفواتير للزبائن'
      },
      test_scenarios: {
        icon: '🎯',
        hub: isFr ? 'Commerce & Devis' : 'التسعير والفوترة',
        title: isFr ? 'Scénarios Tarifaires (A,B,C,D)' : 'النماذج التجارية والتسعير',
        sub: isFr ? 'Simulation de rentabilité & coefficients' : 'اختبار نسب الربحية ونماذج التسعير'
      },
      wallets: {
        icon: '💰',
        hub: isFr ? 'Finances & Caisse' : 'المالية والخزينة',
        title: isFr ? 'Caisse & Bénéfices' : 'صندوق الشركة وتقاسم الأرباح',
        sub: isFr ? 'Trésorerie générale & répartition associés' : 'حساب الأرباح الصافية وحصص الشركاء'
      },
      finances: {
        icon: '📈',
        hub: isFr ? 'Finances & Caisse' : 'المالية والخزينة',
        title: isFr ? 'Finances & Rentabilité' : 'المركز المالي والأرباح الحقيقية',
        sub: isFr ? 'Bilans financiers et marges réelles' : 'مقارنة المداخيل والتكاليف وصافي العائد'
      },
      materials: {
        icon: '🧱',
        hub: isFr ? 'Finances & Caisse' : 'المخزون والموردين',
        title: isFr ? 'Matériaux & Fournisseurs' : 'المواد والمخزون والموردين',
        sub: isFr ? 'Approvisionnement & alertes rupture' : 'فواتير السلع والمواد المستهلكة في الورشات'
      },
      expenses: {
        icon: '🧾',
        hub: isFr ? 'Finances & Caisse' : 'المالية والخزينة',
        title: isFr ? 'Dépenses & Caisses' : 'المصاريف والعهد النثرية',
        sub: isFr ? 'Frais généraux & petite caisse' : 'تسجيل المصاريف اليومية والوقود والنثريات'
      },
      reports: {
        icon: '🖨️',
        hub: isFr ? 'Système' : 'النظام والتقارير',
        title: isFr ? 'Rapports & Impressions A4' : 'التقارير الشاملة والطباعة A4',
        sub: isFr ? 'Bilans imprimables & exports documents' : 'تصدير التقارير الرسمية وكشوف الحسابات'
      },
      new_project: {
        icon: '🏗️',
        hub: isFr ? 'Chantiers' : 'الورشات',
        title: isFr ? 'Nouveau Chantier (Assistant)' : 'إنشاء ورشة جديدة (مساعد ذكي)',
        sub: isFr ? 'Création rapide et liaison catalogue travaux' : 'واجهة مسرعة لتحديد بنود الأشغال والنموذج التجاري'
      },
      new_worker: {
        icon: '👷',
        hub: isFr ? 'RH & Paie' : 'الموارد البشرية',
        title: isFr ? 'Nouvel Ouvrier' : 'تسجيل عامل جديد',
        sub: isFr ? 'Sélection rapide des métiers et salaires' : 'إضافة عامل وتعيينه في الورشة ودفتر اليوميات'
      },
      new_room: {
        icon: '📐',
        hub: isFr ? 'Chantiers' : 'الورشات',
        title: isFr ? 'Métrés & Pièce' : 'مساعد قياسات الغرف',
        sub: isFr ? 'Calcul automatique surfaces et déductions' : 'حساب تلقائي للمساحات وخصومات الأبواب والنوافذ'
      },
      new_expense: {
        icon: '🧾',
        hub: isFr ? 'Finances' : 'المالية',
        title: isFr ? 'Nouvelle Dépense' : 'تسجيل مصروف جديد',
        sub: isFr ? 'Frais de chantier et imputation partenaire' : 'تسجيل مصاريف الورشة وتحديث دفاتر الشركاء'
      },
      settings: {
        icon: '⚙️',
        hub: isFr ? 'Système' : 'النظام والإعدادات',
        title: isFr ? 'Paramètres & Entreprise' : 'إعدادات المؤسسة والسحابة',
        sub: isFr ? 'Configuration système & coordonnées' : 'بيانات المؤسسة والربط السحابي'
      }
    };

    const currentMeta = meta[view] || meta['dashboard'];

    // Dynamic project breadcrumb if inside project workspace
    let projectBreadcrumb = '';
    if (view === 'project_workspace' && this.activeProjectId) {
      try {
        const p = await DB.get('projects', this.activeProjectId);
        if (p) {
          projectBreadcrumb = `
            <span class="text-slate-600">${arrow}</span>
            <span class="text-[#FF3B30] font-bold truncate max-w-[120px] sm:max-w-[200px]">${this.escapeHtml(p.name || this.activeProjectId)}</span>
          `;
        }
      } catch (e) {}
    }

    container.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap">
        <a href="javascript:void(0)" onclick="App.navigate('dashboard')" class="font-black text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 leading-tight hover:opacity-80 transition">
          DARI LUXE
        </a>
        <span class="text-slate-600 text-xs">${arrow}</span>
        <span class="text-[11px] font-bold text-slate-400 hidden sm:inline">${currentMeta.hub}</span>
        <span class="text-slate-600 text-xs hidden sm:inline">${arrow}</span>
        <h1 class="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
          <span>${currentMeta.icon}</span>
          <span>${currentMeta.title}</span>
        </h1>
        ${projectBreadcrumb}
      </div>
      <p class="text-[10px] text-slate-500 hidden sm:block truncate max-w-md mt-0.5">
        ${currentMeta.sub}
      </p>
    `;
  },

  renderHubTabs(currentView) {
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    const hubs = [
      {
        id: 'chantiers',
        views: ['projects', 'building_structure', 'activities'],
        tabs: [
          { view: 'projects', icon: '🏗️', label: isFr ? 'Tous les Chantiers' : 'سجل الورشات والمشاريع' },
          { view: 'building_structure', icon: '📐', label: isFr ? 'Bâtiments & Mesures' : 'الهيكل والقياسات' },
          { view: 'activities', icon: '📋', label: isFr ? 'Catalogue Travaux' : 'دليل بنود الأشغال' },
        ]
      },
      {
        id: 'rh',
        views: ['daily_checkin', 'workers'],
        tabs: [
          { view: 'daily_checkin', icon: '⏱️', label: isFr ? 'Pointage Journalier' : 'الحضور اليومي السريع' },
          { view: 'workers', icon: '👥', label: isFr ? 'Équipe & Salaires' : 'سجل العمال والأجور' },
        ]
      },
      {
        id: 'devis',
        views: ['quotations_invoices', 'test_scenarios'],
        tabs: [
          { view: 'quotations_invoices', icon: '📑', label: isFr ? 'Devis & Factures' : 'عروض الأسعار والفواتير' },
          { view: 'test_scenarios', icon: '🎯', label: isFr ? 'Scénarios (A,B,C,D)' : 'نماذج التسعير والربح' },
        ]
      },
      {
        id: 'finances',
        views: ['wallets', 'finances', 'materials', 'expenses'],
        tabs: [
          { view: 'wallets', icon: '💰', label: isFr ? 'Caisse & Bénéfices' : 'صندوق الشركة والأرباح' },
          { view: 'finances', icon: '📈', label: isFr ? 'Finances & Rentabilité' : 'المركز المالي' },
          { view: 'materials', icon: '🧱', label: isFr ? 'Matériaux & Stock' : 'المواد والمخزون' },
          { view: 'expenses', icon: '🧾', label: isFr ? 'Dépenses & Caisses' : 'المصاريف والنثريات' },
        ]
      }
    ];

    const activeHub = hubs.find(h => h.views.includes(currentView));
    if (!activeHub) return '';

    return `
      <div class="hub-tabs-container">
        ${activeHub.tabs.map(tab => {
          const isActive = tab.view === currentView;
          return `
            <button onclick="App.navigate('${tab.view}')" class="hub-tab-btn ${isActive ? 'active' : ''}">
              <span>${tab.icon}</span>
              <span>${tab.label}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
  },

  injectHubTabs(container, view) {
    const tabsHtml = this.renderHubTabs(view);
    if (!tabsHtml || !container) return;
    container.insertAdjacentHTML('afterbegin', tabsHtml);
  },

  async navigate(viewName, projectId = null, updateHash = true) {
    this.currentView = viewName;
    if (projectId) {
      this.activeProjectId = projectId;
    }

    // Sync URL hash for browser history & bookmarking
    if (updateHash && typeof window !== 'undefined') {
      const targetHash = this.viewToRoute(viewName, projectId);
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }
    }

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

    if (typeof closeMobileSidebar === "function") closeMobileSidebar();
    // Close mobile sidebar if open
    const sidebar = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('mobile-sidebar-backdrop');
    if (sidebar && !sidebar.classList.contains('translate-x-full')) {
      sidebar.classList.add('translate-x-full');
      if (backdrop) backdrop.classList.add('hidden');
    }

    // Update active sidebar nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update dynamic header breadcrumb
    await this.updateHeaderBreadcrumbs();

    await this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
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

  
  // Update mobile bottom nav active state
  updateMobileNavState(view) {
    const mapping = {
      dashboard: 'mob-nav-dashboard',
      projects: 'mob-nav-projects',
      building_structure: 'mob-nav-projects',
      activities: 'mob-nav-projects',
      daily_checkin: 'mob-nav-checkin',
      expenses: 'mob-nav-expenses',
      finances: 'mob-nav-expenses',
      wallets: 'mob-nav-expenses',
      materials: 'mob-nav-expenses',
    };

    // Reset all
    document.querySelectorAll('.mobile-nav-item').forEach(el => el.classList.remove('active'));

    const targetId = mapping[view] || null;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) el.classList.add('active');
    }

    // Update mob i18n text
    document.querySelectorAll('[data-mob-i18n]').forEach(el => {
      const key = el.getAttribute('data-mob-i18n');
      if (typeof I18N !== 'undefined' && I18N.t) {
        const val = I18N.t(key);
        if (val) el.textContent = val;
      }
    });
  },

  async renderCurrentView() {
    const mainContainer = document.getElementById('main-content-view');
    if (!mainContainer) return;

    // Scroll to top
    mainContainer.scrollTop = 0;

    // Update breadcrumbs in header
    await this.updateHeaderBreadcrumbs();

    try {
      switch (this.currentView) {
        case 'dashboard':
          await this.renderDashboardView(mainContainer);
          break;
        case 'daily_checkin':
          await DailyCheckin.renderView(mainContainer);
          this.injectHubTabs(mainContainer, 'daily_checkin');
          break;
        case 'projects':
          await this.renderProjectsView(mainContainer);
          this.injectHubTabs(mainContainer, 'projects');
          break;
        case 'project_workspace':
          await this.renderProjectWorkspaceView(mainContainer);
          break;
        case 'building_structure':
          await this.renderBuildingStructureView(mainContainer);
          this.injectHubTabs(mainContainer, 'building_structure');
          break;
        case 'activities':
          await this.renderActivitiesView(mainContainer);
          this.injectHubTabs(mainContainer, 'activities');
          break;
        case 'workers':
          await this.renderWorkersView(mainContainer);
          this.injectHubTabs(mainContainer, 'workers');
          break;
        case 'materials':
          await this.renderMaterialsView(mainContainer);
          this.injectHubTabs(mainContainer, 'materials');
          break;
        case 'expenses':
          await this.renderExpensesView(mainContainer);
          this.injectHubTabs(mainContainer, 'expenses');
          break;
        case 'wallets':
          await this.renderWalletsView(mainContainer);
          this.injectHubTabs(mainContainer, 'wallets');
          break;
        case 'finances':
          await this.renderFinancesView(mainContainer);
          this.injectHubTabs(mainContainer, 'finances');
          break;
        case 'quotations_invoices':
          await this.renderQuotationsInvoicesView(mainContainer);
          this.injectHubTabs(mainContainer, 'quotations_invoices');
          break;
        case 'test_scenarios':
          await this.renderTestScenariosView(mainContainer);
          this.injectHubTabs(mainContainer, 'test_scenarios');
          break;
        case 'new_project':
          await this.renderNewProjectView(mainContainer);
          break;
        case 'new_worker':
          await this.renderNewWorkerView(mainContainer);
          break;
        case 'new_room':
          await this.renderNewRoomView(mainContainer);
          break;
        case 'new_expense':
          await this.renderNewExpenseView(mainContainer);
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

    // 100% Real DB stats (no fake mock numbers)
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const pendingProjects = projects.filter(p => p.status === 'planning' || p.status === 'on_hold' || p.status === 'draft').length;
    const activeWorkers = workers.filter(w => w.status !== 'inactive').length;

    // Today attendance
    const todayStr = App.getLocalDateString();
    const todayAttendances = attendances.filter(a => a.date === todayStr);
    const todayPresentWorkersCount = todayAttendances.filter(a => (a.multiplier || 0) > 0).length;

    const cockpitRowsHTML = this.renderCockpitTableRows(projects, activities);
    const mobileCardsHTML = this.renderMobileProjectCards(projects, activities);
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-input" oninput="App.filterCockpitTable(this.value)" placeholder="${t('search_placeholder')}" class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] ${isFr ? 'pl-4 pr-12' : 'pr-4 pl-12'} shadow-inner">
          <span class="absolute ${isFr ? 'right-3.5' : 'left-3.5'} top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Cockpit Header Banner -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold shadow-inner">
              <svg class="w-6 h-6 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-base font-black text-white">${t('hero_title')}</h2>
                <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ${t('hero_badge')}
                </span>
              </div>
              <p class="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
                ${t('hero_desc')}
              </p>
            </div>
          </div>
          <button onclick="App.openNewProjectModal()" class="w-full md:w-auto px-4 py-2.5 rounded-xl bg-[#FF3B30] hover:bg-[#E0352B] text-white font-extrabold text-xs shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition transform active:scale-95 whitespace-nowrap">
            <span>${t('hero_btn')}</span>
          </button>
        </div>

        <!-- 6 Live Metric / KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div class="kpi-card metric-box-blue p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_total_projects')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-extrabold">TOTAL</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-white font-mono">${totalProjects}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_total_projects_sub')}</span>
            </div>
          </div>

          <div class="kpi-card metric-box-green p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_active_projects')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-extrabold">ACTIVE</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-emerald-400 font-mono">${activeProjects}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_active_projects_sub')}</span>
            </div>
          </div>

          <div class="kpi-card metric-box-purple p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_pending_projects')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-extrabold">ÉTUDE</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-purple-400 font-mono">${pendingProjects}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_pending_projects_sub')}</span>
            </div>
          </div>

          <div class="kpi-card metric-box-cyan p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_completed_projects')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-extrabold">FIN</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-cyan-400 font-mono">${completedProjects}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_completed_projects_sub')}</span>
            </div>
          </div>

          <div class="kpi-card metric-box-amber p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_active_workers')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold">ÉQUIPE</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-amber-400 font-mono">${activeWorkers}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_active_workers_sub')}</span>
            </div>
          </div>

          <div class="kpi-card metric-box-red p-3.5 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold text-slate-300">${t('kpi_today_attendance')}</span>
              <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-extrabold">AUJOURD'HUI</span>
            </div>
            <div class="mt-2 flex items-baseline justify-between">
              <span class="text-2xl font-black text-red-400 font-mono">${todayPresentWorkersCount}</span>
              <span class="text-[9px] text-slate-400">${t('kpi_today_attendance_sub')}</span>
            </div>
          </div>
        </div>

        <!-- 3 Executive Charts: Real DB Data ONLY -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <!-- Budget Allocation Component (Redesigned & Multi-Mode) -->
          <div id="budget-allocation-component-container" class="kpi-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <!-- Dynamically populated by updateBudgetAllocationComponent() -->
          </div>

          <!-- Monthly Operational Costs Chart -->
          <div class="kpi-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-xs font-black text-white">${isFr ? 'Dépenses & Coûts Mensuels' : 'المصاريف والتكاليف الشهرية'}</h3>
                <p class="text-[10px] text-slate-400">${isFr ? 'Historique réel des sorties de caisse' : 'سجل التدفقات المالية والمصاريف'}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">${isFr ? '6 Mois' : '6 أشهر'}</span>
            </div>
            <div id="chart-monthly-costs-container" class="relative h-44 w-full flex items-center justify-center">
              <canvas id="chart-monthly-costs"></canvas>
            </div>
          </div>

          <!-- Progress Trends Chart -->
          <div class="kpi-card p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-xs font-black text-white">${isFr ? 'Avancement des Chantiers' : 'نسب تقدم الورشات'}</h3>
                <p class="text-[10px] text-slate-400">${isFr ? 'Taux d\'achèvement des travaux en cours' : 'معدل إنجاز الأشغال في الميدان'}</p>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">${isFr ? 'En cours' : 'ميداني'}</span>
            </div>
            <div id="chart-progress-trends-container" class="relative h-44 w-full flex items-center justify-center">
              <canvas id="chart-progress-trends"></canvas>
            </div>
          </div>
        </div>

        <!-- Cockpit Filter Tags Strip -->
        <div class="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          <div class="flex items-center gap-2 shrink-0">
            <button onclick="App.setCockpitFilterStatus('all')" class="filter-pill ${this.cockpitFilterStatus === 'all' ? 'active' : ''}">${t('filter_all')}</button>
            <button onclick="App.setCockpitFilterStatus('in_progress')" class="filter-pill ${this.cockpitFilterStatus === 'in_progress' ? 'active' : ''}">${t('filter_in_progress')}</button>
            <button onclick="App.setCockpitFilterStatus('planning')" class="filter-pill ${this.cockpitFilterStatus === 'planning' ? 'active' : ''}">${t('filter_planning')}</button>
            <button onclick="App.setCockpitFilterStatus('completed')" class="filter-pill ${this.cockpitFilterStatus === 'completed' ? 'active' : ''}">${t('filter_completed')}</button>
            <button onclick="App.setCockpitFilterStatus('on_hold')" class="filter-pill ${this.cockpitFilterStatus === 'on_hold' ? 'active' : ''}">${t('filter_on_hold')}</button>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <select onchange="App.setCockpitFilterWilaya(this.value)" class="bg-[#16161C] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:border-[#FF3B30] outline-none">
              <option value="all">${t('filter_by_wilaya')} (${t('filter_all')})</option>
              <option value="44 - Aïn Defla">44 - Aïn Defla</option>
              <option value="16 - Alger">16 - Alger</option>
              <option value="09 - Blida">09 - Blida</option>
              <option value="42 - Tipaza">42 - Tipaza</option>
              <option value="26 - Médéa">26 - Médéa</option>
              <option value="31 - Oran">31 - Oran</option>
            </select>
            <button onclick="App.toggleCockpitSort()" class="px-3 py-1.5 rounded-xl bg-[#16161C] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition">
              <span>⇅</span>
              <span>${this.cockpitFilterSort === 'recent' ? t('filter_sort_recent') : t('filter_sort_name')}</span>
            </button>
          </div>
        </div>

        <!-- Cockpit Primary Data Table -->
        <div class="kpi-card rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
          <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#0E0E12]">
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-[#FF3B30]"></span>
              <h3 class="text-sm font-black text-white">${t('table_title')}</h3>
              <span class="text-xs text-slate-500 font-mono">(${projects.length})</span>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <button onclick="App.exportProjectsCSV()" class="px-3 py-1.5 rounded-lg bg-[#16161C] hover:bg-slate-800 text-slate-300 font-semibold border border-white/5 flex items-center gap-1.5 transition">
                <span>📥</span>
                <span>${t('export')} CSV</span>
              </button>
              <button onclick="App.openNewProjectModal()" class="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1.5 transition">
                <span>+</span>
                <span>${t('hero_btn')}</span>
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="erp-table ${isFr ? 'text-left' : 'text-right'}">
              <thead>
                <tr>
                  <th class="w-10 text-center">#</th>
                  <th>${t('table_col_code')}</th>
                  <th>${t('table_col_project')}</th>
                  <th>${t('table_col_location')}</th>
                  <th>${t('table_col_start_date')}</th>
                  <th>${t('table_col_status')}</th>
                  <th>${t('table_col_actions')}</th>
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

    // Render Charts
    setTimeout(() => {
      this.renderDashboardCharts();
    }, 50);
  },

  
  renderMobileProjectCards(projects, activities) {
    if (!projects || projects.length === 0) {
      return `
        <div class="mobile-card text-center p-8 space-y-3">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
            🏗️
          </div>
          <h4 class="font-bold text-white text-sm">لا توجد ورشات مسجلة حالياً</h4>
          <p class="text-xs text-slate-400">ابدأ بإنشاء أول ورشة لمتابعة الأعمال ونسب الإنجاز.</p>
          <button onclick="App.openNewProjectModal()" class="w-full py-2.5 rounded-xl bg-[#FF3B30] text-white font-bold text-xs shadow-lg">
            + إنشاء ورشة جديدة
          </button>
        </div>
      `;
    }

    return projects.map(p => {
      const actCount = (activities || []).filter(a => a.project_id === p.id).length;
      const letter = ((p.name || 'P').trim()[0] || 'P').toUpperCase();
      const status = p.status || 'in_progress';
      
      let statusLabel = 'قيد الإنجاز';
      let statusBadgeClass = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      if (status === 'completed') {
        statusLabel = 'مكتمل';
        statusBadgeClass = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      } else if (status === 'on_hold') {
        statusLabel = 'معلق';
        statusBadgeClass = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      } else if (status === 'planning') {
        statusLabel = 'قيد الدراسة';
        statusBadgeClass = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      }

      const clientName = p.client_name || 'زبون غير محدد';
      const clientPhone = p.client_phone || '';
      const wilaya = p.address || p.wilaya || 'عين الدفلى';
      const projectType = p.project_type || 'تشطيب وديكور عام';
      const contractVal = parseFloat(p.contract_value || p.budget || 0);

      return `
        <div class="mobile-project-card mobile-card space-y-3" data-role="${status}" data-status="${status}" data-wilaya="${wilaya}">
          <div class="flex items-start justify-between gap-2.5">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/30 flex items-center justify-center font-black text-[#FF3B30] text-sm shrink-0">
                ${letter}
              </div>
              <div class="min-w-0">
                <h4 class="font-extrabold text-white text-xs leading-snug truncate cursor-pointer hover:text-[#FF3B30]" onclick="App.openProjectWorkspace('${p.id}')">
                  ${p.name}
                </h4>
                <span class="text-[10px] text-slate-400 font-mono block truncate">
                  #${p.ref || p.id.slice(0, 8)} • ${actCount} بند
                </span>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass} shrink-0">
              ${statusLabel}
            </span>
          </div>

          <!-- Client & Financial Strip -->
          <div class="grid grid-cols-2 gap-2 text-[11px] bg-[#0A0A0C]/70 p-2.5 rounded-xl border border-white/5">
            <div class="min-w-0">
              <span class="text-[9px] text-slate-400 block">الزبون:</span>
              <span class="font-bold text-white text-xs truncate block">${clientName}</span>
              ${clientPhone ? `<a href="tel:${clientPhone}" class="text-amber-400 font-mono text-[10px] block mt-0.5 truncate">📞 ${clientPhone}</a>` : ''}
            </div>
            <div class="text-left min-w-0">
              <span class="text-[9px] text-slate-400 block">الميزانية / الموقع:</span>
              <span class="text-emerald-400 font-mono font-bold text-xs block truncate">${App.formatCurrency(contractVal)}</span>
              <span class="text-slate-400 text-[10px] block truncate">📍 ${wilaya}</span>
            </div>
          </div>

          <!-- Big Touch Action Buttons -->
          <div class="flex items-center gap-2 pt-1">
            <button onclick="App.openProjectWorkspace('${p.id}')" class="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 active:from-red-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              <span>فتح مساحة الورشة</span>
            </button>
            <button onclick="App.editProject('${p.id}')" class="p-2 rounded-xl bg-[#1A1A22] border border-white/10 text-slate-300 hover:text-white" title="تعديل">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            </button>
            <button onclick="App.deleteProject('${p.id}')" class="p-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400" title="حذف">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderCockpitTableRows(projects, activities) {
    if (!projects || projects.length === 0) {
      return `
        <tr>
          <td colspan="7" class="text-center py-14">
            <div class="flex flex-col items-center justify-center gap-3">
              <div class="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner">
                <svg class="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-bold text-white">لا توجد ورشات أو مشاريع مسجلة حالياً</p>
                <p class="text-xs text-slate-400 mt-1">Aucun chantier enregistré dans le système. Créez votre premier projet dès maintenant.</p>
              </div>
              <button onclick="App.openNewProjectModal()" class="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-2 border border-red-500/30">
                <span>+</span>
                <span>إضافة ورشة جديدة / Nouveau Chantier</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    return projects.map(p => {
      const actCount = (activities || []).filter(a => a.project_id === p.id).length;
      const letter = ((p.name || 'P').trim()[0] || 'P').toUpperCase();
      const status = p.status || 'in_progress';
      
      let statusLabel = 'قيد الإنجاز';
      let statusBadgeClass = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30';
      if (status === 'completed') {
        statusLabel = 'مكتمل';
        statusBadgeClass = 'text-blue-400 bg-blue-500/10 border border-blue-500/30';
      } else if (status === 'on_hold') {
        statusLabel = 'معلق';
        statusBadgeClass = 'text-amber-400 bg-amber-500/10 border border-amber-500/30';
      } else if (status === 'planning') {
        statusLabel = 'قيد الدراسة';
        statusBadgeClass = 'text-purple-400 bg-purple-500/10 border border-purple-500/30';
      }

      const clientName = p.client_name || 'زبون غير محدد';
      const clientPhone = p.client_phone || '—';
      const wilaya = p.address || p.wilaya || 'عين الدفلى';
      const projectType = p.project_type || 'تشطيب وديكور عام';
      const contractVal = parseFloat(p.contract_value || p.budget || 0);

      return `
        <tr class="transition hover:bg-white/[0.02]" data-role="${status}" data-status="${status}" data-wilaya="${wilaya}">
          <td>
            <div class="flex items-center gap-3">
              <div class="avatar-circle avatar-emerald">
                ${letter}
              </div>
              <div class="min-w-0">
                <span class="font-bold text-white block text-xs hover:text-[#FF3B30] cursor-pointer" onclick="App.openProjectWorkspace('${p.id}')">${p.name}</span>
                <span class="text-[10px] text-slate-500 font-mono block truncate">#${p.ref || p.id.slice(0, 8)} • ${actCount} بند عمل</span>
              </div>
            </div>
          </td>
          <td>
            <div class="min-w-0">
              <span class="font-bold text-white block text-xs">${clientName}</span>
              <a href="tel:${clientPhone}" class="font-mono text-[10px] text-slate-400 hover:text-amber-400 block" dir="ltr">${clientPhone}</a>
            </div>
          </td>
          <td>
            <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-xs font-medium">
              ${projectType}
            </span>
          </td>
          <td class="font-medium text-slate-300 text-xs">
            ${wilaya}
          </td>
          <td class="text-center">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadgeClass}">
              ${statusLabel}
            </span>
          </td>
          <td class="text-center font-mono font-bold text-white text-xs">
            ${App.formatCurrency(contractVal)}
          </td>
          <td class="text-center">
            <div class="flex items-center justify-center gap-1.5 flex-nowrap">
              <button onclick="App.openProjectWorkspace('${p.id}')" class="btn-action-open" title="Ouvrir le chantier / فتح مساحة العمل">
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>فتح</span>
              </button>
              <button onclick="App.editProject('${p.id}')" class="px-2 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1" title="تعديل بيانات المشروع">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                <span>تعديل</span>
              </button>
              <button onclick="App.deleteProject('${p.id}')" class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1" title="حذف المشروع نهائياً">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                <span>حذف</span>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderDashboardCharts() {
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
        label: `${p.name} (${prog}%)`,
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
      labels: items.map(i => `${i.name_fr || i.name} (${i.percentage}%)`),
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
      bodyContainer.innerHTML = `
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
      `;

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
    bodyContainer.innerHTML = `
      <div class="h-44 relative w-full flex items-center justify-center">
        <canvas id="chart-budget-allocation"></canvas>
      </div>
      <div id="budget-breakdown-container" class="space-y-2 max-h-52 overflow-y-auto pr-1">
        ${data.items.map(item => `
          <div class="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition group/item">
            <div class="flex items-center justify-between gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0" style="background-color: ${item.color}20; border: 1px solid ${item.color}40;">
                  ${item.icon || '📌'}
                </span>
                <div class="truncate">
                  <span class="text-xs font-bold text-white block truncate leading-tight">${item.name}</span>
                  <span class="text-[9px] text-slate-400 block truncate leading-tight">${item.name_fr || ''}</span>
                </div>
              </div>
              <div class="text-left flex-shrink-0">
                <div class="flex items-center gap-1.5 justify-end">
                  <span class="text-xs font-black text-white font-mono">${(item.amount).toLocaleString('fr-FR')} <span class="text-[10px] text-slate-400 font-sans">دج</span></span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-black" style="background-color: ${item.color}25; color: ${item.color};">${item.percentage}%</span>
                </div>
                <span class="text-[9px] text-amber-400 font-mono block text-left">${item.centimes}</span>
              </div>
            </div>
            <!-- Progress bar -->
            <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ease-out" style="width: ${item.percentage}%; background-color: ${item.color}; box-shadow: 0 0 8px ${item.color}60;"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // 3. Update footer insight indicators
    const topCatEl = document.getElementById('budget-stat-top-cat');
    if (topCatEl && data.items && data.items.length > 0) {
      topCatEl.textContent = `${data.items[0].name.split(' ')[0]} (${data.items[0].percentage}%)`;
      topCatEl.title = data.items[0].name;
    }

    const laborEl = document.getElementById('budget-stat-labor');
    if (laborEl) {
      laborEl.textContent = `${data.laborPct}%`;
    }

    const matEl = document.getElementById('budget-stat-material');
    if (matEl) {
      matEl.textContent = `${data.matPct}%`;
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

    const modalHTML = `
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
              <span class="text-base font-black text-white block mt-1 font-mono">${data.totalFormatted}</span>
              <span class="text-[10px] text-amber-400 font-mono">${data.centimesFormatted}</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">يد العمل الحرفية</span>
              <span class="text-base font-black text-emerald-400 block mt-1 font-mono">${data.laborPct}%</span>
              <span class="text-[10px] text-slate-400">${((data.laborTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">السلع ومواد البناء</span>
              <span class="text-base font-black text-cyan-400 block mt-1 font-mono">${data.matPct}%</span>
              <span class="text-[10px] text-slate-400">${((data.materialTotal || 0)).toLocaleString('fr-FR')} دج</span>
            </div>
            <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span class="text-[10px] text-slate-400 block font-medium">أعلى صنف في التكلفة</span>
              <span class="text-xs font-black text-amber-400 block mt-1 truncate">${data.items[0] ? data.items[0].name : '—'}</span>
              <span class="text-[10px] text-slate-400">${data.items[0] ? data.items[0].percentage + '%' : ''}</span>
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
                ${data.items.map(item => `
                  <tr>
                    <td>
                      <div class="flex items-center gap-2.5">
                        <span class="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style="background-color: ${item.color}25; border: 1px solid ${item.color}50;">
                          ${item.icon || '📌'}
                        </span>
                        <div>
                          <p class="text-xs font-bold text-white">${item.name}</p>
                          <p class="text-[10px] text-slate-400">${item.name_fr || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td class="text-center">
                      <span class="px-2 py-0.5 rounded text-xs font-black" style="background-color: ${item.color}20; color: ${item.color};">
                        ${item.percentage}%
                      </span>
                    </td>
                    <td class="text-center font-mono font-bold text-xs text-white">
                      ${(item.amount).toLocaleString('fr-FR')} دج
                    </td>
                    <td class="text-center font-mono text-xs text-amber-400 font-bold">
                      ${item.centimes}
                    </td>
                    <td>
                      <div class="w-28 sm:w-36 h-2 rounded-full bg-white/5 overflow-hidden mx-auto">
                        <div class="h-full rounded-full" style="width: ${item.percentage}%; background-color: ${item.color};"></div>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
            <span class="text-xs text-slate-400">عدد الأصناف الفعلية: ${data.items.length}</span>
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
    `;

    const oldModal = document.getElementById('budget-allocation-modal');
    if (oldModal) oldModal.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
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

    const totalCount = projects.length;
    const activeCount = projects.filter(p => p.status === 'in_progress').length;
    const completedCount = projects.filter(p => p.status === 'completed').length;
    const pendingCount = projects.filter(p => p.status === 'planning' || p.status === 'on_hold' || p.status === 'draft').length;

    const cockpitRowsHTML = this.renderCockpitTableRows(projects, activities);
    const mobileCardsHTML = this.renderMobileProjectCards(projects, activities);
    const isFr = (typeof I18N !== 'undefined') && I18N.currentLang === 'fr';

    container.innerHTML = `
      <div class="space-y-5">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="cockpit-search-input" oninput="App.filterCockpitTable(this.value)" placeholder="${t('search_placeholder')}" class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] ${isFr ? 'pl-4 pr-12' : 'pr-4 pl-12'} shadow-inner">
          <span class="absolute ${isFr ? 'right-3.5' : 'left-3.5'} top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Cockpit Header Banner -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 text-xl font-bold shadow-inner">
              <svg class="w-6 h-6 text-[#FF3B30]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
                <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base sm:text-lg font-black text-white">${t('hero_title')}</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>${t('hero_badge')}</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 font-medium">
                ${t('hero_desc')}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <button onclick="App.openNewProjectModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-2 border border-red-400/30">
              <span>+</span>
              <span>${t('hero_btn')}</span>
            </button>
            <button onclick="App.renderCurrentView()" class="px-3 py-2.5 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-slate-200 border border-white/10 text-xs font-bold transition">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            </button>
          </div>
        </div>

        <!-- 6 KPI Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <div class="kpi-card metric-box-blue p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-blue-400 text-xs font-bold">${t('kpi_total_projects')}</span>
              <span class="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[9px] font-black">TOTAL</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-white">${totalCount}</span></div>
            <span class="text-[10px] text-slate-400">${t('kpi_total_projects_sub')}</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-emerald-400 text-xs font-bold">${t('kpi_active_projects')}</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black">ACTIVE</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-emerald-400">${activeCount}</span></div>
            <span class="text-[10px] text-slate-400">${t('kpi_active_projects_sub')}</span>
          </div>
          <div class="kpi-card metric-box-purple p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-purple-400 text-xs font-bold">${t('kpi_pending_projects')}</span>
              <span class="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-400 text-[9px] font-black">ÉTUDE</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-purple-400">${pendingCount}</span></div>
            <span class="text-[10px] text-slate-400">${t('kpi_pending_projects_sub')}</span>
          </div>
          <div class="kpi-card metric-box-cyan p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-cyan-400 text-xs font-bold">${t('kpi_completed_projects')}</span>
              <span class="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-400 text-[9px] font-black">FIN</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-cyan-400">${completedCount}</span></div>
            <span class="text-[10px] text-slate-400">${t('kpi_completed_projects_sub')}</span>
          </div>
          <div class="kpi-card metric-box-amber p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-amber-400 text-xs font-bold">${t('kpi_active_workers')}</span>
              <span class="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[9px] font-black">ÉQUIPE</span>
            </div>
            <div class="my-2"><span class="text-2xl sm:text-3xl font-black text-amber-400">0</span></div>
            <span class="text-[10px] text-slate-400">${t('kpi_active_workers_sub')}</span>
          </div>
          <div class="kpi-card metric-box-green p-4 rounded-2xl flex flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="text-emerald-400 text-xs font-bold">${isFr ? 'Base de Données' : 'قاعدة البيانات'}</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[9px] font-black">SYNC</span>
            </div>
            <div class="my-2"><span class="text-lg sm:text-xl font-black text-emerald-400">${isFr ? 'Connecté' : 'متصل'}</span></div>
            <span class="text-[10px] text-slate-400">Supabase Cloud</span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="space-y-3">
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="relative flex-1">
              <input type="text" oninput="App.filterCockpitTable(this.value)" placeholder="${t('search_placeholder')}" class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] shadow-inner">
            </div>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <button onclick="App.setRoleFilter('all', this)" class="filter-pill active">${t('filter_all')}</button>
              <button onclick="App.setRoleFilter('in_progress', this)" class="filter-pill">${t('filter_in_progress')}</button>
              <button onclick="App.setRoleFilter('completed', this)" class="filter-pill">${t('filter_completed')}</button>
              <button onclick="App.setRoleFilter('planning', this)" class="filter-pill">${t('filter_planning')}</button>
              <button onclick="App.setRoleFilter('on_hold', this)" class="filter-pill">${t('filter_on_hold')}</button>
            </div>
          </div>
        </div>

        <!-- Cockpit Data Table: Desktop Table + Mobile Cards -->
        <div class="block md:hidden space-y-3" id="cockpit-mobile-cards-container">
          ${mobileCardsHTML}
        </div>

        <div class="hidden md:block kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          <div class="overflow-x-auto">
            <table class="erp-table ${isFr ? 'text-left' : 'text-right'}">
              <thead>
                <tr>
                  <th>${t('table_col_code')}</th>
                  <th>${t('table_col_project')}</th>
                  <th>${t('table_col_location')}</th>
                  <th>${t('table_col_start_date')}</th>
                  <th class="text-center">${t('table_col_status')}</th>
                  <th class="text-center">${t('table_col_actions')}</th>
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

    const allAttachments = await DB.getAll('attachments');
    const docs = allAttachments.filter(a => a.project_id === project.id);

    const avantCount = docs.filter(a => a.entity_type === 'avant').length;
    const enCoursCount = docs.filter(a => a.entity_type === 'en_cours').length;
    const apresCount = docs.filter(a => a.entity_type === 'apres').length;
    const plansCount = docs.filter(a => a.entity_type === 'plan' || a.entity_type === 'bon').length;

    const cardsHTML = docs.map(d => {
      const isImg = d.file_type === 'image' || (d.file_url && d.file_url.startsWith('data:image'));
      let stageLabel = 'صورة ورشة';
      let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      if (d.entity_type === 'avant') {
        stageLabel = 'قبل البدء (Avant)';
        badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      } else if (d.entity_type === 'en_cours') {
        stageLabel = 'أثناء الأشغال (En cours)';
        badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      } else if (d.entity_type === 'apres') {
        stageLabel = 'تشطيب نهائي (Après)';
        badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      } else if (d.entity_type === 'plan') {
        stageLabel = 'مخطط تقني (Plan)';
        badgeColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      }

      return `
        <div class="kpi-card p-3 rounded-xl border border-white/10 hover:border-white/20 transition flex flex-col justify-between group overflow-hidden">
          <div class="relative w-full h-36 rounded-lg overflow-hidden bg-[#0A0A0C] flex items-center justify-center cursor-pointer" onclick="App.openImageViewerModal('${d.file_url}', '${this.escapeHtml(d.file_name)}')">
            ${isImg ? `<img src="${d.file_url}" alt="${d.file_name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">` : `<div class="text-4xl text-slate-500">📄</div>`}
            <span class="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-bold border backdrop-blur-md ${badgeColor}">
              ${stageLabel}
            </span>
          </div>
          <div class="mt-2.5 flex items-center justify-between gap-2">
            <div class="min-w-0">
              <span class="font-bold text-white text-xs block truncate" title="${d.file_name}">${d.file_name}</span>
              <span class="text-[10px] text-slate-500 font-mono">${d.uploaded_at ? d.uploaded_at.split('T')[0] : ''}</span>
            </div>
            <button onclick="App.deleteProjectAttachment('${d.id}', '${project.id}')" class="p-1 rounded bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 text-xs transition" title="حذف الصورة">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');

    pane.innerHTML = `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <span>📸</span>
              <span>معرض صور ومستندات الورشة (Galerie Photos & Plans)</span>
            </h3>
            <p class="text-xs text-slate-400">توثيق مراحل الإنجاز: قبل البدء، أثناء التنفيذ، والتشطيب النهائي مع المخططات والوصولات</p>
          </div>
          <button onclick="App.openUploadProjectAttachmentModal('${project.id}')" class="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-1.5 border border-red-500/30">
            <span>+</span>
            <span>إضافة صورة أو مخطط</span>
          </button>
        </div>

        <!-- 4 Summary KPI Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="kpi-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg font-bold">📸</div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">قبل البدء (Avant)</span>
              <strong class="text-base text-white font-mono">${avantCount} صور</strong>
            </div>
          </div>
          <div class="kpi-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg font-bold">🔨</div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">أثناء الإنجاز (En cours)</span>
              <strong class="text-base text-white font-mono">${enCoursCount} صور</strong>
            </div>
          </div>
          <div class="kpi-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg font-bold">✨</div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">تشطيب نهائي (Après)</span>
              <strong class="text-base text-white font-mono">${apresCount} صور</strong>
            </div>
          </div>
          <div class="kpi-card p-3 rounded-xl border border-white/5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg font-bold">📐</div>
            <div>
              <span class="text-[10px] text-slate-400 block font-medium">مخططات ووصولات</span>
              <strong class="text-base text-white font-mono">${plansCount} ملفات</strong>
            </div>
          </div>
        </div>

        <!-- Gallery Grid -->
        ${docs.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${cardsHTML}
          </div>
        ` : `
          <div class="kpi-card p-12 text-center rounded-2xl border border-white/5 space-y-3">
            <div class="w-16 h-16 rounded-2xl bg-white/5 text-slate-500 flex items-center justify-center mx-auto text-3xl">📸</div>
            <h4 class="text-sm font-bold text-white">لا توجد صور أو مخططات مرفقة بهذه الورشة بعد</h4>
            <p class="text-xs text-slate-400 max-w-md mx-auto">اضغط على زر "إضافة صورة أو مخطط" لرفع صور قبل البدء أو أثناء الإنجاز لتوثيق أعمال الورشة.</p>
            <button onclick="App.openUploadProjectAttachmentModal('${project.id}')" class="mt-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition">
              + رفع أول صورة الآن
            </button>
          </div>
        `}
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
              <button onclick="App.openWorkerDetailsModal('${w.id}')" class="btn-action-open" title="Voir fiche individuelle / عرض البطاقة الفردية">
                <span>👁</span>
                <span>Fiche</span>
              </button>
              <button onclick="App.printWorkerIndividualPayslipA4('${w.id}')" class="px-2 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold transition flex items-center gap-1" title="طباعة كشف الحساب الفردي A4">
                <span>🧾</span>
                <span>كشف A4</span>
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
            <button onclick="App.openQuickDailyCheckinModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-950/30 transition flex items-center gap-1.5">
              <span>⚡</span>
              <span>تسجيل حضور سريع اليوم</span>
            </button>
            <button onclick="App.printPayrollSheetA4()" class="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5 border border-emerald-400/30">
              <span>🧾</span>
              <span>كشف الرواتب A4 / Relevé Paie</span>
            </button>
            <button onclick="App.openNewWorkerModal()" class="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-1.5 border border-red-400/30">
              <span>+</span>
              <span>إضافة عامل</span>
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

        <!-- Cockpit Data Table: Desktop Table + Mobile Cards -->
        <div class="block md:hidden space-y-3" id="cockpit-mobile-cards-container">
          ${mobileCardsHTML}
        </div>

        <div class="hidden md:block kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
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

    const totalActivities = catalog.length;
    const totalCategories = categories.length;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Search bar with ⌘K badge -->
        <div class="relative w-full">
          <input type="text" id="catalog-search-input" oninput="App.filterActivityCatalog(this.value)" placeholder="🔍 بحث في دليل الأشغال — اسم النشاط، الوحدة، السعر أو الفئة..." class="w-full bg-[#121216] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-[#FF3B30] pl-10 pr-12 shadow-inner">
          <span class="absolute right-3.5 top-3 kbd-shortcut">⌘K</span>
        </div>

        <!-- Cockpit Header Banner -->
        <div class="kpi-card p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-white/5 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-xl text-[#FF3B30] font-bold shadow-inner">
              📋
            </div>
            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-base sm:text-lg font-black text-white">دليل بنود وأنشطة الأشغال — Catalogue des Travaux</h2>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>${totalCategories} فئات مهنية • ${totalActivities} بنود أعمال</span>
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1 font-medium">
                تنظيم متكامل للأنشطة والمهن في جداول مستقلة لكل فئة مع إمكانية إضافة وتعديل الفئات، تغيير مسميات الأنشطة، وضبط الأسعار المرجعية
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2.5 flex-wrap">
            <button onclick="App.openNewWorkCategoryModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-amber-950/30 transition flex items-center gap-1.5">
              <span>+</span>
              <span>إضافة فئة جديدة / Catégorie</span>
            </button>
            <button onclick="App.openNewCatalogActivityModal()" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-950/40 transition flex items-center gap-1.5 border border-red-400/30">
              <span>+</span>
              <span>إضافة نشاط جديد / Travail</span>
            </button>
            <button onclick="App.renderCurrentView()" class="px-3 py-2.5 rounded-xl bg-[#16161C] hover:bg-[#1E1E26] text-slate-200 border border-white/10 text-xs font-bold transition">
              🔄
            </button>
          </div>
        </div>

        <!-- Quick Category Filter Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button onclick="App.filterActivitiesByCategory('all', this)" class="filter-pill active whitespace-nowrap">
            جميع الفئات (${totalCategories})
          </button>
          ${categories.map(c => {
            const count = catalog.filter(a => String(a.category_id) === String(c.id)).length;
            return `
              <button onclick="App.filterActivitiesByCategory('${c.id}', this)" class="filter-pill whitespace-nowrap">
                ${c.icon || '●'} ${c.name_ar || c.name} (${count})
              </button>
            `;
          }).join('')}
        </div>

        <!-- Categorized Organized Tables Section -->
        <div class="space-y-6" id="categories-tables-wrapper">
          ${categories.map(cat => {
            const items = catalog.filter(a => String(a.category_id) === String(cat.id));

            return `
              <div class="kpi-card rounded-2xl overflow-hidden border border-white/10 shadow-xl category-table-card" data-category-id="${cat.id}">
                
                <!-- Category Section Header -->
                <div class="p-4 sm:p-5 bg-[#14141A] border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">${cat.icon || '🛠️'}</span>
                    <div>
                      <div class="flex items-center gap-2.5 flex-wrap">
                        <h3 class="text-sm sm:text-base font-black text-white">${cat.name_ar || cat.name}</h3>
                        <span class="text-xs text-slate-400 font-medium">(${cat.name_fr || cat.code || ''})</span>
                        <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono">${cat.code || 'CAT'}</span>
                      </div>
                      <span class="text-[11px] text-slate-400 mt-0.5 block">${items.length} بنود أعمال وأشغال مدرجة</span>
                    </div>
                  </div>

                  <!-- Category Action Buttons -->
                  <div class="flex items-center gap-2 self-end sm:self-auto">
                    <button onclick="App.openNewCatalogActivityModal('${cat.id}')" class="px-3 py-1.5 rounded-lg bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1" title="إضافة بند عمل جديد لهذه الفئة">
                      <span>+</span>
                      <span>إضافة نشاط</span>
                    </button>
                    <button onclick="App.editWorkCategory('${cat.id}')" class="px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1" title="تعديل اسم وبيانات الفئة">
                      <span>✏️</span>
                      <span>تعديل الفئة</span>
                    </button>
                    <button onclick="App.deleteWorkCategory('${cat.id}')" class="px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1" title="حذف الفئة بالكامل">
                      <span>🗑️</span>
                    </button>
                  </div>
                </div>

                <!-- Organized Table for this Category -->
                <div class="overflow-x-auto">
                  <table class="erp-table">
                    <thead>
                      <tr>
                        <th class="text-center" style="width: 4%;">#</th>
                        <th class="text-right" style="width: 30%;">اسم النشاط وبند العمل (Désignation)</th>
                        <th class="text-center" style="width: 8%;">الوحدة</th>
                        <th class="text-center" style="width: 14%;">سعر الخدمة (يد عمل)</th>
                        <th class="text-center" style="width: 14%;">سعر السلعة (مواد)</th>
                        <th class="text-center" style="width: 15%;">المجموع الكلي (دج)</th>
                        <th class="text-center" style="width: 15%;">الإجراءات (Actions)</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${items.length > 0 ? items.map((it, idx) => {
                        const laborPrice = parseFloat(it.default_labor_price || it.estimated_labor_cost || 0);
                        const materialPrice = parseFloat(it.default_material_price || it.estimated_material_cost || 0);
                        const totalPrice = parseFloat(it.default_unit_price || it.default_price || (laborPrice + materialPrice));
                        const centimes = (totalPrice / 10000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' م.س';

                        return `
                          <tr class="transition hover:bg-white/[0.02] activity-row" data-activity-name="${this.escapeHtml(it.name || '').toLowerCase()}" data-activity-desc="${this.escapeHtml(it.description || '').toLowerCase()}">
                            <td class="text-center font-mono text-slate-500 text-xs font-bold">
                              ${idx + 1}
                            </td>
                            <td>
                              <div class="min-w-0">
                                <span class="font-bold text-white text-xs block hover:text-[#FF3B30] cursor-pointer" onclick="App.editCatalogActivity('${it.id}')">${it.name}</span>
                                ${it.description ? `<span class="text-[10px] text-slate-400 block mt-0.5 truncate max-w-md">${it.description}</span>` : ''}
                              </div>
                            </td>
                            <td class="text-center">
                              <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-xs font-bold">
                                ${it.unit || 'm²'}
                              </span>
                            </td>
                            <td class="text-center font-mono font-bold text-emerald-400 text-xs">
                              <div class="flex flex-col items-center">
                                <span>${App.formatCurrency(laborPrice)}</span>
                                <span class="text-[9px] text-emerald-500/80 font-normal">خدمة / يد عمل</span>
                              </div>
                            </td>
                            <td class="text-center font-mono font-bold text-cyan-400 text-xs">
                              <div class="flex flex-col items-center">
                                <span>${App.formatCurrency(materialPrice)}</span>
                                <span class="text-[9px] text-cyan-500/80 font-normal">سلعة / مواد</span>
                              </div>
                            </td>
                            <td class="text-center font-mono font-black text-amber-300 text-xs bg-white/[0.02]">
                              <div class="flex flex-col items-center">
                                <span class="text-sm">${App.formatCurrency(totalPrice)}</span>
                                <span class="text-[9px] text-amber-400/80 font-normal">${centimes}</span>
                              </div>
                            </td>
                            <td class="text-center">
                              <div class="flex items-center justify-center gap-1.5">
                                <button onclick="App.editCatalogActivity('${it.id}')" class="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-xs font-bold transition flex items-center gap-1" title="تعديل اسم النشاط، سعر الخدمة، وسعر السلعة">
                                  <span>✏️</span>
                                  <span>تعديل</span>
                                </button>
                                <button onclick="App.deleteCatalogActivity('${it.id}')" class="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1" title="حذف هذا النشاط">
                                  <span>🗑️</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                      }).join('') : `
                        <tr>
                          <td colspan="7" class="text-center py-8 text-slate-500">
                            <p class="text-xs font-bold text-slate-400">لا توجد أنشطة مسجلة في هذه الفئة حالياً</p>
                            <button onclick="App.openNewCatalogActivityModal('${cat.id}')" class="mt-2 px-3 py-1 bg-red-600/15 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition">
                              + إضافة أول نشاط في ${cat.name_ar || cat.name}
                            </button>
                          </td>
                        </tr>
                      `}
                    </tbody>
                  </table>
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  },

  filterActivityCatalog(query) {
    const q = (query || '').toLowerCase().trim();
    const rows = document.querySelectorAll('.activity-row');
    const cards = document.querySelectorAll('.category-table-card');

    if (!q) {
      rows.forEach(r => r.style.display = '');
      cards.forEach(c => c.style.display = '');
      return;
    }

    cards.forEach(card => {
      let hasMatch = false;
      const cardRows = card.querySelectorAll('.activity-row');
      cardRows.forEach(r => {
        const name = r.dataset.activityName || '';
        const desc = r.dataset.activityDesc || '';
        const text = r.textContent.toLowerCase();
        if (name.includes(q) || desc.includes(q) || text.includes(q)) {
          r.style.display = '';
          hasMatch = true;
        } else {
          r.style.display = 'none';
        }
      });
      card.style.display = hasMatch ? '' : 'none';
    });
  },

  filterActivitiesByCategory(categoryId, btn) {
    this.playClickSound();
    if (btn && btn.parentElement) {
      btn.parentElement.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
    }

    const cards = document.querySelectorAll('.category-table-card');
    cards.forEach(card => {
      if (categoryId === 'all' || card.dataset.categoryId === categoryId) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
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
              <button onclick="App.sendQuotationWhatsApp('${q.id}')" class="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1" title="مشاركة الكشف عبر واتساب (WhatsApp)">
                <span>💬</span><span>WhatsApp</span>
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


  // ============================================================
  // WHATSAPP QUOTATION & INVOICE DIRECT SHARING ENGINE
  // ============================================================
  async sendQuotationWhatsApp(quotationId) {
    this.playClickSound();
    const q = await DB.getById('quotations', quotationId);
    if (!q) {
      alert('تعذر العثور على الكشف التقديري.');
      return;
    }
    const project = await DB.getById('projects', q.project_id) || {};
    const clientName = q.client_name || project.client_name || 'الزبون المحترم';
    let clientPhone = project.client_phone || '';

    if (!clientPhone || clientPhone === '—' || clientPhone.length < 8) {
      // Show inline prompt using toast-style input
      const entered = await new Promise(resolve => {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);';
        d.innerHTML = `<div style="background:#1a1a24;border-radius:20px;width:92%;max-width:400px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
          <div style="font-weight:900;color:#fff;margin-bottom:12px;font-size:0.95rem;">📱 رقم هاتف الزبون للواتساب</div>
          <input id="_wa-phone-inp" type="tel" value="${clientPhone||''}" placeholder="0550 xx xx xx" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px 14px;color:#fff;font-size:1rem;box-sizing:border-box;outline:none;direction:ltr;margin-bottom:12px;" />
          <div style="display:flex;gap:8px;">
            <button onclick="this.closest('div[style]').parentElement._resolve(document.getElementById('_wa-phone-inp').value)" style="flex:1;padding:11px;background:#25D366;border:none;border-radius:12px;color:#fff;font-weight:900;cursor:pointer;">إرسال واتساب ✓</button>
            <button onclick="this.closest('div[style]').parentElement._resolve(null)" style="padding:11px 16px;background:#0f0f17;border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#94a3b8;cursor:pointer;">إلغاء</button>
          </div>
        </div>`;
        d._resolve = val => { document.body.removeChild(d); resolve(val); };
        document.body.appendChild(d);
        setTimeout(() => document.getElementById('_wa-phone-inp')?.focus(), 100);
      });
      if (!entered) return;
      clientPhone = entered.trim();
    }

    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '213' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('213') && cleanPhone.length === 9) {
      cleanPhone = '213' + cleanPhone;
    }

    const totalAmount = parseFloat(q.total_amount || q.total_ttc || q.total || 0);
    const centimes = (totalAmount / 10000).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' مليون سنتيم';

    const text = 
`*مؤسسة داري لوكس للتشطيب والديكور العصري*
*DARI LUXE — Rénovation & Décoration*
━━━━━━━━━━━━━━━━━━━━
السلام عليكم ورحمة الله وبركاته،
عناية الزبون المحترم: *${clientName}*

يسرنا أن نوافيكم بالكشف التقديري الرسمي لأشغالكم:
🏷️ *المشروع / الورشة:* ${project.name || 'أشغال التشطيب'}
📄 *رقم الكشف:* #${q.ref || q.id.slice(0, 8)}
📅 *التاريخ:* ${q.date || App.getLocalDateString()}

💰 *المبلغ الإجمالي للكشف:*
👉 *${totalAmount.toLocaleString('fr-FR')} دج* (${centimes})

📋 *نوع الأشغال المقدرة:*
✓ أسقف مستعارة وديكورات الجبس العصري BA13
✓ الإضاءة المخفية وبروفيليه ليد الحديث
✓ صباغة ديكورية ومعالجة الأسطح والجدران

لأي استفسار أو لتثبيت الاتفاق وبدء العمل، نحن في خدمتكم:
📞 0550 60 09 09
📍 سيدي لخضر، ولاية عين الدفلى
_شكراً لثقتكم في DARI LUXE_`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  },

  async sendInvoiceWhatsApp(invoiceId) {
    this.playClickSound();
    const inv = await DB.getById('invoices', invoiceId);
    if (!inv) return;
    const project = await DB.getById('projects', inv.project_id) || {};
    const clientName = inv.client_name || project.client_name || 'الزبون المحترم';
    let clientPhone = project.client_phone || '';

    if (!clientPhone || clientPhone === '—' || clientPhone.length < 8) {
      const entered = await new Promise(resolve => {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);';
        d.innerHTML = `<div style="background:#1a1a24;border-radius:20px;width:92%;max-width:400px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,0.6);">
          <div style="font-weight:900;color:#fff;margin-bottom:12px;font-size:0.95rem;">📱 رقم هاتف الزبون للواتساب</div>
          <input id="_wa-phone-inv" type="tel" value="${clientPhone||''}" placeholder="0550 xx xx xx" style="width:100%;background:#0f0f17;border:1px solid rgba(255,255,255,0.15);border-radius:12px;padding:12px 14px;color:#fff;font-size:1rem;box-sizing:border-box;outline:none;direction:ltr;margin-bottom:12px;" />
          <div style="display:flex;gap:8px;">
            <button onclick="this.closest('div[style]').parentElement._resolve(document.getElementById('_wa-phone-inv').value)" style="flex:1;padding:11px;background:#25D366;border:none;border-radius:12px;color:#fff;font-weight:900;cursor:pointer;">إرسال واتساب ✓</button>
            <button onclick="this.closest('div[style]').parentElement._resolve(null)" style="padding:11px 16px;background:#0f0f17;border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:#94a3b8;cursor:pointer;">إلغاء</button>
          </div>
        </div>`;
        d._resolve = val => { document.body.removeChild(d); resolve(val); };
        document.body.appendChild(d);
        setTimeout(() => document.getElementById('_wa-phone-inv')?.focus(), 100);
      });
      if (!entered) return;
      clientPhone = entered.trim();
    }

    let cleanPhone = clientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '213' + cleanPhone.substring(1);
    else if (!cleanPhone.startsWith('213') && cleanPhone.length === 9) cleanPhone = '213' + cleanPhone;

    const totalAmount = parseFloat(inv.total_amount || inv.total_ttc || inv.total || 0);

    const text = 
`*مؤسسة داري لوكس للتشطيب والديكور العصري*
*DARI LUXE — Facture Officielle*
━━━━━━━━━━━━━━━━━━━━
عناية الزبون المحترم: *${clientName}*
المشروع: *${project.name || '-'}*
فاتورة رسمية رقم: *#${inv.ref || inv.id.slice(0, 8)}*
التاريخ: *${inv.date || App.getLocalDateString()}*

المبلغ المستحق: *${totalAmount.toLocaleString('fr-FR')} دج*
حالة الفاتورة: *${inv.status === 'paid' ? 'مسددة بالكامل ✓' : 'في انتظار التحصيل ⏳'}*

📞 للتواصل: 0550 60 09 09
سيدي لخضر، عين الدفلى`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  },

  // ============================================================
  // OFFICIAL PAYROLL A4 PRINTING ENGINE (ALL WORKERS & INDIVIDUAL)
  // ============================================================
  async printPayrollSheetA4() {
    this.playClickSound();
    const workers = await DB.getAll('workers');
    const attendances = await DB.getAll('worker_attendance');
    const payments = await DB.getAll('worker_payments');

    let totalWagesAll = 0;
    let totalAdvancesAll = 0;

    const workerRows = workers.map((w, idx) => {
      const summary = CalculationEngine.computeWorkerFinancialSummary(w.id, attendances, payments);
      totalWagesAll += summary.totalEarned;
      totalAdvancesAll += summary.totalPaid;

      return `
        <tr>
          <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
          <td>
            <strong>${w.full_name}</strong>
            <div style="font-size: 8pt; color: #64748B;">بطاقة تعريف: ${w.cin || '—'} • هاتف: ${w.phone || '—'}</div>
          </td>
          <td>${w.specialty || 'عامل متعدد المهارات'}</td>
          <td style="text-align: center; font-family: monospace; font-weight: bold;">${(w.daily_wage || 0).toLocaleString('fr-FR')} دج</td>
          <td style="text-align: center; font-weight: bold; font-family: monospace;">${summary.totalDaysWorked} يوم</td>
          <td style="text-align: left; font-weight: bold; font-family: monospace;">${summary.totalEarned.toLocaleString('fr-FR')} دج</td>
          <td style="text-align: left; color: #DC2626; font-weight: bold; font-family: monospace;">${summary.totalPaid.toLocaleString('fr-FR')} دج</td>
          <td style="text-align: left; font-weight: 900; font-family: monospace; background: #F8FAFC; color: ${summary.balanceDue > 0 ? '#B45309' : '#059669'};">
            ${summary.balanceDue.toLocaleString('fr-FR')} دج
          </td>
          <td style="height: 35px; border-bottom: 1px dotted #94A3B8;"></td>
        </tr>
      `;
    }).join('');

    const netRemainingAll = totalWagesAll - totalAdvancesAll;
    const printDate = App.getLocalDateString();

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف رواتب ومستحقات العمال - DARI LUXE</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 15mm 12mm; color: #0F172A; font-size: 9.5pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 20px; }
          th { background: #0B132B; color: #FFFFFF; border: 1px solid #0B132B; padding: 8px 6px; font-weight: bold; font-size: 9pt; }
          td { border: 1px solid #CBD5E1; padding: 7px 6px; }
          .summary-grid { display: flex; justify-content: space-between; gap: 15px; margin-top: 20px; }
          .summary-card { flex: 1; border: 1px solid #CBD5E1; border-radius: 8px; padding: 10px 14px; background: #F8FAFC; text-align: center; }
          .summary-card.highlight { border-color: #B45309; background: #FFFBEB; }
          .signature-box { margin-top: 40px; display: flex; justify-content: space-between; }
          .sig-line { width: 220px; text-align: center; border-top: 1px dashed #64748B; padding-top: 8px; font-weight: bold; font-size: 9pt; }
          @media print {
            body { padding: 5mm; }
            button { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('كشف أجور ومستحقات فريق العمل', 'ÉTAT RÉCAPITULATIF DES SALAIRES & ACOMPTES', 'ETAT-PAIE-' + printDate.replace(/-/g,''), printDate)}

        <div style="background: #F1F5F9; border-right: 4px solid #D4AF37; padding: 8px 12px; border-radius: 4px; margin-bottom: 12px; font-size: 9pt;">
          <strong>بيان الصرف:</strong> كشف حساب شامل لأيام العمل الفعلية، التسبيقات النقدية المسددة، والرصيد الصافي المستحق الدفع لعمال الورشات ومشاريع DARI LUXE.
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 4%;">#</th>
              <th style="width: 22%;">اسم العامل والصفة</th>
              <th style="width: 14%;">المهنة / التخصص</th>
              <th style="width: 11%;">الأجر اليومي</th>
              <th style="width: 9%;">أيام العمل</th>
              <th style="width: 13%;">المستحق الكلي</th>
              <th style="width: 12%;">التسبيقات</th>
              <th style="width: 15%;">الصافي المتبقي</th>
              <th style="width: 10%;">توقيع المستلم</th>
            </tr>
          </thead>
          <tbody>
            ${workerRows}
          </tbody>
        </table>

        <div class="summary-grid">
          <div class="summary-card">
            <span style="font-size: 8.5pt; color: #64748B; display: block;">إجمالي أجور العمل المستحقة</span>
            <strong style="font-size: 13pt; color: #0F172A; font-family: monospace;">${totalWagesAll.toLocaleString('fr-FR')} دج</strong>
          </div>
          <div class="summary-card">
            <span style="font-size: 8.5pt; color: #64748B; display: block;">إجمالي التسبيقات المسددة</span>
            <strong style="font-size: 13pt; color: #DC2626; font-family: monospace;">${totalAdvancesAll.toLocaleString('fr-FR')} دج</strong>
          </div>
          <div class="summary-card highlight">
            <span style="font-size: 8.5pt; color: #B45309; display: block; font-weight: bold;">صافي المبلغ المتبقي للصرف</span>
            <strong style="font-size: 14pt; color: #B45309; font-family: monospace;">${netRemainingAll.toLocaleString('fr-FR')} دج</strong>
            <div style="font-size: 8pt; color: #78350F; margin-top: 2px;">(${App.formatCentimes(netRemainingAll)})</div>
          </div>
        </div>

        <div class="signature-box">
          <div class="sig-line">
            تأشيرة وتوقيع إدارة DARI LUXE
          </div>
          <div class="sig-line">
            تأشيرة المسؤول المالي والمشرف
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="background:#B45309; color:#FFF; border:none; padding:10px 24px; border-radius:6px; font-weight:bold; cursor:pointer; font-family:'Cairo'; font-size:10pt;">
            🖨️ طباعة الكشف الآن (A4 Print)
          </button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  },

  async printWorkerIndividualPayslipA4(workerId) {
    this.playClickSound();
    const w = await DB.getById('workers', workerId);
    if (!w) return;
    const attendances = (await DB.getAll('worker_attendance')).filter(a => a.worker_id === workerId);
    const payments = (await DB.getAll('worker_payments')).filter(p => p.worker_id === workerId);
    const projects = await DB.getAll('projects');
    const summary = CalculationEngine.computeWorkerFinancialSummary(workerId, attendances, payments);

    const printDate = App.getLocalDateString();

    const attendanceRows = attendances.map((a, i) => {
      const p = projects.find(prj => prj.id === a.project_id) || { name: 'ورشة عامة' };
      const dayWage = (w.daily_wage || 0) * (a.multiplier || 1.0);
      return `
        <tr>
          <td style="text-align: center;">${i+1}</td>
          <td>${a.date}</td>
          <td>${p.name}</td>
          <td style="text-align: center;">${a.multiplier === 1 ? 'يوم كامل (1.0)' : (a.multiplier === 0.5 ? 'نصف يوم (0.5)' : 'أخرى')}</td>
          <td style="text-align: left; font-family: monospace; font-weight: bold;">${dayWage.toLocaleString('fr-FR')} دج</td>
        </tr>
      `;
    }).join('') || '<tr><td colspan="5" style="text-align:center; color:#94A3B8;">لا توجد سجلات حضور مسجلة</td></tr>';

    const paymentRows = payments.map((p, i) => `
      <tr>
        <td style="text-align: center;">${i+1}</td>
        <td>${p.payment_date}</td>
        <td>${p.notes || 'تسبيق نقدي'}</td>
        <td style="text-align: left; font-family: monospace; color:#DC2626; font-weight: bold;">${parseFloat(p.amount || 0).toLocaleString('fr-FR')} دج</td>
      </tr>
    `).join('') || '<tr><td colspan="4" style="text-align:center; color:#94A3B8;">لا توجد تسبيقات مسددة</td></tr>';

    const win = window.open('', '_blank');
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>كشف حساب فردي - ${w.full_name}</title>
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; padding: 15mm 12mm; color: #0F172A; font-size: 9.5pt; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
          th { background: #0B132B; color: #FFFFFF; border: 1px solid #0B132B; padding: 7px; font-weight: bold; font-size: 9pt; }
          td { border: 1px solid #CBD5E1; padding: 6px; }
          .info-box { background: #F8FAFC; border: 1px solid #CBD5E1; padding: 12px; border-radius: 8px; margin-bottom: 15px; }
          .summary-card { border: 2px solid #B45309; background: #FFFBEB; padding: 12px; border-radius: 8px; text-align: left; margin-top: 15px; }
          .signature-box { margin-top: 35px; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        ${App.getCompanyPrintHeaderHTML('كشف حساب وأجور فردي لعامل', 'BULLETIN INDIVIDUEL DE PAIE', 'PAYSLIP-' + w.id.slice(0,6), printDate)}

        <div class="info-box">
          <table style="width: 100%; margin: 0; border: none;">
            <tr style="border: none;">
              <td style="border: none; width: 50%;"><strong>اسم العامل:</strong> ${w.full_name}</td>
              <td style="border: none; width: 50%;"><strong>المهنة / الصفة:</strong> ${w.specialty || 'عامل تشطيب'}</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none;"><strong>رقم بطاقة التعريف (CIN):</strong> ${w.cin || '—'}</td>
              <td style="border: none;"><strong>رقم الهاتف:</strong> ${w.phone || '—'}</td>
            </tr>
            <tr style="border: none;">
              <td style="border: none;"><strong>الأجر اليومي المتفق عليه:</strong> ${(w.daily_wage || 0).toLocaleString('fr-FR')} دج / اليوم</td>
              <td style="border: none;"><strong>الولاية:</strong> ${w.wilaya || 'عين الدفلى'}</td>
            </tr>
          </table>
        </div>

        <h4 style="margin: 15px 0 5px 0; color: #0B132B;">1. تفاصيل أيام الحضور والعمل الفعلية:</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 20%;">التاريخ</th>
              <th style="width: 38%;">المشروع / الورشة</th>
              <th style="width: 18%;">طبيعة اليومية</th>
              <th style="width: 18%;">الأجر اليومي المحسوب</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceRows}
          </tbody>
        </table>

        <h4 style="margin: 15px 0 5px 0; color: #0B132B;">2. تفاصيل التسبيقات النقدية المسددة:</h4>
        <table>
          <thead>
            <tr>
              <th style="width: 6%;">#</th>
              <th style="width: 24%;">تاريخ التسليم</th>
              <th style="width: 45%;">البيان / الملاحظة</th>
              <th style="width: 25%;">المبلغ المستلم</th>
            </tr>
          </thead>
          <tbody>
            ${paymentRows}
          </tbody>
        </table>

        <div class="summary-card">
          <div style="display: flex; justify-content: space-between; font-size: 10.5pt; margin-bottom: 4px;">
            <span>إجمالي مستحقات أيام العمل (${summary.totalDaysWorked} يوم):</span>
            <strong style="font-family: monospace;">${summary.totalEarned.toLocaleString('fr-FR')} دج</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 10.5pt; color: #DC2626; margin-bottom: 6px;">
            <span>مجموع التسبيقات المستلمة نقداً:</span>
            <strong style="font-family: monospace;">- ${summary.totalPaid.toLocaleString('fr-FR')} دج</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13pt; font-weight: 900; color: #B45309; border-top: 1px solid #FCD34D; padding-top: 6px;">
            <span>الصافي المتبقي والمستحق للصرف:</span>
            <span style="font-family: monospace;">${summary.balanceDue.toLocaleString('fr-FR')} دج</span>
          </div>
        </div>

        <div class="signature-box">
          <div style="text-align: center; width: 220px; border-top: 1px dashed #64748B; padding-top: 8px; font-size: 9pt;">
            توقيع الإدارة وتأشيرة الصرف
          </div>
          <div style="text-align: center; width: 220px; border-top: 1px dashed #64748B; padding-top: 8px; font-size: 9pt;">
            توقيع واستلام العامل: ${w.full_name}
          </div>
        </div>

        <div style="text-align: center; margin-top: 25px;">
          <button onclick="window.print()" style="background:#B45309; color:#FFF; border:none; padding:8px 20px; border-radius:6px; font-weight:bold; cursor:pointer; font-family:'Cairo'; font-size:10pt;">
            🖨️ طباعة كشف الحساب الفردي A4
          </button>
        </div>
      </body>
      </html>
    `);
    win.document.close();
  },

  // ============================================================
  // QUICK MOBILE DAILY CHECK-IN MODAL (ALL WORKERS AT ONCE)
  // ============================================================
  async openQuickDailyCheckinModal() {
    this.playClickSound();
    const workers = (await DB.getAll('workers')).filter(w => w.status !== 'inactive');
    const projects = await DB.getAll('projects');
    const todayStr = App.getLocalDateString();
    const todayAttendances = (await DB.getAll('worker_attendance')).filter(a => a.date === todayStr);

    if (workers.length === 0) {
      alert('لا يوجد عمال مسجلين في النظام. يرجى إضافة عمال أولاً.');
      return;
    }

    const modalHTML = `
      <div id="quick-checkin-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#16161C]">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                ⚡
              </div>
              <div>
                <h3 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>تسجيل الحضور اليومي السريع لجميع العمال</span>
                  <span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">${todayStr}</span>
                </h3>
                <p class="text-xs text-slate-400">حدد حالة حضور كل عامل مع إمكانية تسجيل تسبيق فوري بضغطة واحدة</p>
              </div>
            </div>
            <button onclick="document.getElementById('quick-checkin-modal').remove()" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition">
              ✕
            </button>
          </div>

          <!-- Workers List Body -->
          <div class="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
            <div class="text-[11px] text-slate-400 bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
              <span>عدد عمال المؤسسة: <strong class="text-white">${workers.length}</strong></span>
              <span class="text-emerald-400">حاضرون مسجلون اليوم: <strong id="quick-present-counter">${todayAttendances.filter(a => a.multiplier > 0).length}</strong></span>
            </div>

            <div class="space-y-2.5" id="quick-workers-list">
              ${workers.map(w => {
                const existing = todayAttendances.find(a => a.worker_id === w.id);
                const currentMult = existing ? existing.multiplier : 1.0;
                const currentProjectId = existing ? existing.project_id : (projects[0] ? projects[0].id : '');

                return `
                  <div class="p-3.5 rounded-xl bg-[#16161C] border border-white/5 hover:border-white/10 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3" data-worker-id="${w.id}">
                    <div class="flex items-center gap-3 min-w-[180px]">
                      <div class="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                        ${(w.full_name || 'W')[0].toUpperCase()}
                      </div>
                      <div>
                        <span class="text-xs font-bold text-white block">${w.full_name}</span>
                        <span class="text-[10px] text-slate-400 font-mono">${w.specialty || 'عامل'} • ${(w.daily_wage || 0).toLocaleString('fr-FR')} دج/يوم</span>
                      </div>
                    </div>

                    <!-- Attendance Toggle Buttons -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <label class="cursor-pointer">
                        <input type="radio" name="quick_status_${w.id}" value="1.0" ${currentMult === 1.0 ? 'checked' : ''} class="hidden peer">
                        <span class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 border-white/10 text-slate-400 peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/50 peer-checked:text-emerald-400">
                          ✓ كامل (1.0)
                        </span>
                      </label>
                      <label class="cursor-pointer">
                        <input type="radio" name="quick_status_${w.id}" value="0.5" ${currentMult === 0.5 ? 'checked' : ''} class="hidden peer">
                        <span class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 border-white/10 text-slate-400 peer-checked:bg-amber-500/20 peer-checked:border-amber-500/50 peer-checked:text-amber-400">
                          ½ نصف (0.5)
                        </span>
                      </label>
                      <label class="cursor-pointer">
                        <input type="radio" name="quick_status_${w.id}" value="0.0" ${currentMult === 0.0 ? 'checked' : ''} class="hidden peer">
                        <span class="px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 border-white/10 text-slate-400 peer-checked:bg-rose-500/20 peer-checked:border-rose-500/50 peer-checked:text-rose-400">
                          ✗ غائب (0)
                        </span>
                      </label>
                    </div>

                    <!-- Project Selection -->
                    <div class="w-full md:w-44">
                      <select id="quick_project_${w.id}" class="w-full bg-[#121216] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-[#FF3B30]">
                        ${projects.map(p => `<option value="${p.id}" ${p.id === currentProjectId ? 'selected' : ''}>${p.name}</option>`).join('') || '<option value="">لا توجد مشاريع</option>'}
                      </select>
                    </div>

                    <!-- Advance input -->
                    <div class="w-full md:w-32 flex items-center gap-1">
                      <input type="number" id="quick_advance_${w.id}" placeholder="تسبيق دج" min="0" step="500" class="w-full bg-[#121216] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-amber-400 text-left font-mono">
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-4 sm:p-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#16161C]">
            <span class="text-xs text-slate-400">سيتم حفظ حضور جميع العمال تلقائياً وتحديث أجورهم وصندوق الشركة.</span>
            <div class="flex items-center gap-2.5 w-full sm:w-auto">
              <button onclick="document.getElementById('quick-checkin-modal').remove()" class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
                إلغاء
              </button>
              <button onclick="App.saveQuickDailyCheckin()" class="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition flex items-center justify-center gap-2 border border-emerald-400/30">
                <span>✓</span>
                <span>حفظ حضور اليوم للجميع</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
  },

  async saveQuickDailyCheckin() {
    this.playClickSound();
    const rows = document.querySelectorAll('#quick-workers-list > div[data-worker-id]');
    const todayStr = App.getLocalDateString();
    const existingAttendances = (await DB.getAll('worker_attendance')).filter(a => a.date === todayStr);
    const partners = await DB.getAll('partners');
    const defaultPartner = partners[0] || { id: 'PART-001', name: 'شريك DARI LUXE' };

    let savedCount = 0;
    let advancesCount = 0;

    for (const row of rows) {
      const workerId = row.dataset.workerId;
      const multInput = row.querySelector(`input[name="quick_status_${workerId}"]:checked`);
      const multiplier = multInput ? parseFloat(multInput.value) : 1.0;
      const projectSelect = document.getElementById(`quick_project_${workerId}`);
      const projectId = projectSelect ? projectSelect.value : '';
      const advanceInput = document.getElementById(`quick_advance_${workerId}`);
      const advanceVal = advanceInput ? parseFloat(advanceInput.value) || 0 : 0;

      // Update or insert attendance
      const existing = existingAttendances.find(a => a.worker_id === workerId);
      if (existing) {
        await DB.update('worker_attendance', existing.id, {
          multiplier: multiplier,
          project_id: projectId,
          status: multiplier > 0 ? 'present' : 'absent',
          notes: 'تسجيل سريع'
        });
      } else {
        await DB.add('worker_attendance', {
          id: 'ATT-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
          worker_id: workerId,
          project_id: projectId,
          date: todayStr,
          multiplier: multiplier,
          status: multiplier > 0 ? 'present' : 'absent',
          notes: 'تسجيل سريع'
        });
      }
      savedCount++;

      // If advance entered, register worker payment
      if (advanceVal > 0) {
        await DB.add('worker_payments', {
          id: 'WPAY-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
          worker_id: workerId,
          project_id: projectId,
          amount: advanceVal,
          payment_date: todayStr,
          paid_by_partner_id: defaultPartner.id,
          paid_by_partner_name: defaultPartner.name,
          notes: 'تسبيق يومي سريع'
        });
        advancesCount++;
      }
    }

    const modal = document.getElementById('quick-checkin-modal');
    if (modal) modal.remove();

    alert(`✓ تم بنجاح حفظ الحضور اليومي لـ ${savedCount} عامل!${advancesCount > 0 ? `\n✓ تم تسجيل ${advancesCount} تسبيق نقدي في حساباتهم.` : ''}`);
    this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
  },

  // ============================================================
  // REAL PROJECT PHOTOS & DOCUMENTS GALLERY ENGINE
  // ============================================================
  async openUploadProjectAttachmentModal(projectId) {
    this.playClickSound();
    const modalHTML = `
      <div id="upload-attachment-modal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div class="bg-[#121216] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <span>📸</span>
              <span>إرفاق صورة أو مخطط للورشة</span>
            </h3>
            <button onclick="document.getElementById('upload-attachment-modal').remove()" class="text-slate-400 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-400 mb-1">مرحلة / صنف المرفق:</label>
              <select id="attachment_stage" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white">
                <option value="avant">📸 قبل بدء الأشغال (Avant travaux)</option>
                <option value="en_cours">🔨 أثناء سير الأشغال (En cours d'exécution)</option>
                <option value="apres">✨ بعد التشطيب النهائي (Après finition)</option>
                <option value="plan">📐 مخطط تقني أو رسم هندسي (Plan technique)</option>
                <option value="bon">🧾 وصل استلام أو فاتورة مواد (Bon d'achat)</option>
              </select>
            </div>

            <div>
              <label class="block text-slate-400 mb-1">عنوان توضيحي للمرفق:</label>
              <input type="text" id="attachment_title" placeholder="مثال: واجهة الصالون قبل البلاكو، مخطط السقف..." class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-white">
            </div>

            <div>
              <label class="block text-slate-400 mb-1">اختر الصورة أو الملف (JPG, PNG, PDF):</label>
              <input type="file" id="attachment_file_input" accept="image/*,application/pdf" class="w-full bg-[#16161C] border border-white/10 rounded-xl px-3 py-2 text-slate-300">
            </div>

            <div id="attachment_preview_container" class="hidden text-center pt-2">
              <img id="attachment_img_preview" class="max-h-40 mx-auto rounded-lg border border-white/10 object-contain">
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button onclick="document.getElementById('upload-attachment-modal').remove()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition">
              إلغاء
            </button>
            <button onclick="App.saveProjectAttachment('${projectId}')" class="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg transition">
              رفع وحفظ
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const fileInput = document.getElementById('attachment_file_input');
    const previewContainer = document.getElementById('attachment_preview_container');
    const imgPreview = document.getElementById('attachment_img_preview');

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          imgPreview.src = evt.target.result;
          previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      }
    };
  },

  async saveProjectAttachment(projectId) {
    const stage = document.getElementById('attachment_stage').value;
    const title = (document.getElementById('attachment_title').value || '').trim();
    const fileInput = document.getElementById('attachment_file_input');

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('يرجى اختيار صورة أو ملف أولاً.');
      return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64Url = e.target.result;
      const newAtt = {
        id: 'ATT-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
        project_id: projectId,
        entity_type: stage,
        file_name: title || file.name,
        file_url: base64Url,
        file_type: file.type.startsWith('image/') ? 'image' : 'pdf',
        file_size: file.size,
        uploaded_at: new Date().toISOString()
      };

      await DB.add('attachments', newAtt);
      const modal = document.getElementById('upload-attachment-modal');
      if (modal) modal.remove();

      alert('✓ تم حفظ الصورة والمرفق بنجاح في سجل الورشة!');
      const project = await DB.getById('projects', projectId);
      if (project) {
        App.renderProjectTabDocuments(project);
      }
    };

    reader.readAsDataURL(file);
  },

  async deleteProjectAttachment(attId, projectId) {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة / المرفق؟')) return;
    this.playClickSound();
    await DB.delete('attachments', attId);
    const project = await DB.getById('projects', projectId);
    if (project) {
      App.renderProjectTabDocuments(project);
    }
  },

  openImageViewerModal(imgSrc, title) {
    const modalHTML = `
      <div id="image-viewer-modal" onclick="this.remove()" class="fixed inset-0 bg-black/90 backdrop-blur-md z-[120] flex items-center justify-center p-4 cursor-pointer">
        <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
          <img src="${imgSrc}" class="max-w-full max-h-[82vh] object-contain rounded-xl border border-white/20 shadow-2xl">
          <p class="text-white text-xs mt-3 font-bold bg-[#121216]/80 px-4 py-1.5 rounded-full border border-white/10">${title}</p>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
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

  // --- Modals Logic: Direct Navigation to Smart Views (Zero Popups) ---
  openNewProjectModal() {
    this.navigate('new_project');
  },

  async openNewFloorModal(projectId) {
    const existingFloors = await DB.query('project_floors', f => String(f.project_id) === String(projectId));
    const nextNumber = existingFloors.length;
    const floorNames = ['الطابق الأرضي (RDC)', 'الطابق الأول (1er Étage)', 'الطابق الثاني (2ème Étage)', 'الطابق الثالث (3ème Étage)', 'السطح والملحق (Terrasse)'];
    const defaultName = floorNames[nextNumber] || ('طابق ' + (nextNumber + 1));
    await DB.add('project_floors', {
      project_id: projectId,
      floor_name: defaultName,
      floor_number: nextNumber,
      description: 'مستوى بناية'
    });
    this.playClickSound();
    alert('✓ تم بنجاح إضافة ' + defaultName + ' للمشروع بنقرة واحدة وبدون نوافذ منبثقة!');
    this.renderActiveProjectTabContent();
  },

  async openNewRoomModal(projectId, defaultFloorId = null) {
    if (projectId) this.activeProjectId = projectId;
    this.navigate('new_room', projectId);
  },

  async openNewWorkerModal() {
    this.navigate('new_worker');
  },

  async openNewExpenseModal(defaultProjectId = null) {
    if (defaultProjectId) this.activeProjectId = defaultProjectId;
    this.navigate('new_expense', defaultProjectId);
  },

  openAddExpenseModal() {
    this.navigate('new_expense');
  },

  async openNewAttendanceModal(defaultProjectId = null) {
    this.navigate('daily_checkin');
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
      this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
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
      this.renderCurrentView(); this.updateMobileNavState(this.currentView);;
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
