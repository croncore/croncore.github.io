(function () {
  'use strict';

  var FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

  // ── Mobile nav focus trap ──────────────────────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var navKeyHandler = null;

  if (mobileNav) {
    // Move mobileNav to <body> so that inerting .page-content (its old parent)
    // doesn't also disable the open menu. It's position:fixed so visually identical.
    if (mobileNav.parentElement !== document.body) {
      document.body.appendChild(mobileNav);
    }

    function openedMobileNav() {
      // Inert the page background (mobileNav is now outside .page-content)
      var pc = document.querySelector('.page-content');
      if (pc) pc.setAttribute('inert', '');

      // Move focus to first focusable element in the menu
      setTimeout(function () {
        var first = mobileNav.querySelector(FOCUSABLE);
        if (first) first.focus();
      }, 50);

      navKeyHandler = function (e) {
        if (e.key === 'Escape') {
          closeMobileNav();
          // Trigger main.js close path by removing 'open' class
          mobileNav.classList.remove('open');
          if (hamburger) {
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          }
          return;
        }
        if (e.key === 'Tab') {
          var els = Array.from(mobileNav.querySelectorAll(FOCUSABLE)).filter(function (el) {
            return el.offsetParent !== null;
          });
          if (!els.length) return;
          var first = els[0], last = els[els.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
          } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
          }
        }
      };
      document.addEventListener('keydown', navKeyHandler);
    }

    function closeMobileNav() {
      var pc = document.querySelector('.page-content');
      if (pc) pc.removeAttribute('inert');
      if (navKeyHandler) {
        document.removeEventListener('keydown', navKeyHandler);
        navKeyHandler = null;
      }
      if (hamburger) hamburger.focus();
    }

    var observer = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.attributeName === 'class') {
          if (mobileNav.classList.contains('open')) {
            openedMobileNav();
          } else {
            closeMobileNav();
          }
        }
      });
    });
    observer.observe(mobileNav, { attributes: true, attributeFilter: ['class'] });
  }

  // ── Theme toggle aria-pressed ───────────────────────────────────────────────
  var themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    function updateAriaPressed() {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      themeToggle.setAttribute('aria-pressed', String(isLight));
    }
    updateAriaPressed();
    new MutationObserver(updateAriaPressed).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
})();
