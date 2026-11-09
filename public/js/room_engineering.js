/**
 * Room Engineering System — DARI LUXE ERP v31
 * Manages full room technical details: walls, protruding corners/pillars, lighting, electrical, doors, windows, decorations, costs
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
  CORNER_POSITIONS: [
    'الزاوية الأمامية اليمنى',
    'الزاوية الأمامية اليسرى',
    'الزاوية الخلفية اليمنى',
    'الزاوية الخلفية اليسرى',
    'وسط الجدار الرئيسي',
    'وسط الجدار الأمامي',
    'وسط الجدار الخلفي',
    'وسط الجدار الأيمن',
    'وسط الجدار الأيسر',
    'موقع مخصص'
  ],
  FINISH_TYPES: ['دهان عادي', 'دهان بلاستيك', 'ورق جدران', 'بلاط سيراميك', 'حجر طبيعي', 'خشب', 'جبس ديكوري', 'بدون تشطيب'],
  LIGHTING_TYPES: ['سبوت (Spot)', 'ثريا (Lustre)', 'إضاءة مخفية (Hidden)', 'شريط LED', 'LED Profile', 'إضاءة ديكورية', 'نجفة (Chandelier)', 'مصباح عادي'],
  ELECTRICAL_TYPES: ['مقبس كهرباء (Prise)', 'مفتاح إنارة (Interrupteur)', 'مقبس تلفاز (TV)', 'مقبس إنترنت', 'نقطة كهرباء مخصصة', 'نقطة توصيل إنارة', 'مقبس إضافي'],
  DOOR_SIZES: ['كبير', 'متوسط', 'صغير', 'قياس مخصص'],
  DECOR_TYPES: ['جبس ديكوري', 'سقف مستعار (BA13)', 'بلاط سيراميك', 'ورق جدران', 'دهان ديكوري', 'خشب بوازري', 'ستوكو', 'كورنيش', 'إضاءة مخفية', 'ديكور حديث', 'أعمال أخرى'],
  TARGET_TYPES: ['جدار محدد', 'السقف', 'الأرضية', 'الغرفة كاملة'],

  // Safe escape
  escapeHtml(str) {
    if (typeof App !== 'undefined' && App.escapeHtml) return App.escapeHtml(str);
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Safe confirm
  _confirm(title, msg, onConfirm) {
    const text = title + (msg ? '\n' + msg : '');
    if (window.confirm(text)) {
      onConfirm();
    }
  },

  // Safe format number
  _fmt(v) {
    if (typeof App !== 'undefined' && App.formatNumber) return App.formatNumber(v);
    const num = parseFloat(v || 0);
    return isNaN(num) ? '0' : num.toLocaleString('fr-DZ');
  },

  // ─────────────────────────────────────────────────────────────────────
  // AUTO-GENERATION OF 4 BASE WALLS
  // ─────────────────────────────────────────────────────────────────────
  async ensureDefaultWalls(room) {
    if (!room || !room.id) return [];
    let walls = await DB.query('room_walls', w => String(w.room_id) === String(room.id));
    if (walls.length === 0) {
      const L = parseFloat(room.length || 0);
      const W = parseFloat(room.width || 0);
      const H = parseFloat(room.height || 0);
      if (L > 0 && W > 0 && H > 0) {
        const defaultWalls = [
          {
            room_id: room.id,
            wall_name: 'الجدار الأمامي (Mur Avant)',
            position: 'الجدار الأمامي',
            length: L,
            height: H,
            area: L * H,
            finish_type: 'دهان بلاستيك',
            paint_type: 'ساتيني أبيض',
            needs_finish: room.include_walls_paint !== false,
            is_corner: false,
            notes: 'توليد تلقائي حسب طول الغرفة (' + L + 'م)'
          },
          {
            room_id: room.id,
            wall_name: 'الجدار الخلفي (Mur Arrière)',
            position: 'الجدار الخلفي',
            length: L,
            height: H,
            area: L * H,
            finish_type: 'دهان بلاستيك',
            paint_type: 'ساتيني أبيض',
            needs_finish: room.include_walls_paint !== false,
            is_corner: false,
            notes: 'توليد تلقائي حسب طول الغرفة (' + L + 'م)'
          },
          {
            room_id: room.id,
            wall_name: 'الجدار الجانبي الأيمن (Mur Droit)',
            position: 'الجدار الجانبي الأيمن',
            length: W,
            height: H,
            area: W * H,
            finish_type: 'دهان بلاستيك',
            paint_type: 'ساتيني أبيض',
            needs_finish: room.include_walls_paint !== false,
            is_corner: false,
            notes: 'توليد تلقائي حسب عرض الغرفة (' + W + 'م)'
          },
          {
            room_id: room.id,
            wall_name: 'الجدار الجانبي الأيسر (Mur Gauche)',
            position: 'الجدار الجانبي الأيسر',
            length: W,
            height: H,
            area: W * H,
            finish_type: 'دهان بلاستيك',
            paint_type: 'ساتيني أبيض',
            needs_finish: room.include_walls_paint !== false,
            is_corner: false,
            notes: 'توليد تلقائي حسب عرض الغرفة (' + W + 'م)'
          }
        ];
        for (const dw of defaultWalls) {
          await DB.add('room_walls', dw);
        }
        walls = await DB.query('room_walls', w => String(w.room_id) === String(room.id));
      }
    }
    return walls;
  },

  async resetDefaultWalls(roomId) {
    this._confirm('إعادة ضبط الجدران الأربعة؟', 'سيتم إعادة توليد الجدران الأربعة الأساسية تلقائياً بحسب أبعاد الغرفة الحالية مع الاحتفاظ بالزوايا والأعمدة البارزة.', async () => {
      const room = await DB.getById('project_rooms', roomId);
      if (!room) return;
      const walls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
      for (const w of walls) {
        if (!w.is_corner) {
          await DB.delete('room_walls', w.id);
        }
      }
      await this.ensureDefaultWalls(room);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تمت إعادة ضبط الجدران الأساسية تلقائياً ✅', 'success');
      await this._refreshPane('walls', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // MAIN WORKSPACE VIEW
  // ─────────────────────────────────────────────────────────────────────
  async renderWorkspaceView(container, roomId) {
    if (!roomId) {
      container.innerHTML = this._errorHTML('لم يتم تحديد غرفة');
      return;
    }

    let room = null;
    try {
      room = await DB.getById('project_rooms', roomId);
    } catch (e) {
      console.warn('Error reading room:', e);
    }

    if (!room) {
      container.innerHTML = this._errorHTML('الغرفة غير موجودة أو تم حذفها');
      return;
    }

    // Auto-generate 4 base walls if not present
    await this.ensureDefaultWalls(room);

    let project = null;
    let floor = null;
    try {
      if (room.project_id) project = await DB.getById('projects', room.project_id);
    } catch (e) { console.warn(e); }
    try {
      if (room.floor_id) floor = await DB.getById('project_floors', room.floor_id);
    } catch (e) { console.warn(e); }

    const area = (parseFloat(room.length || 0) * parseFloat(room.width || 0)).toFixed(2);
    const volume = (parseFloat(room.length || 0) * parseFloat(room.width || 0) * parseFloat(room.height || 0)).toFixed(2);
    const projName = project?.name || project?.project_name || 'المشروع';
    const floorName = floor?.floor_name || 'الطابق';

    container.innerHTML = `
      <div class="min-h-screen bg-[#0A0A0E] text-white" dir="rtl">

        <!-- Header Breadcrumb -->
        <div class="sticky top-0 z-30 bg-[#0E0E14]/95 backdrop-blur border-b border-white/8 px-4 py-3">
          <div class="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <button onclick="App.navigate('projects')" class="hover:text-white transition">📁 المشاريع</button>
            <span class="text-slate-600">›</span>
            <button onclick="App.navigate('project_workspace', '${project?.id || ''}')" class="hover:text-white transition">${this.escapeHtml(projName)}</button>
            <span class="text-slate-600">›</span>
            <span class="text-slate-500">${this.escapeHtml(floorName)}</span>
            <span class="text-slate-600">›</span>
            <span class="text-indigo-400 font-bold">📐 ${this.escapeHtml(room.room_name)}</span>
          </div>
        </div>

        <!-- Room Header Card -->
        <div class="p-4 pb-0">
          <div class="kpi-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-2xl">📐</div>
              <div>
                <h1 class="text-xl font-black text-white">${this.escapeHtml(room.room_name)}</h1>
                <p class="text-xs text-slate-400 mt-0.5">${this.escapeHtml(floorName)} • ${this.escapeHtml(projName)}</p>
                <div class="flex flex-wrap gap-2.5 mt-2 text-xs">
                  <span class="bg-blue-900/40 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/20">📏 ${room.length || 0}م × ${room.width || 0}م × H${room.height || 0}م</span>
                  <span class="bg-green-900/40 text-green-300 px-2.5 py-1 rounded-full border border-green-500/20">📐 مساحة: ${area} م²</span>
                  <span class="bg-purple-900/40 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/20">📦 حجم: ${volume} م³</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="RoomEngineering.openEditRoomModal('${room.id}')" class="px-3.5 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5 shadow">
                <span>✏️</span><span>تعديل الأبعاد</span>
              </button>
              <button onclick="App.navigate('project_workspace', '${project?.id || ''}')" class="px-3.5 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 text-xs font-bold border border-white/10 transition flex items-center gap-1.5">
                <span>←</span><span>العودة للورشة</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="px-4 mt-4 overflow-x-auto">
          <div class="flex gap-1 min-w-max bg-[#111118] rounded-2xl p-1.5 border border-white/6" id="re-tabs-nav">
            ${[
              ['walls', '🧱 الجدران والزوايا البارزة'],
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
                class="re-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${i === 0 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-white/5'}">
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
        btn.className = 're-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap bg-indigo-600 text-white shadow';
      } else {
        btn.className = 're-tab-btn px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap text-slate-400 hover:text-white hover:bg-white/5';
      }
    });
    document.querySelectorAll('[id^="re-pane-"]').forEach(pane => pane.classList.add('hidden'));
    const target = document.getElementById(`re-pane-${tabKey}`);
    if (target) target.classList.remove('hidden');
  },

  // ─────────────────────────────────────────────────────────────────────
  // WALLS & PROTRUDING CORNERS PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderWallsPane(roomId) {
    const room = await DB.getById('project_rooms', roomId);
    if (room) {
      await this.ensureDefaultWalls(room);
    }

    const allWalls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));

    const regularWalls = allWalls.filter(w => !w.is_corner);
    const cornerWalls = allWalls.filter(w => !!w.is_corner);

    // Compute regular walls net area
    let regularNetArea = 0;
    regularWalls.forEach(w => {
      let net = (parseFloat(w.length || 0) * parseFloat(w.height || 0));
      doors.filter(d => String(d.wall_id) === String(w.id)).forEach(d => {
        net -= (parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1));
      });
      windows.filter(wn => String(wn.wall_id) === String(w.id)).forEach(wn => {
        net -= (parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1));
      });
      regularNetArea += Math.max(0, net);
    });

    // Compute protruding corners area & corner beads
    let cornerTotalArea = 0;
    let totalCornerBeadsMeters = 0;
    cornerWalls.forEach(c => {
      const depth = parseFloat(c.protrusion_depth || c.length || 0);
      const width = parseFloat(c.protrusion_width || 0);
      const h = parseFloat(c.height || room?.height || 0);
      let a = parseFloat(c.area || 0);
      if (!a || a === 0) {
        if (c.corner_type === 'wall_pillar') {
          a = (2 * depth + width) * h;
        } else {
          a = (depth + width) * h;
        }
      }
      cornerTotalArea += a;
      const beads = parseInt(c.corner_beads_count || 1);
      totalCornerBeadsMeters += (beads * h);
    });

    const grandTotalWallArea = regularNetArea + cornerTotalArea;

    return `
      <div class="space-y-6">
        <!-- Top Stats Banner -->
        <div class="kpi-card rounded-2xl p-4 border border-white/6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-black text-white">إجمالي مساحة الجدران والزوايا:</span>
              <span class="text-base font-black text-green-400">${grandTotalWallArea.toFixed(2)} م²</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              ${regularWalls.length} جدران أساسية (${regularNetArea.toFixed(2)} م²) • ${cornerWalls.length} زوايا/أعمدة بارزة (${cornerTotalArea.toFixed(2)} م²)${totalCornerBeadsMeters > 0 ? ' • ' + totalCornerBeadsMeters.toFixed(1) + 'م زوايا حماية' : ''}
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="RoomEngineering.openAddCornerModal('${roomId}')" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white text-xs font-bold transition shadow flex items-center gap-1.5">
              <span>🏛️</span><span>+ إضافة زاوية بارزة / عمود</span>
            </button>
            <button onclick="RoomEngineering.openAddWallModal('${roomId}')" class="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow flex items-center gap-1">
              <span>+</span><span>جدار إضافي</span>
            </button>
            <button onclick="RoomEngineering.resetDefaultWalls('${roomId}')" class="px-3 py-2 rounded-xl bg-[#22222E] hover:bg-[#2A2A38] text-slate-300 text-xs font-bold border border-white/10 transition" title="إعادة توليد الجدران الأربعة بحسب طول وعرض الغرفة">
              🔄 إعادة ضبط
            </button>
          </div>
        </div>

        <!-- Section 1: Regular 4 Walls (Auto-generated) -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🧱</span>
              <h3 class="font-black text-white text-sm">الجدران الأساسية للغرفة (${regularWalls.length})</h3>
              <span class="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20 font-semibold">توليد آلي حسب الأبعاد</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${regularWalls.map(w => {
              const gross = parseFloat(w.length || 0) * parseFloat(w.height || 0);
              const wallDoors = doors.filter(d => String(d.wall_id) === String(w.id));
              const wallWindows = windows.filter(wn => String(wn.wall_id) === String(w.id));
              let deduct = 0;
              wallDoors.forEach(d => { deduct += parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1); });
              wallWindows.forEach(wn => { deduct += parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1); });
              const net = Math.max(0, gross - deduct);
              return `
                <div class="kpi-card rounded-xl p-4 space-y-3 border border-white/6 hover:border-indigo-500/40 transition">
                  <div class="flex items-start justify-between">
                    <div>
                      <h4 class="font-bold text-white text-sm flex items-center gap-1.5">
                        <span class="text-indigo-400">🧱</span>
                        <span>${this.escapeHtml(w.wall_name)}</span>
                      </h4>
                      <p class="text-[11px] text-slate-400 mt-0.5">${this.escapeHtml(w.position || 'جدار')}</p>
                    </div>
                    <div class="flex gap-1">
                      <button onclick="RoomEngineering.openEditWallModal('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-lg transition" title="تعديل هذا الجدار">✏️</button>
                      <button onclick="RoomEngineering.deleteWall('${w.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition" title="حذف الجدار (مثلاً صالون مفتوح)">🗑️</button>
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
                      <div class="text-slate-400">الصافي</div>
                      <div class="font-bold text-green-400">${net.toFixed(2)}م²</div>
                    </div>
                  </div>
                  ${w.finish_type ? `<div class="text-[11px] text-slate-400">نوع التشطيب: <span class="text-slate-200 font-semibold">${this.escapeHtml(w.finish_type)}</span></div>` : ''}
                  ${w.paint_type ? `<div class="text-[11px] text-slate-400">الدهان/الديكور: <span class="text-slate-200 font-semibold">${this.escapeHtml(w.paint_type)}</span></div>` : ''}
                  ${deduct > 0 ? `<div class="text-[11px] text-amber-400">خصم فتحات: -${deduct.toFixed(2)} م² (${wallDoors.length} باب، ${wallWindows.length} نافذة)</div>` : ''}
                  ${w.notes ? `<div class="text-[11px] text-slate-500 italic">${this.escapeHtml(w.notes)}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: Protruding Corners & Pillars (الزوايا والأعمدة البارزة) -->
        <div class="space-y-3 pt-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">🏛️</span>
              <h3 class="font-black text-white text-sm">الزوايا والأعمدة البارزة (Poteaux & Angles Saillants) (${cornerWalls.length})</h3>
            </div>
            <button onclick="RoomEngineering.openAddCornerModal('${roomId}')" class="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-bold transition flex items-center gap-1 shadow">
              <span>+</span><span>إضافة زاوية بارزة</span>
            </button>
          </div>

          ${cornerWalls.length === 0 ? `
            <div class="kpi-card text-center py-7 px-4 text-slate-400 text-xs rounded-xl border border-white/6 space-y-2">
              <div class="text-3xl">🏛️</div>
              <p class="font-bold text-white text-sm">لا توجد زوايا أو أعمدة بارزة في هذه الغرفة</p>
              <p class="text-slate-500 max-w-md mx-auto">
                إذا كانت الغرفة تحتوي على أعمدة خرسانية (عرصات بارزة) أو زوايا ديكورية بارزة، أضفها هنا ليتم احتساب مساحة التشطيب الإضافية وأمتار زوايا الحماية (Baguettes d'angle) تلقائياً.
              </p>
              <button onclick="RoomEngineering.openAddCornerModal('${roomId}')" class="mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow">
                + إضافة زاوية بارزة / عمود
              </button>
            </div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${cornerWalls.map(c => {
                const depth = parseFloat(c.protrusion_depth || c.length || 0);
                const width = parseFloat(c.protrusion_width || 0);
                const h = parseFloat(c.height || room?.height || 0);
                let a = parseFloat(c.area || 0);
                if (!a || a === 0) {
                  a = c.corner_type === 'wall_pillar' ? (2 * depth + width) * h : (depth + width) * h;
                }
                const beads = parseInt(c.corner_beads_count || 1);
                const beadsMeters = (beads * h).toFixed(1);

                return `
                  <div class="kpi-card rounded-xl p-4 space-y-3 border border-amber-500/30 bg-[#14141C]/80 hover:border-amber-400/50 transition">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                          <span>🏛️</span>
                          <span>${this.escapeHtml(c.wall_name)}</span>
                        </h4>
                        <p class="text-[11px] text-slate-400 mt-0.5">${this.escapeHtml(c.position || 'زاوية بارزة')} • ${c.corner_type === 'wall_pillar' ? 'عمود وسطي (3 أوجه)' : 'عمود زاوية (وجهان)'}</p>
                      </div>
                      <div class="flex gap-1">
                        <button onclick="RoomEngineering.openEditCornerModal('${c.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-900/20 rounded-lg transition" title="تعديل">✏️</button>
                        <button onclick="RoomEngineering.deleteCorner('${c.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition" title="حذف">🗑️</button>
                      </div>
                    </div>

                    <div class="grid grid-cols-4 gap-1.5 text-center text-[10px]">
                      <div class="bg-[#111118] rounded-lg p-1.5">
                        <div class="text-slate-400">البروز</div>
                        <div class="font-bold text-white text-xs mt-0.5">${depth}م</div>
                      </div>
                      <div class="bg-[#111118] rounded-lg p-1.5">
                        <div class="text-slate-400">عرض الوجه</div>
                        <div class="font-bold text-white text-xs mt-0.5">${width}م</div>
                      </div>
                      <div class="bg-[#111118] rounded-lg p-1.5">
                        <div class="text-slate-400">الارتفاع</div>
                        <div class="font-bold text-white text-xs mt-0.5">${h}م</div>
                      </div>
                      <div class="bg-[#111118] rounded-lg p-1.5 border border-amber-500/20">
                        <div class="text-slate-400">المساحة</div>
                        <div class="font-bold text-amber-300 text-xs mt-0.5">${a.toFixed(2)}م²</div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between text-[11px] bg-[#111118] p-2 rounded-lg">
                      <span class="text-slate-400">زوايا الحماية (Baguettes d'angle):</span>
                      <span class="text-amber-300 font-bold">${beads} زاوية (${beadsMeters} م طولي)</span>
                    </div>

                    ${c.finish_type ? `<div class="text-[11px] text-slate-400">التشطيب: <span class="text-slate-200 font-semibold">${this.escapeHtml(c.finish_type)}</span> ${c.paint_type ? '• ' + this.escapeHtml(c.paint_type) : ''}</div>` : ''}
                    ${c.notes ? `<div class="text-[11px] text-slate-500 italic">${this.escapeHtml(c.notes)}</div>` : ''}
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — PROTRUDING CORNERS / PILLARS (الزوايا البارزة)
  // ─────────────────────────────────────────────────────────────────────
  async openAddCornerModal(roomId, cornerData = null) {
    const isEdit = !!cornerData;
    const c = cornerData || {};
    const room = await DB.getById('project_rooms', roomId);
    const defaultH = room?.height || 3.0;

    const posOptions = this.CORNER_POSITIONS.map(p =>
      `<option value="${p}" ${c.position === p ? 'selected' : ''}>${p}</option>`
    ).join('');
    const finishOptions = this.FINISH_TYPES.map(f =>
      `<option value="${f}" ${c.finish_type === f ? 'selected' : ''}>${f}</option>`
    ).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-2 flex items-center gap-2">
        <span>🏛️</span>
        <span>${isEdit ? 'تعديل الزاوية أو العمود البارز' : 'إضافة زاوية أو عمود بارز (Poteau / Angle saillant)'}</span>
      </h3>
      <p class="text-xs text-slate-400 mb-4">يتم احتساب أوجه البروز الإضافية وزوايا الحماية المعدنية تلقائياً</p>

      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم/تعريف الزاوية البارزة *</label>
            <input id="re-corner-name" type="text" value="${this.escapeHtml(c.wall_name || 'عمود بارز 1')}"
              placeholder="مثل: عمود الزاوية اليمنى"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الموقع داخل الغرفة</label>
            <select id="re-corner-pos" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none">
              ${posOptions}
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs text-slate-400 block mb-1">شكل ونوع البروز *</label>
          <select id="re-corner-type" onchange="RoomEngineering._recalcCornerPreview()" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none">
            <option value="angle_pillar" ${c.corner_type !== 'wall_pillar' ? 'selected' : ''}>عمود في زاوية (وجهان: عرض الواجهة + عمق البروز)</option>
            <option value="wall_pillar" ${c.corner_type === 'wall_pillar' ? 'selected' : ''}>عمود بارز على جدار مسطح (3 أوجه: واجهة + عمقان جانبيان)</option>
            <option value="custom">بروز ديكوري مخصص</option>
          </select>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">عمق البروز (م) *</label>
            <input id="re-corner-depth" type="number" step="0.01" min="0" value="${c.protrusion_depth || c.length || 0.25}"
              oninput="RoomEngineering._recalcCornerPreview()"
              placeholder="0.25"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">عرض الواجهة (م) *</label>
            <input id="re-corner-width" type="number" step="0.01" min="0" value="${c.protrusion_width || 0.35}"
              oninput="RoomEngineering._recalcCornerPreview()"
              placeholder="0.35"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع (م) *</label>
            <input id="re-corner-height" type="number" step="0.01" min="0" value="${c.height || defaultH}"
              oninput="RoomEngineering._recalcCornerPreview()"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
        </div>

        <!-- Live Calculation Preview -->
        <div id="re-corner-preview-box" class="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400 block">المساحة الإضافية للتشطيب:</span>
            <strong id="re-corner-preview-area" class="text-amber-300 font-black text-sm">-- م²</strong>
          </div>
          <div class="text-left">
            <span class="text-slate-400 block">زوايا الحماية (Baguettes d'angle):</span>
            <strong id="re-corner-preview-beads" class="text-white font-bold text-xs">-- م طولي</strong>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">عدد زوايا الحماية (Baguettes)</label>
            <input id="re-corner-beads" type="number" min="0" value="${c.corner_beads_count !== undefined ? c.corner_beads_count : 1}"
              oninput="RoomEngineering._recalcCornerPreview()"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">نوع التشطيب</label>
            <select id="re-corner-finish" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none">
              <option value="بلاكو BA13 ودهان">بلاكو بلاتر BA13 ودهان</option>
              <option value="ملاط ودهان">ملاط إسمنتي ودهان</option>
              <option value="تغليف خشبي">تغليف خشبي (Boiserie)</option>
              <option value="حجر ديكوري">حجر ديكوري</option>
              ${finishOptions}
            </select>
          </div>
        </div>

        <div>
          <label class="text-xs text-slate-400 block mb-1">نوع الدهان أو الديكور</label>
          <input id="re-corner-paint" type="text" value="${this.escapeHtml(c.paint_type || 'ساتيني أبيض')}"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none"/>
        </div>

        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-corner-notes" rows="2" placeholder="ملاحظات حول هذا البروز..."
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-amber-500 focus:outline-none resize-none">${this.escapeHtml(c.notes || '')}</textarea>
        </div>
      </div>

      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveCorner('${roomId}', '${c.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ التعديلات' : '+ إضافة الزاوية/العمود'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);

    setTimeout(() => this._recalcCornerPreview(), 50);
  },

  _recalcCornerPreview() {
    const depth = parseFloat(document.getElementById('re-corner-depth')?.value || 0);
    const width = parseFloat(document.getElementById('re-corner-width')?.value || 0);
    const height = parseFloat(document.getElementById('re-corner-height')?.value || 0);
    const type = document.getElementById('re-corner-type')?.value;
    const beads = parseInt(document.getElementById('re-corner-beads')?.value || 0);

    let area = 0;
    if (type === 'wall_pillar') {
      area = (2 * depth + width) * height;
    } else {
      area = (depth + width) * height;
    }
    const beadsMeters = beads * height;

    const areaEl = document.getElementById('re-corner-preview-area');
    const beadsEl = document.getElementById('re-corner-preview-beads');
    if (areaEl) areaEl.innerText = area.toFixed(2) + ' م²';
    if (beadsEl) beadsEl.innerText = beads + ' زاوية (' + beadsMeters.toFixed(1) + ' م طولي)';
  },

  async openEditCornerModal(cornerId, roomId) {
    const c = await DB.getById('room_walls', cornerId);
    if (c) this.openAddCornerModal(roomId, c);
  },

  async saveCorner(roomId, cornerId = '') {
    const name = document.getElementById('re-corner-name')?.value?.trim();
    const depth = parseFloat(document.getElementById('re-corner-depth')?.value || 0);
    const width = parseFloat(document.getElementById('re-corner-width')?.value || 0);
    const height = parseFloat(document.getElementById('re-corner-height')?.value || 0);
    const type = document.getElementById('re-corner-type')?.value || 'angle_pillar';
    const beads = parseInt(document.getElementById('re-corner-beads')?.value || 0);

    if (!name) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل اسم الزاوية أو العمود البارز', 'error');
      return;
    }
    if (!depth && !width) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل عمق أو عرض البروز', 'error');
      return;
    }

    let calculatedArea = 0;
    if (type === 'wall_pillar') {
      calculatedArea = (2 * depth + width) * height;
    } else {
      calculatedArea = (depth + width) * height;
    }

    const payload = {
      room_id: roomId,
      wall_name: name,
      position: document.getElementById('re-corner-pos')?.value || 'الزاوية الأمامية اليمنى',
      is_corner: true,
      corner_type: type,
      protrusion_depth: depth,
      protrusion_width: width,
      length: depth, // For backward compatibility
      height: height,
      area: calculatedArea,
      corner_beads_count: beads,
      finish_type: document.getElementById('re-corner-finish')?.value || '',
      paint_type: document.getElementById('re-corner-paint')?.value?.trim() || '',
      needs_finish: true,
      notes: document.getElementById('re-corner-notes')?.value?.trim() || ''
    };

    if (cornerId) {
      await DB.update('room_walls', cornerId, payload);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم تحديث الزاوية البارزة ✅', 'success');
    } else {
      await DB.add('room_walls', payload);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تمت إضافة الزاوية البارزة بنجاح ✅', 'success');
    }
    this._closeModal();
    await this._refreshPane('walls', roomId);
  },

  async deleteCorner(cornerId, roomId) {
    this._confirm('حذف هذه الزاوية أو العمود البارز؟', '', async () => {
      await DB.delete('room_walls', cornerId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم الحذف', 'success');
      await this._refreshPane('walls', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // CEILING PANE
  // ─────────────────────────────────────────────────────────────────────
  async _renderCeilingPane(room) {
    const area = (parseFloat(room.length || 0) * parseFloat(room.width || 0)).toFixed(2);
    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">🔲 السقف والأعمال المعمارية</h3>
        <div class="kpi-card rounded-xl p-5 space-y-4 border border-white/6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">مساحة السقف</div>
              <div class="font-black text-white text-lg mt-1">${area} م²</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">نوع السقف</div>
              <div class="font-bold text-slate-200 text-sm mt-1">${this.escapeHtml(room.ceiling_type || 'عادي')}</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">دهان وتشطيب السقف</div>
              <div class="font-bold text-slate-200 text-sm mt-1">${room.include_ceiling_paint ? '✅ مشمول' : '❌ غير مشمول'}</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">ارتفاع السقف</div>
              <div class="font-bold text-white text-lg mt-1">${room.height || 0}م</div>
            </div>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            📌 لإضافة أعمال الجبس (BA13)، الأسقف المستعارة، أو كورنيش الديكور بالسقف، انتقل إلى تبويب <strong class="text-white">🎨 الديكورات والتشطيبات</strong>.
          </p>
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
            <h3 class="font-black text-white text-sm">💡 منظومة الإنارة</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} نوع مسجل • إجمالي التكلفة: <strong class="text-yellow-400">${this._fmt(total)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddLightingModal('${roomId}')" class="px-3.5 py-2 rounded-xl bg-yellow-600/90 hover:bg-yellow-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5">
            <span>+</span><span>إضافة إنارة</span>
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="kpi-card text-center py-12 text-slate-400 text-sm rounded-2xl border border-white/6 space-y-3">
            <div class="text-4xl">💡</div>
            <p class="font-bold text-white text-sm">لا توجد عناصر إنارة مضافة</p>
            <p class="text-xs text-slate-500">أضف السبوتات، الثريات، شرائط LED، وLED Profile مع تكاليف المواد والتركيب</p>
            <button onclick="RoomEngineering.openAddLightingModal('${roomId}')" class="mt-2 px-4 py-2 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold transition shadow">
              + إضافة أول عنصر إنارة
            </button>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(l => {
              const lineCost = (parseFloat(l.unit_price || 0) + parseFloat(l.install_cost || 0)) * parseInt(l.quantity || 1);
              return `
                <div class="kpi-card rounded-xl p-4 flex items-center justify-between gap-4 border border-white/6 hover:border-yellow-500/30 transition">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-yellow-600/20 text-yellow-400 flex items-center justify-center text-lg flex-shrink-0">💡</div>
                    <div class="min-w-0">
                      <div class="font-bold text-white text-sm truncate">${this.escapeHtml(l.lighting_type)}</div>
                      <div class="text-[11px] text-slate-400 truncate">${this.escapeHtml(l.model || '')} ${l.wattage ? '• ' + l.wattage + 'W' : ''}</div>
                    </div>
                  </div>
                  <div class="text-center flex-shrink-0">
                    <div class="text-xs text-slate-400">الكمية</div>
                    <div class="font-black text-white">${l.quantity || 1}</div>
                  </div>
                  <div class="text-center flex-shrink-0 hidden sm:block">
                    <div class="text-xs text-slate-400">الإجمالي</div>
                    <div class="font-bold text-yellow-400 text-sm">${this._fmt(lineCost)} دج</div>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <button onclick="RoomEngineering.openEditLightingModal('${l.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition" title="تعديل">✏️</button>
                    <button onclick="RoomEngineering.deleteLighting('${l.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition" title="حذف">🗑️</button>
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
    walls.forEach(w => { wallMap[w.id] = w.wall_name; });

    return `
      <div class="space-y-6">
        <!-- Doors Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-black text-white text-sm">🚪 الأبواب (${doors.length})</h3>
              <p class="text-xs text-slate-400">قياسات مخصصة مع الخصم التلقائي من مساحة الجدار التابع له</p>
            </div>
            <button onclick="RoomEngineering.openAddDoorModal('${roomId}')" class="px-3.5 py-1.5 rounded-xl bg-orange-700/80 hover:bg-orange-600 text-white text-xs font-bold transition shadow flex items-center gap-1">
              <span>+</span><span>إضافة باب</span>
            </button>
          </div>
          ${doors.length === 0 ? `
            <div class="text-center py-6 text-slate-500 text-xs bg-[#111118]/40 rounded-xl border border-white/5">لا توجد أبواب مسجلة لهذه الغرفة</div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${doors.map(d => `
                <div class="kpi-card rounded-xl p-4 space-y-2 border border-white/6">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-bold text-white text-sm">🚪 ${this.escapeHtml(d.name || 'باب')}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[d.wall_id] ? 'الجدار: ' + this.escapeHtml(wallMap[d.wall_id]) : 'موقع عام'}</div>
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
                  ${d.door_type ? `<div class="text-[11px] text-slate-400">النوع: <span class="text-slate-200 font-semibold">${this.escapeHtml(d.door_type)}</span></div>` : ''}
                  ${d.material ? `<div class="text-[11px] text-slate-400">المادة: <span class="text-slate-200">${this.escapeHtml(d.material)}</span></div>` : ''}
                  ${d.color ? `<div class="text-[11px] text-slate-400">اللون: <span class="text-slate-200">${this.escapeHtml(d.color)}</span></div>` : ''}
                  ${(d.door_price || d.install_cost) ? `<div class="text-[11px] text-green-400 font-bold">التكلفة: ${this._fmt((parseFloat(d.door_price||0)+parseFloat(d.install_cost||0))*parseInt(d.quantity||1))} دج</div>` : ''}
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Windows Section -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="font-black text-white text-sm">🪟 النوافذ (${windows.length})</h3>
              <p class="text-xs text-slate-400">خصم مساحة النوافذ من الجدار المعني لتقدير الدهانات بدقة</p>
            </div>
            <button onclick="RoomEngineering.openAddWindowModal('${roomId}')" class="px-3.5 py-1.5 rounded-xl bg-sky-700/80 hover:bg-sky-600 text-white text-xs font-bold transition shadow flex items-center gap-1">
              <span>+</span><span>إضافة نافذة</span>
            </button>
          </div>
          ${windows.length === 0 ? `
            <div class="text-center py-6 text-slate-500 text-xs bg-[#111118]/40 rounded-xl border border-white/5">لا توجد نوافذ مسجلة لهذه الغرفة</div>
          ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${windows.map(w => `
                <div class="kpi-card rounded-xl p-4 space-y-2 border border-white/6">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="font-bold text-white text-sm">🪟 ${this.escapeHtml(w.name || 'نافذة')}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[w.wall_id] ? 'الجدار: ' + this.escapeHtml(wallMap[w.wall_id]) : 'موقع عام'}</div>
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
                  ${w.window_type ? `<div class="text-[11px] text-slate-400">النوع: <span class="text-slate-200 font-semibold">${this.escapeHtml(w.window_type)}</span></div>` : ''}
                  ${w.notes ? `<div class="text-[11px] text-slate-500 italic">${this.escapeHtml(w.notes)}</div>` : ''}
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
    walls.forEach(w => { wallMap[w.id] = w.wall_name; });

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
            <h3 class="font-black text-white text-sm">🔌 التجهيزات والمقابس الكهربائية</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} عنصر مسجل • إجمالي: <strong class="text-orange-400">${this._fmt(total)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddElectricalModal('${roomId}')" class="px-3.5 py-2 rounded-xl bg-orange-600/90 hover:bg-orange-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5">
            <span>+</span><span>إضافة عنصر كهربائي</span>
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="kpi-card text-center py-12 text-slate-400 text-sm rounded-2xl border border-white/6 space-y-3">
            <div class="text-4xl">🔌</div>
            <p class="font-bold text-white text-sm">لا توجد تجهيزات كهربائية مضافة</p>
            <p class="text-xs text-slate-500">أضف المقابس (Prises)، مفاتيح الإنارة، مقابس التلفاز، والإنترنت مع تحديد الجدار والارتفاع عن الأرض</p>
            <button onclick="RoomEngineering.openAddElectricalModal('${roomId}')" class="mt-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow">
              + إضافة أول مقبس/مفتاح
            </button>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(e => {
              const lineCost = (parseFloat(e.unit_price || 0) + parseFloat(e.install_cost || 0)) * parseInt(e.quantity || 1);
              const icon = typeIcons[e.fixture_type] || '🔌';
              return `
                <div class="kpi-card rounded-xl p-4 flex items-center justify-between gap-4 border border-white/6 hover:border-orange-500/30 transition">
                  <div class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center text-lg flex-shrink-0">${icon}</div>
                    <div class="min-w-0">
                      <div class="font-bold text-white text-sm">${this.escapeHtml(e.fixture_type)}</div>
                      <div class="text-[11px] text-slate-400">${wallMap[e.wall_id] ? this.escapeHtml(wallMap[e.wall_id]) : 'موقع عام'} ${e.height_from_floor ? '• ارتفاع ' + e.height_from_floor + 'م' : ''}</div>
                    </div>
                  </div>
                  <div class="text-center flex-shrink-0">
                    <div class="text-xs text-slate-400">الكمية</div>
                    <div class="font-black text-white">${e.quantity || 1}</div>
                  </div>
                  <div class="text-center flex-shrink-0 hidden sm:block">
                    <div class="text-xs text-slate-400">الإجمالي</div>
                    <div class="font-bold text-orange-400 text-sm">${this._fmt(lineCost)} دج</div>
                  </div>
                  <div class="flex gap-1 flex-shrink-0">
                    <button onclick="RoomEngineering.openEditElectricalModal('${e.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition" title="تعديل">✏️</button>
                    <button onclick="RoomEngineering.deleteElectrical('${e.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition" title="حذف">🗑️</button>
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
    walls.forEach(w => { wallMap[w.id] = w.wall_name; });

    const total = items.reduce((s, d) => s + (parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0)), 0);

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-black text-white text-sm">🎨 الديكورات والتشطيبات الخاصة</h3>
            <p class="text-xs text-slate-400 mt-0.5">${items.length} عمل مسجل • إجمالي: <strong class="text-purple-400">${this._fmt(total)} دج</strong></p>
          </div>
          <button onclick="RoomEngineering.openAddDecorationModal('${roomId}')" class="px-3.5 py-2 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold transition shadow flex items-center gap-1.5">
            <span>+</span><span>إضافة عمل ديكور</span>
          </button>
        </div>
        ${items.length === 0 ? `
          <div class="kpi-card text-center py-12 text-slate-400 text-sm rounded-2xl border border-white/6 space-y-3">
            <div class="text-4xl">🎨</div>
            <p class="font-bold text-white text-sm">لا توجد أعمال ديكور مضافة</p>
            <p class="text-xs text-slate-500">أضف أعمال الجبس، الأسقف المستعارة BA13، الديكورات الخشبية، البلاط، والدهانات العصرية</p>
            <button onclick="RoomEngineering.openAddDecorationModal('${roomId}')" class="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow">
              + إضافة أول عمل ديكور
            </button>
          </div>
        ` : `
          <div class="space-y-2">
            ${items.map(d => {
              const lineCost = parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0);
              const target = d.wall_id && wallMap[d.wall_id] ? wallMap[d.wall_id] : (d.target_type || 'الغرفة كاملة');
              return `
                <div class="kpi-card rounded-xl p-4 border border-white/6 hover:border-purple-500/30 transition">
                  <div class="flex items-start justify-between gap-4">
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-white text-sm">${this.escapeHtml(d.title || d.decor_type)}</div>
                      <div class="text-[11px] text-slate-400 mt-0.5">${this.escapeHtml(d.decor_type)} • مرتبط بـ: ${this.escapeHtml(target)}</div>
                      ${d.quantity ? `<div class="text-[11px] text-slate-400 mt-1">الكمية: ${d.quantity} ${this.escapeHtml(d.unit || '')}</div>` : ''}
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="font-bold text-purple-400 text-sm">${this._fmt(lineCost)} دج</div>
                      <div class="text-[10px] text-slate-500">مواد: ${this._fmt(d.material_cost)} | يد: ${this._fmt(d.labor_cost)}</div>
                    </div>
                    <div class="flex gap-1 flex-shrink-0">
                      <button onclick="RoomEngineering.openEditDecorationModal('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg transition">✏️</button>
                      <button onclick="RoomEngineering.deleteDecoration('${d.id}', '${roomId}')" class="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition">🗑️</button>
                    </div>
                  </div>
                  ${d.notes ? `<div class="text-[11px] text-slate-500 italic mt-2">${this.escapeHtml(d.notes)}</div>` : ''}
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
    const allWalls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));
    const lighting = await DB.query('room_lighting', l => String(l.room_id) === String(roomId));
    const electrical = await DB.query('room_electrical', e => String(e.room_id) === String(roomId));
    const decorations = await DB.query('room_decorations', d => String(d.room_id) === String(roomId));

    const area = parseFloat(room.length || 0) * parseFloat(room.width || 0);

    const regularWalls = allWalls.filter(w => !w.is_corner);
    const cornerWalls = allWalls.filter(w => !!w.is_corner);

    let regularNetArea = 0;
    regularWalls.forEach(w => {
      let net = parseFloat(w.length || 0) * parseFloat(w.height || 0);
      doors.filter(d => String(d.wall_id) === String(w.id)).forEach(d => {
        net -= parseFloat(d.width || 0) * parseFloat(d.height || 0) * parseInt(d.quantity || 1);
      });
      windows.filter(wn => String(wn.wall_id) === String(w.id)).forEach(wn => {
        net -= parseFloat(wn.width || 0) * parseFloat(wn.height || 0) * parseInt(wn.quantity || 1);
      });
      regularNetArea += Math.max(0, net);
    });

    let cornerArea = 0;
    let cornerBeadsMeters = 0;
    cornerWalls.forEach(c => {
      const depth = parseFloat(c.protrusion_depth || c.length || 0);
      const width = parseFloat(c.protrusion_width || 0);
      const h = parseFloat(c.height || room.height || 0);
      let a = parseFloat(c.area || 0);
      if (!a || a === 0) {
        a = c.corner_type === 'wall_pillar' ? (2 * depth + width) * h : (depth + width) * h;
      }
      cornerArea += a;
      cornerBeadsMeters += (parseInt(c.corner_beads_count || 1) * h);
    });

    const totalWallNetArea = regularNetArea + cornerArea;

    const costLighting = lighting.reduce((s, l) => s + ((parseFloat(l.unit_price || 0) + parseFloat(l.install_cost || 0)) * parseInt(l.quantity || 1)), 0);
    const costElectrical = electrical.reduce((s, e) => s + ((parseFloat(e.unit_price || 0) + parseFloat(e.install_cost || 0)) * parseInt(e.quantity || 1)), 0);
    const costDoors = doors.reduce((s, d) => s + ((parseFloat(d.door_price || 0) + parseFloat(d.install_cost || 0)) * parseInt(d.quantity || 1)), 0);
    const costDecorations = decorations.reduce((s, d) => s + parseFloat(d.material_cost || 0) + parseFloat(d.labor_cost || 0), 0);
    const grandTotal = costLighting + costElectrical + costDoors + costDecorations;

    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">💰 ملخص القياسات والتكاليف الشاملة</h3>

        <!-- Areas Summary -->
        <div class="kpi-card rounded-xl p-4 space-y-3 border border-white/6">
          <h4 class="font-bold text-slate-300 text-xs uppercase tracking-wider">📐 ملخص المساحات</h4>
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
              <div class="text-slate-400">مجموع الجدران الصافية</div>
              <div class="font-black text-green-400 text-base mt-1">${totalWallNetArea.toFixed(2)}</div>
              <div class="text-slate-500">م² (يشمل الزوايا)</div>
            </div>
            <div class="bg-[#111118] rounded-xl p-3">
              <div class="text-slate-400">زوايا الحماية المعدنية</div>
              <div class="font-black text-amber-400 text-base mt-1">${cornerBeadsMeters.toFixed(1)}</div>
              <div class="text-slate-500">متر طولي (Baguettes)</div>
            </div>
          </div>
        </div>

        <!-- Costs Breakdown -->
        <div class="kpi-card rounded-xl p-4 space-y-3 border border-white/6">
          <h4 class="font-bold text-slate-300 text-xs uppercase tracking-wider">💵 التكاليف المباشرة</h4>
          <div class="space-y-2 text-sm">
            ${[
              ['💡 منظومة الإنارة', costLighting, lighting.length + ' بند إنارة'],
              ['🔌 المقابس والكهرباء', costElectrical, electrical.length + ' عنصر وتجهيز'],
              ['🚪 الأبواب وتكاليف التركيب', costDoors, doors.length + ' باب مسجل'],
              ['🎨 الديكورات والتشطيبات', costDecorations, decorations.length + ' عمل ديكور'],
            ].map(([label, cost, count]) => `
              <div class="flex items-center justify-between p-3 rounded-xl bg-[#111118]">
                <div>
                  <div class="font-bold text-white text-xs">${label}</div>
                  <div class="text-[11px] text-slate-500">${count}</div>
                </div>
                <div class="font-black text-white">${this._fmt(cost)} <span class="text-slate-500 text-xs font-normal">دج</span></div>
              </div>
            `).join('')}

            <div class="flex items-center justify-between p-4 rounded-xl bg-gradient-to-l from-indigo-900/50 to-indigo-800/30 border border-indigo-500/40 shadow-lg">
              <div class="font-black text-white text-sm">التكلفة التقديرية الإجمالية للغرفة</div>
              <div class="font-black text-indigo-300 text-lg">${this._fmt(grandTotal)} <span class="text-slate-400 text-xs font-normal">دج</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // VISUAL PLAN PANE (SVG Top-Down with Protruding Corners)
  // ─────────────────────────────────────────────────────────────────────
  async _renderVisualPane(roomId, room) {
    const allWalls = await DB.query('room_walls', w => String(w.room_id) === String(roomId));
    const doors = await DB.query('room_doors', d => String(d.room_id) === String(roomId));
    const windows = await DB.query('room_windows', w => String(w.room_id) === String(roomId));
    const electrical = await DB.query('room_electrical', e => String(e.room_id) === String(roomId));
    const lighting = await DB.query('room_lighting', l => String(l.room_id) === String(roomId));

    const regularWalls = allWalls.filter(w => !w.is_corner);
    const cornerWalls = allWalls.filter(w => !!w.is_corner);

    const W = parseFloat(room.width || 4);
    const L = parseFloat(room.length || 5);
    const scale = 55;
    const pad = 50;
    const svgW = L * scale + pad * 2;
    const svgH = W * scale + pad * 2;

    const totalSpots = lighting.filter(l => (l.lighting_type || '').includes('سبوت') || (l.lighting_type || '').includes('Spot')).reduce((s, l) => s + parseInt(l.quantity || 1), 0);
    const totalOutlets = electrical.filter(e => (e.fixture_type || '').includes('مقبس')).reduce((s, e) => s + parseInt(e.quantity || 1), 0);
    const totalSwitches = electrical.filter(e => (e.fixture_type || '').includes('مفتاح')).reduce((s, e) => s + parseInt(e.quantity || 1), 0);

    return `
      <div class="space-y-4">
        <h3 class="font-black text-white text-sm">🗺️ المخطط المرئي الهندسي للغرفة</h3>
        <div class="kpi-card rounded-xl p-4 border border-white/6">
          <div class="overflow-x-auto py-2">
            <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" class="mx-auto block max-w-full">
              <!-- Room outline -->
              <rect x="${pad}" y="${pad}" width="${L * scale}" height="${W * scale}"
                fill="#161622" stroke="#6366f1" stroke-width="3" rx="4"/>

              <!-- Dimensions labels -->
              <text x="${pad + L * scale / 2}" y="${pad - 12}" text-anchor="middle" font-size="13" fill="#94a3b8" font-family="Arial">${L}م (طول)</text>
              <text x="${pad - 12}" y="${pad + W * scale / 2}" text-anchor="middle" font-size="13" fill="#94a3b8" font-family="Arial" transform="rotate(-90, ${pad - 12}, ${pad + W * scale / 2})">${W}م (عرض)</text>

              <!-- Compass labels -->
              <text x="${pad + L * scale / 2}" y="${pad + W * scale + 24}" text-anchor="middle" font-size="12" fill="#64748b" font-family="Arial">الجدار الأمامي</text>
              <text x="${pad + L * scale / 2}" y="${pad - 28}" text-anchor="middle" font-size="12" fill="#64748b" font-family="Arial">الجدار الخلفي</text>

              <!-- Ceiling center light -->
              <circle cx="${pad + L * scale / 2}" cy="${pad + W * scale / 2}" r="${Math.min(L, W) * scale / 5}"
                fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
              <text x="${pad + L * scale / 2}" y="${pad + W * scale / 2 + 5}" text-anchor="middle" font-size="14" fill="#facc15" font-family="Arial">💡</text>

              <!-- Protruding Corners (Pillars) drawn on the 4 corners/walls -->
              ${cornerWalls.map((c, idx) => {
                const pos = c.position || '';
                let cx = pad, cy = pad, pw = 16, ph = 16;
                if (pos.includes('أمامية') && pos.includes('يمنى')) {
                  cx = pad + L * scale - 18; cy = pad + W * scale - 18;
                } else if (pos.includes('أمامية') && pos.includes('يسرى')) {
                  cx = pad + 2; cy = pad + W * scale - 18;
                } else if (pos.includes('خلفية') && pos.includes('يمنى')) {
                  cx = pad + L * scale - 18; cy = pad + 2;
                } else if (pos.includes('خلفية') && pos.includes('يسرى')) {
                  cx = pad + 2; cy = pad + 2;
                } else {
                  cx = pad + 20 + idx * 30; cy = pad + 2;
                }
                return `
                  <rect x="${cx}" y="${cy}" width="${pw}" height="${ph}" fill="#f59e0b" stroke="#fbbf24" stroke-width="1.5" rx="2"/>
                  <text x="${cx + pw / 2}" y="${cy + ph / 2 + 3}" text-anchor="middle" font-size="8" fill="#1e1b4b" font-weight="black" font-family="Arial">🏛️</text>
                `;
              }).join('')}

              <!-- Door symbols -->
              ${doors.slice(0, 3).map((d, i) => {
                const x = pad + 25 + i * 45;
                const y = pad + W * scale;
                return `
                  <rect x="${x - 10}" y="${y - 4}" width="20" height="6" fill="#f97316" rx="2"/>
                  <text x="${x}" y="${y + 16}" text-anchor="middle" font-size="11" fill="#f97316" font-family="Arial">🚪</text>
                `;
              }).join('')}

              <!-- Window symbols -->
              ${windows.slice(0, 3).map((w, i) => {
                const x = pad + 35 + i * 50;
                const y = pad;
                return `
                  <rect x="${x - 12}" y="${y - 3}" width="24" height="5" fill="#38bdf8" rx="1"/>
                  <text x="${x}" y="${y - 10}" text-anchor="middle" font-size="11" fill="#38bdf8" font-family="Arial">🪟</text>
                `;
              }).join('')}
            </svg>
          </div>

          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-4 text-xs justify-center border-t border-white/5 pt-3">
            <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-full bg-indigo-500"></div><span class="text-slate-400">جدار أساسي</span></div>
            <div class="flex items-center gap-1.5"><div class="w-3 h-3 rounded-sm bg-amber-500"></div><span class="text-slate-400">زاوية/عمود بارز</span></div>
            <div class="flex items-center gap-1.5"><span>🚪</span><span class="text-slate-400">باب</span></div>
            <div class="flex items-center gap-1.5"><span>🪟</span><span class="text-slate-400">نافذة</span></div>
            <div class="flex items-center gap-1.5"><span>💡</span><span class="text-slate-400">إنارة</span></div>
          </div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div class="kpi-card rounded-xl p-3 border border-white/6">
            <div class="text-2xl">🧱</div>
            <div class="font-black text-white text-xl mt-1">${regularWalls.length}</div>
            <div class="text-slate-400">جدران أساسية</div>
          </div>
          <div class="kpi-card rounded-xl p-3 border border-amber-500/30">
            <div class="text-2xl">🏛️</div>
            <div class="font-black text-amber-300 text-xl mt-1">${cornerWalls.length}</div>
            <div class="text-slate-400">زوايا/أعمدة بارزة</div>
          </div>
          <div class="kpi-card rounded-xl p-3 border border-white/6">
            <div class="text-2xl">💡</div>
            <div class="font-black text-yellow-400 text-xl mt-1">${totalSpots}</div>
            <div class="text-slate-400">سبوت إنارة</div>
          </div>
          <div class="kpi-card rounded-xl p-3 border border-white/6">
            <div class="text-2xl">🔌</div>
            <div class="font-black text-orange-400 text-xl mt-1">${totalOutlets}</div>
            <div class="text-slate-400">مقابس</div>
          </div>
        </div>
      </div>
    `;
  },

  // ─────────────────────────────────────────────────────────────────────
  // MODALS — REGULAR WALLS
  // ─────────────────────────────────────────────────────────────────────
  openAddWallModal(roomId, wallData = null) {
    const isEdit = !!wallData;
    const title = isEdit ? 'تعديل الجدار' : 'إضافة جدار مخصص';
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
            <input id="re-wall-name" type="text" value="${this.escapeHtml(w.wall_name || '')}"
              placeholder="مثل: جدار الديكور"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الموقع</label>
            <select id="re-wall-position" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- اختر الموقع --</option>
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
            <input id="re-wall-paint" type="text" value="${this.escapeHtml(w.paint_type || '')}"
              placeholder="مثل: دهان ساتيني أبيض"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="flex items-center gap-3 pt-1">
          <input id="re-wall-needs-finish" type="checkbox" ${w.needs_finish !== false ? 'checked' : ''} class="w-4 h-4 rounded accent-indigo-500"/>
          <label for="re-wall-needs-finish" class="text-sm text-slate-300">يحتاج هذا الجدار إلى تشطيب ودهان</label>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-wall-notes" rows="2" placeholder="ملاحظات إضافية..."
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(w.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveWall('${roomId}', '${w.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ التعديلات' : '+ إضافة الجدار'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition hover:bg-[#2A2A38]">
          إلغاء
        </button>
      </div>
    `);
  },

  async openEditWallModal(wallId, roomId) {
    const w = await DB.getById('room_walls', wallId);
    if (w) this.openAddWallModal(roomId, w);
  },

  async saveWall(roomId, wallId = '') {
    const name = document.getElementById('re-wall-name')?.value?.trim();
    const length = parseFloat(document.getElementById('re-wall-length')?.value || 0);
    const height = parseFloat(document.getElementById('re-wall-height')?.value || 0);
    if (!name) { if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل اسم الجدار', 'error'); return; }
    if (!length || !height) { if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل أبعاد الجدار', 'error'); return; }

    const payload = {
      room_id: roomId,
      wall_name: name,
      position: document.getElementById('re-wall-position')?.value || '',
      length,
      height,
      area: length * height,
      is_corner: false,
      finish_type: document.getElementById('re-wall-finish')?.value || '',
      paint_type: document.getElementById('re-wall-paint')?.value?.trim() || '',
      needs_finish: document.getElementById('re-wall-needs-finish')?.checked !== false,
      notes: document.getElementById('re-wall-notes')?.value?.trim() || '',
    };

    if (wallId) {
      await DB.update('room_walls', wallId, payload);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم تحديث الجدار ✅', 'success');
    } else {
      await DB.add('room_walls', payload);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تمت إضافة الجدار ✅', 'success');
    }
    this._closeModal();
    await this._refreshPane('walls', roomId);
  },

  async deleteWall(wallId, roomId) {
    this._confirm('حذف الجدار؟', 'سيتم حذف الجدار وجميع تفاصيله.', async () => {
      await DB.delete('room_walls', wallId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حذف الجدار بنجاح', 'success');
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
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عنصر إنارة' : 'إضافة إنارة للغرفة'}</h3>
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
            <input id="re-light-model" type="text" value="${this.escapeHtml(d.model || '')}"
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
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveLighting('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ' : '+ إضافة الإنارة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditLightingModal(itemId, roomId) {
    const d = await DB.getById('room_lighting', itemId);
    if (d) this.openAddLightingModal(roomId, d);
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
    if (!payload.lighting_type) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('اختر نوع الإنارة', 'error');
      return;
    }
    if (itemId) {
      await DB.update('room_lighting', itemId, payload);
    } else {
      await DB.add('room_lighting', payload);
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ الإنارة ✅', 'success');
    this._closeModal();
    await this._refreshPane('lighting', roomId);
  },

  async deleteLighting(itemId, roomId) {
    this._confirm('حذف عنصر الإنارة؟', '', async () => {
      await DB.delete('room_lighting', itemId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم الحذف', 'success');
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
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${this.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل الباب' : 'إضافة باب جديد'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم/وصف الباب</label>
            <input id="re-door-name" type="text" value="${this.escapeHtml(d.name || '')}" placeholder="مثل: الباب الرئيسي"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الجدار التابع له</label>
            <select id="re-door-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد جدار --</option>
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
            <input id="re-door-type" type="text" value="${this.escapeHtml(d.door_type || '')}" placeholder="مثل: خشبي، PVC، زجاجي"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">مادة التصنيع</label>
            <input id="re-door-material" type="text" value="${this.escapeHtml(d.material || '')}" placeholder="مثل: MDF، خشب زان"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اللون</label>
            <input id="re-door-color" type="text" value="${this.escapeHtml(d.color || '')}"
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
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveDoor('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ' : '+ إضافة الباب'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditDoorModal(doorId, roomId) {
    const d = await DB.getById('room_doors', doorId);
    if (d) this.openAddDoorModal(roomId, d);
  },

  async saveDoor(roomId, doorId = '') {
    const width = parseFloat(document.getElementById('re-door-w')?.value || 0);
    const height = parseFloat(document.getElementById('re-door-h')?.value || 0);
    if (!width || !height) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل أبعاد الباب', 'error');
      return;
    }

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
    if (doorId) {
      await DB.update('room_doors', doorId, payload);
    } else {
      await DB.add('room_doors', payload);
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ الباب ✅', 'success');
    this._closeModal();
    await this._refreshPane('doors', roomId);
  },

  async deleteDoor(doorId, roomId) {
    this._confirm('حذف الباب؟', '', async () => {
      await DB.delete('room_doors', doorId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حذف الباب', 'success');
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
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${this.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل النافذة' : 'إضافة نافذة جديدة'}</h3>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">اسم/وصف النافذة</label>
            <input id="re-win-name" type="text" value="${this.escapeHtml(d.name || '')}" placeholder="مثل: نافذة الصالون"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الجدار التابع له</label>
            <select id="re-win-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد جدار --</option>
              ${wallOpts}
            </select>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">العرض (م) *</label>
            <input id="re-win-w" type="number" step="0.01" min="0" value="${d.width || ''}"
              class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">الارتفاع (م) *</label>
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
          <input id="re-win-type" type="text" value="${this.escapeHtml(d.window_type || '')}" placeholder="مثل: ألومنيوم مزدوج، PVC"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none"/>
        </div>
        <div>
          <label class="text-xs text-slate-400 block mb-1">ملاحظات</label>
          <textarea id="re-win-notes" rows="2"
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveWindow('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ' : '+ إضافة النافذة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditWindowModal(winId, roomId) {
    const d = await DB.getById('room_windows', winId);
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
    if (winId) {
      await DB.update('room_windows', winId, payload);
    } else {
      await DB.add('room_windows', payload);
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ النافذة ✅', 'success');
    this._closeModal();
    await this._refreshPane('doors', roomId);
  },

  async deleteWindow(winId, roomId) {
    this._confirm('حذف النافذة؟', '', async () => {
      await DB.delete('room_windows', winId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حذف النافذة', 'success');
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
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${this.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عنصر كهربائي' : 'إضافة تجهيز كهربائي'}</h3>
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
            <label class="text-xs text-slate-400 block mb-1">الجدار التابع له</label>
            <select id="re-elec-wall" class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none">
              <option value="">-- بدون تحديد جدار --</option>
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
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveElectrical('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ' : '+ إضافة'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditElectricalModal(itemId, roomId) {
    const d = await DB.getById('room_electrical', itemId);
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
    if (itemId) {
      await DB.update('room_electrical', itemId, payload);
    } else {
      await DB.add('room_electrical', payload);
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ العنصر الكهربائي ✅', 'success');
    this._closeModal();
    await this._refreshPane('electrical', roomId);
  },

  async deleteElectrical(itemId, roomId) {
    this._confirm('حذف العنصر الكهربائي؟', '', async () => {
      await DB.delete('room_electrical', itemId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم الحذف', 'success');
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
    const wallOpts = walls.map(w => `<option value="${w.id}" ${d.wall_id === w.id ? 'selected' : ''}>${this.escapeHtml(w.wall_name)}</option>`).join('');

    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">${isEdit ? 'تعديل عمل ديكور' : 'إضافة عمل ديكور وتشطيب'}</h3>
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
            <input id="re-dec-title" type="text" value="${this.escapeHtml(d.title || '')}" placeholder="مثل: ديكور بلاكو شاشة التلفاز"
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
            <input id="re-dec-unit" type="text" value="${this.escapeHtml(d.unit || '')}" placeholder="م², مل, قطعة..."
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
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(d.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveDecoration('${roomId}', '${d.id || ''}')"
          class="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm transition shadow">
          ${isEdit ? '✅ حفظ' : '+ إضافة الديكور'}
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async openEditDecorationModal(itemId, roomId) {
    const d = await DB.getById('room_decorations', itemId);
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
    if (itemId) {
      await DB.update('room_decorations', itemId, payload);
    } else {
      await DB.add('room_decorations', payload);
    }
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ عمل الديكور ✅', 'success');
    this._closeModal();
    await this._refreshPane('decorations', roomId);
  },

  async deleteDecoration(itemId, roomId) {
    this._confirm('حذف عمل الديكور؟', '', async () => {
      await DB.delete('room_decorations', itemId);
      if (typeof App !== 'undefined' && App.showToast) App.showToast('تم الحذف', 'success');
      await this._refreshPane('decorations', roomId);
    });
  },

  // ─────────────────────────────────────────────────────────────────────
  // EDIT ROOM MODAL
  // ─────────────────────────────────────────────────────────────────────
  async openEditRoomModal(roomId) {
    const room = await DB.getById('project_rooms', roomId);
    if (!room) return;
    this._showModal(`
      <h3 class="text-base font-black text-white mb-5">✏️ تعديل قياسات ومعلومات الغرفة</h3>
      <div class="space-y-3">
        <div>
          <label class="text-xs text-slate-400 block mb-1">اسم الغرفة *</label>
          <input id="re-room-name" type="text" value="${this.escapeHtml(room.room_name)}"
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
            class="w-full bg-[#111118] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none">${this.escapeHtml(room.notes || '')}</textarea>
        </div>
      </div>
      <div class="flex gap-3 mt-5">
        <button onclick="RoomEngineering.saveRoomInfo('${roomId}')"
          class="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition shadow">
          ✅ حفظ التعديلات
        </button>
        <button onclick="RoomEngineering._closeModal()" class="px-5 py-3 rounded-xl bg-[#22222E] text-slate-300 font-bold text-sm border border-white/10 transition">إلغاء</button>
      </div>
    `);
  },

  async saveRoomInfo(roomId) {
    const name = document.getElementById('re-room-name')?.value?.trim();
    if (!name) {
      if (typeof App !== 'undefined' && App.showToast) App.showToast('أدخل اسم الغرفة', 'error');
      return;
    }
    const payload = {
      room_name: name,
      length: parseFloat(document.getElementById('re-room-len')?.value || 0),
      width: parseFloat(document.getElementById('re-room-wid')?.value || 0),
      height: parseFloat(document.getElementById('re-room-hei')?.value || 0),
      notes: document.getElementById('re-room-notes')?.value?.trim() || '',
    };
    await DB.update('project_rooms', roomId, payload);
    if (typeof App !== 'undefined' && App.showToast) App.showToast('تم حفظ معلومات الغرفة ✅', 'success');
    this._closeModal();
    const container = document.getElementById('main-content-view');
    if (container) await this.renderWorkspaceView(container, roomId);
  },

  // ─────────────────────────────────────────────────────────────────────
  // HELPER: REFRESH A SINGLE PANE
  // ─────────────────────────────────────────────────────────────────────
  async _refreshPane(paneKey, roomId) {
    const pane = document.getElementById(`re-pane-${paneKey}`);
    if (!pane) return;
    const room = await DB.getById('project_rooms', roomId);
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
        <button onclick="App.navigate('building_structure')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition">
          → العودة إلى هيكل المبنى والغرف
        </button>
      </div>
    `;
  }
};
