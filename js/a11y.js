(function () {
  'use strict';

  var FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

  // ── Mobile nav focus trap ──────────────────────────────────────────────────
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');
  var mobileClose = document.getElementById('mobileCloseBtn');
  var navKeyHandler = null;

  function openedMobileNav() {
    // Move focus to close button or first link
    var first = mobileNav.querySelector('button,a');
    if (first) first.focus();

    // Inert the rest of the page
    var pc = document.querySelector('.page-content');
    if (pc) pc.setAttribute('inert', '');

    navKeyHandler = function (e) {
      if (e.key === 'Escape') {
        closeMobileNav();
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
    // Return focus to hamburger
    if (hamburger) hamburger.focus();
  }

  if (mobileNav) {
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

    // Watch for theme attribute changes
    new MutationObserver(updateAriaPressed).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }
})();
