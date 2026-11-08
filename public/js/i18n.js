/**
 * DARI LUXE ERP — Internationalization (i18n) Engine
 * Full bilingual support: Arabic (RTL) & French (LTR)
 * High-precision software translation for renovation & construction ERP.
 */

const I18N = {
  currentLang: (typeof localStorage !== 'undefined' && localStorage.getItem('dari_lang')) || 'ar',

  translations: {
    // ═════════════════════════════════════════════════════════
    // ARABIC (العربية) — RTL
    // ═════════════════════════════════════════════════════════
    ar: {
      // Mobile Navigation
      'mob_nav_home': 'الرئيسية',
      'mob_nav_projects': 'الورشات',
      'mob_nav_checkin': 'التحضير',
      'mob_nav_expenses': 'المصاريف',
      'mob_nav_menu': 'القائمة',

      // Common & Actions
      'app_name': 'داري لوكس',
      'app_tagline': 'تجديد، ديكور وتشطيب عقاري راقٍ',
      'brand_subtitle': 'داري لوكس للتشطيب العقاري',
      'save': 'حفظ',
      'cancel': 'إلغاء',
      'delete': 'حذف',
      'edit': 'تعديل',
      'close': 'إغلاق',
      'search': 'بحث...',
      'filter': 'تصفية',
      'export': 'تصدير',
      'print': 'طباعة',
      'loading': 'جاري التحميل...',
      'open': 'فتح',
      'details': 'التفاصيل',
      'confirm': 'تأكيد',
      'total': 'المجموع',
      'status': 'الحالة',
      'date': 'التاريخ',
      'actions': 'الإجراءات',
      'dzd': 'دج',

      // Header Bar
      'header_subtitle': 'تسيير الورشات، الرقابة الميدانية ومتابعة التكاليف',
      'header_desc': 'تسيير ملفات الورشات، المتابعة الميدانية، الديفيس وحساب الأرباح في الوقت الفعلي',
      'system_connected': 'النظام متصل',
      'realtime_active': 'مزامنة حية',
      'supabase_connected': 'متصل سحابياً',
      'supabase_local': 'تخزين محلي',
      'btn_new_project': '+ إنشاء ورشة جديدة',
      'btn_new_project_sm': '+ ورشة',
      'btn_lang_toggle': 'FR',
      'tooltip_sound': 'الصوت التفاعلي',
      'tooltip_notif': 'الإشعارات الميدانية',
      'tooltip_team': 'فريق العمل والعمال',
      'tooltip_account': 'تبديل الحساب (الشركاء)',
      'tooltip_lang': 'Changer vers le Français (LTR)',
      'tooltip_collapse': 'طي / توسيع القائمة',

      // Sidebar Navigation
      'nav_dashboard': 'لوحة التحكم',
      'nav_dashboard_sub': 'لوحة التحكم والرقابة',
      'nav_projects': 'الورشات والمشاريع',
      'nav_projects_sub': 'سجل الورشات والمشاريع',
      'nav_building_structure': 'الهيكل والقياسات',
      'nav_building_structure_sub': 'الهيكل، الغرف، والقياسات',
      'nav_activities': 'دليل الأشغال',
      'nav_activities_sub': 'دليل بنود وأنشطة الأشغال',
      'nav_daily_checkin': 'الحضور اليومي',
      'nav_daily_checkin_sub': 'التحضير اليومي وتسبيقات العمال',
      'nav_workers': 'العمال والأجور',
      'nav_workers_sub': 'سجل العمال، اليوميات والأجور',
      'nav_quotations_invoices': 'الديفيس والفواتير',
      'nav_quotations_invoices_sub': 'عروض الأسعار والفواتير الرسمية',
      'nav_test_scenarios': 'النماذج التجارية',
      'nav_test_scenarios_sub': 'اختبار النماذج والتسعير',
      'nav_wallets': 'الصندوق والأرباح',
      'nav_wallets_sub': 'صندوق الشركة وتقاسم الأرباح',
      'nav_finances': 'المركز المالي',
      'nav_finances_sub': 'المركز المالي والأرباح الحقيقية',
      'nav_materials': 'المواد والموردون',
      'nav_materials_sub': 'المواد والمخزون والموردين',
      'nav_expenses': 'المصاريف',
      'nav_expenses_sub': 'المصاريف النثرية والعهد',
      'nav_reports': 'التقارير',
      'nav_reports_sub': 'التقارير الشاملة والطباعة A4',
      'nav_settings': 'الإعدادات',
      'nav_settings_sub': 'إعدادات داري لوكس والسحابة',

      // Sidebar Categories
      'cat_projects': 'المشاريع والورشات',
      'cat_team': 'الحضور والفريق',
      'cat_pricing': 'المتر والديفيس',
      'cat_finances': 'المالية والمخزون',
      'cat_system': 'النظام والإعدادات',

      // PWA & Sidebar Footer
      'pwa_title': 'تثبيت تطبيق DARI LUXE',
      'pwa_subtitle': 'يعمل بدون إنترنت على الهاتف',
      'pwa_button': 'تثبيت التطبيق',
      'sidebar_company_address': 'سيدي لخضر، عين الدفلى (17 أكتوبر)',
      'sidebar_db_synced': 'قاعدة بيانات سحابية متصلة',
      'sidebar_db_local': 'تخزين محلي جاهز',

      // Dashboard View
      'search_placeholder': 'ابحث سريعاً — اسم الورشة، الزبون، الولاية، رقم الهاتف، المعرف...',
      'hero_badge': 'تحديث لحظي',
      'hero_title': 'السجل الرسمي للورشات ومشاريع DARI LUXE',
      'hero_desc': 'تسيير ملفات الورشات، المتابعة اليومية للعمال، عقود Métré، تسعير Devis التقني، ومتابعة التكاليف وصافي الأرباح لكل ورشة بشكل مستقل تماماً.',
      'hero_btn': '+ إنشاء ورشة جديدة',

      // 6 Metric Cards
      'kpi_total_projects': 'إجمالي الورشات',
      'kpi_total_projects_sub': 'جميع المشاريع المسجلة',
      'kpi_active_projects': 'قيد الإنجاز',
      'kpi_active_projects_sub': 'ورشات جارية ونشطة',
      'kpi_pending_projects': 'قيد الدراسة',
      'kpi_pending_projects_sub': 'في طور التحضير والدراسة',
      'kpi_completed_projects': 'مكتملة ومسلمة',
      'kpi_completed_projects_sub': 'مشاريع منتهية كلياً',
      'kpi_active_workers': 'فريق العمل النشط',
      'kpi_active_workers_sub': 'عمال مسجلين في المؤسسة',
      'kpi_today_attendance': 'حضور اليوم الميداني',
      'kpi_today_attendance_sub': 'عمال حاضرين اليوم',

      // Filter Pills
      'filter_all': 'الكل',
      'filter_in_progress': 'قيد الإنجاز',
      'filter_planning': 'قيد الدراسة',
      'filter_completed': 'مكتملة',
      'filter_on_hold': 'متوقفة مؤقتاً',
      'filter_by_wilaya': 'حسب الولاية',
      'filter_sort_recent': 'الأحدث أولاً',
      'filter_sort_name': 'حسب الاسم',

      // Cockpit Table
      'table_title': 'سجل الورشات والرقابة الميدانية',
      'table_col_code': 'كود الورشة',
      'table_col_project': 'الورشة والزبون',
      'table_col_location': 'الموقع والولاية',
      'table_col_start_date': 'تاريخ البدء',
      'table_col_status': 'الحالة التقنية',
      'table_col_validation': 'المصادقة والربط',
      'table_col_actions': 'الإجراءات',
      'btn_open_workspace': 'فتح ملف الورشة',
      'table_empty_title': 'لا توجد ورشات مسجلة حالياً في قاعدة البيانات',
      'table_empty_desc': 'ابدأ الآن بإضافة أول ورشة عمل لبدء المتابعة والرقابة الميدانية وحساب التكاليف.',
      'btn_add_first_project': '+ إضافة ورشة جديدة الآن',

      // Status Labels
      'status_in_progress': 'قيد الإنجاز',
      'status_planning': 'قيد الدراسة',
      'status_completed': 'مكتملة ومسلمة',
      'status_on_hold': 'متوقفة مؤقتاً',
      'status_draft': 'مسودة',

      // Budget Allocation Component
      'budget_component_title': 'توزيع الميزانية والتكاليف',
      'budget_component_sub': 'تحليل مالي مفصل حسب صنف الأشغال، نوع المنشآت، وطبيعة التكاليف',
      'budget_tab_categories': 'أصناف الأشغال',
      'budget_tab_project_types': 'أنواع المنشآت',
      'budget_tab_cost_nature': 'طبيعة التكاليف',
      'budget_col_item': 'البند / الصنف',
      'budget_col_amount': 'المبلغ (دج)',
      'budget_col_share': 'النسبة',
      'budget_col_cost_m2': 'التكلفة / م²',
      'budget_empty_state': 'لا توجد بيانات مالية مسجلة بعد لهذه المشاريع.',
      'budget_empty_desc': 'عند تسجيل القياسات والمواد واليوميات ستظهر النسب الدقيقة هنا تلقائياً.',
      'budget_total_cost': 'إجمالي التكاليف المسجلة',

      // Daily Pointage
      'pointage_title': 'تسجيل الحضور اليومي واليوميات',
      'pointage_sub': 'متابعة حضور العمال، الساعات الميدانية وتسجيل التسبيقات المالية',
      'pointage_date': 'تاريخ اليوم',
      'pointage_save_btn': 'حفظ بيانات الحضور',
      'pointage_whatsapp_btn': 'مشاركة الملخص عبر واتساب',
      'pointage_a4_btn': 'طباعة كشف الحضور A4',
      'pointage_present': 'حاضر (1.0)',
      'pointage_half': 'نصف يوم (0.5)',
      'pointage_absent': 'غائب (0.0)',
      'pointage_wage': 'الأجرة اليومية',
      'pointage_advance': 'التسبيق المالي'
    },

    // ═════════════════════════════════════════════════════════
    // FRENCH (Français) — LTR
    // ═════════════════════════════════════════════════════════
    fr: {
      // Mobile Navigation
      'mob_nav_home': 'Accueil',
      'mob_nav_projects': 'Chantiers',
      'mob_nav_checkin': 'Pointage',
      'mob_nav_expenses': 'Dépenses',
      'mob_nav_menu': 'Menu',

      // Common & Actions
      'app_name': 'DARI LUXE',
      'app_tagline': 'Rénovation, Décoration & Aménagement Haut de Gamme',
      'brand_subtitle': 'Rénovation & Décoration',
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'delete': 'Supprimer',
      'edit': 'Modifier',
      'close': 'Fermer',
      'search': 'Rechercher...',
      'filter': 'Filtrer',
      'export': 'Exporter',
      'print': 'Imprimer',
      'loading': 'Chargement...',
      'open': 'Ouvrir',
      'details': 'Détails',
      'confirm': 'Confirmer',
      'total': 'Total',
      'status': 'Statut',
      'date': 'Date',
      'actions': 'Actions',
      'dzd': 'DZD',

      // Header Bar
      'header_subtitle': 'Gestion des chantiers et contrôle opérationnel',
      'header_desc': 'Pilotage des chantiers, suivi technique, devis et rentabilité en temps réel',
      'system_connected': 'Système connecté',
      'realtime_active': 'Realtime Active',
      'supabase_connected': 'Connecté Cloud',
      'supabase_local': 'Stockage Local',
      'btn_new_project': '+ Nouveau Chantier',
      'btn_new_project_sm': '+ Chantier',
      'btn_lang_toggle': 'عربي',
      'tooltip_sound': 'Effets sonores',
      'tooltip_notif': 'Notifications chantiers',
      'tooltip_team': 'Équipe & Ouvriers',
      'tooltip_account': 'Compte Associé',
      'tooltip_lang': 'Passer en Arabe (RTL)',
      'tooltip_collapse': 'Réduire / Agrandir le menu',

      // Sidebar Navigation
      'nav_dashboard': 'Tableau de bord',
      'nav_dashboard_sub': 'Vue d\'ensemble & KPIs',
      'nav_projects': 'Tous les chantiers',
      'nav_projects_sub': 'Liste & suivi des projets',
      'nav_building_structure': 'Bâtiments & Mesures',
      'nav_building_structure_sub': 'Plans, pièces & surfaces',
      'nav_activities': 'Catalogue Travaux',
      'nav_activities_sub': 'Corps d\'état & tarifs',
      'nav_daily_checkin': 'Pointage Journalier',
      'nav_daily_checkin_sub': 'Présences & avances ouvriers',
      'nav_workers': 'Équipe & Salaires',
      'nav_workers_sub': 'Ouvriers, paie & contrats',
      'nav_quotations_invoices': 'Devis & Factures',
      'nav_quotations_invoices_sub': 'Documents commerciaux & factures',
      'nav_test_scenarios': 'Scénarios (A,B,C,D)',
      'nav_test_scenarios_sub': 'Simulation tarifaire & marge',
      'nav_wallets': 'Caisse & Bénéfices',
      'nav_wallets_sub': 'Trésorerie & partage associés',
      'nav_finances': 'Finances & Rentabilité',
      'nav_finances_sub': 'Bilans & marges réelles',
      'nav_materials': 'Matériaux & Fournisseurs',
      'nav_materials_sub': 'Stock & approvisionnement',
      'nav_expenses': 'Dépenses & Caisses',
      'nav_expenses_sub': 'Frais généraux & petite caisse',
      'nav_reports': 'Rapports & Impression',
      'nav_reports_sub': 'Export PDF & impressions A4',
      'nav_settings': 'Paramètres & Entreprise',
      'nav_settings_sub': 'Configuration du système',

      // Sidebar Categories
      'cat_projects': 'Projets & Chantiers',
      'cat_team': 'Pointage & Équipe',
      'cat_pricing': 'Métré & Devis',
      'cat_finances': 'Finances & Stock',
      'cat_system': 'Système & Paramètres',

      // PWA & Sidebar Footer
      'pwa_title': 'Installer DARI LUXE App',
      'pwa_subtitle': 'Fonctionne hors ligne sur mobile',
      'pwa_button': 'Installer l\'application',
      'sidebar_company_address': 'Sidi Lakhder, Ain Defla (17 Octobre)',
      'sidebar_db_synced': 'PostgreSQL Cloud Synchronisé',
      'sidebar_db_local': 'Stockage Local Prêt',

      // Dashboard View
      'search_placeholder': 'Recherche rapide — Chantier, client, wilaya, téléphone, code...',
      'hero_badge': 'Temps réel',
      'hero_title': 'Cockpit Opérationnel des Chantiers DARI LUXE',
      'hero_desc': 'Pilotage des chantiers, suivi quotidien des ouvriers, métré technique, chiffrage devis, et rentabilité nette par projet en temps réel.',
      'hero_btn': '+ Nouveau Chantier',

      // 6 Metric Cards
      'kpi_total_projects': 'Total Chantiers',
      'kpi_total_projects_sub': 'Tous les projets enregistrés',
      'kpi_active_projects': 'En cours',
      'kpi_active_projects_sub': 'Chantiers actifs sur le terrain',
      'kpi_pending_projects': 'En étude',
      'kpi_pending_projects_sub': 'En préparation & planification',
      'kpi_completed_projects': 'Terminés & Livrés',
      'kpi_completed_projects_sub': 'Projets clôturés avec succès',
      'kpi_active_workers': 'Ouvriers Actifs',
      'kpi_active_workers_sub': 'Personnel actif enregistré',
      'kpi_today_attendance': 'Pointage du Jour',
      'kpi_today_attendance_sub': 'Ouvriers présents aujourd\'hui',

      // Filter Pills
      'filter_all': 'Tous',
      'filter_in_progress': 'En cours',
      'filter_planning': 'En étude',
      'filter_completed': 'Terminés',
      'filter_on_hold': 'En pause',
      'filter_by_wilaya': 'Par Wilaya',
      'filter_sort_recent': 'Plus récent',
      'filter_sort_name': 'Par nom',

      // Cockpit Table
      'table_title': 'Registre des Chantiers & Contrôle Opérationnel',
      'table_col_code': 'Code Chantier',
      'table_col_project': 'Chantier & Client',
      'table_col_location': 'Localisation & Wilaya',
      'table_col_start_date': 'Date de début',
      'table_col_status': 'Statut technique',
      'table_col_validation': 'Validation & Sync',
      'table_col_actions': 'Actions',
      'btn_open_workspace': 'Ouvrir le chantier',
      'table_empty_title': 'Aucun chantier enregistré pour le moment',
      'table_empty_desc': 'Commencez par créer votre premier chantier pour démarrer le suivi opérationnel et financier.',
      'btn_add_first_project': '+ Créer un chantier maintenant',

      // Status Labels
      'status_in_progress': 'En cours',
      'status_planning': 'En étude',
      'status_completed': 'Terminé & Livré',
      'status_on_hold': 'En pause',
      'status_draft': 'Brouillon',

      // Budget Allocation Component
      'budget_component_title': 'Répartition Budgétaire & Coûts',
      'budget_component_sub': 'Ventilation financière par corps d\'état, type d\'ouvrage et nature des coûts',
      'budget_tab_categories': 'Corps d\'état',
      'budget_tab_project_types': 'Types d\'ouvrages',
      'budget_tab_cost_nature': 'Nature des coûts',
      'budget_col_item': 'Poste / Catégorie',
      'budget_col_amount': 'Montant (DZD)',
      'budget_col_share': 'Part (%)',
      'budget_col_cost_m2': 'Coût / m²',
      'budget_empty_state': 'Aucune donnée financière enregistrée pour ces chantiers.',
      'budget_empty_desc': 'Dès l\'enregistrement des métrés, matériaux et pointages, les pourcentages s\'afficheront ici automatiquement.',
      'budget_total_cost': 'Total des coûts enregistrés',

      // Daily Pointage
      'pointage_title': 'Pointage Journalier des Ouvriers',
      'pointage_sub': 'Suivi des présences, des heures de travail et des avances sur salaires',
      'pointage_date': 'Date du pointage',
      'pointage_save_btn': 'Enregistrer le pointage',
      'pointage_whatsapp_btn': 'Partager le bilan via WhatsApp',
      'pointage_a4_btn': 'Imprimer feuille de paie A4',
      'pointage_present': 'Présent (1.0)',
      'pointage_half': 'Demi-journée (0.5)',
      'pointage_absent': 'Absent (0.0)',
      'pointage_wage': 'Salaire journalier',
      'pointage_advance': 'Avance accordée'
    }
  },

  /**
   * Translate a key into the active language
   */
  t(key, fallback = '') {
    const lang = this.currentLang;
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    if (this.translations['ar'] && this.translations['ar'][key] !== undefined) {
      return this.translations['ar'][key];
    }
    return fallback || key;
  },

  /**
   * Switch the global application language
   */
  setLang(lang) {
    this.currentLang = (lang === 'fr') ? 'fr' : 'ar';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dari_lang', this.currentLang);
    }
    const isRtl = this.currentLang === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    document.documentElement.setAttribute('lang', this.currentLang);
    document.documentElement.setAttribute('dir', dir);
    if (document.body) {
      document.body.setAttribute('dir', dir);
    }

    this.updateStaticUI();
  },

  /**
   * Update all static UI elements across header, sidebar, footer and tooltips
   */
  updateStaticUI() {
    const isFr = this.currentLang === 'fr';

    // 1. Language Toggle Button text
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
      btn.innerHTML = isFr
        ? '<span class="text-xs font-black text-blue-400">FR</span>'
        : '<span class="text-xs font-black text-emerald-400">عربي</span>';
      btn.title = this.t('tooltip_lang');
    }

    // 2. Header Elements
    const headerSub = document.querySelector('header .text-\\[11px\\].text-slate-400');
    if (headerSub) headerSub.textContent = this.t('header_subtitle');

    const headerDesc = document.querySelector('header p.text-\\[10px\\].text-slate-500');
    if (headerDesc) headerDesc.textContent = this.t('header_desc');

    const newProjBtn = document.querySelector('header button[onclick*="openNewProjectModal"]');
    if (newProjBtn) {
      const spanLg = newProjBtn.querySelector('span.hidden.sm\\:inline');
      const spanSm = newProjBtn.querySelector('span.sm\\:hidden');
      if (spanLg) spanLg.textContent = this.t('btn_new_project');
      if (spanSm) spanSm.textContent = this.t('btn_new_project_sm');
    }

    const sysStatus = document.querySelector('header .font-bold.text-white.text-\\[11px\\]');
    if (sysStatus) sysStatus.textContent = this.t('system_connected');

    const realtimeSpan = document.querySelector('header .text-slate-400.text-\\[10px\\]');
    if (realtimeSpan && realtimeSpan.textContent.includes('Realtime')) {
      realtimeSpan.textContent = this.t('realtime_active');
    }

    // Header Tooltips
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) soundBtn.title = this.t('tooltip_sound');

    const teamBtn = document.querySelector('header button[onclick*="workers"]');
    if (teamBtn) teamBtn.title = this.t('tooltip_team');

    const avatarBtn = document.querySelector('header div[onclick*="openLoginModal"]');
    if (avatarBtn) avatarBtn.title = this.t('tooltip_account');

    // 3. Sidebar Brand Subtitle
    const brandSub = document.querySelector('.brand-container .sidebar-text p.text-\\[8px\\]');
    if (brandSub) brandSub.textContent = this.t('brand_subtitle');

    const brandTag = document.querySelector('.brand-container .sidebar-text p.text-\\[9px\\]');
    if (brandTag) brandTag.textContent = this.t('app_tagline');

    const companyAddr = document.querySelector('.sidebar-company-coords div:last-child span:last-child');
    if (companyAddr) companyAddr.textContent = this.t('sidebar_company_address');

    // 4. Sidebar Nav Items (Pure Language — NO MIXING!)
    const navItems = [
      'dashboard', 'projects', 'building_structure', 'activities',
      'daily_checkin', 'workers', 'quotations_invoices', 'test_scenarios',
      'wallets', 'finances', 'materials', 'expenses', 'reports', 'settings'
    ];

    navItems.forEach(view => {
      const link = document.querySelector(`.nav-link[data-view="${view}"]`);
      if (!link) return;

      const primarySpan = link.querySelector('.sidebar-text .font-bold, .sidebar-text .font-extrabold');
      const subSpan = link.querySelector('.sidebar-text .text-\\[10px\\]');

      if (primarySpan) primarySpan.textContent = this.t('nav_' + view);
      if (subSpan) subSpan.textContent = this.t('nav_' + view + '_sub');

      // Update link tooltip title
      link.title = this.t('nav_' + view) + ' — ' + this.t('nav_' + view + '_sub');
    });

    // 5. Sidebar Category Titles
    const catTitles = document.querySelectorAll('.sidebar-category-title');
    const catKeys = ['cat_projects', 'cat_team', 'cat_pricing', 'cat_finances', 'cat_system'];
    catTitles.forEach((el, idx) => {
      if (catKeys[idx]) {
        el.textContent = this.t(catKeys[idx]);
      }
    });

    // 6. PWA Box
    const pwaTitle = document.querySelector('#pwa-install-container .font-bold.text-white');
    if (pwaTitle) pwaTitle.textContent = this.t('pwa_title');

    const pwaSub = document.querySelector('#pwa-install-container .text-\\[9px\\].text-slate-400');
    if (pwaSub) pwaSub.textContent = this.t('pwa_subtitle');

    const pwaBtn = document.getElementById('pwa-install-btn');
    if (pwaBtn) pwaBtn.textContent = this.t('pwa_button');

    // 7. Supabase Sidebar Status
    const isConn = (typeof DB !== 'undefined') ? DB.isSupabaseConnected : false;
    const sidebarPill = document.getElementById('sidebar-db-status-pill');
    if (sidebarPill) {
      const span = sidebarPill.querySelector('span:last-child');
      if (span) span.textContent = isConn ? (isFr ? 'Connecté' : 'متصل') : (isFr ? 'Local' : 'محلي');
    }
    const sidebarSub = document.getElementById('sidebar-db-subtitle');
    if (sidebarSub) {
      sidebarSub.textContent = isConn ? this.t('sidebar_db_synced') : this.t('sidebar_db_local');
    }

    // 8. Sidebar Collapse Toggle Button title
    const collapseBtn = document.getElementById('sidebar-toggle-btn');
    if (collapseBtn) collapseBtn.title = this.t('tooltip_collapse');
  }
};

// Global shorthand helper
window.I18N = I18N;
window.t = function(key, fallback = '') {
  return I18N.t(key, fallback);
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = I18N;
}
