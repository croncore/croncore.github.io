(function () {
    'use strict';

    /* ========================================
       NEURAL NETWORK CANVAS
    ======================================== */
    const canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let nodes = [];
        let w, h;
        const NODE_COUNT = 60;
        const CONNECTION_DIST = 180;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 2 + 1
            });
        }

        function animateNetwork() {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                for (let j = i + 1; j < nodes.length; j++) {
                    const m = nodes[j];
                    const dx = n.x - m.x;
                    const dy = n.y - m.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.strokeStyle = 'rgba(0, 212, 255, ' + alpha + ')';
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
                ctx.fill();
            }
            requestAnimationFrame(animateNetwork);
        }
        animateNetwork();
    }

    /* ========================================
       NAVBAR SCROLL + ACTIVE LINK
    ======================================== */
    const nav = document.getElementById('navbar');
    if (nav) {
        var navLinks = nav.querySelectorAll('.nav-link');
        var sections = [];
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                var sec = document.querySelector(href);
                if (sec) sections.push({ el: sec, link: link });
            }
        });

        function updateNav() {
            nav.classList.toggle('is-scrolled', window.scrollY > 60);

            if (sections.length) {
                var scrollPos = window.scrollY + nav.offsetHeight + 80;
                var activeLink = null;
                for (var i = sections.length - 1; i >= 0; i--) {
                    if (scrollPos >= sections[i].el.offsetTop) {
                        activeLink = sections[i].link;
                        break;
                    }
                }
                navLinks.forEach(function (l) { l.classList.remove('active'); });
                if (activeLink) activeLink.classList.add('active');
            }
        }

        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }

    /* ========================================
       MOBILE MENU
    ======================================== */
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function () {
            const isOpen = hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        mobileNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('open');
                mobileNav.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }

    /* ========================================
       SCROLL REVEAL
    ======================================== */
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(function (el) { revealObs.observe(el); });
    }

    /* ========================================
       COUNTER ANIMATION
    ======================================== */
    function runCounters(container) {
        container.querySelectorAll('.counter').forEach(function (el) {
            if (el.dataset.counted) return;
            el.dataset.counted = 'true';
            var target = parseInt(el.dataset.target);
            var current = 0;
            var step = target / 50;
            var interval = setInterval(function () {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                el.textContent = Math.floor(current);
            }, 30);
        });
    }

    // Hero counters
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
        var heroObs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                runCounters(heroEl);
                heroObs.disconnect();
            }
        }, { threshold: 0.25 });
        heroObs.observe(heroEl);
    }

    // About counters
    var aboutEl = document.querySelector('.about');
    if (aboutEl) {
        var aboutObs = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting) {
                runCounters(aboutEl);
                aboutObs.disconnect();
            }
        }, { threshold: 0.25 });
        aboutObs.observe(aboutEl);
    }

    /* ========================================
       FAQ ACCORDION
    ======================================== */
    document.querySelectorAll('.faq-q').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            var wasActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(function (i) {
                i.classList.remove('active');
                i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
            });
            if (!wasActive) {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ========================================
       SMOOTH SCROLL
    ======================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            var target = document.querySelector(href);
            if (target && nav) {
                var navHeight = nav.offsetHeight;
                var y = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });
    });

    /* ========================================
       CONTACT FORM VALIDATION & SUBMISSION
    ======================================== */
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        var submitBtn = contactForm.querySelector('.btn-submit');

        // Mark selects with value
        contactForm.querySelectorAll('.form-select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                sel.classList.toggle('has-value', sel.value !== '');
            });
        });

        // Clear error on input
        contactForm.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(function (field) {
            field.addEventListener('input', function () {
                var group = field.closest('.form-group');
                if (group) {
                    group.classList.remove('has-error');
                    field.classList.remove('error');
                }
            });
            field.addEventListener('change', function () {
                var group = field.closest('.form-group');
                if (group) {
                    group.classList.remove('has-error');
                    field.classList.remove('error');
                }
            });
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var isValid = true;
            var requiredFields = contactForm.querySelectorAll('[required]');

            requiredFields.forEach(function (field) {
                var group = field.closest('.form-group');
                if (!field.value.trim()) {
                    isValid = false;
                    if (group) group.classList.add('has-error');
                    field.classList.add('error');
                } else {
                    if (group) group.classList.remove('has-error');
                    field.classList.remove('error');
                }
            });

            // Email format check
            var emailField = contactForm.querySelector('input[type="email"]');
            if (emailField && emailField.value.trim()) {
                var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRe.test(emailField.value.trim())) {
                    isValid = false;
                    var emailGroup = emailField.closest('.form-group');
                    if (emailGroup) {
                        emailGroup.classList.add('has-error');
                        var errEl = emailGroup.querySelector('.form-error');
                        if (errEl) errEl.textContent = 'Please enter a valid email address.';
                    }
                    emailField.classList.add('error');
                }
            }

            if (!isValid) {
                showToast('Please fill in all required fields.', 'error');
                return;
            }

            // Show loading
            if (submitBtn) submitBtn.classList.add('loading');

            // Submit via Formspree (or native form action)
            var formData = new FormData(contactForm);

            fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).then(function (res) {
                if (submitBtn) submitBtn.classList.remove('loading');
                if (res.ok) {
                    showToast('Message sent successfully!', 'success');
                    contactForm.reset();
                    contactForm.querySelectorAll('.form-select').forEach(function (s) {
                        s.classList.remove('has-value');
                    });
                } else {
                    showToast('Something went wrong. Please try again.', 'error');
                }
            }).catch(function () {
                if (submitBtn) submitBtn.classList.remove('loading');
                showToast('Network error. Please try again.', 'error');
            });
        });
    }

    /* ========================================
       TOAST NOTIFICATIONS
    ======================================== */
    function showToast(message, type) {
        var existing = document.querySelector('.toast');
        if (existing) existing.remove();

        var toast = document.createElement('div');
        toast.className = 'toast ' + (type || 'success');
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(function () {
            toast.classList.add('show');
        });

        setTimeout(function () {
            toast.classList.remove('show');
            setTimeout(function () { toast.remove(); }, 400);
        }, 4000);
    }

})();
