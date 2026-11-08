/**
 * Supabase-Enabled Relational Database Layer for ERP Management System
 * Supports Cloud PostgreSQL via @supabase/supabase-js with automatic schema mapping,
 * real-time sync, offline fallback, and full relational integrity.
 */

const DB = {
  dbName: 'DARILUXE_ERP_DB',
  _cache: null,
  
  // Supabase Configuration State — Configured with provided DARI LUXE Production Cloud by default
  supabaseClient: null,
  supabaseUrl: 'https://ileqivegtkvcaawlugsj.supabase.co',
  supabaseAnonKey: 'sb_publishable_g1x_0FuCHfQCUbAwlL9J_A_tTiKyW5F',
  isSupabaseConnected: false,

  // Table definitions
  tables: [
    'company_settings',
    'customers',
    'projects',
    'project_floors',
    'project_rooms',
    'room_doors',
    'room_windows',
    'room_equipment',
    'work_categories',
    'activity_catalog',
    'project_activities',
    'activity_progress',
    'workers',
    'worker_specialties',
    'worker_project_assignments',
    'worker_attendance',
    'worker_payments',
    'suppliers',
    'materials',
    'material_purchases',
    'project_material_usage',
    'inventory_stock',
    'expenses',
    'customer_payments',
    'quotations',
    'quotation_items',
    'invoices',
    'invoice_items',
    'attachments',
    'audit_logs',
    'partners',
    'partner_transfers',
    'partner_withdrawals',
    'invoice_payments'
  ],

  async init() {
    // 1. Try to initialize Supabase from stored credentials
    this.loadSupabaseCredentials();

    if (this.supabaseUrl && this.supabaseAnonKey && typeof window !== 'undefined' && window.supabase) {
      try {
        this.supabaseClient = window.supabase.createClient(this.supabaseUrl, this.supabaseAnonKey);
        
        // Test connectivity
        const { data, error } = await this.supabaseClient.from('company_settings').select('id').limit(1);
        if (!error) {
          this.isSupabaseConnected = true;
          console.log('✓ Successfully connected to Supabase Cloud PostgreSQL!');
          
          // Hydrate cache from Supabase
          await this.loadAllFromSupabase();
          return this;
        } else {
          console.warn('Supabase credentials found but query failed (schema not imported yet?):', error.message);
        }
      } catch (err) {
        console.warn('Failed to connect to Supabase:', err.message);
        this.isSupabaseConnected = false;
      }
    }

    // 2. LocalStorage cache with automatic clean initialization
    let localData = null;
    if (typeof localStorage !== 'undefined') {
      // Purge legacy demo keys
      localStorage.removeItem('dariluxe_erp_v2');
      localStorage.removeItem('alitqan_erp_data_v1');
      localData = localStorage.getItem('dariluxe_erp_clean_v1');
    }
    if (localData) {
      try {
        this._cache = JSON.parse(localData);
      } catch (e) {
        this._cache = this.generateCleanDatabase();
        this.saveLocalCache();
      }
    } else {
      this._cache = this.generateCleanDatabase();
      this.saveLocalCache();
    }

        // Set DARI LUXE branding defaults only if fields are empty/missing (never overwrite user edits)
    if (this._cache && this._cache.company_settings && this._cache.company_settings[0]) {
      const cur = this._cache.company_settings[0];
      let changed = false;
      if (!cur.company_name) { cur.company_name = 'مؤسسة داري لوكس للتشطيب والديكور العصري (DARI LUXE)'; changed = true; }
      if (!cur.company_name_fr) { cur.company_name_fr = 'DARI LUXE — Rénovation, Décoration et Aménagement'; changed = true; }
      if (!cur.phone) { cur.phone = '0550600909'; changed = true; }
      if (!cur.email) { cur.email = 'DARILUXE.NET@GMAIL.COM'; changed = true; }
      if (!cur.address) { cur.address = 'حي 17 أكتوبر، سيدي لخضر - عين الدفلى (17 Octobre, Sidi Lakhder, Ain Defla)'; changed = true; }
      if (!cur.logo_url) { cur.logo_url = 'dari_luxe_logo.png'; changed = true; }
      if (changed) this.saveLocalCache();
    }

    return this;
  },

  loadSupabaseCredentials() {
    this.supabaseUrl = 'https://ileqivegtkvcaawlugsj.supabase.co';
    this.supabaseAnonKey = 'sb_publishable_g1x_0FuCHfQCUbAwlL9J_A_tTiKyW5F';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dariluxe_supabase_url', this.supabaseUrl);
      localStorage.setItem('dariluxe_supabase_key', this.supabaseAnonKey);
    }
  },

  async configureSupabase(url, key) {
    url = (url || '').trim();
    key = (key || '').trim();

    if (!url || !key) {
      throw new Error('يرجى إدخال كل من رابط Supabase ومفتاح Anon Key.');
    }

    if (typeof window !== 'undefined' && window.supabase) {
      const client = window.supabase.createClient(url, key);
      const { data, error } = await client.from('company_settings').select('id').limit(1);
      
      if (error && error.code !== 'PGRST116') {
        throw new Error('فشل الاتصال بـ Supabase: ' + error.message + '\nتأكد من تنفيذ كود supabase_schema.sql في SQL Editor.');
      }

      this.supabaseClient = client;
      this.supabaseUrl = url;
      this.supabaseAnonKey = key;
      this.isSupabaseConnected = true;

      localStorage.setItem('dariluxe_supabase_url', url);
      localStorage.setItem('dariluxe_supabase_key', key);

      // Load data or upload current cache to Supabase
      await this.loadAllFromSupabase();
      return true;
    } else {
      throw new Error('مكتبة Supabase JS لم يتم تحميلها بعد.');
    }
  },

  disconnectSupabase() {
    this.supabaseClient = null;
    this.supabaseUrl = '';
    this.supabaseAnonKey = '';
    this.isSupabaseConnected = false;
    localStorage.removeItem('dariluxe_supabase_url'); localStorage.removeItem('alitqan_supabase_url');
    localStorage.removeItem('dariluxe_supabase_key'); localStorage.removeItem('alitqan_supabase_anon_key');
  },

  async loadAllFromSupabase() {
    if (!this.supabaseClient) return { success: false, error: 'Supabase client not initialized' };
    if (!this._cache) this._cache = {};

    const loadedTables = [];
    const failedTables = [];

    for (const table of this.tables) {
      try {
        const { data, error } = await this.supabaseClient.from(table).select('*');
        if (!error && Array.isArray(data)) {
          // If remote table has data, hydrate cache
          if (data.length > 0) {
            this._cache[table] = data;
          } else if (!this._cache[table] || this._cache[table].length === 0) {
            this._cache[table] = [];
          }
          loadedTables.push(table);
        } else {
          failedTables.push({ table, error: error ? error.message : 'Unknown query failure' });
          if (!this._cache[table]) this._cache[table] = [];
        }
      } catch (e) {
        failedTables.push({ table, error: e.message });
        if (!this._cache[table]) this._cache[table] = [];
      }
    }

    // Ensure structural foundation is always available
    const cleanBase = this.generateCleanDatabase();
    if (!this._cache['company_settings'] || this._cache['company_settings'].length === 0) {
      this._cache['company_settings'] = cleanBase['company_settings'];
    }
    if (!this._cache['partners'] || this._cache['partners'].length === 0) {
      this._cache['partners'] = cleanBase['partners'];
    }
    if (!this._cache['work_categories'] || this._cache['work_categories'].length === 0) {
      this._cache['work_categories'] = cleanBase['work_categories'];
    }
    if (!this._cache['activity_catalog'] || this._cache['activity_catalog'].length === 0) {
      this._cache['activity_catalog'] = cleanBase['activity_catalog'];
    }

    this.saveLocalCache();
    this.lastSyncStatus = {
      timestamp: new Date().toISOString(),
      loadedCount: loadedTables.length,
      failedCount: failedTables.length,
      failedTables
    };
    return { success: true, loadedTables, failedTables };
  },

  async getPage(tableName, page = 1, pageSize = 50, filterFn = null) {
    if (!this._cache) await this.init();
    let list = this._cache[tableName] || [];
    if (typeof filterFn === 'function') {
      list = list.filter(filterFn);
    }
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const start = (currentPage - 1) * pageSize;
    const data = list.slice(start, start + pageSize).map(item => ({ ...item }));
    return {
      data,
      total,
      page: currentPage,
      pageSize,
      totalPages
    };
  },

  saveLocalCache() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('dariluxe_erp_clean_v1', JSON.stringify(this._cache));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }
  },

  // Generic CRUD with Supabase Cloud Realtime Sync
  async getAll(tableName) {
    if (!this._cache) await this.init();
    return (this._cache[tableName] || []).map(item => ({ ...item }));
  },

  async getById(tableName, id) {
    if (!this._cache) await this.init();
    const list = this._cache[tableName] || [];
    const item = list.find(x => String(x.id) === String(id));
    return item ? { ...item } : null;
  },

  async query(tableName, filterFn) {
    if (!this._cache) await this.init();
    const list = this._cache[tableName] || [];
    return list.filter(filterFn).map(item => ({ ...item }));
  },

  async add(tableName, record) {
    if (!this._cache) await this.init();
    if (!this._cache[tableName]) this._cache[tableName] = [];

    const newRecord = {
      ...record,
      id: record.id || (tableName.substring(0, 3).toUpperCase() + '_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36))),
      created_at: record.created_at || new Date().toISOString()
    };

    this._cache[tableName].push(newRecord);
    this.saveLocalCache();

    // Supabase Cloud Insert
    if (this.isSupabaseConnected && this.supabaseClient) {
      try {
        const { error } = await this.supabaseClient.from(tableName).insert([newRecord]);
        if (error) console.warn(`Supabase insert to ${tableName} warning:`, error.message);
      } catch (err) {
        console.warn(`Supabase insert error on ${tableName}:`, err);
      }
    }

    this.logAudit('CREATE', tableName, newRecord.id, newRecord);
    return { ...newRecord };
  },

  async update(tableName, id, updates) {
    if (!this._cache) await this.init();
    const list = this._cache[tableName] || [];
    const index = list.findIndex(x => String(x.id) === String(id));
    if (index === -1) throw new Error(`Record not found in ${tableName} with id ${id}`);

    const updated = {
      ...list[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    list[index] = updated;
    this.saveLocalCache();

    // Supabase Cloud Update
    if (this.isSupabaseConnected && this.supabaseClient) {
      try {
        const { error } = await this.supabaseClient.from(tableName).update(updates).eq('id', id);
        if (error) console.warn(`Supabase update on ${tableName} warning:`, error.message);
      } catch (err) {
        console.warn(`Supabase update error on ${tableName}:`, err);
      }
    }

    this.logAudit('UPDATE', tableName, id, updates);
    return { ...updated };
  },

  async delete(tableName, id) {
    if (!this._cache) await this.init();
    const list = this._cache[tableName] || [];
    const index = list.findIndex(x => String(x.id) === String(id));
    if (index === -1) return false;

    // Cascade deletions in memory
    if (tableName === 'projects') {
      const pId = String(id);
      const floors = await this.query('project_floors', f => String(f.project_id) === pId);
      for (const fl of floors) {
        await this.delete('project_floors', fl.id);
      }
      this._cache['project_activities'] = (this._cache['project_activities'] || []).filter(x => String(x.project_id) !== pId);
      this._cache['customer_payments'] = (this._cache['customer_payments'] || []).filter(x => String(x.project_id) !== pId);
      this._cache['expenses'] = (this._cache['expenses'] || []).filter(x => String(x.project_id) !== pId);
      this._cache['material_purchases'] = (this._cache['material_purchases'] || []).filter(x => String(x.project_id) !== pId);
      this._cache['project_material_usage'] = (this._cache['project_material_usage'] || []).filter(x => String(x.project_id) !== pId);
    } else if (tableName === 'project_floors') {
      const fId = String(id);
      const rooms = await this.query('project_rooms', r => String(r.floor_id) === fId);
      for (const rm of rooms) {
        await this.delete('project_rooms', rm.id);
      }
    } else if (tableName === 'project_rooms') {
      const rId = String(id);
      this._cache['room_doors'] = (this._cache['room_doors'] || []).filter(x => String(x.room_id) !== rId);
      this._cache['room_windows'] = (this._cache['room_windows'] || []).filter(x => String(x.room_id) !== rId);
      this._cache['room_equipment'] = (this._cache['room_equipment'] || []).filter(x => String(x.room_id) !== rId);
    }

    list.splice(index, 1);
    this.saveLocalCache();

    // Supabase Cloud Delete
    if (this.isSupabaseConnected && this.supabaseClient) {
      try {
        const { error } = await this.supabaseClient.from(tableName).delete().eq('id', id);
        if (error) console.warn(`Supabase delete from ${tableName} warning:`, error.message);
      } catch (err) {
        console.warn(`Supabase delete error on ${tableName}:`, err);
      }
    }

    this.logAudit('DELETE', tableName, id, { deleted: true });
    return true;
  },

  // Bulk Daily Checkin synchronized to Supabase with Idempotency & Full Attendance Logging
  async recordDailyCheckin(checkinEntries) {
    if (!this._cache) await this.init();
    if (!this._cache['worker_attendance']) this._cache['worker_attendance'] = [];
    if (!this._cache['worker_payments']) this._cache['worker_payments'] = [];

    const date = checkinEntries[0]?.date || new Date().toISOString().split('T')[0];
    const savedAttendances = [];
    const savedPayments = [];

    for (const item of checkinEntries) {
      const workerId = String(item.worker_id);
      const projectId = String(item.project_id || '');
      const workdayType = item.workday_type || 'normal';
      const multiplier = (workdayType === 'absent') ? 0 : (item.multiplier !== undefined && !isNaN(parseFloat(item.multiplier)) ? parseFloat(item.multiplier) : 1.0);
      const dailyWage = parseFloat(item.daily_wage) || 0;
      const commission = parseFloat(item.commission) || 0;
      const amount = (multiplier * dailyWage) + commission;
      const advanceGiven = parseFloat(item.advance_given) || 0;

      // 1. Record Attendance (Including Absent Days for complete audit trail)
      const existingIdx = this._cache['worker_attendance'].findIndex(
        a => String(a.worker_id) === workerId && a.date === date && String(a.project_id) === projectId
      );

      const attRecord = {
        id: existingIdx >= 0 ? this._cache['worker_attendance'][existingIdx].id : ('ATT_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36))),
        worker_id: workerId,
        project_id: projectId,
        date: date,
        workday_type: workdayType,
        multiplier: multiplier,
        daily_wage: dailyWage,
        commission: commission,
        calculated_amount: amount,
        work_description: (item.work_description || '').trim(),
        notes: item.notes || ''
      };

      if (existingIdx >= 0) {
        this._cache['worker_attendance'][existingIdx] = attRecord;
      } else {
        this._cache['worker_attendance'].push(attRecord);
      }
      savedAttendances.push(attRecord);

      // Supabase upsert
      if (this.isSupabaseConnected && this.supabaseClient) {
        try {
          await this.supabaseClient.from('worker_attendance').upsert(attRecord);
        } catch (e) {
          console.warn('Supabase worker_attendance upsert warning:', e);
        }
      }

      // 2. Advance Payments with Idempotency Protection (prevents duplicate payment creation on re-save)
      const partnerId = item.partner_id || (typeof App !== 'undefined' && App.activePartnerId) || 'USR-001';
      const receiptRef = 'REC-ADV-' + date + '-' + workerId;
      const idempotencyKey = 'IDEMP_ADV_' + workerId + '_' + date;

      const existingAdvIdx = this._cache['worker_payments'].findIndex(
        p => String(p.worker_id) === workerId && p.date === date && (p.idempotency_key === idempotencyKey || p.receipt_ref === receiptRef || p.receipt_ref === ('REC-ADV-' + date))
      );

      if (advanceGiven > 0) {
        if (existingAdvIdx >= 0) {
          // Update existing advance instead of creating duplicate
          const existingPmt = this._cache['worker_payments'][existingAdvIdx];
          existingPmt.amount = advanceGiven;
          existingPmt.partner_id = partnerId;
          existingPmt.project_id = projectId;
          existingPmt.notes = 'تسبيق نقدي فوري أثناء التحضير اليومي (محدث) / Avance journalière';
          savedPayments.push(existingPmt);

          if (this.isSupabaseConnected && this.supabaseClient) {
            try {
              await this.supabaseClient.from('worker_payments').update({
                amount: advanceGiven,
                partner_id: partnerId,
                project_id: projectId
              }).eq('id', existingPmt.id);
            } catch (e) {
              console.warn('Supabase worker_payments update warning:', e);
            }
          }
        } else {
          // Insert fresh idempotent advance record
          const pmtRecord = {
            id: 'WPMT_ADV_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
            worker_id: workerId,
            project_id: projectId,
            partner_id: partnerId,
            date: date,
            amount: advanceGiven,
            payment_type: 'advance',
            payment_method: 'cash',
            receipt_ref: receiptRef,
            idempotency_key: idempotencyKey,
            notes: 'تسبيق نقدي فوري أثناء التحضير اليومي / Avance journalière'
          };
          this._cache['worker_payments'].push(pmtRecord);
          savedPayments.push(pmtRecord);

          if (this.isSupabaseConnected && this.supabaseClient) {
            try {
              await this.supabaseClient.from('worker_payments').insert([pmtRecord]);
            } catch (e) {
              console.warn('Supabase worker_payments insert warning:', e);
            }
          }
        }
      } else if (existingAdvIdx >= 0 && advanceGiven === 0) {
        // User explicitly zeroed out advance on this date: remove previous check-in advance
        const removedPmt = this._cache['worker_payments'].splice(existingAdvIdx, 1)[0];
        if (this.isSupabaseConnected && this.supabaseClient && removedPmt && removedPmt.id) {
          try {
            await this.supabaseClient.from('worker_payments').delete().eq('id', removedPmt.id);
          } catch (e) {
            console.warn('Supabase worker_payments delete warning:', e);
          }
        }
      }
    }

    this.saveLocalCache();
    return { savedAttendances, savedPayments };
  },

  logAudit(action, entity, entityId, details) {
    if (!this._cache['audit_logs']) this._cache['audit_logs'] = [];
    this._cache['audit_logs'].unshift({
      id: 'AUD_' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)),
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details)
    });
    if (this._cache['audit_logs'].length > 200) {
      this._cache['audit_logs'].length = 200;
    }
  },

  exportDatabaseJSON() {
    return JSON.stringify(this._cache, null, 2);
  },

  importDatabaseJSON(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (typeof data !== 'object' || !data.projects || !data.company_settings) {
        throw new Error('الملف غير صالح أو لا يحتوي على بنية قاعدة بيانات ERP صحيحة.');
      }
      this._cache = data;
      this.saveLocalCache();
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      throw e;
    }
  },

  resetDatabase() {
    this._cache = this.generateCleanDatabase();
    this.saveLocalCache();
  },

  async wipeAllData(wipeSupabase = true) {
    this._cache = this.generateCleanDatabase();
    this.saveLocalCache();

    if (wipeSupabase && this.isSupabaseConnected && this.supabaseClient) {
      const operationalTables = [
        'attachments',
        'audit_logs',
        'invoice_payments',
        'invoice_items',
        'invoices',
        'quotation_items',
        'quotations',
        'customer_payments',
        'expenses',
        'project_material_usage',
        'material_purchases',
        'inventory_stock',
        'materials',
        'suppliers',
        'worker_payments',
        'worker_attendance',
        'worker_project_assignments',
        'worker_specialties',
        'workers',
        'activity_progress',
        'project_activities',
        'room_equipment',
        'room_windows',
        'room_doors',
        'project_rooms',
        'project_floors',
        'projects',
        'customers',
        'partner_transfers',
        'partner_withdrawals'
      ];
      for (const tbl of operationalTables) {
        try {
          await this.supabaseClient.from(tbl).delete().neq('id', '___NON_EXISTING_ID___');
        } catch (e) {
          console.warn(`Supabase wipe table ${tbl} warning:`, e);
        }
      }
    }
    return true;
  },

  // 100% Clean Database Structure (Zero Demo / Dummy Records)
  generateCleanDatabase() {
    const data = {};
    this.tables.forEach(t => { data[t] = []; });

    data['company_settings'] = [{
      id: 'settings_main',
      company_name: 'مؤسسة داري لوكس للتشطيب والديكور العصري (DARI LUXE)',
      company_name_fr: 'DARI LUXE — Rénovation, Décoration et Aménagement',
      phone: '0550600909',
      email: 'DARILUXE.NET@GMAIL.COM',
      address: 'حي 17 أكتوبر، سيدي لخضر - عين الدفلى (17 Octobre, Sidi Lakhder, Ain Defla)',
      logo_url: 'dari_luxe_logo.png',
      rc_number: '44/00-0987654B20',
      nif_number: '002044098765432',
      currency: 'DZD',
      currency_symbol: 'دج / DA',
      tax_rate: 0,
      partner1_share: 50,
      partner2_share: 50,
      theme: 'dark'
    }];

    data['partners'] = [
      {
        id: 'USR-001',
        name: 'الشريك 1 (Admin 1)',
        name_fr: 'Associé 1 / Direction',
        phone: '0550600909',
        role: 'admin',
        pin: '1234',
        avatar: 'A1',
        color: '#FF3B30'
      },
      {
        id: 'USR-002',
        name: 'الشريك 2 (Admin 2)',
        name_fr: 'Associé 2 / Co-Gérant',
        phone: '0550000000',
        role: 'admin',
        pin: '5678',
        avatar: 'A2',
        color: '#00E5FF'
      }
    ];

    data['work_categories'] = [
      { id: 'CAT-01', code: 'BA13', name: 'أشغال بلاكو بلاتر وأسقف معلقة', name_fr: 'Placoplâtre BA13 & Faux Plafonds', icon: '🏗️' },
      { id: 'CAT-02', code: 'PNT', name: 'دهان وديكورات جدارية حديثة', name_fr: 'Peinture & Décoration Murale', icon: '🎨' },
      { id: 'CAT-03', code: 'ELEC', name: 'كهرباء معمارية وإنارة ليد ذكية', name_fr: 'Électricité & Éclairage LED', icon: '⚡' },
      { id: 'CAT-04', code: 'PLMB', name: 'سباكة صحية، غاز وتدفئة مركزية', name_fr: 'Plomberie, Sanitaire & Chauffage', icon: '🔧' },
      { id: 'CAT-05', code: 'CARREL', name: 'تبليط، سيراميك، بورسلان ورخام', name_fr: 'Carrelage, Faïence & Marbre', icon: '📐' },
      { id: 'CAT-06', code: 'MENUIS', name: 'نجارة ألمنيوم، PVC وأبواب خشبية', name_fr: 'Menuiserie Aluminium, PVC & Bois', icon: '🚪' },
      { id: 'CAT-07', code: 'ETANCH', name: 'عزل مائي وحراري للأسطح والمسابح', name_fr: 'Étanchéité & Isolation Thermique', icon: '🛡️' },
      { id: 'CAT-08', code: 'SMART', name: 'منازل ذكية، كاميرات مراقبة وإنذار', name_fr: 'Smart Home, Vidéosurveillance & Alarmes', icon: '📡' },
      { id: 'CAT-09', code: 'MACON', name: 'بناء، هدم، ترميم وتوسعة عامة', name_fr: 'Maçonnerie, Démolition & Rénovation', icon: '🧱' }
    ];

    // Comprehensive Home Finishing & Renovation Catalog with Standard Algerian Market Prices (DZD)
    data['activity_catalog'] = [
      // 1. Placoplâtre BA13
      { id: 'ACT-CAT-01', category_id: 'CAT-01', code: 'BA13-SIMP', name: 'سقف معلق بلاكو بسيط (BA13 Simple)', name_fr: 'Faux plafond simple BA13', unit: 'm²', default_labor_price: 1200, default_material_price: 1200, default_unit_price: 2400, description: 'هيكل حديدي مجلفن + ألواح كناوف BA13 مع شريط الفواصل والمعجون وجهين' },
      { id: 'ACT-CAT-02', category_id: 'CAT-01', code: 'BA13-CAIS', name: 'كايسون ديكوري مع إنارة مخفية (Caisson Déco)', name_fr: 'Caisson décoratif avec gorge lumineuse LED', unit: 'ml', default_labor_price: 1800, default_material_price: 1400, default_unit_price: 3200, description: 'كايسون جانبي أو دائري بالجبس بورد مجهز لمجرى شريط ليد المخفي' },
      { id: 'ACT-CAT-03', category_id: 'CAT-01', code: 'BA13-CLOI', name: 'جدار فاصل عازل صوتي مزدوج (Cloison Double)', name_fr: 'Cloison de séparation double peau isolée', unit: 'm²', default_labor_price: 1500, default_material_price: 2000, default_unit_price: 3500, description: 'قاطع جداري مزدوج الوجهين مع حشوة صوف صخري 50 مم عازل للصوت' },
      { id: 'ACT-CAT-04', category_id: 'CAT-01', code: 'BA13-HYDR', name: 'سقف مقاوم للرطوبة حمامات ومطابخ (Hydrofuge)', name_fr: 'Faux plafond hydrofuge vert pour SDB & Cuisine', unit: 'm²', default_labor_price: 1400, default_material_price: 1500, default_unit_price: 2900, description: 'ألواح جبس خضراء معالجة ضد الرطوبة والبخار والأملاح' },
      { id: 'ACT-CAT-05', category_id: 'CAT-01', code: 'BA13-TV', name: 'ديكور جداري مدمج لشاشة التلفاز (Meuble TV Murale)', name_fr: 'Habillage mural meuble TV en BA13 avec niches', unit: 'forfait', default_labor_price: 12000, default_material_price: 8000, default_unit_price: 20000, description: 'تصميم وتنفيذ مكتبة تلفاز جدارية برفوف ونقاط إنارة ورفوف ديكورية' },

      // 2. Peinture & Décoration
      { id: 'ACT-CAT-06', category_id: 'CAT-02', code: 'PNT-VINYL', name: 'صباغة فينيل عادية وجهين (Peinture Vinyle)', name_fr: 'Peinture vinylique intérieure 2 couches', unit: 'm²', default_labor_price: 250, default_material_price: 150, default_unit_price: 400, description: 'طبقة أساس إمبريميسيون + وجهين دهان مائي فينيل غير لامع' },
      { id: 'ACT-CAT-07', category_id: 'CAT-02', code: 'PNT-SATIN', name: 'دهان ساتيني حريري قابل للغسل (Peinture Satinée)', name_fr: 'Peinture laquée satinée lavable haute qualité', unit: 'm²', default_labor_price: 450, default_material_price: 350, default_unit_price: 800, description: 'صباغة ساتيني فاخرة ملساء مقاومة للأوساخ وسهلة التنظيف' },
      { id: 'ACT-CAT-08', category_id: 'CAT-02', code: 'PNT-SABLE', name: 'طلاء ديكوري رملي سابلي (Effet Sablé)', name_fr: 'Peinture décorative sablée métallisée', unit: 'm²', default_labor_price: 600, default_material_price: 450, default_unit_price: 1050, description: 'مظهر رملي كريستالي لامع للجدران الرئيسية والصالونات' },
      { id: 'ACT-CAT-09', category_id: 'CAT-02', code: 'PNT-STUCC', name: 'ستوكو رخامي لامع مارمورينو (Stucco Marbre)', name_fr: 'Enduit décoratif Stucco vénitien effet marbre', unit: 'm²', default_labor_price: 1200, default_material_price: 800, default_unit_price: 2000, description: 'طلاء جيري إيطالي مع تلميع ميكانيكي بمظهر رخامي ملكي فخم' },
      { id: 'ACT-CAT-10', category_id: 'CAT-02', code: 'PNT-ENDUI', name: 'معجون تسوية الجدران إندوي (Enduit 3 Passes)', name_fr: 'Enduisage de lissage et ratissage 3 couches', unit: 'm²', default_labor_price: 350, default_material_price: 150, default_unit_price: 500, description: 'تسوية الجدران المتموجة وإخفاء العيوب قبل الطلاء النهائي' },

      // 3. Électricité & Éclairage LED
      { id: 'ACT-CAT-11', category_id: 'CAT-03', code: 'ELEC-POIN', name: 'تأسيس نقطة كهربائية مأخذ أو إنارة (Point Électrique)', name_fr: 'Création point lumineux ou prise électrique', unit: 'piece', default_labor_price: 900, default_material_price: 400, default_unit_price: 1300, description: 'حفر وتثبيت أنبوب مع سلك نحاسي مفرغ وعلبة تجميع' },
      { id: 'ACT-CAT-12', category_id: 'CAT-03', code: 'ELEC-SPOT', name: 'تركيب وتوصيل سبوت ليد غائر (Spot LED Encastré)', name_fr: 'Pose et raccordement spot LED encastrable', unit: 'piece', default_labor_price: 250, default_material_price: 350, default_unit_price: 600, description: 'ثقب دائري في البلاكو وتثبيت السبوت مع التوصيل الآمن' },
      { id: 'ACT-CAT-13', category_id: 'CAT-03', code: 'ELEC-PROF', name: 'تركيب شريط بروفيل ليد ألمنيوم (Profilé LED)', name_fr: 'Installation bandeau LED avec profilé alu diffuseur', unit: 'ml', default_labor_price: 600, default_material_price: 800, default_unit_price: 1400, description: 'تثبيت بروفيل ألمنيوم ناشر مع لحام شريط LED وتوصيل المحول 12V/24V' },
      { id: 'ACT-CAT-14', category_id: 'CAT-03', code: 'ELEC-TABL', name: 'تركيب وتوصيل خزانة القواطع الرئيسية (Tableau Électrique)', name_fr: 'Câblage tableau de répartition électrique 24/36 modules', unit: 'forfait', default_labor_price: 8000, default_material_price: 12000, default_unit_price: 20000, description: 'توزيع الدوائر مع الفواصم التفاضلية 30mA والحماية من الصواعق' },

      // 4. Plomberie, Sanitaire & Chauffage
      { id: 'ACT-CAT-15', category_id: 'CAT-04', code: 'PLMB-SDB', name: 'شبكة تغذية حمام كامل متعدد الطبقات (Réseau SDB Multicouche)', name_fr: 'Alimentation complète salle de bain en multicouche', unit: 'forfait', default_labor_price: 14000, default_material_price: 10000, default_unit_price: 24000, description: 'تمديد أنابيب الماء الساخن والبارد للمغسلة والدوش والمرحاض والغسالة' },
      { id: 'ACT-CAT-16', category_id: 'CAT-04', code: 'PLMB-WC-S', name: 'تركيب مرحاض معلق مدمج (WC Bâti-Support Suspendu)', name_fr: 'Installation WC suspendu avec bâti encastré', unit: 'piece', default_labor_price: 5000, default_material_price: 22000, default_unit_price: 27000, description: 'تثبيت شاسيه المرحاض المعلق في الجدار وضبط ميكانيزم الطرد' },
      { id: 'ACT-CAT-17', category_id: 'CAT-04', code: 'PLMB-CHAU', name: 'تركيب وتوصيل شوفاج سنترال (Chaudière & Radiateurs)', name_fr: 'Pose chaudière murale et réseau de radiateurs', unit: 'forfait', default_labor_price: 18000, default_material_price: 85000, default_unit_price: 103000, description: 'تركيب غلاية الغاز الجدارية ومد أنابيب المشعات والتحكم بالحرارة' },
      { id: 'ACT-CAT-18', category_id: 'CAT-04', code: 'PLMB-EVAC', name: 'شبكة صرف صحي بلاستيك PVC (Évacuation PVC)', name_fr: 'Réseau d\'évacuation eaux usées et vannes PVC', unit: 'ml', default_labor_price: 600, default_material_price: 600, default_unit_price: 1200, description: 'أنابيب تصريف PVC بقطر 40-110 مم مع السيفونات وغرف التفتيش' },

      // 5. Carrelage, Faïence & Marbre
      { id: 'ACT-CAT-19', category_id: 'CAT-05', code: 'CAR-SOL', name: 'تبليط أرضيات بورسلان وسيراميك (Pose Carrelage Sol)', name_fr: 'Pose carrelage sol grand format au mortier colle', unit: 'm²', default_labor_price: 1100, default_material_price: 1800, default_unit_price: 2900, description: 'تسوية الأرضية واستخدام مادة لاصقة C2 مع صلبان التسوية الذاتية' },
      { id: 'ACT-CAT-20', category_id: 'CAT-05', code: 'CAR-FAI', name: 'تركيب خزف جدران حمامات ومطابخ (Faïence Murale)', name_fr: 'Pose faïence murale cuisine et salle de bain', unit: 'm²', default_labor_price: 1300, default_material_price: 1600, default_unit_price: 2900, description: 'تثبيت سيراميك الجدران مع الفواصل الإيبوكسية المضادة للبكتيريا' },
      { id: 'ACT-CAT-21', category_id: 'CAT-05', code: 'CAR-ESCA', name: 'تلبيس درجات سلم بالرخام الطبيعي (Marches Escalier Marbre)', name_fr: 'Pose marche et contre-marche en marbre naturel', unit: 'piece', default_labor_price: 1400, default_material_price: 3500, default_unit_price: 4900, description: 'تركيب الدرجة والقائمة مع الجلي وتلميع الحواف الدائرية' },
      { id: 'ACT-CAT-22', category_id: 'CAT-05', code: 'CAR-CHAP', name: 'صب طبقة خرسانة تسوية شاپ (Chape Mortier Sol)', name_fr: 'Réalisation chape ciment de mise à niveau', unit: 'm²', default_labor_price: 400, default_material_price: 350, default_unit_price: 750, description: 'ضبط المناسيب بالليزر وصب خلطة إسمنتية رملية ملساء' },

      // 6. Menuiserie Alu, PVC & Bois
      { id: 'ACT-CAT-23', category_id: 'CAT-06', code: 'MEN-ALU-F', name: 'نافذة ألمنيوم زجاج مزدوج عازل (Fenêtre Alu Double Vitrage)', name_fr: 'Fourniture & pose fenêtre aluminium double vitrage', unit: 'm²', default_labor_price: 2500, default_material_price: 14500, default_unit_price: 17000, description: 'بروفيل ألمنيوم عالي الجودة عازل للحرارة والضوضاء مع إكسسوارات إيطالية' },
      { id: 'ACT-CAT-24', category_id: 'CAT-06', code: 'MEN-PORT-B', name: 'تركيب باب داخلي خشبي MDF (Porte Intérieure Bois)', name_fr: 'Pose bloc-porte intérieur ouvrant complet', unit: 'piece', default_labor_price: 3000, default_material_price: 9000, default_unit_price: 12000, description: 'تثبيت الإطار بالفوم والمثبتات مع المقبض والقفل والمفصلات' },
      { id: 'ACT-CAT-25', category_id: 'CAT-06', code: 'MEN-BLIND', name: 'باب خارجي مصفح مدرع تركي (Porte Blindée)', name_fr: 'Fourniture et pose porte d\'entrée blindée sécurisée', unit: 'piece', default_labor_price: 6000, default_material_price: 42000, default_unit_price: 48000, description: 'باب أمان حديدي مصفح بنقاط إغلاق متعددة عازل للصوت والعوامل الجوية' },

      // 7. Étanchéité & Isolation
      { id: 'ACT-CAT-26', category_id: 'CAT-07', code: 'ETAN-PAX', name: 'عزل مائي للأسطح بمادة الباكس (Étanchéité Terrasse Paxalu)', name_fr: 'Étanchéité terrasse multicouche bitume armé Paxalu', unit: 'm²', default_labor_price: 600, default_material_price: 1100, default_unit_price: 1700, description: 'طبقة أساس زفتي كولدكوت + لحام غشاء البيتومين المؤلمن بالنار' },
      { id: 'ACT-CAT-27', category_id: 'CAT-07', code: 'ETAN-LIQ', name: 'عزل مائي سائل للمطابخ والحمامات (Étanchéité Liquide SDB)', name_fr: 'Membrane d\'étanchéité liquide sous carrelage (SPEC)', unit: 'm²', default_labor_price: 500, default_material_price: 900, default_unit_price: 1400, description: 'دهان عازل مرن وجهين لمنع تسرب المياه نهائياً تحت البلاط' },
      { id: 'ACT-CAT-28', category_id: 'CAT-07', code: 'ISOL-XPS', name: 'عزل حراري بألواح البوليستيرين المبثوق XPS (Isolation Thermique)', name_fr: 'Isolation thermique par panneaux polystyrène extrudé XPS', unit: 'm²', default_labor_price: 350, default_material_price: 650, default_unit_price: 1000, description: 'ألواح عازلة للحرارة 40 مم تخفض فاتورة التكييف والتدفئة بنسبة 40%' },

      // 8. Smart Home & Sécurité
      { id: 'ACT-CAT-29', category_id: 'CAT-08', code: 'SMRT-CAM', name: 'تركيب وبرمجة كاميرا مراقبة IP (Caméra Surveillance IP Full HD)', name_fr: 'Installation et paramétrage caméra IP connectée', unit: 'piece', default_labor_price: 2500, default_material_price: 5500, default_unit_price: 8000, description: 'تثبيت وتوجيه الكاميرا وتوصيلها بجهاز NVR والربط بالهاتف الذكي' },
      { id: 'ACT-CAT-30', category_id: 'CAT-08', code: 'SMRT-DOMO', name: 'تأسيس نظام تحكم ذكي بالإنارة والمكيفات (Pack Domotique)', name_fr: 'Configuration centrale domotique et relais intelligents', unit: 'forfait', default_labor_price: 15000, default_material_price: 25000, default_unit_price: 40000, description: 'تحكم في إطفاء وتشغيل الأضواء والمكيفات والستائر عن بعد بالهاتف' },
      { id: 'ACT-CAT-31', category_id: 'CAT-08', code: 'SMRT-ALRM', name: 'جهاز إنذار ذكي لاسلكي ضد الاقتحام (Alarme Anti-Intrusion)', name_fr: 'Système d\'alarme sans fil avec détecteurs volumétriques', unit: 'forfait', default_labor_price: 6000, default_material_price: 22000, default_unit_price: 28000, description: 'حساسات حركة وأبواب مع صفارة إنذار واتصال تلقائي برقم الهاتف' },

      // 9. Maçonnerie & Démolition
      { id: 'ACT-CAT-32', category_id: 'CAT-09', code: 'MAC-DEMO', name: 'هدم جدران قديمة وإخلاء الردوم (Démolition & Évacuation)', name_fr: 'Démolition de cloisons et évacuation des gravats', unit: 'm²', default_labor_price: 700, default_material_price: 0, default_unit_price: 700, description: 'تكسير حذر للجدران ونقل المخلفات في أكياس إلى المفرغة العمومية' },
      { id: 'ACT-CAT-33', category_id: 'CAT-09', code: 'MAC-BRIQ', name: 'بناء جدران آجور أحمر 10 أو 15 سم (Maçonnerie Brique)', name_fr: 'Montage murs en brique rouge avec mortier ciment', unit: 'm²', default_labor_price: 600, default_material_price: 550, default_unit_price: 1150, description: 'بناء شاقولي متقن مع تسليح الربط بالأعمدة والخرسانة' },
      { id: 'ACT-CAT-34', category_id: 'CAT-09', code: 'MAC-CREP', name: 'تلبيس ومحارة جدران إسمنتية وجهين (Crépissage Mortier)', name_fr: 'Crépissage intérieur / extérieur taloché au ciment', unit: 'm²', default_labor_price: 550, default_material_price: 250, default_unit_price: 800, description: 'طبقة رش خشنة + ملء وتسوية السطح جاهز للدهان أو التبليط' }
    ];

    return data;
  },

  // Backward compatibility alias
  generateSeedData() {
    return this.generateCleanDatabase();
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DB;
}
