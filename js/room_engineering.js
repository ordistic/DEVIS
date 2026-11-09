/**
 * Room Engineering System — DARI LUXE ERP v29
 * Manages full room technical details: walls, lighting, electrical, doors, windows, decorations, costs
 * RTL Arabic/French bilingual — Algerian context
 */

const RoomEngineering = {

  // ─────────────────────────────────────────────────────────────────────
  // CONSTANTS
  // ─────────────────────────────────────────────────────────────────────
  WALL_POSITIONS: [
    'الجدار الأمامي', 'الجدار الخلفي', 'الجدار الجانبي الأيمن',
    'الجدار الجانبي الأيسر', 'الجدار الرئيسي', 'جدار التلفاز',
    'جدار الديكور', 'جدار آخر'
  ],
  FINISH_TYPES: ['دهان عادي', 'دهان بلاستيك', 'ورق جدران', 'بلاط سيراميك', 'حجر طبيعي', 'خشب', 'جبس ديكوري', 'بدون تشطيب'],
  LIGHTING_TYPES: ['سبوت (Spot)', 'ثريا (Lustre)', 'إضاءة مخفية (Hidden)', 'شريط LED', 'LED Profile', 'إضاءة ديكورية', 'نجفة (Chandelier)', 'مصباح عادي'],
  ELECTRICAL_TYPES: ['مقبس كهرباء (Prise)', 'مفتاح إنارة (Interrupteur)', 'مقبس تلفاز (TV)', 'مقبس إنترنت', 'نقطة كهرباء مخصصة', 'نقطة توصيل إنارة', 'مقبس إضافي'],
  DOOR_SIZES: ['كبير', 'متوسط', 'صغير', 'قياس مخصص'],
  DECOR_TYPES: ['جبس ديكوري', 'سقف مستعار (BA13)', 'بلاط سيراميك', 'ورق جدران', 'دهان ديكوري', 'خشب بوازري', 'ستوكو', 'كورنيش', 'إضاءة مخفية', 'ديكور حديث', 'أعمال أخرى'],
  TARGET_TYPES: ['جدار محدد', 'السقف', 'الأرضية', 'الغرفة كاملة'],

  // ─────────────────────────────────────────────────────────────────────
  // MAIN WORKSPACE VIEW
  // ─────────────────────────────────────────────────────────────────────
  async renderWorkspaceView(container, roomId) {
    if (!roomId) {
      container.innerHTML = this._errorHTML('لم يتم تحديد غرفة');
      return;
    }

    const room = await DB.get('project_rooms', roomId);
    if (!room) {
      container.innerHTML = this._errorHTML('الغرفة غير موجودة');
      return;
    }

    const project = await DB.get('projects', room.project_id);
    const floor = room.floor_id ? await DB.get('project_floors', room.floor_id) : null;

    const area = (parseFloat(room.length || 0) * parseFloat(room.width || 0)).toFixed(2);
    const volume = (parseFloat(room.length || 0) * parseFloat(room.width || 0) * parseFloat(room.height || 0)).toFixed(2);

    container.innerHTML = `
      <div class="min-h-screen bg-[#0A0A0E] text-white" dir="rtl">

        <!-- Header Breadcrumb -->
        <div class="sticky top-0 z-30 bg-[#0E0E14]/95 backdrop-blur border-b border-white/8 px-4 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <button onclick="App.navigate('projects')" class="hover:text-white transition">📁 المشاريع</button>
            <span class="text-slate-600">›</span>
            <button onclick="App.navigate('project_workspace', '${project?.id}')" class="hover:text-white transition">${App.escapeHtml(project?.project_name || 'المشروع')}</button>
            <span class="text-slate-600">›</span>
            <span class="text-slate-500">${App.escapeHtml(floor?.floor_name || 'الطابق')}</span>
            <span class="text-slate-600">›</span>
            <span class="text-white font-bold">📐 ${App.escapeHtml(room.room_name)}</span>
          </div>
        </div>

        <!-- Room Header Card -->
        <div class="p-4 pb-0">
          <div class="kpi-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-2xl">🛏️</div>
              <div>
                <h1 class="text-xl font-black text-white">${App.escapeHtml(room.room_name)}</h1>
                <p class="text-xs text-slate-400 mt-0.5">${App.escapeHtml(floor?.floor_name || '')} • ${App.escapeHtml(project?.project_name || '')}</p>
                <div class="flex flex-wrap gap-3 mt-2 text-xs">
                  <span class="bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/20">📏 ${room.length || 0}م × ${room.width || 0}م × H${room.height || 0}م</span>
                  <span class="bg-green-900/40 text-green-300 px-2.5 py-1 rounded-full border border-green-500/20">📐 ${area} م²</span>
                  <span class="bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20">📦 ${volume} م³</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="RoomEngineering.openEditRoomModal('${room.id}')" class="px-3 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 text-xs font-bold border border-white/10 transition">
                ✏️ تعديل المعلومات
              </button>
              <button onclick="App.navigate('project_workspace', '${project?.id}')" class="px-3 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 text-xs font-bold border border-white/10 transition">
                ← العودة
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="px-4 mt-4 overflow-x-auto">
          <div class="flex gap-1 min-w-max bg-[#111118] rounded-2xl p-1.5 border border-white/6" id="re-tabs-nav">
            ${[
              ['walls', '🧱 الجدران'],
              ['ceiling', '🔲 السقف'],
              ['lighting', '💡 الإنارة'],
              ['doors', '🚪 الأبواب والنوافذ'],
              ['electrical', '🔌 الكهرباء'],
              ['decorations', '🎨 الديكورات'],
              ['costs', '💰 التكاليف'],
              ['visual', '🗺️ المخطط'],
            ].map(([k, label], i) => `
              <button onclick="RoomEngineering.switchTab('${k}', '${roomId}')"
                data-re-tab="${k}"
                class="re-tab-btn px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${i === 0 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
                ${label}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Tab Panes -->
        <div class="p-4 space-y-4" id="re-tab-content">
          <div id="re-pane-walls">${await this._renderWallsPane(roomId)}</div>
          <div id="re-pane-ceiling" class="hidden">${await this._renderCeilingPane(room)}</div>
          <div id="re-pane-lighting" class="hidden">${await this._renderLightingPane(roomId)}</div>
          <div id="re-pane-doors" class="hidden">${await this._renderDoorsPane(roomId)}</div>
          <div id="re-pane-electrical" class="hidden">${await this._renderElectricalPane(roomId)}</div>
          <div id="re-pane-decorations" class="hidden">${await this._renderDecorationsPane(roomId)}</div>
          <div id="re-pane-costs" class="hidden">${await this._renderCostsPane(roomId, room)}</div>
          <div id="re-pane-visual" class="hidden">${await this._renderVisualPane(roomId, room)}</div>
        </div>
      </div>
    `;
  },

  switchTab(tabKey, roomId) {
    document.querySelectorAll('.re-tab-btn').forEach(btn => {
      if (btn.dataset.reTab === tabKey) {
        btn.className = 're-tab-btn px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap bg-indigo-600 text-white';
      } else {
        btn.className = 're-tab-btn px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5';
      }
    });
    document.querySelectorAll('[id^="re-pane-"]').forEach(pane => pane.classList.add('hidden'));
    const target = document.getElementById(`re-pane-${tabKey}`);
    if (target) target.classList.remove('hidden');
  },

  // ─────────────────────────────────────────────────────────────────────
  // WALLS PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderWallsPane(roomId) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));

    const totalWallArea = walls.reduce((s, w) => {
      let net = (parseFloat(w.length || 0) * parseFloat(w.height || 0));
      const wallDoors = doors.filter(d => String(d.wall_id) === String(w.id));
      const wallWindows = windows.filter(wn => String(wn.wall_id) === String(w.id));
      wallDoors.forEach(d => net -= (parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1)));
      wallWindows.forEach(wn => net -= (parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1)));
      return s + Math.max(0, net);
    }, 0);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-white text-sm">🧱 الجدران</h3>
            <p class="text-xs text-slate-400 mt-0.5">${walls.length} جدران • إجمالي المساحة الصافية: <strong class="text-green-400">${totalWallArea.toFixed(2)} م²</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddWallModal('${roomId}')" class="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
            + إضافة جدار
          </button>
        </div>

        ${walls.length === 0 ? `
          <div class="text-center py-12 text-slate-500 text-sm">
            <div class="text-4xl mb-3">🧱</div>
            <p>لا توجد جدران مضافة بعد</p>
            <button onclick="RoomEngineering.openAddWallModal('${roomId}')" class="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
              + إضافة أول جدار
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${walls.map(w => {
              const gross = parseFloat(w.length || 0) * parseFloat(w.height || 0);
              const wallDoors = doors.filter(d => String(d.wall_id) === String(w.id));
              const wallWindows = windows.filter(wn => String(wn.wall_id) === String(w.id));
              let deduct = 0;
              wallDoors.forEach(d => deduct += parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1));
              wallWindows.forEach(wn => deduct += parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1));
              const net = Math.max(0, gross - deduct);
              return `
                <div class="kpi-card rounded-xl p-4 space-y-3">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-white text-sm">${App.escapeHtml(w.wall_name)}</h4>
                      <p class="text-[11px] text-slate-400">${App.escapeHtml(w.position || '')}</p>
                    </div>
                    <div class="flex gap-1">
                      <button onclick="RoomEngineering.openEditWallModal('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition">✏️</button>
                      <button onclick="RoomEngineering.deleteWall('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div class="bg-[#111118] rounded-lg p-2">
                      <div class="text-slate-400">الطول</div>
                      <div class="font-bold text-white">${w.length || 0}م</div>
                    </div>
                    <div class="bg-[#111118] rounded-lg p-2">
                      <div class="text-slate-400">الارتفاع</div>
                      <div class="font-bold text-white">${w.height || 0}م</div>
                    </div>
                    <div class="bg-[#111118] rounded-lg p-2">
                      <div class="text-slate-400">المساحة</div>
                      <div class="font-bold text-green-400">${net.toFixed(2)}م²</div>
                    </div>
                  </div>
                  ${w.finish_type ? `<div class="text-[11px] text-slate-400">التشطيب: <span class="text-slate-200">${App.escapeHtml(w.finish_type)}</span></div>` : ''}
                  ${w.paint_type ? `<div class="text-[11px] text-slate-400">الدهان: <span class="text-slate-200">${App.escapeHtml(w.paint_type)}</span></div>` : ''}
                  ${deduct > 0 ? `<div class="text-[11px] text-amber-400">خصم أبواب/نوافذ: ${deduct.toFixed(2)} م²</div>` : ''}
                  ${w.notes ? `<div class="text-[11px] text-slate-500 italic">${App.escapeHtml(w.notes)}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // CEILING PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderCeilingPane(room) {
    const area = (parseFloat(room.length || 0) * parseFloat(room.width || 0)).toFixed(2);
    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">🔲 السقف</h3>
        <div class="kpi-card rounded-xl p-5 space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">مساحة السقف</div>
              <div class="font-black text-white text-lg mt-1">${area} م²</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">نوع السقف</div>
              <div class="font-bold text-slate-200 text-sm mt-1">${App.escapeHtml(room.ceiling_type || 'غير محدد')}</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">تشطيب السقف</div>
              <div class="font-bold text-slate-200 text-sm mt-1">${room.include_ceiling_paint ? '✅ نعم' : '❌ لا'}</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">الارتفاع</div>
              <div class="font-bold text-white text-lg mt-1">${room.height || 0}م</div>
            </div>
          </div>
          <p class="text-xs text-slate-400">📌 لتعديل نوع السقف وتشطيباته، استخدم زر <strong class="text-white">تعديل المعلومات</strong> في أعلى الصفحة. الديكورات والجبس تُضاف من تبويب <strong class="text-white">الديكورات</strong>.</p>
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // LIGHTING PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderLightingPane(roomId) {
    const items = await DB.query('room_lighting', l => String(l.room_id) === String(roomId));
    const total = items.reduce((s, l) => s + ((parseFloat(l.unit_price || 0) + parseFloat(l.install_cost || 0)) * parseInt(l.quantity || 1)), 0);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-white text-sm">💡 الإنارة</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} عنصر • إجمالي: <strong class="text-yellow-400">${App.formatNumber ? App.formatNumber(total) : total.toFixed(2)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddLightingModal('${roomId}')" class="px-3 py-2 rounded-xl bg-yellow-600/80 hover:bg-yellow-500 text-white text-xs font-bold transition">
            + إضافة إنارة
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="text-center py-12 text-slate-500 text-sm">
            <div class="text-4xl mb-3">💡</div>
            <p>لا توجد عناصر إنارة مضافة</p>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(l => {
              const lineCost = (parseFloat(l.unit_price || 0) + parseFloat(l.install_cost || 0)) * parseInt(l.quantity || 1);
              return `
                <div class="kpi-card rounded-xl p-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-yellow-600/20 flex items-center justify-center text-lg flex-shrink-0">💡</div>
                    <div class="min-w-0">
                      <div class="font-bold text-white text-sm truncate">${App.escapeHtml(l.lighting_type)}</div>
                      <div class="text-[11px] text-slate-400 truncate">${App.escapeHtml(l.model || '')} ${l.wattage ? '• ' + l.wattage + 'W' : ''}</div>
                    </div>
                  </div>
                  <div class="text-center flex-shrink-0">
                    <div class="text-xs text-slate-400">الكمية</div>
                    <div class="font-black text-white">${l.quantity || 1}</div>
                  </div>
                  <div class="text-center flex-shrink-0 hidden sm:block">
                    <div class="text-xs text-slate-400">الإجمالي</div>
                    <div class="font-bold text-yellow-400 text-sm">${App.formatNumber ? App.formatNumber(lineCost) : lineCost.toFixed(0)} دج</div>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <button onclick="RoomEngineering.openEditLightingModal('${l.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                    <button onclick="RoomEngineering.deleteLighting('${l.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // DOORS & WINDOWS PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderDoorsPane(roomId) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));

    const wallMap = {};
    walls.forEach(w => wallMap[w.id] = w.wall_name);

    return `
      <div class="space-y-5">
        <!-- Doors -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-white text-sm">🚪 الأبواب (${doors.length})</h3>
            <button onclick="RoomEngineering.openAddDoorModal('${roomId}')" class="px-3 py-2 rounded-xl bg-orange-700/70 hover:bg-orange-600 text-white text-xs font-bold transition">
              + إضافة باب
            </button>
          </div>
          ${doors.length === 0 ? `<div class="text-center py-6 text-slate-500 text-xs">لا توجد أبواب مضافة</div>` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${doors.map(d => `
                <div class="kpi-card rounded-xl p-4 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-bold text-white text-sm">🚪 ${App.escapeHtml(d.name || 'باب')}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[d.wall_id] ? 'الجدار: ' + App.escapeHtml(wallMap[d.wall_id]) : ''}</div>
                    </div>
                    <div class="flex gap-1">
                      <button onclick="RoomEngineering.openEditDoorModal('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                      <button onclick="RoomEngineering.deleteDoor('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">العرض</div><div class="font-bold text-white">${d.width || 0}م</div></div>
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">الارتفاع</div><div class="font-bold text-white">${d.height || 0}م</div></div>
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">العدد</div><div class="font-bold text-white">${d.quantity || 1}</div></div>
                  </div>
                  ${d.door_type ? `<div class="text-[11px] text-slate-400">النوع: <span class="text-slate-200">${App.escapeHtml(d.door_type)}</span></div>` : ''}
                  ${d.material ? `<div class="text-[11px] text-slate-400">المادة: <span class="text-slate-200">${App.escapeHtml(d.material)}</span></div>` : ''}
                  ${d.color ? `<div class="text-[11px] text-slate-400">اللون: <span class="text-slate-200">${App.escapeHtml(d.color)}</span></div>` : ''}
                  ${(d.door_price || d.install_cost) ? `<div class="text-[11px] text-green-400 font-bold">التكلفة: ${App.formatNumber ? App.formatNumber((parseFloat(d.door_price||0)+parseFloat(d.install_cost||0))*parseInt(d.quantity||1)) : ((parseFloat(d.door_price||0)+parseFloat(d.install_cost||0))*parseInt(d.quantity||1)).toFixed(0)} دج</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Windows -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="font-black text-white text-sm">🪟 النوافذ (${windows.length})</h3>
            <button onclick="RoomEngineering.openAddWindowModal('${roomId}')" class="px-3 py-2 rounded-xl bg-sky-700/70 hover:bg-sky-600 text-white text-xs font-bold transition">
              + إضافة نافذة
            </button>
          </div>
          ${windows.length === 0 ? `<div class="text-center py-6 text-slate-500 text-xs">لا توجد نوافذ مضافة</div>` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${windows.map(w => `
                <div class="kpi-card rounded-xl p-4 space-y-2">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-bold text-white text-sm">🪟 ${App.escapeHtml(w.name || 'نافذة')}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[w.wall_id] ? 'الجدار: ' + App.escapeHtml(wallMap[w.wall_id]) : ''}</div>
                    </div>
                    <div class="flex gap-1">
                      <button onclick="RoomEngineering.openEditWindowModal('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                      <button onclick="RoomEngineering.deleteWindow('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">العرض</div><div class="font-bold text-white">${w.width || 0}م</div></div>
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">الارتفاع</div><div class="font-bold text-white">${w.height || 0}م</div></div>
                    <div class="bg-[#111118] rounded-lg p-1.5"><div class="text-slate-400">العدد</div><div class="font-bold text-white">${w.quantity || 1}</div></div>
                  </div>
                  ${w.window_type ? `<div class="text-[11px] text-slate-400">النوع: <span class="text-slate-200">${App.escapeHtml(w.window_type)}</span></div>` : ''}
                  ${w.notes ? `<div class="text-[11px] text-slate-500 italic">${App.escapeHtml(w.notes)}</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // ELECTRICAL PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderElectricalPane(roomId) {
    const items = await DB.query('room_electrical', e => String(e.room_id) === String(roomId));
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const wallMap = {};
    walls.forEach(w => wallMap[w.id] = w.wall_name);

    const total = items.reduce((s, e) => s + ((parseFloat(e.unit_price || 0) + parseFloat(e.install_cost || 0)) * parseInt(e.quantity || 1)), 0);

    const typeIcons = {
      'مقبس كهرباء (Prise)': '🔌', 'مفتاح إنارة (Interrupteur)': '💡',
      'مقبس تلفاز (TV)': '📺', 'مقبس إنترنت': '🌐',
      'نقطة كهرباء مخصصة': '⚡', 'نقطة توصيل إنارة': '🔆', 'مقبس إضافي': '🔋'
    };

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-white text-sm">🔌 الكهرباء والمقابس</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} عنصر • إجمالي: <strong class="text-orange-400">${App.formatNumber ? App.formatNumber(total) : total.toFixed(2)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddElectricalModal('${roomId}')" class="px-3 py-2 rounded-xl bg-orange-600/80 hover:bg-orange-500 text-white text-xs font-bold transition">
            + إضافة عنصر
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="text-center py-12 text-slate-500 text-sm">
            <div class="text-4xl mb-3">🔌</div>
            <p>لا توجد تجهيزات كهربائية مضافة</p>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(e => {
              const lineCost = (parseFloat(e.unit_price || 0) + parseFloat(e.install_cost || 0)) * parseInt(e.quantity || 1);
              const icon = typeIcons[e.fixture_type] || '🔌';
              return `
                <div class="kpi-card rounded-xl p-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-orange-600/20 flex items-center justify-center text-lg flex-shrink-0">${icon}</div>
                    <div class="min-w-0">
                      <div class="font-bold text-white text-sm">${App.escapeHtml(e.fixture_type)}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[e.wall_id] ? App.escapeHtml(wallMap[e.wall_id]) : ''} ${e.height_from_floor ? '• ارتفاع ' + e.height_from_floor + 'م' : ''}</div>
                    </div>
                  </div>
                  <div class="text-center flex-shrink-0">
                    <div class="text-xs text-slate-400">الكمية</div>
                    <div class="font-black text-white">${e.quantity || 1}</div>
                  </div>
                  <div class="text-center flex-shrink-0 hidden sm:block">
                    <div class="text-xs text-slate-400">الإجمالي</div>
                    <div class="font-bold text-orange-400 text-sm">${App.formatNumber ? App.formatNumber(lineCost) : lineCost.toFixed(0)} دج</div>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <button onclick="RoomEngineering.openEditElectricalModal('${e.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                    <button onclick="RoomEngineering.deleteElectrical('${e.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // DECORATIONS PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderDecorationsPane(roomId) {
    const items = await DB.query('room_decorations', d => String(d.room_id) === String(roomId));
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const wallMap = {};
    walls.forEach(w => wallMap[w.id] = w.wall_name);

    const total = items.reduce((s, d) => s + (parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0)), 0);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-white text-sm">🎨 الديكورات والتشطيبات</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} عمل • إجمالي: <strong class="text-purple-400">${App.formatNumber ? App.formatNumber(total) : total.toFixed(2)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddDecorationModal('${roomId}')" class="px-3 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white text-xs font-bold transition">
            + إضافة عمل
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="text-center py-12 text-slate-500 text-sm">
            <div class="text-4xl mb-3">🎨</div>
            <p>لا توجد أعمال ديكور مضافة</p>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(d => {
              const lineCost = parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0);
              const target = d.wall_id && wallMap[d.wall_id] ? wallMap[d.wall_id] : (d.target_type || 'الغرفة');
              return `
                <div class="kpi-card rounded-xl p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-white text-sm">${App.escapeHtml(d.title || d.decor_type)}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">${App.escapeHtml(d.decor_type)} • ${App.escapeHtml(target)}</div>
                      ${d.quantity ? `<div class="text-[11px] text-slate-400">الكمية: ${d.quantity} ${d.unit || ''}</div>` : ''}
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="font-bold text-purple-400 text-sm">${App.formatNumber ? App.formatNumber(lineCost) : lineCost.toFixed(0)} دج</div>
                      <div class="text-[10px] text-slate-500">مواد: ${App.formatNumber ? App.formatNumber(parseFloat(d.material_cost||0)) : parseFloat(d.material_cost||0).toFixed(0)} | عمالة: ${App.formatNumber ? App.formatNumber(parseFloat(d.labor_cost||0)) : parseFloat(d.labor_cost||0).toFixed(0)}</div>
                    </div>
                    <div class="flex gap-1 flex-shrink-0">
                      <button onclick="RoomEngineering.openEditDecorationModal('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                      <button onclick="RoomEngineering.deleteDecoration('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  ${d.notes ? `<div class="text-[11px] text-slate-500 italic mt-2">${App.escapeHtml(d.notes)}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // COSTS PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderCostsPane(roomId, room) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));
    const lighting = await DB.query('room_lighting', l => String(l.room_id) === String(roomId));
    const electrical = await DB.query('room_electrical', e => String(e.room_id) === String(roomId));
    const decorations = await DB.query('room_decorations', d => String(d.room_id) === String(roomId));

    const area = parseFloat(room.length || 0) * parseFloat(room.width || 0);

    // Calculate wall net areas
    let totalWallNetArea = 0;
    walls.forEach(w => {
      let net = parseFloat(w.length || 0) * parseFloat(w.height || 0);
      doors.filter(d => String(d.wall_id) === String(w.id)).forEach(d => net -= parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1));
      windows.filter(wn => String(wn.wall_id) === String(w.id)).forEach(wn => net -= parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1));
      totalWallNetArea += Math.max(0, net);
    });

    const costLighting = lighting.reduce((s, l) => s + ((parseFloat(l.unit_price || 0) + parseFloat(l.install_cost || 0)) * parseInt(l.quantity || 1)), 0);
    const costElectrical = electrical.reduce((s, e) => s + ((parseFloat(e.unit_price || 0) + parseFloat(e.install_cost || 0)) * parseInt(e.quantity || 1)), 0);
    const costDoors = doors.reduce((s, d) => s + ((parseFloat(d.door_price || 0) + parseFloat(d.install_cost || 0)) * parseInt(d.quantity || 1)), 0);
    const costDecorations = decorations.reduce((s, d) => s + parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0), 0);
    const grandTotal = costLighting + costElectrical + costDoors + costDecorations;

    const fmt = (v) => App.formatNumber ? App.formatNumber(v) : v.toFixed(2);

    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">💰 ملخص التكاليف</h3>

        <!-- Areas Summary -->
        <div class="kpi-card rounded-xl p-4 space-y-3">
          <h4 class="font-bold text-slate-300 text-xs uppercase tracking-wider">📐 المساحات</h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">مساحة الأرضية</div>
              <div class="font-black text-white text-base mt-1">${area.toFixed(2)}</div>
              <div class="text-slate-500">م²</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">مساحة السقف</div>
              <div class="font-black text-white text-base mt-1">${area.toFixed(2)}</div>
              <div class="text-slate-500">م²</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">مجموع الجدران</div>
              <div class="font-black text-green-400 text-base mt-1">${totalWallNetArea.toFixed(2)}</div>
              <div class="text-slate-500">م² صافي</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">الأبواب والنوافذ</div>
              <div class="font-black text-amber-400 text-base mt-1">${doors.length + windows.length}</div>
              <div class="text-slate-500">عنصر</div>
            </div>
          </div>
        </div>

        <!-- Costs Breakdown -->
        <div class="kpi-card rounded-xl p-4 space-y-3">
          <h4 class="font-bold text-slate-300 text-xs uppercase tracking-wider">💵 تفصيل التكاليف</h4>
          <div class="space-y-2 text-sm">
            ${[
              ['💡 الإنارة', costLighting, lighting.length + ' وحدة'],
              ['🔌 الكهرباء والمقابس', costElectrical, electrical.length + ' عنصر'],
              ['🚪 الأبواب', costDoors, doors.length + ' باب'],
              ['🎨 الديكورات والتشطيبات', costDecorations, decorations.length + ' عمل'],
            ].map(([label, cost, count]) => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-[#111118]">
                <div>
                  <div class="font-bold text-white text-xs">${label}</div>
                  <div class="text-[11px] text-slate-500">${count}</div>
                </div>
                <div class="font-black text-white">${fmt(cost)} <span class="text-slate-500 text-xs font-normal">دج</span></div>
              </div>
            `).join('')}

            <div class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-indigo-900/40 to-indigo-800/20 border border-indigo-500/30">
              <div class="font-black text-white text-sm">الإجمالي الكلي للغرفة</div>
              <div class="font-black text-indigo-300 text-lg">${fmt(grandTotal)} <span class="text-slate-400 text-xs font-normal">دج</span></div>
            </div>
          </div>
        </div>

        <!-- Counts Summary -->
        <div class="kpi-card rounded-xl p-4 space-y-3">
          <h4 class="font-bold text-slate-300 text-xs uppercase tracking-wider">📊 الكميات</h4>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
            ${[
              ['🧱', 'جدران', walls.length],
              ['💡', 'إنارة', lighting.reduce((s, l) => s + parseInt(l.quantity || 1), 0)],
              ['🔌', 'مقابس', electrical.reduce((s, e) => s + parseInt(e.quantity || 1), 0)],
              ['🚪', 'أبواب', doors.reduce((s, d) => s + parseInt(d.quantity || 1), 0)],
              ['🪟', 'نوافذ', windows.reduce((s, w) => s + parseInt(w.quantity || 1), 0)],
              ['🎨', 'ديكور', decorations.length],
            ].map(([icon, label, count]) => `
              <div class="bg-[#111118] rounded-xl p-3">
                <div class="text-xl">${icon}</div>
                <div class="font-black text-white text-lg mt-1">${count}</div>
                <div class="text-slate-500 text-[10px]">${label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // VISUAL PLAN PANE (SVG Top-Down)
  // ─────────────────────────────────────────────────────────────────────
  async _renderVisualPane(roomId, room) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));
    const electrical = await DB.query('room_electrical', e => String(e.room_id) === String(roomId));
    const lighting = await DB.query('room_lighting', l => String(l.room_id) === String(roomId));

    const W = parseFloat(room.width || 4);
    const L = parseFloat(room.length || 5);
    const scale = 60;
    const pad = 60;
    const svgW = L * scale + pad * 2;
    const svgH = W * scale + pad * 2;

    const totalSpots = lighting.filter(l => l.lighting_type?.includes('سبوت') || l.lighting_type?.includes('Spot')).reduce((s, l) => s + parseInt(l.quantity || 1), 0);
    const totalOutlets = electrical.filter(e => e.fixture_type?.includes('مقبس')).reduce((s, e) => s + parseInt(e.quantity || 1), 0);
    const totalSwitches = electrical.filter(e => e.fixture_type?.includes('مفتاح')).reduce((s, e) => s + parseInt(e.quantity || 1), 0);

    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">🗺️ المخطط المرئي للغرفة</h3>
        <div class="kpi-card rounded-xl p-4">
          <div class="overflow-x-auto">
            <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" class="mx-auto block max-w-full">
              <!-- Room outline -->
              <rect x="${pad}" y="${pad}" width="${L * scale}" height="${W * scale}"
                fill="#1a1a24" stroke="#6366f1" stroke-width="3" rx="4"/>

              <!-- Dimensions labels -->
              <text x="${pad + L * scale / 2}" y="${pad - 12}" text-anchor="middle" font-size="14" fill="#94a3b8" font-family="Arial">${L}م</text>
              <text x="${pad - 15}" y="${pad + W * scale / 2}" text-anchor="middle" font-size="14" fill="#94a3b8" font-family="Arial" transform="rotate(-90, ${pad - 15}, ${pad + W * scale / 2})">${W}م</text>

              <!-- Compass labels -->
              <text x="${pad + L * scale / 2}" y="${pad + W * scale + 24}" text-anchor="middle" font-size="13" fill="#64748b" font-family="Arial">الجدار الأمامي</text>
              <text x="${pad + L * scale / 2}" y="${pad - 28}" text-anchor="middle" font-size="13" fill="#64748b" font-family="Arial">الجدار الخلفي</text>
              <text x="${pad - 35}" y="${pad + W * scale / 2 + 5}" text-anchor="middle" font-size="12" fill="#64748b" font-family="Arial" transform="rotate(-90, ${pad - 35}, ${pad + W * scale / 2 + 5})">أيمن</text>
              <text x="${pad + L * scale + 35}" y="${pad + W * scale / 2 + 5}" text-anchor="middle" font-size="12" fill="#64748b" font-family="Arial" transform="rotate(90, ${pad + L * scale + 35}, ${pad + W * scale / 2 + 5})">أيسر</text>

              <!-- Ceiling light center -->
              <circle cx="${pad + L * scale / 2}" cy="${pad + W * scale / 2}" r="${Math.min(L, W) * scale / 5}"
                fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
              <text x="${pad + L * scale / 2}" y="${pad + W * scale / 2 + 5}" text-anchor="middle" font-size="12" fill="#facc15" font-family="Arial">💡</text>

              <!-- Walls count indicator -->
              ${walls.map((w, i) => {
                const side = i % 4;
                const positions = [
                  [pad + L * scale / 2, pad + 10],
                  [pad + L * scale / 2, pad + W * scale - 10],
                  [pad + 10, pad + W * scale / 2],
                  [pad + L * scale - 10, pad + W * scale / 2]
                ];
                const [cx, cy] = positions[side] || [pad + L * scale / 2, pad + W * scale / 2];
                return `
                  <circle cx="${cx}" cy="${cy}" r="8" fill="#6366f1" opacity="0.7"/>
                  <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="9" fill="white" font-family="Arial">${i + 1}</text>
                `;
              }).join('')}

              <!-- Door symbols on front wall -->
              ${doors.slice(0, 3).map((d, i) => {
                const x = pad + 20 + i * 40;
                const y = pad + W * scale;
                return `
                  <rect x="${x - 8}" y="${y - 6}" width="16" height="6" fill="#f97316" rx="2"/>
                  <text x="${x}" y="${y + 14}" text-anchor="middle" font-size="10" fill="#f97316" font-family="Arial">🚪</text>
                `;
              }).join('')}

              <!-- Window symbols on back wall -->
              ${windows.slice(0, 3).map((w, i) => {
                const x = pad + 30 + i * 50;
                const y = pad;
                return `
                  <rect x="${x - 10}" y="${y - 4}" width="20" height="4" fill="#38bdf8" rx="1"/>
                  <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="10" fill="#38bdf8" font-family="Arial">🪟</text>
                `;
              }).join('')}

              <!-- Electric outlets symbols -->
              ${electrical.slice(0, 4).map((e, i) => {
                const x = pad + 15;
                const y = pad + 20 + i * 30;
                return `<text x="${x}" y="${y}" font-size="11" fill="#fb923c" font-family="Arial">⚡</text>`;
              }).join('')}
            </svg>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-3 text-xs justify-center">
            <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-indigo-500"></div><span class="text-slate-400">جدار</span></div>
            <div class="flex items-center gap-1.5"><span>🚪</span><span class="text-slate-400">باب</span></div>
            <div class="flex items-center gap-1.5"><span>🪟</span><span class="text-slate-400">نافذة</span></div>
            <div class="flex items-center gap-1.5"><span>💡</span><span class="text-slate-400">إنارة</span></div>
            <div class="flex items-center gap-1.5"><span>⚡</span><span class="text-slate-400">كهرباء</span></div>
          </div>
        </div>

        <!-- Quick Stats for Visual -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="kpi-card rounded-xl p-3">
            <div class="text-2xl">🧱</div>
            <div class="font-black text-white text-xl mt-1">${walls.length}</div>
            <div class="text-slate-400">جدران</div>
          </div>
          <div class="kpi-card rounded-xl p-3">
            <div class="text-2xl">💡</div>
            <div class="font-black text-yellow-400 text-xl mt-1">${totalSpots}</div>
            <div class="text-slate-400">سبوت</div>
          </div>
          <div class="kpi-card rounded-xl p-3">
            <div class="text-2xl">🔌</div>
            <div class="font-black text-orange-400 text-xl mt-1">${totalOutlets}</div>
            <div class="text-slate-400">مقابس</div>
          </div>
          <div class="kpi-card rounded-xl p-3">
            <div class="text-2xl">🔆</div>
            <div class="font-black text-blue-400 text-xl mt-1">${totalSwitches}</div>
            <div class="text-slate-400">مفاتيح</div>
          </div>
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — WALLS
  // ─────────────────────────────────────────────────────────────────────
  openAddWallModal(roomId, wallData = null) {
    const isEdit = !!wallData;
    const title = isEdit ? 'تعديل الجدار' : 'إضافة جدار جديد';
    const w = wallData || {};

    const positionOptions = this.WALL_POSITIONS.map(p =>
      `<option value="${p}" ${w.position === p ? 'selected' : ''}>${p}</option>`
    ).join('');
    const finishOptions = this.FINISH_TYPES.map(f =>
      `<option value="${f}" ${w.finish_type === f ? 'selected' : ''}>${f}</option>`
    ).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${title}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم الجدار *</label>
            <input id="re-wall-name" type="text" value="${App.escapeHtml(w.wall_name || '')}"
              placeholder="مثل: الجدار الأمامي"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الموقع</label>
            <select id="re-wall-position" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- اختر --</option>
              ${positionOptions}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">الطول (م) *</label>
            <input id="re-wall-length" type="number" step="0.01" min="0" value="${w.length || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع (م) *</label>
            <input id="re-wall-height" type="number" step="0.01" min="0" value="${w.height || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع التشطيب</label>
            <select id="re-wall-finish" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد --</option>
              ${finishOptions}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع الدهان / الديكور</label>
            <input id="re-wall-paint" type="text" value="${App.escapeHtml(w.paint_type || '')}"
              placeholder="مثل: دهان بلاستيك أبيض"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <input id="re-wall-needs-finish" type="checkbox" ${w.needs_finish !== false ? 'checked' : ''} class="w-4 h-4 rounded accent-indigo-500"/>
          <label for="re-wall-needs-finish" class="text-sm text-slate-300">يحتاج هذا الجدار إلى تشطيب</label>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-wall-notes" rows="2" placeholder="ملاحظات إضافية..."
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(w.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveWall('${roomId}', '${w.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ التعديلات' : '+ إضافة الجدار'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition hover:bg-[#2A2A38]">
          إلغاء
        </button>
      </div>
    `);
  },

  openEditWallModal(wallId, roomId) {
    DB.get('room_walls', wallId).then(w => {
      if (w) this.openAddWallModal(roomId, w);
    });
  },

  async saveWall(roomId, wallId = '') {
    const name = document.getElementById('re-wall-name')?.value?.trim();
    const length = parseFloat(document.getElementById('re-wall-length')?.value || 0);
    const height = parseFloat(document.getElementById('re-wall-height')?.value || 0);
    if (!name) { App.showToast('أدخل اسم الجدار', 'error'); return; }
    if (!length || !height) { App.showToast('أدخل أبعاد الجدار', 'error'); return; }

    const payload = {
      room_id: roomId,
      wall_name: name,
      position: document.getElementById('re-wall-position')?.value || '',
      length,
      height,
      area: length * height,
      finish_type: document.getElementById('re-wall-finish')?.value || '',
      paint_type: document.getElementById('re-wall-paint')?.value?.trim() || '',
      needs_finish: document.getElementById('re-wall-needs-finish')?.checked !== false,
      notes: document.getElementById('re-wall-notes')?.value?.trim() || '',
    };

    if (wallId) {
      await DB.update('room_walls', wallId, payload);
      App.showToast('تم تحديث الجدار ✅', 'success');
    } else {
      await DB.create('room_walls', payload);
      App.showToast('تمت إضافة الجدار ✅', 'success');
    }
    this._closeModal();
    await this._refreshPane('walls', roomId);
  },

  async deleteWall(wallId, roomId) {
    App.showConfirmModal('حذف الجدار؟', 'سيتم حذف الجدار وجميع تفاصيله.', async () => {
      await DB.delete('room_walls', wallId);
      App.showToast('تم حذف الجدار', 'success');
      await this._refreshPane('walls', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — LIGHTING
  // ─────────────────────────────────────────────────────────────────────
  openAddLightingModal(roomId, data = null) {
    const isEdit = !!data;
    const d = data || {};
    const typeOptions = this.LIGHTING_TYPES.map(t =>
      `<option value="${t}" ${d.lighting_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عنصر إنارة' : 'إضافة إنارة'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع الإنارة *</label>
            <select id="re-light-type" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              ${typeOptions}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الموديل / الوصف</label>
            <input id="re-light-model" type="text" value="${App.escapeHtml(d.model || '')}"
              placeholder="مثل: GU10 LED 7W"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">الكمية *</label>
            <input id="re-light-qty" type="number" min="1" value="${d.quantity || 1}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">القدرة (W)</label>
            <input id="re-light-watt" type="number" min="0" value="${d.wattage || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">سعر الوحدة (دج)</label>
            <input id="re-light-price" type="number" min="0" value="${d.unit_price || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">تكلفة التركيب للوحدة (دج)</label>
          <input id="re-light-install" type="number" min="0" value="${d.install_cost || ''}"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-light-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveLighting('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  openEditLightingModal(itemId, roomId) {
    DB.get('room_lighting', itemId).then(d => { if (d) this.openAddLightingModal(roomId, d); });
  },

  async saveLighting(roomId, itemId = '') {
    const payload = {
      room_id: roomId,
      lighting_type: document.getElementById('re-light-type')?.value || '',
      model: document.getElementById('re-light-model')?.value?.trim() || '',
      quantity: parseInt(document.getElementById('re-light-qty')?.value || 1),
      wattage: parseFloat(document.getElementById('re-light-watt')?.value || 0) || null,
      unit_price: parseFloat(document.getElementById('re-light-price')?.value || 0),
      install_cost: parseFloat(document.getElementById('re-light-install')?.value || 0),
      notes: document.getElementById('re-light-notes')?.value?.trim() || '',
    };
    if (!payload.lighting_type) { App.showToast('اختر نوع الإنارة', 'error'); return; }
    if (itemId) { await DB.update('room_lighting', itemId, payload); } else { await DB.create('room_lighting', payload); }
    App.showToast('تم حفظ الإنارة ✅', 'success');
    this._closeModal();
    await this._refreshPane('lighting', roomId);
  },

  async deleteLighting(itemId, roomId) {
    App.showConfirmModal('حذف عنصر الإنارة؟', '', async () => {
      await DB.delete('room_lighting', itemId);
      App.showToast('تم الحذف', 'success');
      await this._refreshPane('lighting', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — DOORS
  // ─────────────────────────────────────────────────────────────────────
  async openAddDoorModal(roomId, data = null) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const isEdit = !!data;
    const d = data || {};
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${App.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل الباب' : 'إضافة باب'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم/وصف الباب</label>
            <input id="re-door-name" type="text" value="${App.escapeHtml(d.name || '')}" placeholder="مثل: الباب الرئيسي"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الجدار الذي يوجد عليه</label>
            <select id="re-door-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد --</option>
              ${wallOpts}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">العرض (م) *</label>
            <input id="re-door-w" type="number" step="0.01" min="0" value="${d.width || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع (م) *</label>
            <input id="re-door-h" type="number" step="0.01" min="0" value="${d.height || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">العدد</label>
            <input id="re-door-qty" type="number" min="1" value="${d.quantity || 1}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع الباب</label>
            <input id="re-door-type" type="text" value="${App.escapeHtml(d.door_type || '')}" placeholder="مثل: خشبي، PVC، زجاجي"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">مادة التصنيع</label>
            <input id="re-door-material" type="text" value="${App.escapeHtml(d.material || '')}" placeholder="مثل: خشب طبيعي، MDF"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اللون</label>
            <input id="re-door-color" type="text" value="${App.escapeHtml(d.color || '')}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">سعر الباب (دج)</label>
            <input id="re-door-price" type="number" min="0" value="${d.door_price || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">تكلفة التركيب (دج)</label>
            <input id="re-door-install" type="number" min="0" value="${d.install_cost || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-door-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveDoor('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditDoorModal(doorId, roomId) {
    const d = await DB.get('room_doors', doorId);
    if (d) this.openAddDoorModal(roomId, d);
  },

  async saveDoor(roomId, doorId = '') {
    const width = parseFloat(document.getElementById('re-door-w')?.value || 0);
    const height = parseFloat(document.getElementById('re-door-h')?.value || 0);
    if (!width || !height) { App.showToast('أدخل أبعاد الباب', 'error'); return; }

    const payload = {
      room_id: roomId,
      name: document.getElementById('re-door-name')?.value?.trim() || 'باب',
      wall_id: document.getElementById('re-door-wall')?.value || null,
      width, height,
      quantity: parseInt(document.getElementById('re-door-qty')?.value || 1),
      door_type: document.getElementById('re-door-type')?.value?.trim() || '',
      material: document.getElementById('re-door-material')?.value?.trim() || '',
      color: document.getElementById('re-door-color')?.value?.trim() || '',
      door_price: parseFloat(document.getElementById('re-door-price')?.value || 0),
      install_cost: parseFloat(document.getElementById('re-door-install')?.value || 0),
      notes: document.getElementById('re-door-notes')?.value?.trim() || '',
    };
    if (doorId) { await DB.update('room_doors', doorId, payload); } else { await DB.create('room_doors', payload); }
    App.showToast('تم حفظ الباب ✅', 'success');
    this._closeModal();
    await this._refreshPane('doors', roomId);
  },

  async deleteDoor(doorId, roomId) {
    App.showConfirmModal('حذف الباب؟', '', async () => {
      await DB.delete('room_doors', doorId);
      App.showToast('تم حذف الباب', 'success');
      await this._refreshPane('doors', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — WINDOWS
  // ─────────────────────────────────────────────────────────────────────
  async openAddWindowModal(roomId, data = null) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const isEdit = !!data;
    const d = data || {};
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${App.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل النافذة' : 'إضافة نافذة'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم/وصف النافذة</label>
            <input id="re-win-name" type="text" value="${App.escapeHtml(d.name || '')}" placeholder="مثل: نافذة المطل"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الجدار</label>
            <select id="re-win-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد --</option>
              ${wallOpts}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">العرض (م)</label>
            <input id="re-win-w" type="number" step="0.01" min="0" value="${d.width || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع (م)</label>
            <input id="re-win-h" type="number" step="0.01" min="0" value="${d.height || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">العدد</label>
            <input id="re-win-qty" type="number" min="1" value="${d.quantity || 1}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">نوع النافذة</label>
          <input id="re-win-type" type="text" value="${App.escapeHtml(d.window_type || '')}" placeholder="مثل: PVC، ألومنيوم، خشب"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-win-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveWindow('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditWindowModal(winId, roomId) {
    const d = await DB.get('room_windows', winId);
    if (d) this.openAddWindowModal(roomId, d);
  },

  async saveWindow(roomId, winId = '') {
    const payload = {
      room_id: roomId,
      name: document.getElementById('re-win-name')?.value?.trim() || 'نافذة',
      wall_id: document.getElementById('re-win-wall')?.value || null,
      width: parseFloat(document.getElementById('re-win-w')?.value || 0),
      height: parseFloat(document.getElementById('re-win-h')?.value || 0),
      quantity: parseInt(document.getElementById('re-win-qty')?.value || 1),
      window_type: document.getElementById('re-win-type')?.value?.trim() || '',
      notes: document.getElementById('re-win-notes')?.value?.trim() || '',
    };
    if (winId) { await DB.update('room_windows', winId, payload); } else { await DB.create('room_windows', payload); }
    App.showToast('تم حفظ النافذة ✅', 'success');
    this._closeModal();
    await this._refreshPane('doors', roomId);
  },

  async deleteWindow(winId, roomId) {
    App.showConfirmModal('حذف النافذة؟', '', async () => {
      await DB.delete('room_windows', winId);
      App.showToast('تم حذف النافذة', 'success');
      await this._refreshPane('doors', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — ELECTRICAL
  // ─────────────────────────────────────────────────────────────────────
  async openAddElectricalModal(roomId, data = null) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const isEdit = !!data;
    const d = data || {};
    const typeOpts = this.ELECTRICAL_TYPES.map(t =>
      `<option value="${t}" ${d.fixture_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${App.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عنصر كهربائي' : 'إضافة عنصر كهربائي'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">النوع *</label>
            <select id="re-elec-type" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              ${typeOpts}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الكمية *</label>
            <input id="re-elec-qty" type="number" min="1" value="${d.quantity || 1}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">الجدار</label>
            <select id="re-elec-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد --</option>
              ${wallOpts}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع عن الأرض (م)</label>
            <input id="re-elec-height" type="number" step="0.05" min="0" value="${d.height_from_floor || ''}" placeholder="مثل: 0.30"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">سعر الوحدة (دج)</label>
            <input id="re-elec-price" type="number" min="0" value="${d.unit_price || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">تكلفة التركيب (دج)</label>
            <input id="re-elec-install" type="number" min="0" value="${d.install_cost || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-elec-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveElectrical('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditElectricalModal(itemId, roomId) {
    const d = await DB.get('room_electrical', itemId);
    if (d) this.openAddElectricalModal(roomId, d);
  },

  async saveElectrical(roomId, itemId = '') {
    const payload = {
      room_id: roomId,
      fixture_type: document.getElementById('re-elec-type')?.value || '',
      quantity: parseInt(document.getElementById('re-elec-qty')?.value || 1),
      wall_id: document.getElementById('re-elec-wall')?.value || null,
      height_from_floor: parseFloat(document.getElementById('re-elec-height')?.value || 0) || null,
      unit_price: parseFloat(document.getElementById('re-elec-price')?.value || 0),
      install_cost: parseFloat(document.getElementById('re-elec-install')?.value || 0),
      notes: document.getElementById('re-elec-notes')?.value?.trim() || '',
    };
    if (itemId) { await DB.update('room_electrical', itemId, payload); } else { await DB.create('room_electrical', payload); }
    App.showToast('تم حفظ العنصر الكهربائي ✅', 'success');
    this._closeModal();
    await this._refreshPane('electrical', roomId);
  },

  async deleteElectrical(itemId, roomId) {
    App.showConfirmModal('حذف العنصر الكهربائي؟', '', async () => {
      await DB.delete('room_electrical', itemId);
      App.showToast('تم الحذف', 'success');
      await this._refreshPane('electrical', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — DECORATIONS
  // ─────────────────────────────────────────────────────────────────────
  async openAddDecorationModal(roomId, data = null) {
    const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const isEdit = !!data;
    const d = data || {};
    const decorOpts = this.DECOR_TYPES.map(t =>
      `<option value="${t}" ${d.decor_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');
    const targetOpts = this.TARGET_TYPES.map(t =>
      `<option value="${t}" ${d.target_type === t ? 'selected' : ''}>${t}</option>`
    ).join('');
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${App.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عمل ديكور' : 'إضافة عمل ديكور'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع العمل *</label>
            <select id="re-dec-type" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              ${decorOpts}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">العنوان / الوصف</label>
            <input id="re-dec-title" type="text" value="${App.escapeHtml(d.title || '')}" placeholder="وصف العمل"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">يخص</label>
            <select id="re-dec-target" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              ${targetOpts}
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">جدار محدد (اختياري)</label>
            <select id="re-dec-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- لا يخص جداراً معيناً --</option>
              ${wallOpts}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">الكمية / المساحة</label>
            <input id="re-dec-qty" type="number" step="0.01" min="0" value="${d.quantity || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الوحدة</label>
            <input id="re-dec-unit" type="text" value="${App.escapeHtml(d.unit || '')}" placeholder="م², مل, قطعة..."
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">تكلفة المواد (دج)</label>
            <input id="re-dec-mat" type="number" min="0" value="${d.material_cost || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">تكلفة اليد العاملة (دج)</label>
          <input id="re-dec-labor" type="number" min="0" value="${d.labor_cost || ''}"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-dec-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveDecoration('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditDecorationModal(itemId, roomId) {
    const d = await DB.get('room_decorations', itemId);
    if (d) this.openAddDecorationModal(roomId, d);
  },

  async saveDecoration(roomId, itemId = '') {
    const payload = {
      room_id: roomId,
      decor_type: document.getElementById('re-dec-type')?.value || '',
      title: document.getElementById('re-dec-title')?.value?.trim() || '',
      target_type: document.getElementById('re-dec-target')?.value || 'الغرفة كاملة',
      wall_id: document.getElementById('re-dec-wall')?.value || null,
      quantity: parseFloat(document.getElementById('re-dec-qty')?.value || 0) || null,
      unit: document.getElementById('re-dec-unit')?.value?.trim() || '',
      material_cost: parseFloat(document.getElementById('re-dec-mat')?.value || 0),
      labor_cost: parseFloat(document.getElementById('re-dec-labor')?.value || 0),
      notes: document.getElementById('re-dec-notes')?.value?.trim() || '',
    };
    if (itemId) { await DB.update('room_decorations', itemId, payload); } else { await DB.create('room_decorations', payload); }
    App.showToast('تم حفظ عمل الديكور ✅', 'success');
    this._closeModal();
    await this._refreshPane('decorations', roomId);
  },

  async deleteDecoration(itemId, roomId) {
    App.showConfirmModal('حذف عمل الديكور؟', '', async () => {
      await DB.delete('room_decorations', itemId);
      App.showToast('تم الحذف', 'success');
      await this._refreshPane('decorations', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // EDIT ROOM MODAL
  // ─────────────────────────────────────────────────────────────────────
  async openEditRoomModal(roomId) {
    const room = await DB.get('project_rooms', roomId);
    if (!room) return;
    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">✏️ تعديل معلومات الغرفة</h3>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-slate-400 block mb-1">اسم الغرفة *</label>
          <input id="re-room-name" type="text" value="${App.escapeHtml(room.room_name)}"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">الطول (م)</label>
            <input id="re-room-len" type="number" step="0.01" min="0" value="${room.length || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">العرض (م)</label>
            <input id="re-room-wid" type="number" step="0.01" min="0" value="${room.width || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">ارتفاع السقف (م)</label>
            <input id="re-room-hei" type="number" step="0.01" min="0" value="${room.height || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-room-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${App.escapeHtml(room.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveRoomInfo('${roomId}')"
          class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition">
          ✅ حفظ التعديلات
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async saveRoomInfo(roomId) {
    const name = document.getElementById('re-room-name')?.value?.trim();
    if (!name) { App.showToast('أدخل اسم الغرفة', 'error'); return; }
    const payload = {
      room_name: name,
      length: parseFloat(document.getElementById('re-room-len')?.value || 0),
      width: parseFloat(document.getElementById('re-room-wid')?.value || 0),
      height: parseFloat(document.getElementById('re-room-hei')?.value || 0),
      notes: document.getElementById('re-room-notes')?.value?.trim() || '',
    };
    await DB.update('project_rooms', roomId, payload);
    App.showToast('تم حفظ معلومات الغرفة ✅', 'success');
    this._closeModal();
    // Re-render workspace
    const container = document.getElementById('main-content-view');
    if (container) await this.renderWorkspaceView(container, roomId);
  },

  // ─────────────────────────────────────────────────────────────────────
  // HELPER: REFRESH A SINGLE PANE
  // ─────────────────────────────────────────────────────────────────────
  async _refreshPane(paneKey, roomId) {
    const pane = document.getElementById(`re-pane-${paneKey}`);
    if (!pane) return;
    const room = await DB.get('project_rooms', roomId);
    let html = '';
    if (paneKey === 'walls') html = await this._renderWallsPane(roomId);
    else if (paneKey === 'lighting') html = await this._renderLightingPane(roomId);
    else if (paneKey === 'doors') html = await this._renderDoorsPane(roomId);
    else if (paneKey === 'electrical') html = await this._renderElectricalPane(roomId);
    else if (paneKey === 'decorations') html = await this._renderDecorationsPane(roomId);
    else if (paneKey === 'costs' && room) html = await this._renderCostsPane(roomId, room);
    else if (paneKey === 'visual' && room) html = await this._renderVisualPane(roomId, room);
    pane.innerHTML = html;
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODAL SYSTEM
  // ─────────────────────────────────────────────────────────────────────
  _showModal(contentHTML) {
    let overlay = document.getElementById('re-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 're-modal-overlay';
      overlay.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4';
      overlay.style.backgroundColor = 'rgba(0,0,0,0.75)';
      overlay.style.backdropFilter = 'blur(4px)';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="bg-[#16161C] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" dir="rtl"
        onclick="event.stopPropagation()">
        ${contentHTML}
      </div>
    `;
    overlay.onclick = () => this._closeModal();
    overlay.classList.remove('hidden');
    // Focus first input
    setTimeout(() => overlay.querySelector('input, select, textarea')?.focus(), 100);
  },

  _closeModal() {
    const overlay = document.getElementById('re-modal-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  // ─────────────────────────────────────────────────────────────────────
  // ERROR HTML
  // ─────────────────────────────────────────────────────────────────────
  _errorHTML(msg) {
    return `
      <div class="p-8 max-w-md mx-auto my-16 text-center space-y-4">
        <div class="text-5xl">⚠️</div>
        <h3 class="text-white font-black">${msg}</h3>
        <button onclick="App.navigate('projects')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition">
          → العودة للمشاريع
        </button>
      </div>
    `;
  }
};
