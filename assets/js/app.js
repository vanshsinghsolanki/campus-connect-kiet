/**
 * Campus Connect — Core Application (Phase 1)
 * ------------------------------------------------------------------
 * Framework-free core shared by every page. Exposes a single global
 * namespace `window.CC` with these modules:
 *
 *   CC.config    – app-wide constants
 *   CC.utils     – DOM + formatting helpers
 *   CC.store     – namespaced localStorage wrapper (demo persistence)
 *   CC.api       – data service layer (Promise-based). Phase 2 swaps the
 *                  internals for fetch() calls; pages do not change.
 *   CC.auth      – demo session (UI only — NO real authentication)
 *   CC.activity  – demo user activity (connections, saved items, etc.)
 *   CC.icon      – inline SVG icon set
 *   CC.ui        – toast, modal, avatar, badges, empty/skeleton states
 *   CC.forms     – validation + serialisation
 *   CC.listing   – generic search/filter/sort engine with URL sync
 *   CC.layout    – header, drawer, bottom nav, footer, theme
 *   CC.page()    – register a page controller (runs after layout)
 *
 * Classic script (not an ES module) so the site also works when opened
 * straight from the file system (file://) as well as on GitHub Pages.
 */
(function () {
  "use strict";

  var CC = (window.CC = window.CC || {});
  var DATA = window.CC_DATA || { meta: {}, profiles: [], opportunities: [], resources: [], events: [] };

  /* ================================================================
   * Config
   * ============================================================== */
  CC.config = {
    appName: "Campus Connect",
    phase: 1,
    storagePrefix: "cc:",
    apiLatency: 280, // simulated network delay so loading states are visible
    demoOtp: "246810"
  };

  /* ================================================================
   * Utils
   * ============================================================== */
  var utils = (CC.utils = {});

  utils.$ = function (sel, root) { return (root || document).querySelector(sel); };
  utils.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  utils.escapeHtml = function (value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  utils.debounce = function (fn, wait) {
    var t;
    return function () {
      var args = arguments, ctx = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
    };
  };

  utils.getParam = function (name) {
    return new URLSearchParams(window.location.search).get(name);
  };

  utils.clone = function (v) { return JSON.parse(JSON.stringify(v)); };

  utils.today = function () {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  utils.parseDate = function (iso) {
    var p = String(iso).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  };

  utils.formatDate = function (iso, opts) {
    if (!iso) return "";
    return utils.parseDate(iso).toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" });
  };

  utils.daysUntil = function (iso) {
    return Math.round((utils.parseDate(iso) - utils.today()) / 86400000);
  };

  utils.relativeDeadline = function (iso) {
    var d = utils.daysUntil(iso);
    if (d < 0) return { label: "Closed", tone: "muted" };
    if (d === 0) return { label: "Closes today", tone: "danger" };
    if (d === 1) return { label: "1 day left", tone: "danger" };
    if (d <= 7) return { label: d + " days left", tone: "warning" };
    return { label: d + " days left", tone: "success" };
  };

  utils.timeAgo = function (ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    var m = Math.floor(s / 60); if (m < 60) return m + "m ago";
    var h = Math.floor(m / 60); if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  };

  utils.initials = function (name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(function (w) { return w[0]; }).join("").toUpperCase();
  };

  utils.hue = function (seed) {
    var h = 0, s = String(seed || "");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  };

  utils.plural = function (n, word, pluralWord) {
    return n + " " + (n === 1 ? word : (pluralWord || word + "s"));
  };

  utils.formatNumber = function (n) { return Number(n || 0).toLocaleString("en-IN"); };

  /** Look up a display name from the meta tables, e.g. lookup("departments", "CSE") */
  utils.lookup = function (table, code) {
    var list = (DATA.meta && DATA.meta[table]) || [];
    for (var i = 0; i < list.length; i++) if (list[i].code === code) return list[i].name;
    return code || "";
  };

  utils.uid = function (prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  };

  utils.copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  };

  /**
   * Read an uploaded image, centre-crop it to a square and resize it
   * (default 320px JPEG) so it can be stored in the browser for the demo.
   * Phase 2: upload the original to Firebase Storage instead.
   * @returns {Promise<string>} data URL
   */
  utils.imageToDataUrl = function (file, size) {
    size = size || 320;
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return reject(new Error("Please choose a JPG, PNG or WEBP image."));
      if (file.size > 5 * 1024 * 1024) return reject(new Error("Image must be smaller than 5 MB."));
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Could not read this image.")); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error("Could not read this image.")); };
        img.onload = function () {
          var side = Math.min(img.width, img.height);
          var canvas = document.createElement("canvas");
          canvas.width = canvas.height = size;
          var ctx = canvas.getContext("2d");
          ctx.fillStyle = "#fff";
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  utils.downloadFile = function (filename, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /* ================================================================
   * Store — namespaced localStorage (never throws)
   * ============================================================== */
  CC.store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(CC.config.storagePrefix + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(CC.config.storagePrefix + key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
      return value;
    },
    remove: function (key) {
      try { localStorage.removeItem(CC.config.storagePrefix + key); } catch (e) { /* noop */ }
    }
  };

  /* ================================================================
   * API — data service layer
   * Phase 1: resolves sample data from data.js after a short delay.
   * Phase 2: replace `respond()` bodies with fetch('/api/...').
   * ============================================================== */
  function respond(value) {
    return new Promise(function (resolve) {
      setTimeout(function () { resolve(utils.clone(value)); }, CC.config.apiLatency);
    });
  }

  function collection(name) {
    return {
      list: function () { return respond(DATA[name] || []); },
      get: function (id) {
        var item = (DATA[name] || []).filter(function (x) { return x.id === id; })[0];
        return respond(item || null);
      },
      /** Synchronous lookup for small joins (e.g. author names on cards). */
      peek: function (id) {
        return (DATA[name] || []).filter(function (x) { return x.id === id; })[0] || null;
      }
    };
  }

  CC.api = {
    profiles: collection("profiles"),
    opportunities: collection("opportunities"),
    resources: collection("resources"),
    events: collection("events"),
    meta: function () { return DATA.meta; },
    stats: function () {
      return respond({
        profiles: DATA.profiles.length,
        alumni: DATA.profiles.filter(function (p) { return p.role === "alumni"; }).length,
        verified: DATA.profiles.filter(function (p) { return p.verification === "verified"; }).length,
        opportunities: DATA.opportunities.length,
        resources: DATA.resources.length,
        events: DATA.events.length
      });
    }
  };

  /* ================================================================
   * Auth — DEMO ONLY. No passwords are checked or stored.
   * ============================================================== */
  CC.auth = {
    user: function () { return CC.store.get("user", null); },
    current: function () { return CC.store.get("session", null) ? CC.auth.user() : null; },
    isLoggedIn: function () { return !!CC.auth.current(); },
    saveUser: function (user) {
      var existing = CC.auth.user() || {};
      var merged = Object.assign({ id: "me", verification: "unverified", createdAt: Date.now() }, existing, user);
      CC.store.set("user", merged);
      return merged;
    },
    login: function (email) {
      var user = CC.auth.user();
      if (!user || (email && user.email !== email)) {
        // Create a demo account on the fly so the demo always works.
        var name = String(email || "demo.student").split("@")[0].replace(/[._-]+/g, " ")
          .replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        user = {
          name: name, email: email || "demo.student@kiet.edu", role: "student", department: "CSE",
          batch: 2028, headline: "Student at Campus Connect", bio: "", skills: ["JavaScript", "Python"],
          openTo: ["Mentorship"], links: {}, verification: "unverified"
        };
        CC.store.set("user", null);
        user = CC.auth.saveUser(user);
      }
      CC.store.set("session", { email: user.email, at: Date.now() });
      return user;
    },
    logout: function () { CC.store.remove("session"); }
  };

  /* ================================================================
   * Activity — demo interactions persisted in the browser
   * ============================================================== */
  CC.activity = {
    connection: function (profileId) { return (CC.store.get("connections", {}))[profileId] || null; },
    requestConnection: function (profileId, data) {
      var all = CC.store.get("connections", {});
      all[profileId] = Object.assign({ status: "pending", at: Date.now() }, data);
      CC.store.set("connections", all);
      return all[profileId];
    },
    withdrawConnection: function (profileId) {
      var all = CC.store.get("connections", {});
      delete all[profileId];
      CC.store.set("connections", all);
    },
    connections: function () { return CC.store.get("connections", {}); },

    isSaved: function (kind, id) { return ((CC.store.get("saved", {}))[kind] || []).indexOf(id) > -1; },
    toggleSaved: function (kind, id) {
      var saved = CC.store.get("saved", {});
      var list = saved[kind] || [];
      var idx = list.indexOf(id);
      if (idx > -1) list.splice(idx, 1); else list.push(id);
      saved[kind] = list;
      CC.store.set("saved", saved);
      return idx === -1;
    },
    saved: function (kind) { return (CC.store.get("saved", {}))[kind] || []; },

    addTo: function (key, id) {
      var list = CC.store.get(key, []);
      if (list.indexOf(id) === -1) list.push(id);
      CC.store.set(key, list);
    },
    has: function (key, id) { return CC.store.get(key, []).indexOf(id) > -1; },
    list: function (key) { return CC.store.get(key, []); },

    messages: function (profileId) { return (CC.store.get("messages", {}))[profileId] || []; },
    addMessage: function (profileId, msg) {
      var all = CC.store.get("messages", {});
      (all[profileId] = all[profileId] || []).push(Object.assign({ at: Date.now() }, msg));
      CC.store.set("messages", all);
    },

    addCall: function (call) {
      var calls = CC.store.get("calls", []);
      calls.push(Object.assign({ id: utils.uid("call"), at: Date.now(), status: "requested" }, call));
      CC.store.set("calls", calls);
    },
    calls: function () { return CC.store.get("calls", []); }
  };

  /* ================================================================
   * Icons — inline SVG (Lucide-style, stroke based)
   * ============================================================== */
  var ICONS = {
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    "user-check": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    filter: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    verified: '<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
    camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14 21 3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "arrow-right": '<path d="M5 12h14M12 5l7 7-7 7"/>',
    "arrow-left": '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    graduation: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
    linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
    github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    login: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    "eye-off": '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    idcard: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="8" cy="12" r="2"/><path d="M14 10h4M14 14h4"/>',
    star: '<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    ticket: '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/>',
    hourglass: '<path d="M5 22h14M5 2h14M17 22v-4.17a2 2 0 0 0-.59-1.42L12 12l-4.41 4.41A2 2 0 0 0 7 17.83V22M7 2v4.17a2 2 0 0 0 .59 1.42L12 12l4.41-4.41A2 2 0 0 0 17 6.17V2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
  };

  CC.icon = function (name, cls) {
    var body = ICONS[name] || ICONS.info;
    return '<svg class="icon' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + "</svg>";
  };

  /* ================================================================
   * UI primitives
   * ============================================================== */
  var ui = (CC.ui = {});
  var esc = utils.escapeHtml;

  /* ---------- Toasts ---------- */
  ui.toast = function (message, opts) {
    opts = opts || {};
    var type = opts.type || "success";
    var region = utils.$("#toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    var iconName = { success: "check", error: "alert", info: "info", warning: "alert" }[type] || "info";
    var el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML = '<span class="toast__icon">' + CC.icon(iconName) + '</span><div class="toast__body">' +
      (opts.title ? "<strong>" + esc(opts.title) + "</strong>" : "") + "<span>" + esc(message) + "</span></div>" +
      '<button class="toast__close" type="button" aria-label="Dismiss notification">' + CC.icon("x") + "</button>";
    region.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    var remove = function () {
      el.classList.remove("is-visible");
      setTimeout(function () { el.remove(); }, 250);
    };
    el.querySelector(".toast__close").addEventListener("click", remove);
    setTimeout(remove, opts.timeout || 4000);
  };

  /* ---------- Modal (accessible dialog) ---------- */
  var FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var openModals = [];

  ui.modal = {
    /**
     * Open a dialog.
     * @param {Object} o { title, subtitle, body (html), footer (html), size: 'sm'|'md'|'lg', onOpen(el, close), onClose() }
     * @returns {{el: HTMLElement, close: Function}}
     */
    open: function (o) {
      var lastFocus = document.activeElement;
      var id = utils.uid("modal");
      var wrap = document.createElement("div");
      wrap.className = "modal";
      wrap.innerHTML =
        '<div class="modal__backdrop" data-close></div>' +
        '<div class="modal__dialog modal__dialog--' + (o.size || "md") + '" role="dialog" aria-modal="true" aria-labelledby="' + id + '-title">' +
          '<header class="modal__header">' +
            '<div><h2 class="modal__title" id="' + id + '-title">' + esc(o.title || "") + "</h2>" +
            (o.subtitle ? '<p class="modal__subtitle">' + esc(o.subtitle) + "</p>" : "") + "</div>" +
            '<button type="button" class="icon-btn modal__close" data-close aria-label="Close dialog">' + CC.icon("x") + "</button>" +
          "</header>" +
          '<div class="modal__body">' + (o.body || "") + "</div>" +
          (o.footer ? '<footer class="modal__footer">' + o.footer + "</footer>" : "") +
        "</div>";
      document.body.appendChild(wrap);
      document.body.classList.add("no-scroll");
      openModals.push(wrap);

      var closed = false;
      function close() {
        if (closed) return;
        closed = true;
        wrap.classList.remove("is-open");
        document.removeEventListener("keydown", onKey);
        openModals.splice(openModals.indexOf(wrap), 1);
        setTimeout(function () {
          wrap.remove();
          // Only restore focus / scrolling if no other dialog opened meanwhile
          if (!openModals.length) {
            document.body.classList.remove("no-scroll");
            if (lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus();
          }
        }, 200);
        if (o.onClose) o.onClose();
      }
      function onKey(e) {
        if (openModals[openModals.length - 1] !== wrap) return;
        if (e.key === "Escape") { e.preventDefault(); close(); }
        if (e.key === "Tab") {
          var f = utils.$$(FOCUSABLE, wrap).filter(function (n) { return n.offsetParent !== null; });
          if (!f.length) return;
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
      wrap.addEventListener("click", function (e) {
        if (e.target.closest("[data-close]")) close();
      });
      document.addEventListener("keydown", onKey);
      requestAnimationFrame(function () {
        wrap.classList.add("is-open");
        // Respect focus already placed inside the dialog by onOpen (e.g. the chat box)
        if (wrap.contains(document.activeElement)) return;
        var body = wrap.querySelector(".modal__body");
        var target = wrap.querySelector("[autofocus]") || (body && body.querySelector(FOCUSABLE)) || wrap.querySelector(".modal__close");
        if (target) target.focus({ preventScroll: true });
      });
      if (o.onOpen) o.onOpen(wrap, close);
      return { el: wrap, close: close };
    },
    isOpen: function () { return openModals.length > 0; },
    closeAll: function () {
      openModals.slice().forEach(function (m) { var b = m.querySelector("[data-close]"); if (b) b.click(); });
    }
  };

  /** Confirmation dialog helper — resolves true/false */
  ui.confirm = function (o) {
    return new Promise(function (resolve) {
      var result = false;
      ui.modal.open({
        title: o.title || "Are you sure?",
        size: "sm",
        body: "<p>" + esc(o.message || "") + "</p>",
        footer: '<button type="button" class="btn btn--ghost" data-close>' + esc(o.cancelText || "Cancel") + "</button>" +
                '<button type="button" class="btn ' + (o.danger ? "btn--danger" : "btn--primary") + '" data-confirm>' + esc(o.confirmText || "Confirm") + "</button>",
        onOpen: function (el, close) {
          el.querySelector("[data-confirm]").addEventListener("click", function () { result = true; close(); });
        },
        onClose: function () { resolve(result); }
      });
    });
  };

  /* ---------- Avatar / badges ---------- */
  var SILHOUETTE = '<svg class="avatar__silhouette" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="24" r="12"/><path d="M6 64c1.5-14 12-22 26-22s24.5 8 26 22z"/></svg>';

  /**
   * Profile picture. Shows the person's photo (sample photo, or the photo the
   * logged-in user uploaded); falls back to a neutral silhouette if there is
   * no photo or it fails to load.
   */
  ui.avatar = function (person, size) {
    var photo = person.photo;
    if (!photo && person.id === "me") {
      var me = CC.auth.user();
      photo = me && me.photo;
    }
    return '<span class="avatar avatar--' + (size || "md") + '" aria-hidden="true">' + SILHOUETTE +
      (photo ? '<img src="' + esc(photo) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : "") +
      "</span>";
  };

  ui.verificationBadge = function (status, compact) {
    var map = {
      verified: { icon: "verified", label: "Verified", cls: "badge--success" },
      pending: { icon: "hourglass", label: "Pending", cls: "badge--warning" },
      unverified: { icon: "alert", label: "Unverified", cls: "badge--muted" }
    };
    var m = map[status] || map.unverified;
    if (compact && status === "verified") {
      return '<span class="verified-tick" title="Verified profile">' + CC.icon("verified") + '<span class="sr-only">Verified</span></span>';
    }
    if (compact) return "";
    return '<span class="badge ' + m.cls + '">' + CC.icon(m.icon) + m.label + "</span>";
  };

  ui.roleBadge = function (role) {
    var cls = { alumni: "badge--primary", senior: "badge--accent", student: "badge--info" }[role] || "badge--muted";
    return '<span class="badge ' + cls + '">' + esc(utils.lookup("roles", role)) + "</span>";
  };

  ui.demoTag = function () { return '<span class="demo-tag" title="UI demonstration — no data is sent">Demo</span>'; };

  ui.chips = function (items, max) {
    items = items || [];
    var shown = max ? items.slice(0, max) : items;
    var extra = items.length - shown.length;
    return '<ul class="chips" role="list">' + shown.map(function (s) { return '<li class="chip">' + esc(s) + "</li>"; }).join("") +
      (extra > 0 ? '<li class="chip chip--more">+' + extra + "</li>" : "") + "</ul>";
  };

  ui.skeletonCards = function (n, variant) {
    var out = "";
    for (var i = 0; i < (n || 6); i++) {
      out += '<div class="card skeleton-card' + (variant ? " skeleton-card--" + variant : "") + '" aria-hidden="true">' +
        '<div class="sk sk--circle"></div><div class="sk sk--line w-70"></div><div class="sk sk--line w-50"></div>' +
        '<div class="sk sk--line w-90"></div><div class="sk sk--line w-40"></div></div>';
    }
    return out;
  };

  ui.empty = function (o) {
    return '<div class="empty-state">' +
      '<div class="empty-state__icon">' + CC.icon(o.icon || "search") + "</div>" +
      "<h3>" + esc(o.title || "Nothing here yet") + "</h3>" +
      (o.text ? "<p>" + esc(o.text) + "</p>" : "") +
      (o.action || "") + "</div>";
  };

  ui.setLoading = function (btn, loading, text) {
    if (!btn) return;
    if (loading) {
      btn.dataset.label = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + esc(text || "Please wait…");
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      if (btn.dataset.label) btn.innerHTML = btn.dataset.label;
    }
  };

  /** Simulate an async request (UI demo only). */
  ui.fakeRequest = function (ms) {
    return new Promise(function (r) { setTimeout(r, ms || 900); });
  };

  /* ================================================================
   * Forms — validation + serialisation
   * Uses native constraint validation plus `data-match="#id"`,
   * `data-minwords`, and custom messages via `data-error`.
   * ============================================================== */
  var forms = (CC.forms = {});

  function fieldWrap(input) { return input.closest(".field") || input.parentElement; }

  function messageFor(input) {
    var v = input.validity;
    if (input.dataset.error && !v.valid) return input.dataset.error;
    if (v.valueMissing) return input.type === "checkbox" ? "Please tick this box to continue." : "This field is required.";
    if (v.typeMismatch && input.type === "email") return "Enter a valid email address.";
    if (v.typeMismatch && input.type === "url") return "Enter a valid URL (starting with https://).";
    if (v.tooShort) return "Must be at least " + input.minLength + " characters.";
    if (v.tooLong) return "Must be at most " + input.maxLength + " characters.";
    if (v.patternMismatch) return input.title || "Please match the requested format.";
    if (v.rangeUnderflow) return "Must be at least " + input.min + ".";
    if (v.rangeOverflow) return "Must be at most " + input.max + ".";
    if (v.customError) return input.validationMessage;
    return "Please check this field.";
  }

  forms.validateField = function (input) {
    if (!input.willValidate) return true;
    input.setCustomValidity("");
    if (input.dataset.match) {
      var other = utils.$(input.dataset.match);
      if (other && input.value !== other.value) input.setCustomValidity("Values do not match.");
    }
    if (input.dataset.validate === "file" && input.required && !(input.files && input.files.length) && !input.dataset.hasFile) {
      input.setCustomValidity("Please choose a file.");
    }
    var valid = input.checkValidity();
    var wrap = fieldWrap(input);
    var errEl = wrap && wrap.querySelector(".field__error");
    input.setAttribute("aria-invalid", valid ? "false" : "true");
    if (wrap) wrap.classList.toggle("has-error", !valid);
    if (!valid) {
      if (!errEl && wrap) {
        errEl = document.createElement("p");
        errEl.className = "field__error";
        errEl.id = (input.id || input.name) + "-error";
        wrap.appendChild(errEl);
        var d = input.getAttribute("aria-describedby");
        input.setAttribute("aria-describedby", (d ? d + " " : "") + errEl.id);
      }
      if (errEl) errEl.textContent = messageFor(input);
    } else if (errEl) {
      errEl.textContent = "";
    }
    return valid;
  };

  /** Validate every field inside `scope` (form or fieldset). Focuses first invalid. */
  forms.validate = function (scope) {
    var inputs = utils.$$("input, select, textarea", scope).filter(function (i) {
      return i.offsetParent !== null || i.type === "file";
    });
    var firstInvalid = null;
    inputs.forEach(function (i) {
      if (!forms.validateField(i) && !firstInvalid) firstInvalid = i;
    });
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
      return false;
    }
    return true;
  };

  /** Live validation: validate on blur, re-validate on input once a field has errored. */
  forms.enhance = function (form) {
    form.setAttribute("novalidate", "");
    form.addEventListener("blur", function (e) {
      if (e.target.matches("input, select, textarea") && e.target.value !== "") forms.validateField(e.target);
    }, true);
    form.addEventListener("input", function (e) {
      var wrap = fieldWrap(e.target);
      if (wrap && wrap.classList.contains("has-error")) forms.validateField(e.target);
    });
    form.addEventListener("change", function (e) {
      if (e.target.matches("select, input[type=checkbox], input[type=radio], input[type=file]")) {
        var wrap = fieldWrap(e.target);
        if (wrap && wrap.classList.contains("has-error")) forms.validateField(e.target);
      }
    });
    // Password visibility toggles
    utils.$$("[data-toggle-password]", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = utils.$(btn.dataset.togglePassword);
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.setAttribute("aria-pressed", show);
        btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
        btn.innerHTML = CC.icon(show ? "eye-off" : "eye");
      });
    });
    return form;
  };

  /** Serialise a form into a plain object. Repeated names become arrays. */
  forms.serialize = function (form) {
    var out = {};
    new FormData(form).forEach(function (value, key) {
      if (value instanceof File) value = value.name;
      if (Object.prototype.hasOwnProperty.call(out, key)) {
        if (!Array.isArray(out[key])) out[key] = [out[key]];
        out[key].push(value);
      } else {
        out[key] = value;
      }
    });
    utils.$$("input[type=checkbox][data-array]", form).forEach(function (cb) {
      if (!out[cb.name]) out[cb.name] = [];
      else if (!Array.isArray(out[cb.name])) out[cb.name] = [out[cb.name]];
    });
    return out;
  };

  /** Password strength 0–4 */
  forms.passwordScore = function (pw) {
    var s = 0;
    if (!pw) return 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };

  /* ================================================================
   * Listing engine — search / filter / sort with URL sync
   * ============================================================== */
  /**
   * @param {Object} o
   *   form       – <form> containing named filter controls
   *   items      – array of data
   *   predicate  – (item, state) => boolean
   *   sorters    – { key: (a, b) => number }
   *   render     – (items, state) => void
   *   syncUrl    – boolean (default true)
   */
  CC.listing = function (o) {
    var form = o.form;
    var names = [];
    utils.$$("[name]", form).forEach(function (el) { if (names.indexOf(el.name) === -1) names.push(el.name); });

    function read() {
      var state = {};
      names.forEach(function (n) {
        var els = utils.$$('[name="' + n + '"]', form);
        var first = els[0];
        if (first.type === "checkbox") {
          state[n] = els.filter(function (e) { return e.checked; }).map(function (e) { return e.value; });
        } else if (first.type === "radio") {
          var c = els.filter(function (e) { return e.checked; })[0];
          state[n] = c ? c.value : "";
        } else {
          state[n] = first.value.trim();
        }
      });
      return state;
    }

    function write(state) {
      names.forEach(function (n) {
        if (!(n in state)) return;
        var val = state[n];
        utils.$$('[name="' + n + '"]', form).forEach(function (el) {
          if (el.type === "checkbox") el.checked = [].concat(val).indexOf(el.value) > -1;
          else if (el.type === "radio") el.checked = el.value === val;
          else el.value = val;
        });
      });
    }

    function fromUrl() {
      var params = new URLSearchParams(window.location.search);
      var state = {};
      names.forEach(function (n) {
        var all = params.getAll(n);
        if (!all.length) return;
        var el = form.querySelector('[name="' + n + '"]');
        state[n] = el && el.type === "checkbox" ? all : all[0];
      });
      return state;
    }

    function toUrl(state) {
      if (o.syncUrl === false) return;
      var params = new URLSearchParams(window.location.search);
      names.forEach(function (n) { params.delete(n); });
      Object.keys(state).forEach(function (k) {
        var v = state[k];
        if (Array.isArray(v)) v.forEach(function (x) { params.append(k, x); });
        else if (v && !(k === "sort" && v === o.defaultSort)) params.set(k, v);
      });
      var qs = params.toString();
      history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : "") + window.location.hash);
    }

    function run() {
      var state = read();
      var result = o.items.filter(function (it) { return o.predicate(it, state); });
      var sorter = o.sorters && o.sorters[state.sort || o.defaultSort];
      if (sorter) result.sort(sorter);
      toUrl(state);
      o.render(result, state);
      return result;
    }

    write(fromUrl());
    var debounced = utils.debounce(run, 180);
    form.addEventListener("input", function (e) { if (e.target.type === "search" || e.target.type === "text") debounced(); });
    form.addEventListener("change", function (e) { if (e.target.type !== "search" && e.target.type !== "text") run(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    form.addEventListener("reset", function () { setTimeout(run, 0); });

    run();
    return {
      refresh: run,
      state: read,
      set: function (partial) { write(partial); run(); },
      clear: function () { form.reset(); }
    };
  };

  /** Normalised text match helper for search boxes */
  CC.listing.matches = function (q, fields) {
    if (!q) return true;
    var hay = fields.join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(function (t) { return hay.indexOf(t) > -1; });
  };

  /* ================================================================
   * Layout — header, drawer, bottom nav, footer, theme, demo banner
   * ============================================================== */
  var NAV = [
    { page: "home", href: "index.html", label: "Home", icon: "home" },
    { page: "people", href: "people.html", label: "People", icon: "users" },
    { page: "opportunities", href: "opportunities.html", label: "Opportunities", short: "Jobs", icon: "briefcase" },
    { page: "resources", href: "resources.html", label: "Resources", icon: "book" },
    { page: "events", href: "events.html", label: "Events", icon: "calendar" }
  ];

  var LOGO = '<span class="brand__mark" aria-hidden="true"><img class="brand__mark-image" src="assets/img/brand/kiet-logo.webp" alt=""></span>';

  var layout = (CC.layout = {});

  layout.theme = {
    get: function () {
      var saved = CC.store.get("theme", null);
      if (saved) return saved;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    },
    set: function (t) {
      document.documentElement.setAttribute("data-theme", t);
      CC.store.set("theme", t);
      utils.$$("[data-theme-toggle]").forEach(function (b) {
        b.innerHTML = CC.icon(t === "dark" ? "sun" : "moon");
        b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      });
      var meta = utils.$('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", t === "dark" ? "#0b1020" : "#ffffff");
    },
    toggle: function () { layout.theme.set(layout.theme.get() === "dark" ? "light" : "dark"); }
  };

  function userMenu(user) {
    return '<div class="user-menu">' +
      '<button type="button" class="user-menu__trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="user-menu-list">' +
        ui.avatar({ id: "me", name: user.name }, "sm") +
        '<span class="user-menu__name">' + esc(user.name.split(" ")[0]) + "</span>" + CC.icon("chevron-down") +
      "</button>" +
      '<div class="user-menu__list" id="user-menu-list" role="menu" hidden>' +
        '<div class="user-menu__head"><strong>' + esc(user.name) + "</strong><span>" + esc(user.email) + "</span></div>" +
        '<a role="menuitem" href="my-profile.html">' + CC.icon("user") + "My Profile</a>" +
        '<a role="menuitem" href="verify.html">' + CC.icon("shield") + "Verification</a>" +
        '<a role="menuitem" href="my-profile.html#activity">' + CC.icon("bookmark") + "Saved & Activity</a>" +
        '<button type="button" role="menuitem" data-logout>' + CC.icon("logout") + "Log out</button>" +
      "</div></div>";
  }

  function renderHeader(page) {
    var user = CC.auth.current();
    var links = NAV.map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + ">" + n.label + "</a></li>";
    }).join("");

    var auth = user
      ? userMenu(user)
      : '<a class="btn btn--ghost btn--sm hide-sm" href="login.html">Log in</a><a class="btn btn--primary btn--sm" href="register.html">Join now</a>';

    var banner = CC.store.get("bannerDismissed", false) ? "" :
      '<div class="demo-banner" role="note"><div class="container demo-banner__inner">' + CC.icon("info") +
      "<span><strong>Phase 1 prototype</strong> · Sample data only · Login, registration, verification & messaging are UI demos (no backend).</span>" +
      '<button type="button" class="icon-btn icon-btn--sm" data-dismiss-banner aria-label="Dismiss notice">' + CC.icon("x") + "</button></div></div>";

    return banner +
      '<header class="site-header" id="site-header"><div class="container site-header__inner">' +
        '<a class="brand" href="index.html" aria-label="Campus Connect home">' + LOGO + '<span class="brand__text">Campus<span>Connect</span><small class="brand__caption">Independent student project</small></span></a>' +
        '<nav class="main-nav" aria-label="Primary"><ul>' + links + "</ul></nav>" +
        '<div class="site-header__actions">' +
          '<button type="button" class="icon-btn command-trigger" data-command-open aria-label="Search Campus Connect" title="Search pages and actions (⌘/Ctrl + K)">' + CC.icon("search") + '<span>⌘ K</span></button>' +
          '<button type="button" class="icon-btn" data-theme-toggle aria-label="Toggle theme"></button>' +
          auth +
          '<button type="button" class="icon-btn menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-drawer">' + CC.icon("menu") + "</button>" +
        "</div>" +
      "</div></header>" + renderDrawer(page, user) + renderCommandPalette();
  }

  function renderDrawer(page, user) {
    var links = NAV.map(function (n) {
      return '<li><a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + ">" + CC.icon(n.icon) + n.label + "</a></li>";
    }).join("");
    var extra = [
      ["about.html", "About", "info"], ["faq.html", "FAQ", "message"], ["contact.html", "Contact", "mail"]
    ].map(function (l) { return '<li><a href="' + l[0] + '">' + CC.icon(l[2]) + l[1] + "</a></li>"; }).join("");

    var account = user
      ? '<li><a href="my-profile.html">' + CC.icon("user") + "My Profile</a></li>" +
        '<li><a href="verify.html">' + CC.icon("shield") + "Verification</a></li>" +
        '<li><button type="button" data-logout>' + CC.icon("logout") + "Log out</button></li>"
      : '<li><a href="login.html">' + CC.icon("login") + "Log in</a></li>" +
        '<li><a href="register.html">' + CC.icon("user-plus") + "Create account</a></li>";

    return '<div class="drawer" id="mobile-drawer" aria-hidden="true">' +
      '<div class="drawer__backdrop" data-drawer-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">' +
        '<div class="drawer__head"><a class="brand" href="index.html">' + LOGO + '<span class="brand__text">Campus<span>Connect</span><small class="brand__caption">Independent student project</small></span></a>' +
        '<button type="button" class="icon-btn" data-drawer-close aria-label="Close menu">' + CC.icon("x") + "</button></div>" +
        (user ? '<div class="drawer__user">' + ui.avatar({ id: "me", name: user.name }, "md") + "<div><strong>" + esc(user.name) + "</strong><span>" + esc(user.email) + "</span></div></div>" : "") +
        '<nav aria-label="Mobile"><p class="drawer__label">Explore</p><ul class="drawer__list">' + links + "</ul>" +
        '<p class="drawer__label">Account</p><ul class="drawer__list">' + account + "</ul>" +
        '<p class="drawer__label">Help</p><ul class="drawer__list">' + extra + "</ul></nav>" +
      "</aside></div>";
  }

  function renderBottomNav(page) {
    var items = [NAV[0], NAV[1], NAV[2], NAV[4], { page: "my-profile", href: CC.auth.isLoggedIn() ? "my-profile.html" : "login.html", label: "Me", icon: "user" }];
    return '<nav class="bottom-nav" aria-label="Quick navigation">' + items.map(function (n) {
      return '<a href="' + n.href + '"' + (n.page === page ? ' aria-current="page"' : "") + ">" + CC.icon(n.icon) + "<span>" + (n.short || n.label) + "</span></a>";
    }).join("") + "</nav>";
  }

  function renderCommandPalette() {
    return '<div class="command-palette" id="command-palette" aria-hidden="true">' +
      '<button type="button" class="command-palette__backdrop" data-command-close tabindex="-1" aria-label="Close search"></button>' +
      '<section class="command-palette__dialog" role="dialog" aria-modal="true" aria-labelledby="command-title">' +
        '<div class="command-palette__search"><span class="command-palette__search-icon">' + CC.icon("search") + '</span>' +
          '<label class="sr-only" id="command-title" for="command-search">Search Campus Connect</label>' +
          '<input id="command-search" type="search" placeholder="Search people, events, opportunities..." autocomplete="off" spellcheck="false">' +
          '<button type="button" class="command-palette__close" data-command-close aria-label="Close search">Esc</button></div>' +
        '<div class="command-palette__body"><p class="command-palette__label">QUICK ACCESS</p><div id="command-results" class="command-palette__results" role="list"></div></div>' +
        '<div class="command-palette__foot"><span>Navigate with your keyboard</span><span><kbd>Enter</kbd> open <kbd>Esc</kbd> close</span></div>' +
      '</section></div>';
  }

  function bindCommandPalette() {
    var palette = utils.$("#command-palette"), trigger = utils.$("[data-command-open]");
    var input = utils.$("#command-search"), results = utils.$("#command-results");
    if (!palette || !trigger || !input || !results) return;
    var commands = [
      { title: "Discover people", description: "Find students, seniors and alumni", href: "people.html", icon: "users", keywords: "people students seniors alumni directory network mentors" },
      { title: "Events & hackathons", description: "Browse workshops, competitions and activities", href: "events.html", icon: "calendar", keywords: "events hackathons workshops webinar meetup" },
      { title: "Career opportunities", description: "Explore internships, jobs and certifications", href: "opportunities.html", icon: "briefcase", keywords: "career internship jobs certification hiring" },
      { title: "Learning library", description: "Find notes, roadmaps and study resources", href: "resources.html", icon: "book", keywords: "learning notes resources papers courses" },
      { title: "My profile", description: "View your profile and saved activity", href: "my-profile.html", icon: "user", keywords: "profile account saved settings" },
      { title: "Create account", description: "Start a Campus Connect demo profile", href: "register.html", icon: "user-plus", keywords: "signup register join account" },
      { title: "About Campus Connect", description: "Understand the project and its scope", href: "about.html", icon: "info", keywords: "about project vision scope" },
      { title: "Help centre", description: "Read frequently asked questions", href: "faq.html", icon: "message", keywords: "help support faq questions" }
    ];
    function draw(query) {
      var q = String(query || "").trim().toLowerCase();
      var filtered = commands.filter(function (item) {
        return !q || (item.title + " " + item.description + " " + item.keywords).toLowerCase().indexOf(q) > -1;
      });
      results.innerHTML = filtered.length ? filtered.map(function (item, i) {
        return '<a class="command-item" role="listitem" data-command-item href="' + item.href + '">' +
          '<span class="command-item__icon">' + CC.icon(item.icon) + '</span><span class="command-item__copy"><strong>' + esc(item.title) + '</strong><small>' + esc(item.description) + '</small></span><span class="command-item__enter">' + (i === 0 ? "↵" : "↗") + '</span></a>';
      }).join("") : '<div class="command-empty"><strong>No matching destination</strong><span>Try people, events, internships or resources.</span></div>';
    }
    function openPalette() {
      palette.classList.add("is-open"); palette.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll"); input.value = ""; draw(""); input.focus();
    }
    function closePalette() {
      if (!palette.classList.contains("is-open")) return;
      palette.classList.remove("is-open"); palette.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll"); trigger.focus();
    }
    trigger.addEventListener("click", openPalette);
    palette.querySelectorAll("[data-command-close]").forEach(function (button) { button.addEventListener("click", closePalette); });
    input.addEventListener("input", function () { draw(input.value); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") { var first = results.querySelector("[data-command-item]"); if (first) window.location.href = first.href; }
      if (event.key === "Escape") closePalette();
    });
    palette.addEventListener("keydown", function (event) {
      if (event.key !== "Tab") return;
      var focusable = Array.prototype.slice.call(palette.querySelectorAll("input, button:not([tabindex='-1']), a[href]"));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    document.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (palette.classList.contains("is-open")) closePalette(); else openPalette();
      } else if (event.key === "Escape") closePalette();
    });
    draw("");
  }

  function renderFooter() {
    var year = new Date().getFullYear();
    function col(title, links) {
      return '<div class="footer__col"><h3>' + title + "</h3><ul>" + links.map(function (l) {
        return '<li><a href="' + l[0] + '">' + l[1] + "</a></li>";
      }).join("") + "</ul></div>";
    }
    return '<footer class="site-footer"><div class="container">' +
      '<div class="footer__grid">' +
        '<div class="footer__brand"><a class="brand" href="index.html">' + LOGO + '<span class="brand__text">Campus<span>Connect</span><small class="brand__caption">Independent student project</small></span></a>' +
          "<p>An independent student-built community concept for KIET students to connect, collaborate and grow.</p>" +
          '<div class="footer__social"><a class="icon-btn" href="#" aria-label="LinkedIn (demo link)">' + CC.icon("linkedin") + '</a><a class="icon-btn" href="#" aria-label="GitHub (demo link)">' + CC.icon("github") + '</a><a class="icon-btn" href="contact.html" aria-label="Email us">' + CC.icon("mail") + "</a></div>" +
        "</div>" +
        col("Explore", [["people.html", "People"], ["opportunities.html", "Opportunities"], ["resources.html", "Resources"], ["events.html", "Events"]]) +
        col("Account", [["register.html", "Create account"], ["login.html", "Log in"], ["verify.html", "Verify profile"], ["my-profile.html", "My profile"]]) +
        col("Company", [["about.html", "About"], ["contact.html", "Contact"], ["faq.html", "FAQ"], ["coming-soon.html", "Roadmap"]]) +
        col("Legal", [["privacy.html", "Privacy Policy"], ["terms.html", "Terms of Use"]]) +
      "</div>" +
      '<div class="footer__bottom"><p>© ' + year + " Campus Connect. Built as a Phase 1 front-end prototype.</p>" +
      "<p>HTML5 · CSS3 · Vanilla JavaScript</p></div>" +
      "</div></footer>";
  }

  function bindLayout() {
    // Theme
    layout.theme.set(layout.theme.get());
    utils.$$("[data-theme-toggle]").forEach(function (b) { b.addEventListener("click", layout.theme.toggle); });

    // Demo banner
    var dismiss = utils.$("[data-dismiss-banner]");
    if (dismiss) dismiss.addEventListener("click", function () {
      CC.store.set("bannerDismissed", true);
      dismiss.closest(".demo-banner").remove();
    });

    // Drawer
    var drawer = utils.$("#mobile-drawer");
    var toggle = utils.$(".menu-toggle");
    function setDrawer(open) {
      drawer.classList.toggle("is-open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("no-scroll", open);
      if (open) { var f = drawer.querySelector(".drawer__panel a, .drawer__panel button"); if (f) f.focus(); }
      else toggle.focus();
    }
    if (toggle && drawer) {
      toggle.addEventListener("click", function () { setDrawer(true); });
      utils.$$("[data-drawer-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { setDrawer(false); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("is-open")) setDrawer(false); });
    }

    // User menu
    var trigger = utils.$(".user-menu__trigger");
    if (trigger) {
      var list = utils.$("#user-menu-list");
      var setMenu = function (open) { list.hidden = !open; trigger.setAttribute("aria-expanded", String(open)); };
      trigger.addEventListener("click", function (e) { e.stopPropagation(); setMenu(list.hidden); });
      document.addEventListener("click", function (e) { if (!e.target.closest(".user-menu")) setMenu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    }

    // Logout
    utils.$$("[data-logout]").forEach(function (b) {
      b.addEventListener("click", function () {
        CC.auth.logout();
        CC.store.set("flash", { message: "You have been logged out.", type: "info" });
        window.location.href = "index.html";
      });
    });

    bindCommandPalette();

    // Sticky header shadow
    var header = utils.$("#site-header");
    var onScroll = function () { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Flash messages (toast carried across a redirect)
    var flash = CC.store.get("flash", null);
    if (flash) { CC.store.remove("flash"); ui.toast(flash.message, { type: flash.type || "success" }); }
  }

  layout.init = function () {
    var page = document.body.getAttribute("data-page") || "";
    var headerSlot = utils.$("#app-header");
    var footerSlot = utils.$("#app-footer");
    if (headerSlot) headerSlot.outerHTML = renderHeader(page);
    if (footerSlot && !document.body.hasAttribute("data-no-footer")) footerSlot.outerHTML = renderFooter();
    else if (footerSlot) footerSlot.remove();
    if (!document.body.hasAttribute("data-no-bottom-nav")) document.body.insertAdjacentHTML("beforeend", renderBottomNav(page));
    bindLayout();
  };

  /** Redirect unauthenticated users to login (UI-level guard only). */
  layout.requireAuth = function () {
    if (CC.auth.isLoggedIn()) return true;
    var next = encodeURIComponent(window.location.pathname.split("/").pop() + window.location.search);
    window.location.replace("login.html?next=" + next);
    return false;
  };

  /* ================================================================
   * Page registry & bootstrap
   * ============================================================== */
  var pages = {};
  CC.page = function (name, fn) { pages[name] = fn; };

  function boot() {
    layout.init();
    var page = document.body.getAttribute("data-page");
    if (pages[page]) {
      try { pages[page](); }
      catch (err) {
        console.error("[Campus Connect] page init failed:", err);
        ui.toast("Something went wrong while loading this page.", { type: "error" });
      }
    }
    // Reveal-on-scroll animations
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("can-reveal");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); } });
      }, { rootMargin: "0px 0px -40px 0px" });
      utils.$$(".reveal").forEach(function (el) { io.observe(el); });
    } else {
      utils.$$(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  // Deferred scripts run while readyState is "interactive" but BEFORE
  // DOMContentLoaded — waiting for it guarantees every page script has
  // registered its controller first.
  if (document.readyState === "complete") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
