(function () {
  if (document.getElementById('supabase-host')) return;

  const host = document.createElement('div');
  host.id = 'supabase-host';
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: 'open' });

  if (!document.getElementById('mn-lato-font')) {
    const link = document.createElement('link');
    link.id = 'mn-lato-font'; link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap';
    document.head.appendChild(link);
  }

  shadow.innerHTML = `
  <style>
    :host { all: initial; }
    * { box-sizing: border-box; }

    /* ── FAB ── */
    #fab {
      position: fixed; bottom: 32px; right: 32px;
      width: 52px; height: 52px; border-radius: 50%;
      background: #fff; border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25); padding: 8px;
      display: flex; align-items: center; justify-content: center;
      z-index: 10000; transition: box-shadow 0.2s, transform 0.2s;
    }
    #fab:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.3); transform: scale(1.08); }
    #fab img { width: 100%; height: 100%; object-fit: contain; }

    /* ── View panel ── */
    #panel {
      position: fixed; top: 0; right: 0; width: 360px; height: 100vh;
      background: #fff; border-left: 1px solid #e8eaed;
      box-shadow: -4px 0 24px rgba(0,0,0,0.1);
      font-family: 'Lato', sans-serif; z-index: 9999;
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    #panel.open { transform: translateX(0); }

    #edit-btn {
      position: absolute; top: 12px; left: 12px;
      background: none; border: none; cursor: pointer; color: #9aa0a6;
      padding: 4px; z-index: 1; display: flex; align-items: center;
      justify-content: center; border-radius: 6px;
      transition: color 0.15s, background 0.15s;
    }
    #edit-btn:hover { color: #202124; background: #f1f3f4; }

    #panel-close {
      position: absolute; top: 12px; right: 12px;
      background: none; border: none; cursor: pointer; color: #9aa0a6;
      font-size: 20px; line-height: 1; padding: 4px; z-index: 1;
    }
    #panel-close:hover { color: #202124; }

    #panel-body { flex: 1; overflow-y: auto; padding-bottom: 24px; }

    /* ── Spinner / status ── */
    .spinner {
      width: 24px; height: 24px; border: 2px solid #e8eaed;
      border-top-color: #1a73e8; border-radius: 50%;
      animation: spin 0.7s linear infinite; margin: 48px auto;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status {
      padding: 48px 20px; font-size: 13px; color: #9aa0a6;
      text-align: center; font-family: 'Lato', sans-serif;
    }
    .status.error { color: #d93025; }

    /* ── Hero ── */
    .hero {
      display: flex; flex-direction: column; align-items: center;
      padding: 28px 20px 16px; text-align: center;
    }
    .hero-logo {
      width: 64px; height: 64px; border-radius: 14px; object-fit: contain;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12); margin-bottom: 10px; background: #f8f9fa;
    }
    .hero-logo-placeholder {
      width: 64px; height: 64px; border-radius: 14px; background: #e8f0fe;
      color: #1a73e8; font-size: 18px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    .hero-name { font-size: 18px; font-weight: 700; color: #202124; }
    .hero-meta {
      display: flex; align-items: center; gap: 8px; margin-top: 4px;
    }
    .hero-retainer { font-size: 12px; color: #9aa0a6; }
    .hero-badge {
      font-size: 10px; font-weight: 700; padding: 2px 7px;
      border-radius: 20px; text-transform: uppercase; letter-spacing: 0.4px;
    }
    .hero-badge.active   { background: #e6f4ea; color: #1e7e34; }
    .hero-badge.inactive { background: #fce8e6; color: #c5221f; }

    /* ── Section ── */
    .section { padding: 12px 20px 4px; }
    .section-label {
      font-size: 10px; font-weight: 700; color: #9aa0a6;
      text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
    }
    .divider { height: 1px; background: #f1f3f4; margin: 4px 20px; }

    /* ── Team ── */
    .member { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
    .member-avatar {
      width: 28px; height: 28px; border-radius: 50%; background: #f1f3f4;
      display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;
    }
    .member-name { font-size: 13px; color: #202124; }

    /* ── Tools ── */
    .tool-row { display: flex; align-items: center; justify-content: space-between; padding: 3px 0; }
    .tool-left {
      display: flex; align-items: center; gap: 8px; font-size: 11px;
      font-weight: 700; color: #5f6368; text-transform: uppercase; letter-spacing: 0.4px;
    }
    .tool-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
    .tool-pills { display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-end; }
    .tool-pill {
      font-size: 11px; font-weight: 600; padding: 2px 8px;
      border-radius: 20px; background: #e8f5e9; color: #2e7d32;
    }

    /* ── Links ── */
    .link-row {
      display: flex; align-items: center; gap: 10px; padding: 6px 10px;
      border: 1px solid #e8eaed; border-radius: 8px; margin-bottom: 6px;
      text-decoration: none; color: #202124; font-size: 13px;
      font-family: 'Lato', sans-serif; transition: background 0.15s;
    }
    .link-row:hover { background: #f8f9fa; }
    .link-icon {
      width: 24px; height: 24px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; border-radius: 5px;
    }
    .link-icon svg { display: block; }

    /* ── Ad Accounts ── */
    .adacc-grid { display: flex; flex-direction: column; gap: 6px; }
    .adacc-row {
      display: flex; align-items: center; gap: 10px; padding: 6px 10px;
      border: 1px solid #e8eaed; border-radius: 8px;
      text-decoration: none; color: #202124; font-family: 'Lato', sans-serif;
      transition: background 0.15s;
    }
    .adacc-row:hover { background: #f8f9fa; }
    .adacc-icon { width: 24px; height: 24px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .adacc-label { font-size: 11px; font-weight: 700; color: #5f6368; width: 52px; flex-shrink: 0; }
    .adacc-id { font-size: 12px; color: #202124; font-family: monospace; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .adacc-arrow { font-size: 11px; color: #9aa0a6; flex-shrink: 0; }

    /* ── Onboarding flags ── */
    .flags-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .flag-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600;
    }
    .flag-chip.on  { background: #e6f4ea; color: #1e7e34; }
    .flag-chip.off { background: #f8f9fa; color: #9aa0a6; }
    .flag-chip-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .flag-chip.on  .flag-chip-dot { background: #34a853; }
    .flag-chip.off .flag-chip-dot { background: #dadce0; }

    /* ── Config row ── */
    .config-row { display: flex; gap: 8px; }
    .config-chip {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      padding: 7px 8px; background: #f8f9fa; border-radius: 8px; gap: 2px;
    }
    .config-chip-label { font-size: 10px; color: #9aa0a6; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; text-align: center; }
    .config-chip-val { font-size: 12px; font-weight: 700; color: #202124; }
    .config-chip-val.on  { color: #1e7e34; }
    .config-chip-val.off { color: #9aa0a6; }

    /* ════════════════════════════════════
       EDIT PANEL
    ════════════════════════════════════ */
    #edit-panel {
      position: fixed; top: 0; right: 0; width: 460px; height: 100vh;
      background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.15);
      font-family: 'Lato', sans-serif; z-index: 10001;
      display: flex; flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
    }
    #edit-panel.open { transform: translateX(0); }

    .ep-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
    }
    .ep-header-title { font-size: 15px; font-weight: 700; color: #111827; }
    .ep-header-sub   { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .ep-header-close {
      background: none; border: none; cursor: pointer; color: #d1d5db;
      font-size: 16px; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      border-radius: 6px; transition: color 0.15s, background 0.15s;
    }
    .ep-header-close:hover { color: #374151; background: #f3f4f6; }

    /* Tabs */
    .ep-tabs {
      display: flex; border-bottom: 1px solid #f3f4f6;
      padding: 0 20px; overflow-x: auto; flex-shrink: 0; gap: 0;
      scrollbar-width: none;
    }
    .ep-tabs::-webkit-scrollbar { display: none; }
    .ep-tab {
      font-size: 11px; font-weight: 700; color: #9ca3af;
      padding: 9px 10px; border: none; background: none; cursor: pointer;
      border-bottom: 2px solid transparent; white-space: nowrap;
      font-family: 'Lato', sans-serif;
      transition: color 0.15s;
    }
    .ep-tab.active { color: #022547; border-bottom-color: #022547; }
    .ep-tab:hover:not(.active) { color: #374151; }

    .ep-body { flex: 1; overflow-y: auto; }
    .ep-tab-pane { display: none; padding: 0 20px 24px; }
    .ep-tab-pane.active { display: block; }

    .ep-section { padding-top: 18px; }
    .ep-section-title {
      font-size: 10px; font-weight: 700; color: #9ca3af;
      text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
    }
    .ep-fields { display: flex; flex-direction: column; gap: 10px; }
    .ep-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .ep-label { display: block; font-size: 11px; color: #9ca3af; margin-bottom: 4px; }

    .ep-input, .ep-select, .ep-textarea {
      width: 100%; font-size: 13px; font-family: 'Lato', sans-serif;
      border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 10px;
      background: #fff; color: #111827; outline: none;
      transition: box-shadow 0.15s, border-color 0.15s;
    }
    .ep-textarea { resize: vertical; min-height: 70px; }
    .ep-input:focus, .ep-select:focus, .ep-textarea:focus {
      border-color: transparent; box-shadow: 0 0 0 2px #108FFF;
    }
    .ep-input-prefix { position: relative; }
    .ep-input-prefix .ep-pfx {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      font-size: 13px; color: #9ca3af; pointer-events: none;
    }
    .ep-input-prefix .ep-input { padding-left: 18px; }
    .ep-input.readonly { background: #f9fafb; color: #6b7280; cursor: default; }

    /* Bool toggle row */
    .ep-bool-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; background: #f9fafb; border-radius: 8px;
    }
    .ep-bool-label { font-size: 13px; color: #374151; }
    .ep-bool-toggle {
      display: flex; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;
    }
    .ep-bool-opt {
      font-size: 11px; font-weight: 700; padding: 4px 10px;
      border: none; cursor: pointer; font-family: 'Lato', sans-serif;
      background: #fff; color: #9ca3af; transition: background 0.15s, color 0.15s;
    }
    .ep-bool-opt.selected-yes { background: #e6f4ea; color: #1e7e34; }
    .ep-bool-opt.selected-no  { background: #fce8e6; color: #c5221f; }

    /* Tools */
    .ep-tools-wrap { position: relative; }
    .ep-tools-btn {
      width: 100%; font-size: 13px; font-family: 'Lato', sans-serif;
      border: 1px solid #e5e7eb; border-radius: 6px; padding: 6px 10px;
      background: #fff; color: #374151; text-align: left; cursor: pointer;
      display: flex; align-items: center; justify-content: space-between; gap: 8px; outline: none;
      transition: box-shadow 0.15s;
    }
    .ep-tools-btn:focus, .ep-tools-btn.active { box-shadow: 0 0 0 2px #108FFF; border-color: transparent; }
    .ep-tools-btn-text { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
    .ep-tools-dropdown {
      display: none; border: 1px solid #e5e7eb; border-radius: 6px;
      background: #fff; margin-top: 4px; padding: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .ep-tools-dropdown.open { display: block; }
    .ep-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; min-height: 4px; }
    .ep-tag {
      display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600;
      padding: 3px 8px; background: #eff6ff; color: #1d4ed8; border-radius: 20px;
    }
    .ep-tag-rm { cursor: pointer; font-size: 13px; color: #93c5fd; background: none; border: none; padding: 0; line-height: 1; }
    .ep-tag-rm:hover { color: #1d4ed8; }
    .ep-tools-add { display: flex; gap: 6px; }
    .ep-tools-add .ep-input { margin: 0; }
    .ep-add-btn {
      flex-shrink: 0; font-size: 12px; font-weight: 700;
      background: #eff6ff; color: #1d4ed8; border: none;
      border-radius: 6px; padding: 0 10px; cursor: pointer; white-space: nowrap;
      font-family: 'Lato', sans-serif;
    }
    .ep-add-btn:hover { background: #dbeafe; }

    /* Footer */
    .ep-footer {
      flex-shrink: 0; padding: 12px 20px; border-top: 1px solid #f3f4f6;
      display: flex; align-items: center; justify-content: flex-end; gap: 8px; background: #fff;
    }
    .ep-cancel {
      font-size: 13px; color: #9ca3af; background: none; border: none;
      cursor: pointer; padding: 6px 12px; border-radius: 6px;
      transition: color 0.15s, background 0.15s; font-family: 'Lato', sans-serif;
    }
    .ep-cancel:hover { color: #374151; background: #f3f4f6; }
    .ep-save {
      font-size: 13px; font-weight: 700; background: #022547; color: #fff;
      border: none; border-radius: 6px; padding: 7px 18px; cursor: pointer;
      min-width: 110px; text-align: center; font-family: 'Lato', sans-serif;
      transition: background 0.15s, opacity 0.15s;
    }
    .ep-save:hover { background: #033a6a; }
    .ep-save:disabled { opacity: 0.5; cursor: default; }
  </style>

  <button id="fab" title="Open Matchnode Panel"><img id="fab-img" alt="" /></button>

  <div id="panel">
    <button id="edit-btn" title="Edit client">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M10 1.5l2.5 2.5-7.5 7.5-3 .5.5-3 7.5-7.5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <button id="panel-close" title="Close">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <div id="panel-body"><div class="spinner"></div></div>
  </div>

  <div id="edit-panel"></div>
  `;

  shadow.getElementById('fab-img').src = chrome.runtime.getURL('Icon.png');

  const fab       = shadow.getElementById('fab');
  const panel     = shadow.getElementById('panel');
  const body      = shadow.getElementById('panel-body');
  const closeBtn  = shadow.getElementById('panel-close');
  const editBtn   = shadow.getElementById('edit-btn');
  const editPanel = shadow.getElementById('edit-panel');
  let   currentClient = null;

  // ── URL parsing ──────────────────────────────────────────────
  function getGChatRoomId() {
    const m = window.location.pathname.match(/\/(?:app\/chat|room)\/([^/]+)/);
    return m ? m[1] : null;
  }

  // ── Helpers ──────────────────────────────────────────────────
  function initials(name) {
    if (!name) return '?';
    return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }
  function emailToName(email) {
    if (!email) return null;
    return email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
  function fmt$(n) {
    if (!n && n !== 0) return null;
    return '$' + Number(n).toLocaleString() + '/mo';
  }
  function el(tag, props = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === 'className') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else e[k] = v;
    });
    children.forEach(c => c && e.appendChild(c));
    return e;
  }

  // ── View icons & labels ──────────────────────────────────────
  const LINK_ICONS = {
    weekly_doc_folder_link:    `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#1a73e8"/><path d="M5 7h10M5 10h10M5 13h6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    ongoing_call_notes_doc_id: `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#e84393"/><path d="M6 7c0 4.5 3.5 7 7 7l1-2-2-1-1 1c-1.5-.8-2.5-2-3-3l1-1-1-2-2 1z" fill="#fff"/></svg>`,
    ad_approval_sheet:         `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#34a853"/><path d="M5 5h4v4H5zM11 5h4v4h-4zM5 11h4v4H5zM11 11h4v4h-4z" fill="#fff" opacity=".9"/></svg>`,
    asana_project_id:          `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#f06a6a"/><circle cx="10" cy="7" r="2.5" fill="#fff"/><circle cx="6" cy="13" r="2.5" fill="#fff"/><circle cx="14" cy="13" r="2.5" fill="#fff"/></svg>`,
    onboarding_sow_link:       `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#8e44ad"/><path d="M6 5h8v10H6z" stroke="#fff" stroke-width="1.2" fill="none"/><path d="M8 8h4M8 11h3" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    sales_call_notes_doc:      `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#f39c12"/><path d="M6 7c0 4.5 3.5 7 7 7l1-2-2-1-1 1c-1.5-.8-2.5-2-3-3l1-1-1-2-2 1z" fill="#fff"/></svg>`,
    coda_weekly_doc_metrics_doc_link: `<svg width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" rx="4" fill="#e74c3c"/><path d="M5 7h10M5 10h10M5 13h10" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  };
  const LINK_LABELS = {
    weekly_doc_folder_link:           'Weekly Docs',
    ongoing_call_notes_doc_id:        'Call Notes',
    ad_approval_sheet:                'Ad Approvals',
    asana_project_id:                 'Asana',
    onboarding_sow_link:              'SOW',
    sales_call_notes_doc:             'Sales Call Notes',
    coda_weekly_doc_metrics_doc_link: 'Weekly Doc Metrics',
  };
  function linkHref(key, val) {
    if (!val) return null;
    if (val.startsWith('http')) return val;
    if (key === 'ongoing_call_notes_doc_id') return `https://docs.google.com/document/d/${val}`;
    if (key === 'asana_project_id')          return `https://app.asana.com/0/${val}`;
    return val;
  }
  const ADACC = [
    { key: 'meta_adaccountid',    label: 'Meta',    icon: `<svg width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="4" fill="#0082fb"/><path d="M3 9c0-2 1.1-3.3 2.3-3.3C6.6 5.7 7.7 7 8.5 9c.8-2 2-3.3 3.3-3.3C13 5.7 14 7 14 9s-1 3.3-2.3 3.3C10.5 12.3 9.5 11 8.5 9c-.8 2-2 3.3-3.3 3.3C4 12.3 3 11 3 9z" stroke="#fff" stroke-width="1.2" fill="none"/></svg>`, href: id => `https://business.facebook.com/adsmanager/manage/?act=${id}` },
    { key: 'google_adaccountid',  label: 'Google',  icon: `<svg width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="4" fill="#fff" stroke="#e8eaed"/><text x="9" y="13" text-anchor="middle" font-size="10" font-weight="700" fill="#4285f4" font-family="sans-serif">G</text></svg>`, href: id => `https://ads.google.com/aw/overview?__e=${id}` },
    { key: 'tiktok_adaccountid',  label: 'TikTok',  icon: `<svg width="18" height="18" viewBox="0 0 18 18"><rect width="18" height="18" rx="4" fill="#010101"/><path d="M11.5 4a2.8 2.8 0 002 2.2v1.4a4.2 4.2 0 01-2-.7v3.6a3.1 3.1 0 11-2.2-3v1.5a1.6 1.6 0 101.6 1.5V4h.6z" fill="#fff"/></svg>`, href: id => `https://ads.tiktok.com/i18n/dashboard?aadvid=${id}` },
  ];

  // ── View render ──────────────────────────────────────────────
  async function renderClient(c) {
    currentClient = c;
    body.innerHTML = '';

    const emails = [c.account_manager, c.media_buyer, c.creative_designer].filter(Boolean);
    let nameMap = {};
    try { nameMap = await getTeammateNames(emails); } catch (_) {}

    // Hero
    const hero = el('div', { className: 'hero' });
    const logoPh = el('div', { className: 'hero-logo-placeholder', text: initials(c.client_name) });
    hero.appendChild(logoPh);
    if (c.logo_url) {
      chrome.runtime.sendMessage({ type: 'FETCH_IMAGE', url: c.logo_url }, res => {
        if (res?.dataUrl && logoPh.isConnected) {
          const img = el('img', { className: 'hero-logo', src: res.dataUrl, alt: c.client_name });
          logoPh.replaceWith(img);
        }
      });
    }
    hero.appendChild(el('div', { className: 'hero-name', text: c.client_name }));
    const heroMeta = el('div', { className: 'hero-meta' });
    if (c.onboarding_payment_amount) heroMeta.appendChild(el('span', { className: 'hero-retainer', text: fmt$(c.onboarding_payment_amount) }));
    heroMeta.appendChild(el('span', { className: `hero-badge ${c.active ? 'active' : 'inactive'}`, text: c.active ? 'Active' : 'Inactive' }));
    hero.appendChild(heroMeta);
    body.appendChild(hero);

    // Team
    const team = [
      { email: c.account_manager,   emoji: '🎙️' },
      { email: c.media_buyer,       emoji: '⌨️' },
      { email: c.creative_designer, emoji: '🎨' },
    ].filter(t => t.email);
    if (team.length) {
      body.appendChild(el('div', { className: 'divider' }));
      const sec = el('div', { className: 'section' });
      sec.appendChild(el('div', { className: 'section-label', text: 'Team' }));
      team.forEach(t => {
        const name = nameMap[t.email] || emailToName(t.email);
        const row = el('div', { className: 'member' });
        row.appendChild(el('div', { className: 'member-avatar', text: t.emoji }));
        row.appendChild(el('span', { className: 'member-name', text: name }));
        sec.appendChild(row);
      });
      body.appendChild(sec);
    }

    // Tools
    const tools = Array.isArray(c.tools_resources) ? c.tools_resources.filter(Boolean) : [];
    if (tools.length) {
      body.appendChild(el('div', { className: 'divider' }));
      const sec = el('div', { className: 'section' });
      sec.appendChild(el('div', { className: 'section-label', text: 'Tools' }));
      const COLORS = ['#4285f4','#34a853','#ff6d00','#7c4dff','#e91e63','#00897b','#f4b400','#46bdc6'];
      const PSTYLES = [
        {bg:'#e8f0fe',color:'#1557b0'},{bg:'#e6f4ea',color:'#1e7e34'},{bg:'#fff3e0',color:'#b45309'},
        {bg:'#f3e8fd',color:'#6b21a8'},{bg:'#fce4ec',color:'#9d174d'},{bg:'#e0f2f1',color:'#00695c'},
        {bg:'#fffde7',color:'#92400e'},{bg:'#e0f7fa',color:'#006064'},
      ];
      const groups = new Map();
      tools.forEach(t => {
        const ci = t.indexOf(':');
        const label = ci > -1 ? t.slice(0, ci).trim() : t;
        const pill  = ci > -1 ? t.slice(ci + 1).trim() : null;
        if (!groups.has(label)) groups.set(label, []);
        if (pill) groups.get(label).push(pill);
      });
      let ci = 0;
      groups.forEach((pills, label) => {
        const idx = ci++ % COLORS.length;
        const row = el('div', { className: 'tool-row' });
        const left = el('span', { className: 'tool-left' });
        left.appendChild(el('span', { className: 'tool-dot', style: `background:${COLORS[idx]}` }));
        left.appendChild(document.createTextNode(label));
        row.appendChild(left);
        if (pills.length) {
          const wrap = el('div', { className: 'tool-pills' });
          pills.forEach(p => {
            const pill = el('span', { className: 'tool-pill', text: p });
            pill.style.background = PSTYLES[idx].bg;
            pill.style.color = PSTYLES[idx].color;
            wrap.appendChild(pill);
          });
          row.appendChild(wrap);
        }
        sec.appendChild(row);
      });
      body.appendChild(sec);
    }

    // Links
    const linkKeys = ['weekly_doc_folder_link','ongoing_call_notes_doc_id','ad_approval_sheet',
      'onboarding_sow_link','sales_call_notes_doc','coda_weekly_doc_metrics_doc_link'].filter(k => c[k]);
    if (linkKeys.length) {
      body.appendChild(el('div', { className: 'divider' }));
      const sec = el('div', { className: 'section' });
      sec.appendChild(el('div', { className: 'section-label', text: 'Links' }));
      linkKeys.forEach(k => {
        const href = linkHref(k, c[k]);
        if (!href) return;
        const a = el('a', { className: 'link-row', href, target: '_blank', rel: 'noopener noreferrer' });
        a.innerHTML = `<span class="link-icon">${LINK_ICONS[k] || ''}</span>${LINK_LABELS[k] || k}`;
        sec.appendChild(a);
      });
      body.appendChild(sec);
    }

    // Ad Accounts
    const activeAccs = ADACC.filter(a => c[a.key]);
    if (activeAccs.length) {
      body.appendChild(el('div', { className: 'divider' }));
      const sec = el('div', { className: 'section' });
      sec.appendChild(el('div', { className: 'section-label', text: 'Ad Accounts' }));
      const grid = el('div', { className: 'adacc-grid' });
      activeAccs.forEach(acc => {
        const a = el('a', { className: 'adacc-row', href: acc.href(c[acc.key]), target: '_blank', rel: 'noopener noreferrer' });
        a.innerHTML = `<span class="adacc-icon">${acc.icon}</span><span class="adacc-label">${acc.label}</span><span class="adacc-id">${c[acc.key]}</span><span class="adacc-arrow">↗</span>`;
        grid.appendChild(a);
      });
      sec.appendChild(grid);
      body.appendChild(sec);
    }

    // Config
    body.appendChild(el('div', { className: 'divider' }));
    const cfgSec = el('div', { className: 'section' });
    cfgSec.appendChild(el('div', { className: 'section-label', text: 'Config' }));
    const cfgRow = el('div', { className: 'config-row' });
    [
      { label: 'Hours Form',  val: c.show_hours_form },
      { label: 'Auto Doc',    val: c.auto_generate_weekly_doc },
    ].forEach(cfg => {
      const chip = el('div', { className: 'config-chip' });
      chip.appendChild(el('span', { className: 'config-chip-label', text: cfg.label }));
      chip.appendChild(el('span', { className: `config-chip-val ${cfg.val ? 'on' : 'off'}`, text: cfg.val ? 'Yes' : 'No' }));
      cfgRow.appendChild(chip);
    });
    cfgSec.appendChild(cfgRow);
    body.appendChild(cfgSec);
  }

  // ── Edit panel helpers ───────────────────────────────────────
  function makeInput(name, val, ph = '', type = 'text') {
    return el('input', { className: 'ep-input', name, type, value: val || '', placeholder: ph });
  }
  function makeSelect(name, options, value) {
    const sel = el('select', { className: 'ep-select', name });
    options.forEach(([v, l]) => {
      const opt = el('option', { value: v, text: l });
      if (v === value) opt.selected = true;
      sel.appendChild(opt);
    });
    return sel;
  }
  function makeTeammateSelect(name, teammates, value) {
    return makeSelect(name, [['','— None —'], ...teammates.map(t => [t.email, t.full_name])], value || '');
  }
  function makeField(labelText, inputEl) {
    const wrap = el('div', {});
    wrap.appendChild(el('label', { className: 'ep-label', text: labelText }));
    wrap.appendChild(inputEl);
    return wrap;
  }
  function makeBoolRow(labelText, name, value) {
    const row = el('div', { className: 'ep-bool-row' });
    row.appendChild(el('span', { className: 'ep-bool-label', text: labelText }));
    const toggle = el('div', { className: 'ep-bool-toggle' });
    const yesBtn = el('button', { type: 'button', className: 'ep-bool-opt', text: 'Yes' });
    const noBtn  = el('button', { type: 'button', className: 'ep-bool-opt', text: 'No' });
    // Hidden input for form collection
    const hidden = el('input', { type: 'hidden', name, value: value ? 'true' : 'false' });
    let current = !!value;
    function update() {
      yesBtn.className = `ep-bool-opt${current ? ' selected-yes' : ''}`;
      noBtn.className  = `ep-bool-opt${!current ? ' selected-no' : ''}`;
      hidden.value = current ? 'true' : 'false';
    }
    update();
    yesBtn.addEventListener('click', () => { current = true;  update(); });
    noBtn .addEventListener('click', () => { current = false; update(); });
    toggle.appendChild(yesBtn);
    toggle.appendChild(noBtn);
    row.appendChild(toggle);
    row.appendChild(hidden);
    return row;
  }
  function buildToolsField(tools) {
    let current = Array.isArray(tools) ? [...tools] : [];
    const wrap = el('div', { className: 'ep-tools-wrap' });
    const btn = el('button', { type: 'button', className: 'ep-tools-btn' });
    const btnText = el('span', { className: 'ep-tools-btn-text' });
    btn.appendChild(btnText);
    btn.appendChild(el('span', { style: 'color:#9ca3af;font-size:11px;flex-shrink:0', text: '▾' }));
    const dropdown = el('div', { className: 'ep-tools-dropdown' });
    const tagsEl = el('div', { className: 'ep-tags' });
    const addRow = el('div', { className: 'ep-tools-add' });
    const addInput = el('input', { className: 'ep-input', placeholder: 'e.g. ANALYTICS: GA4' });
    const addBtn = el('button', { type: 'button', className: 'ep-add-btn', text: '+ Add' });
    addRow.appendChild(addInput); addRow.appendChild(addBtn);
    dropdown.appendChild(tagsEl); dropdown.appendChild(addRow);
    function refresh() {
      btnText.textContent = current.length ? current.join(', ') : 'None';
      tagsEl.innerHTML = '';
      current.forEach((t, i) => {
        const tag = el('span', { className: 'ep-tag', text: t });
        const rm = el('button', { type: 'button', className: 'ep-tag-rm', text: '×' });
        rm.addEventListener('click', () => { current.splice(i, 1); refresh(); });
        tag.appendChild(rm);
        tagsEl.appendChild(tag);
      });
    }
    refresh();
    addBtn.addEventListener('click', () => {
      const v = addInput.value.trim();
      if (v && !current.includes(v)) { current.push(v); refresh(); }
      addInput.value = '';
    });
    addInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });
    btn.addEventListener('click', () => { dropdown.classList.toggle('open'); btn.classList.toggle('active'); });
    wrap.appendChild(btn); wrap.appendChild(dropdown);
    wrap.getTools = () => current;
    return wrap;
  }

  // ── Open edit panel ──────────────────────────────────────────
  async function openEditPanel() {
    if (!currentClient) return;
    const c = currentClient;
    editPanel.innerHTML = '<div class="spinner" style="margin:48px auto"></div>';
    editPanel.classList.add('open');
    let teammates = [];
    try { teammates = await getActiveTeammates(); } catch (_) {}
    const accts     = teammates.filter(t => t.department === 'Accounts');
    const buyers    = teammates.filter(t => t.department === 'Media Buying');
    const creatives = teammates.filter(t => t.department === 'Creative');
    editPanel.innerHTML = '';

    // Header
    const hdr = el('div', { className: 'ep-header' });
    const hdrInfo = el('div', {});
    hdrInfo.appendChild(el('div', { className: 'ep-header-title', text: c.client_name }));
    hdrInfo.appendChild(el('div', { className: 'ep-header-sub',   text: 'Edit client details' }));
    const hdrClose = el('button', { className: 'ep-header-close', text: '✕' });
    hdrClose.addEventListener('click', closeEditPanel);
    hdr.appendChild(hdrInfo); hdr.appendChild(hdrClose);
    editPanel.appendChild(hdr);

    // Tabs
    const TABS = [
      { id: 'general',    label: 'General' },
      { id: 'team',       label: 'Team' },
      { id: 'links',      label: 'Links' },
      { id: 'ids',        label: 'IDs' },
      { id: 'advanced',   label: 'Advanced' },
      { id: 'onboarding', label: 'Onboarding' },
    ];
    const tabBar = el('div', { className: 'ep-tabs' });
    const panes = {};
    TABS.forEach(t => {
      const btn = el('button', { className: 'ep-tab', text: t.label });
      btn.dataset.tab = t.id;
      btn.addEventListener('click', () => {
        tabBar.querySelectorAll('.ep-tab').forEach(b => b.classList.remove('active'));
        epBody.querySelectorAll('.ep-tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        panes[t.id].classList.add('active');
      });
      tabBar.appendChild(btn);
      const pane = el('div', { className: 'ep-tab-pane' });
      panes[t.id] = pane;
    });
    tabBar.firstChild.classList.add('active');
    editPanel.appendChild(tabBar);

    const epBody = el('div', { className: 'ep-body' });
    Object.values(panes).forEach(p => epBody.appendChild(p));
    editPanel.appendChild(epBody);
    panes['general'].classList.add('active');

    // ── GENERAL TAB
    let toolsField;
    {
      const sec = el('div', { className: 'ep-section' });
      const fields = el('div', { className: 'ep-fields' });
      // Retainer with $ prefix
      const retWrap = el('div', {});
      retWrap.appendChild(el('label', { className: 'ep-label', text: 'Monthly Retainer' }));
      const retPfx = el('div', { className: 'ep-input-prefix' });
      retPfx.appendChild(el('span', { className: 'ep-pfx', text: '$' }));
      const retInput = el('input', { className: 'ep-input', name: 'onboarding_payment_amount', type: 'number', min: '0', value: c.onboarding_payment_amount || '', placeholder: '0' });
      retPfx.appendChild(retInput); retWrap.appendChild(retPfx);
      fields.appendChild(retWrap);
      fields.appendChild(makeField('Status', makeSelect('active', [['true','Active'],['false','Inactive']], String(c.active))));
      fields.appendChild(makeField('Logo URL', makeInput('logo_url', c.logo_url, 'https://…')));
      const toolsWrap = el('div', {});
      toolsWrap.appendChild(el('label', { className: 'ep-label', text: 'Tools & Resources' }));
      toolsField = buildToolsField(c.tools_resources);
      toolsWrap.appendChild(toolsField);
      fields.appendChild(toolsWrap);

      const row2 = el('div', { className: 'ep-row2' });
      row2.appendChild(makeField('Show in Hours Form',   makeSelect('show_hours_form',       [['true','Yes'],['false','No']], String(c.show_hours_form))));
      row2.appendChild(makeField('Auto Generate Weekly Doc', makeSelect('auto_generate_weekly_doc', [['true','Yes'],['false','No']], String(c.auto_generate_weekly_doc))));
      fields.appendChild(row2);
      sec.appendChild(fields); panes['general'].appendChild(sec);
    }

    // ── TEAM TAB
    {
      const sec = el('div', { className: 'ep-section' });
      sec.appendChild(el('div', { className: 'ep-section-title', text: 'Assignments' }));
      const fields = el('div', { className: 'ep-fields' });
      fields.appendChild(makeField('Account Manager',  makeTeammateSelect('account_manager',   accts,     c.account_manager)));
      fields.appendChild(makeField('Media Buyer',      makeTeammateSelect('media_buyer',       buyers,    c.media_buyer)));
      fields.appendChild(makeField('Creative Designer',makeTeammateSelect('creative_designer', creatives, c.creative_designer)));
      sec.appendChild(fields);
      panes['team'].appendChild(sec);
    }

    // ── LINKS TAB
    {
      const sec = el('div', { className: 'ep-section' });
      const fields = el('div', { className: 'ep-fields' });
      [
        ['Weekly Docs URL',        'weekly_doc_folder_link',           'https://…'],
        ['Call Notes Doc ID',      'ongoing_call_notes_doc_id',        'Doc ID or URL'],
        ['Ad Approval Sheet URL',  'ad_approval_sheet',                'https://…'],
        ['SOW Link',               'onboarding_sow_link',              'https://…'],
        ['Sales Call Notes',       'sales_call_notes_doc',             'https://…'],
        ['Setup Guide Link',       'onboarding_setup_guide_link',      'https://…'],
        ['Onboarding LP',          'onboarding_lp',                    'https://…'],
        ['Weekly Doc Metrics Link', 'coda_weekly_doc_metrics_doc_link', 'https://…'],
      ].forEach(([lbl, name, ph]) => fields.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      sec.appendChild(fields); panes['links'].appendChild(sec);
    }

    // ── IDs TAB
    {
      const sec1 = el('div', { className: 'ep-section' });
      sec1.appendChild(el('div', { className: 'ep-section-title', text: 'Ad Platforms' }));
      const f1 = el('div', { className: 'ep-fields' });
      [
        ['Meta Ad Account ID',   'meta_adaccountid',   'act_123…'],
        ['Google Ad Account ID', 'google_adaccountid', '1234567890'],
        ['TikTok Ad Account ID', 'tiktok_adaccountid', ''],
      ].forEach(([lbl, name, ph]) => f1.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      sec1.appendChild(f1);

      const sec2 = el('div', { className: 'ep-section' });
      sec2.appendChild(el('div', { className: 'ep-section-title', text: 'Project IDs' }));
      const f2 = el('div', { className: 'ep-fields' });
      [
        ['Asana Project ID',        'asana_project_id',              '0/1234…'],
        ['Slack Channel ID',        'slack_channel_id',              'C0XXXXXXX'],
        ['Fernando Slack Channel',  'fernando_slack_channel_id',     'C0XXXXXXX'],
        ['GChat Channel ID',        'gchat_channel_id',              ''],
        ['GChat Media Buying',      'gchat_channel_id_mediabuying',  ''],
        ['GChat Creative',          'gchat_channel_id_creative',     ''],
      ].forEach(([lbl, name, ph]) => f2.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      sec2.appendChild(f2);
      panes['ids'].appendChild(sec1); panes['ids'].appendChild(sec2);
    }

    // ── ONBOARDING TAB
    {
      const sec1 = el('div', { className: 'ep-section' });
      sec1.appendChild(el('div', { className: 'ep-section-title', text: 'Status' }));
      const f1 = el('div', { className: 'ep-fields' });
      [
        ['SOW Signed',          'onboarding_sow_signed',                  c.onboarding_sow_signed],
        ['Payment Added',       'onboarding_payment_added',               c.onboarding_payment_added],
        ['Setup Guide Done',    'onboarding_setup_guide_completed_guide',  c.onboarding_setup_guide_completed_guide],
        ['Kickoff Scheduled',   'onboarding_kickoff_scheduled',           c.onboarding_kickoff_scheduled],
      ].forEach(([lbl, name, val]) => f1.appendChild(makeBoolRow(lbl, name, val)));
      sec1.appendChild(f1);

      const sec2 = el('div', { className: 'ep-section' });
      sec2.appendChild(el('div', { className: 'ep-section-title', text: 'Details' }));
      const f2 = el('div', { className: 'ep-fields' });
      [
        ['Client Emails',       'onboarding_client_emails',      'email1@…, email2@…'],
        ['Payment Link',        'onboarding_payment_link',       'https://…'],
        ['Kickoff Calendar',    'onboarding_kickoff_calendar_link','https://…'],
      ].forEach(([lbl, name, ph]) => f2.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      sec2.appendChild(f2);
      panes['onboarding'].appendChild(sec1); panes['onboarding'].appendChild(sec2);
    }

    // ── ADVANCED TAB
    {
      const sec1 = el('div', { className: 'ep-section' });
      sec1.appendChild(el('div', { className: 'ep-section-title', text: 'Coda' }));
      const f1 = el('div', { className: 'ep-fields' });
      [
        ['Metrics Doc ID',    'coda_weekly_doc_metrics_doc_id', ''],
        ['Source Table ID',   'coda_weekly_doc_source_table_id',''],
      ].forEach(([lbl, name, ph]) => f1.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      sec1.appendChild(f1);

      const sec2 = el('div', { className: 'ep-section' });

      const sec3 = el('div', { className: 'ep-section' });
      sec3.appendChild(el('div', { className: 'ep-section-title', text: 'Other' }));
      const f3 = el('div', { className: 'ep-fields' });
      const tokenInput = makeInput('public_token', c.public_token, '');
      tokenInput.classList.add('readonly'); tokenInput.readOnly = true;
      f3.appendChild(makeField('Public Token (read-only)', tokenInput));
      const secTemplates = el('div', { className: 'ep-section' });
      secTemplates.appendChild(el('div', { className: 'ep-section-title', text: 'Templates' }));
      const fTemplates = el('div', { className: 'ep-fields' });
      [
        ['Weekly Doc Template',     'weekly_doc_template',     ''],
        ['Report Builder Template', 'report_builder_template', ''],
      ].forEach(([lbl, name, ph]) => fTemplates.appendChild(makeField(lbl, makeInput(name, c[name], ph))));
      secTemplates.appendChild(fTemplates);

      sec3.appendChild(f3);
      panes['advanced'].appendChild(sec1); panes['advanced'].appendChild(secTemplates); panes['advanced'].appendChild(sec3);
    }

    // Footer
    const footer = el('div', { className: 'ep-footer' });
    const cancelBtn = el('button', { className: 'ep-cancel', text: 'Cancel' });
    cancelBtn.addEventListener('click', closeEditPanel);
    const saveBtn = el('button', { className: 'ep-save', text: 'Save changes' });
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
      try {
        const fields = {};
        editPanel.querySelectorAll('[name]').forEach(inp => {
          if (inp.readOnly) return;
          const v = inp.value.trim();
          if (inp.name === 'active' || inp.name === 'show_hours_form' || inp.name === 'auto_generate_weekly_doc' ||
              inp.name.startsWith('onboarding_sow_signed') || inp.name.startsWith('onboarding_payment_added') ||
              inp.name.startsWith('onboarding_setup_guide_completed_guide') || inp.name.startsWith('onboarding_kickoff_scheduled')) {
            fields[inp.name] = v === 'true';
          } else if (inp.name === 'onboarding_payment_amount') {
            fields[inp.name] = v ? Number(v) : null;
          } else {
            fields[inp.name] = v || null;
          }
        });
        fields.tools_resources = toolsField.getTools();
        await updateClient(c.id, fields);
        closeEditPanel();
        load();
      } catch (err) {
        saveBtn.textContent = 'Error — retry';
        saveBtn.disabled = false;
      }
    });
    footer.appendChild(cancelBtn); footer.appendChild(saveBtn);
    editPanel.appendChild(footer);
  }

  function closeEditPanel() { editPanel.classList.remove('open'); }
  editBtn.addEventListener('click', openEditPanel);

  // ── Load ─────────────────────────────────────────────────────
  async function load() {
    body.innerHTML = '<div class="spinner"></div>';
    const roomId = getGChatRoomId();
    if (!roomId) { body.innerHTML = '<div class="status">Open a Chat room to see client info.</div>'; return; }
    try {
      const client = await getClientByGChatId(roomId);
      if (client) {
        await renderClient(client);
      } else {
        body.innerHTML = `<div class="status">No client matched for this chat.<br><br><small style="color:#c5c8cb;font-size:11px">${roomId}</small></div>`;
      }
    } catch (err) {
      body.innerHTML = `<div class="status error">Error: ${err.message}</div>`;
    }
  }

  function togglePanel() {
    const opening = !panel.classList.contains('open');
    panel.classList.toggle('open');
    if (opening) load();
  }

  fab.addEventListener('click', togglePanel);
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  let lastPath = location.pathname;
  new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      if (panel.classList.contains('open')) load();
    }
  }).observe(document.body, { childList: true, subtree: true });

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_PANEL') togglePanel();
  });
})();
