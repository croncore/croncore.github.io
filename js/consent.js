(function () {
  'use strict';

  var KEY = 'croncore-consent';
  var VER = 1;

  function gtagUpdate(analytics, ads) {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: analytics ? 'granted' : 'denied',
        ad_storage: ads ? 'granted' : 'denied',
        ad_user_data: ads ? 'granted' : 'denied',
        ad_personalization: ads ? 'granted' : 'denied'
      });
    }
  }

  function save(analytics, ads) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VER, analytics: analytics, ads: ads, ts: Date.now() }));
    } catch (e) {}
  }

  function load() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY) || 'null');
      return (d && d.v === VER) ? d : null;
    } catch (e) { return null; }
  }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      '#cc-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;padding:14px 24px;background:var(--bg-card,#131829);border-top:1px solid var(--border-accent,rgba(0,212,255,.15));display:flex;align-items:center;gap:14px;flex-wrap:wrap;font-family:var(--font-body,Manrope,sans-serif);box-shadow:0 -4px 24px rgba(0,0,0,.3);animation:cc-up .3s ease}',
      '@keyframes cc-up{from{transform:translateY(100%)}to{transform:translateY(0)}}',
      '#cc-banner .cc-text{flex:1;min-width:200px;font-size:13px;line-height:1.55;color:var(--text-secondary,#8B8FA7)}',
      '#cc-banner .cc-text a{color:var(--accent,#00D4FF);text-decoration:underline}',
      '#cc-banner .cc-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
      '.cc-btn{padding:8px 18px;border-radius:var(--r-full,9999px);font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:opacity .15s,border-color .15s,color .15s;line-height:1}',
      '.cc-btn-primary{background:var(--accent,#00D4FF);color:#050810}',
      '.cc-btn-primary:hover{opacity:.85}',
      '.cc-btn-outline{background:transparent;color:var(--text-secondary,#8B8FA7);border:1px solid var(--border-strong,rgba(255,255,255,.1))}',
      '.cc-btn-outline:hover{color:var(--text-primary,#E0E2EA);border-color:var(--border-accent,rgba(0,212,255,.2))}',
      '.cc-btn-ghost{background:transparent;color:var(--text-secondary,#8B8FA7);text-decoration:underline;padding:8px 4px}',
      '.cc-btn-ghost:hover{color:var(--text-primary,#E0E2EA)}',
      '#cc-modal{position:fixed;inset:0;z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding-bottom:24px;background:rgba(0,0,0,.55);animation:cc-fade .2s ease}',
      '@keyframes cc-fade{from{opacity:0}to{opacity:1}}',
      '#cc-panel{background:var(--bg-card,#131829);border-radius:var(--r-lg,20px) var(--r-lg,20px) 0 0;padding:28px 24px 32px;width:100%;max-width:540px;border:1px solid var(--border-accent,rgba(0,212,255,.15));box-shadow:0 -8px 40px rgba(0,0,0,.4);max-height:88vh;overflow-y:auto}',
      '@media(min-width:600px){#cc-modal{align-items:center;padding-bottom:0}#cc-panel{border-radius:var(--r-lg,20px);margin:auto}}',
      '#cc-panel h2{margin:0 0 8px;font-size:17px;font-weight:700;color:var(--text-primary,#E0E2EA);font-family:var(--font-display,"Plus Jakarta Sans",sans-serif)}',
      '#cc-panel>p{margin:0 0 20px;font-size:13px;color:var(--text-secondary,#8B8FA7);line-height:1.6}',
      '#cc-panel>p a{color:var(--accent,#00D4FF);text-decoration:underline}',
      '.cc-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:13px 0;border-bottom:1px solid var(--border,rgba(255,255,255,.05))}',
      '.cc-row:last-of-type{border-bottom:none}',
      '.cc-row-info .cc-row-title{font-size:14px;font-weight:600;color:var(--text-primary,#E0E2EA)}',
      '.cc-row-info .cc-row-desc{font-size:12px;color:var(--text-secondary,#8B8FA7);margin-top:2px}',
      '.cc-always-on{font-size:12px;color:var(--text-muted,#4D5168);font-style:italic;white-space:nowrap}',
      '.cc-switch{position:relative;width:44px;height:24px;flex-shrink:0}',
      '.cc-switch input{opacity:0;width:0;height:0;position:absolute}',
      '.cc-track{position:absolute;inset:0;background:var(--border-strong,rgba(255,255,255,.1));border-radius:12px;cursor:pointer;transition:background .2s}',
      '.cc-switch input:checked+.cc-track{background:var(--accent,#00D4FF)}',
      '.cc-track::after{content:"";position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;transition:transform .2s}',
      '.cc-switch input:checked+.cc-track::after{transform:translateX(20px)}',
      '.cc-modal-btns{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap}',
      '.cc-modal-btns .cc-btn{flex:1;padding:10px 20px;text-align:center}'
    ].join('');
    document.head.appendChild(s);
  }

  var modalTrigger = null;

  var FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

  function trapFocus(container, e) {
    var els = Array.from(container.querySelectorAll(FOCUSABLE)).filter(function (el) {
      return !el.closest('[inert]') && el.offsetParent !== null;
    });
    if (!els.length) return;
    var first = els[0], last = els[els.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  }

  function setPageInert(state) {
    var pc = document.querySelector('.page-content') || document.querySelector('main');
    if (pc) { state ? pc.setAttribute('inert', '') : pc.removeAttribute('inert'); }
  }

  function removeBanner() {
    var el = document.getElementById('cc-banner');
    if (el) { document.removeEventListener('keydown', el._keyHandler); el.remove(); }
    setPageInert(false);
  }
  function removeModal() {
    var el = document.getElementById('cc-modal');
    if (el) { document.removeEventListener('keydown', el._keyHandler); el.remove(); }
    setPageInert(false);
    if (modalTrigger) { modalTrigger.focus(); modalTrigger = null; }
  }

  function accept(analytics, ads) {
    removeBanner();
    removeModal();
    save(analytics, ads);
    gtagUpdate(analytics, ads);
  }

  function showBanner() {
    if (document.getElementById('cc-banner')) return;
    var el = document.createElement('div');
    el.id = 'cc-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Cookie consent');
    el.setAttribute('aria-describedby', 'cc-banner-text');
    el.innerHTML =
      '<p id="cc-banner-text" class="cc-text">We use cookies to understand how visitors use our site and improve performance. See our <a href="privacy-policy">Privacy Policy</a>.</p>' +
      '<div class="cc-actions">' +
        '<button class="cc-btn cc-btn-primary" id="cc-accept">Accept all</button>' +
        '<button class="cc-btn cc-btn-outline" id="cc-reject">Reject non-essential</button>' +
        '<button class="cc-btn cc-btn-ghost" id="cc-prefs">Preferences</button>' +
      '</div>';
    document.body.appendChild(el);
    document.getElementById('cc-accept').onclick = function () { accept(true, true); };
    document.getElementById('cc-reject').onclick = function () { accept(false, false); };
    document.getElementById('cc-prefs').onclick = function () { removeBanner(); showModal(); };

    // Focus first button
    setTimeout(function () {
      var first = el.querySelector('button');
      if (first) first.focus();
    }, 50);

    // Focus trap + Esc
    el._keyHandler = function (e) {
      if (e.key === 'Escape') { accept(false, false); return; }
      trapFocus(el, e);
    };
    document.addEventListener('keydown', el._keyHandler);
    setPageInert(true);
  }

  function showModal() {
    if (document.getElementById('cc-modal')) return;
    var stored = load();
    var a = stored ? stored.analytics : false;
    var ads = stored ? stored.ads : false;
    var overlay = document.createElement('div');
    overlay.id = 'cc-modal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Cookie preferences');
    overlay.setAttribute('aria-describedby', 'cc-panel-desc');
    overlay.innerHTML =
      '<div id="cc-panel">' +
        '<h2>Cookie Preferences</h2>' +
        '<p id="cc-panel-desc">Essential cookies are always on. Choose which optional cookies you allow. See our <a href="privacy-policy">Privacy Policy</a>.</p>' +
        '<div class="cc-row"><div class="cc-row-info"><div class="cc-row-title">Essential</div><div class="cc-row-desc">Site navigation, security, theme preferences.</div></div><span class="cc-always-on">Always on</span></div>' +
        '<div class="cc-row"><div class="cc-row-info"><div class="cc-row-title">Analytics</div><div class="cc-row-desc">Helps us understand how visitors use the site (Google Analytics 4).</div></div><label class="cc-switch"><input type="checkbox" id="cc-chk-a"' + (a ? ' checked' : '') + '><span class="cc-track"></span></label></div>' +
        '<div class="cc-row"><div class="cc-row-info"><div class="cc-row-title">Advertising</div><div class="cc-row-desc">Used to measure ad effectiveness and personalization.</div></div><label class="cc-switch"><input type="checkbox" id="cc-chk-ads"' + (ads ? ' checked' : '') + '><span class="cc-track"></span></label></div>' +
        '<div class="cc-modal-btns">' +
          '<button class="cc-btn cc-btn-primary" id="cc-save">Save preferences</button>' +
          '<button class="cc-btn cc-btn-outline" id="cc-all">Accept all</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.onclick = function (e) { if (e.target === overlay) removeModal(); };
    document.getElementById('cc-save').onclick = function () {
      accept(document.getElementById('cc-chk-a').checked, document.getElementById('cc-chk-ads').checked);
    };
    document.getElementById('cc-all').onclick = function () { accept(true, true); };

    // Focus first button
    setTimeout(function () {
      var first = overlay.querySelector('button');
      if (first) first.focus();
    }, 50);

    // Focus trap + Esc
    overlay._keyHandler = function (e) {
      if (e.key === 'Escape') { removeModal(); return; }
      trapFocus(overlay, e);
    };
    document.addEventListener('keydown', overlay._keyHandler);
    setPageInert(true);
  }

  // Called by "Cookie Settings" footer button
  window.openConsentSettings = function () {
    modalTrigger = document.activeElement;
    removeBanner();
    showModal();
  };

  // Called by "Do Not Sell or Share My Info" footer link
  window.doNotSell = function () {
    accept(false, false);
    var flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--bg-card,#131829);border:1px solid var(--border-accent,rgba(0,212,255,.2));color:var(--text-primary,#E0E2EA);font-family:var(--font-body,Manrope,sans-serif);font-size:13px;padding:10px 20px;border-radius:var(--r-full,9999px);z-index:10001;box-shadow:0 4px 20px rgba(0,0,0,.4)';
    flash.textContent = 'Opt-out saved. No analytics or ad cookies will be set.';
    document.body.appendChild(flash);
    setTimeout(function () { flash.remove(); }, 4000);
  };

  function init() {
    injectStyles();
    // Honor Global Privacy Control — treat as opt-out, no banner needed
    if (navigator.globalPrivacyControl) {
      save(false, false);
      gtagUpdate(false, false);
      return;
    }
    var stored = load();
    if (stored) {
      gtagUpdate(stored.analytics, stored.ads);
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
