(function () {
    'use strict';

    /* ========================================
       NAV MEGA MENU
       Injects a Tkxel-style mega-menu under the
       Services nav link on every page.
    ======================================== */
    (function initMegaMenu() {
        // Match any nav-pill anchor that points to the services page,
        // regardless of whether it's relative ("services") or absolute ("/services").
        var servicesLink = null;
        var navAnchors = document.querySelectorAll('.nav-pill a');
        for (var i = 0; i < navAnchors.length; i++) {
            var href = navAnchors[i].getAttribute('href') || '';
            if (href === '/services' || href === 'services' || href === '/services/' || href === 'services/') {
                servicesLink = navAnchors[i];
                break;
            }
        }
        if (!servicesLink) return;

        // Slot 3 ("AI Agents & Automations") holds all 16 subservices — agents
        // lead, so the 4-item preview matches the title and the rest reveal behind
        // the inline "Show more" toggle. The other three slots have 4 each. Each
        // group carries its own right-rail spotlight (see renderSpotlight).
        var GROUPS = [
            {
                id: 'custom-software',
                title: 'Custom Software Development',
                anchor: '/services#custom-software-development',
                spotlight: { tag: 'Featured', title: 'Built once, scales forever.', desc: 'Engineering software that grows with your business — not against it.', href: '/services#custom-software-development', cta: 'View all Custom Software Development' },
                items: [
                    { href: '/services/web-saas-applications', title: 'Web & SaaS Applications', desc: 'Modern, scalable web platforms built with React, Next.js, and Node.js — fast to ship, easy to grow.' },
                    { href: '/services/enterprise-application-development', title: 'Enterprise Application Development', desc: 'Mission-critical systems in .NET, Java, and Python that handle the load your business actually runs on.' },
                    { href: '/services/api-development-integrations', title: 'API Development & Integrations', desc: 'Connect the tools you already use. REST, GraphQL, and event-driven architectures that make your stack talk.' },
                    { href: '/services/cloud-native-devops', title: 'Cloud-Native & DevOps', desc: "AWS, Azure, Docker, Kubernetes — built for scale from day one, deployed with CI/CD pipelines that don't break." }
                ]
            },
            {
                id: 'cyber-security',
                title: 'Cyber Security & Data',
                anchor: '/services#cyber-security-data',
                spotlight: { tag: 'Featured', title: 'Security that scales. Data that speaks.', desc: 'Defense and intelligence built into one operational layer.', href: '/services#cyber-security-data', cta: 'View all Cyber Security & Data' },
                items: [
                    { href: '/services/security-assessments-pen-testing', title: 'Security Assessments & Pen Testing', desc: 'Find the gaps before someone else does. Vulnerability assessments, pen testing, and OWASP-aligned audits.' },
                    { href: '/services/managed-security-soc', title: 'Managed Security & SOC', desc: '24/7 monitoring with SIEM, threat detection, and incident response — so your team can sleep at night.' },
                    { href: '/services/zero-trust-identity', title: 'Zero Trust & Identity', desc: 'Modern access architecture. SSO, IAM, MFA, and zero trust frameworks that secure users wherever they work.' },
                    { href: '/services/data-engineering-analytics', title: 'Data Engineering & Analytics', desc: 'Pipelines, warehouses, and dashboards. Power BI, Tableau, and modern data stacks that turn raw data into answers.' }
                ]
            },
            {
                id: 'agents',
                title: 'AI Agents & Automations',
                anchor: '/services#ai-agents-automations',
                previewCount: 4,
                spotlight: { tag: 'Featured Case Study', title: 'Sovereign voice engine for Mongolia', desc: 'How we shipped a national-scale, in-country AI system in an underserved language.', href: '/case-study-sovereign-voice-engine-for-mongolia', cta: 'Read the case study' },
                items: [
                    // Agents — shown in the 4-item preview
                    { href: '/services/enterprise-ai-agents', title: 'Enterprise AI Agents', desc: 'Autonomous agents that reason, plan, and act across your systems.' },
                    { href: '/services/sales-crm-chatbots', title: 'Sales & CRM Chatbots', desc: 'Conversational agents that qualify leads and close, not just chat.' },
                    { href: '/services/operations-automation', title: 'Operations Automation', desc: 'Internal workflows handled — ticket triage, approvals, helpdesk.' },
                    { href: '/services/process-document-ai', title: 'Process & Document AI', desc: 'Documents that read themselves and trigger the next action.' },
                    // Compliance & regulated
                    { href: '/services/gdpr-compliant-ai-systems', title: 'GDPR-Compliant AI Systems', desc: 'AI engineered for the EU regulatory bar from day one.' },
                    { href: '/services/edtech-ai-platforms', title: 'EdTech AI Platforms', desc: 'Tutoring, assessment, and curriculum AI schools actually trust.' },
                    { href: '/services/data-sovereignty-on-premise-ai', title: 'Data Sovereignty & On-Premise AI', desc: 'Air-gapped, in-country AI for sovereign and regulated workloads.' },
                    { href: '/services/regulatory-ai-consulting', title: 'Regulatory AI Consulting', desc: 'Senior advisory on AI governance, EU AI Act, model risk.' },
                    // Models & intelligence
                    { href: '/services/custom-llm-training', title: 'Custom LLM Training', desc: 'Foundation models built on your data, your infrastructure.' },
                    { href: '/services/model-fine-tuning', title: 'Model Fine-Tuning', desc: 'SFT, DPO, RLHF, LoRA — adapted to your domain and voice.' },
                    { href: '/services/multilingual-low-resource-ai', title: 'Multilingual & Low-Resource AI', desc: 'AI for languages no one else builds for — sovereign by design.' },
                    { href: '/services/speech-ai', title: 'Speech AI — STT & TTS', desc: 'Voice models tuned to accent, dialect, and real-time latency.' },
                    // Infrastructure & MLOps
                    { href: '/services/model-deployment-serving', title: 'Model Deployment & Serving', desc: 'Production model serving with sub-second latency and SLOs.' },
                    { href: '/services/mlops-pipelines', title: 'MLOps Pipelines', desc: 'CI/CD for AI — versioned data, eval gates, safe deploys.' },
                    { href: '/services/monitoring-observability', title: 'Monitoring & Observability', desc: 'Catch drift, hallucinations, and quality regressions before users do.' },
                    { href: '/services/ai-cost-optimization', title: 'AI Cost Optimisation', desc: '30–60% off your AI bill without sacrificing quality.' }
                ]
            },
            {
                id: 'erp',
                title: 'ERP & Enterprise Platforms',
                anchor: '/services#erp-enterprise-platforms',
                spotlight: { tag: 'Featured', title: 'Run the business on rails.', desc: 'ERP that fits your workflow — not a template forced on your team.', href: '/services#erp-enterprise-platforms', cta: 'View all ERP & Enterprise Platforms' },
                items: [
                    { href: '/services/erp-implementation', title: 'ERP Implementation', desc: 'Microsoft Dynamics 365, NetSuite, and SAP — deployed with the configuration, migration, and training that make rollouts stick.' },
                    { href: '/services/salesforce-servicenow', title: 'Salesforce & ServiceNow', desc: 'CRM and ITSM done right. Custom workflows, integrations, and Lightning/Now Platform development that fits your operation.' },
                    { href: '/services/platform-customization-extensions', title: 'Platform Customization & Extensions', desc: 'Bend your ERP to your business, not the reverse. Custom modules, plugins, and workflows on every major platform.' },
                    { href: '/services/migrations-modernization', title: 'Migrations & Modernization', desc: 'Move off legacy. We migrate from on-prem to cloud ERPs with zero data loss and minimal downtime.' }
                ]
            }
        ];

        // Right-rail spotlight. Each group supplies its own; this is the fallback.
        var DEFAULT_SPOTLIGHT = {
            tag: 'Featured Case Study',
            title: 'Sovereign voice engine for Mongolia',
            desc: 'How we shipped a national-scale, in-country AI system in an underserved language.',
            href: '/case-study-sovereign-voice-engine-for-mongolia',
            cta: 'Read the case study'
        };

        var ARROW_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

        // ---- Decorate the Services link with chevron ----
        servicesLink.classList.add('nav-services-trigger');
        servicesLink.setAttribute('aria-haspopup', 'true');
        servicesLink.setAttribute('aria-expanded', 'false');
        if (!servicesLink.querySelector('.nav-mega-chevron')) {
            var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chev.setAttribute('class', 'nav-mega-chevron');
            chev.setAttribute('viewBox', '0 0 24 24');
            chev.setAttribute('fill', 'none');
            chev.setAttribute('stroke', 'currentColor');
            chev.setAttribute('stroke-width', '2.5');
            chev.setAttribute('stroke-linecap', 'round');
            chev.setAttribute('stroke-linejoin', 'round');
            chev.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
            servicesLink.appendChild(chev);
        }

        // ---- Build mega-menu DOM ----
        var menu = document.createElement('div');
        menu.className = 'nav-megamenu';
        menu.id = 'navMegaMenu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Services');

        var inner = document.createElement('div');
        inner.className = 'nav-megamenu-inner';

        // Default to the first real (non-placeholder) group so hovering Services
        // never opens onto an empty "Coming soon" panel.
        var defaultActiveIndex = 0;
        for (var gi = 0; gi < GROUPS.length; gi++) {
            if (!GROUPS[gi].placeholder) { defaultActiveIndex = gi; break; }
        }

        // Parents column
        var parentsCol = document.createElement('div');
        parentsCol.className = 'nav-mega-parents';
        GROUPS.forEach(function (g, i) {
            var btn = document.createElement('button');
            btn.className = 'nav-mega-parent' + (i === defaultActiveIndex ? ' active' : '') + (g.placeholder ? ' is-placeholder' : '');
            btn.type = 'button';
            btn.setAttribute('data-parent', g.id);
            btn.innerHTML = '<span>' + g.title + '</span>' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
            parentsCol.appendChild(btn);
        });

        // Subs column
        var subsCol = document.createElement('div');
        subsCol.className = 'nav-mega-subs';
        GROUPS.forEach(function (g, i) {
            var subgroup = document.createElement('div');
            subgroup.className = 'nav-mega-subgroup' + (i === defaultActiveIndex ? ' active' : '');
            subgroup.setAttribute('data-parent', g.id);

            // Placeholder groups have no subservices yet.
            if (g.placeholder || !g.items || !g.items.length) {
                var empty = document.createElement('div');
                empty.className = 'nav-mega-empty';
                empty.innerHTML = '<strong>Coming soon</strong><span>New services are on the way.</span>';
                subgroup.appendChild(empty);
                subsCol.appendChild(subgroup);
                return;
            }

            // Show the preview count up front; extras stay hidden until "Show more".
            var preview = g.previewCount || g.items.length;
            g.items.forEach(function (item, idx) {
                var a = document.createElement('a');
                a.className = 'nav-mega-sub' + (idx >= preview ? ' is-extra' : '');
                a.href = item.href;
                a.innerHTML = '<strong>' + item.title + '</strong><span>' + item.desc + '</span>';
                subgroup.appendChild(a);
            });

            // Inline "Show more" toggle — reveals the hidden extras without leaving the menu.
            var hiddenCount = g.items.length - preview;
            if (hiddenCount > 0) {
                var moreBtn = document.createElement('button');
                moreBtn.type = 'button';
                moreBtn.className = 'nav-mega-showmore';
                moreBtn.setAttribute('aria-expanded', 'false');
                moreBtn.innerHTML = '<span class="nav-mega-showmore-label">Show more (' + hiddenCount + ')</span>' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
                (function (sg, btn, n) {
                    btn.addEventListener('click', function (e) {
                        e.preventDefault();
                        var expanded = sg.classList.toggle('show-all');
                        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
                        btn.querySelector('.nav-mega-showmore-label').textContent = expanded ? 'Show less' : 'Show more (' + n + ')';
                    });
                })(subgroup, moreBtn, hiddenCount);
                subgroup.appendChild(moreBtn);
            }

            var allLink = document.createElement('a');
            allLink.className = 'nav-mega-all';
            allLink.href = g.anchor;
            allLink.innerHTML = 'View all ' + g.title + ' ' + ARROW_RIGHT;
            subgroup.appendChild(allLink);
            subsCol.appendChild(subgroup);
        });

        // Spotlight column — its content swaps to match the active group.
        var spot = document.createElement('div');
        spot.className = 'nav-mega-spotlight';
        function renderSpotlight(g) {
            var s = (g && g.spotlight) || DEFAULT_SPOTLIGHT;
            spot.innerHTML =
                '<span class="nav-spotlight-tag">' + s.tag + '</span>' +
                '<div class="nav-spotlight-content">' +
                '<h4>' + s.title + '</h4>' +
                '<p>' + s.desc + '</p>' +
                '</div>' +
                '<a class="nav-spotlight-link" href="' + s.href + '">' + s.cta + ' ' + ARROW_RIGHT + '</a>';
        }
        renderSpotlight(GROUPS[defaultActiveIndex]);

        inner.appendChild(parentsCol);
        inner.appendChild(subsCol);
        inner.appendChild(spot);
        menu.appendChild(inner);
        document.body.appendChild(menu);

        // ---- Position relative to nav (flush, no gap — they read as one panel) ----
        var navEl = document.querySelector('.nav');
        function positionMenu() {
            if (!navEl) return;
            var rect = navEl.getBoundingClientRect();
            // Sit exactly at the navbar's bottom edge with a 1px overlap to
            // collapse any sub-pixel rendering seam between the two surfaces.
            menu.style.top = (rect.bottom - 1) + 'px';
        }
        positionMenu();
        window.addEventListener('scroll', positionMenu, { passive: true });
        window.addEventListener('resize', positionMenu);

        // ---- Open / close ----
        var hideTimer;
        function open() {
            if (window.innerWidth <= 1100) return;
            clearTimeout(hideTimer);
            positionMenu();
            if (navEl) navEl.classList.add('nav-mega-open');
            servicesLink.classList.add('is-open');
            servicesLink.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
        }
        function close() {
            if (navEl) navEl.classList.remove('nav-mega-open');
            servicesLink.classList.remove('is-open');
            servicesLink.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
        }
        function delayedClose() {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(close, 180);
        }

        servicesLink.addEventListener('mouseenter', open);
        servicesLink.addEventListener('mouseleave', delayedClose);
        servicesLink.addEventListener('focus', open);
        menu.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        menu.addEventListener('mouseleave', delayedClose);

        // ESC closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        // Click outside closes
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && !servicesLink.contains(e.target)) close();
        });

        // ---- Parent tab interactions (hover/click to switch group) ----
        var parentBtns = parentsCol.querySelectorAll('.nav-mega-parent');
        var subgroups = subsCol.querySelectorAll('.nav-mega-subgroup');
        var GROUP_BY_ID = {};
        GROUPS.forEach(function (g) { GROUP_BY_ID[g.id] = g; });
        function activate(parentId) {
            parentBtns.forEach(function (b) {
                b.classList.toggle('active', b.getAttribute('data-parent') === parentId);
            });
            subgroups.forEach(function (g) {
                g.classList.toggle('active', g.getAttribute('data-parent') === parentId);
            });
            if (GROUP_BY_ID[parentId]) renderSpotlight(GROUP_BY_ID[parentId]);
        }
        parentBtns.forEach(function (b) {
            b.addEventListener('mouseenter', function () { activate(b.getAttribute('data-parent')); });
            b.addEventListener('focus', function () { activate(b.getAttribute('data-parent')); });
            b.addEventListener('click', function (e) {
                e.preventDefault();
                activate(b.getAttribute('data-parent'));
            });
        });

        // Expose the services data to initMobileNav (defined later in this IIFE)
        window.__croncoreNavGroups = GROUPS;
    })();

    /* ========================================
       NAV RESOURCES DROPDOWN
       Compact two-item dropdown (Insights + Newsroom)
       with a featured spotlight on the right.
       Shares the .nav-megamenu shell so visuals match
       the Services mega-menu exactly.
    ======================================== */
    (function initResourcesMenu() {
        var resourcesTrigger = null;
        var navItems = document.querySelectorAll('.nav-pill .nav-link, .nav-pill > a, .nav-pill > button');
        for (var i = 0; i < navItems.length; i++) {
            if ((navItems[i].textContent || '').trim().toLowerCase() === 'resources') {
                resourcesTrigger = navItems[i];
                break;
            }
        }
        if (!resourcesTrigger) return;

        var ITEMS = [
            {
                href: '/insights',
                title: 'Insights',
                desc: 'Expert articles on AI engineering, automation, and enterprise scaling.',
                iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>'
            },
            {
                href: '/newsroom',
                title: 'Newsroom',
                desc: 'Product launches, partnerships, and milestones from the Croncore team.',
                iconSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v6"/><line x1="8" y1="15" x2="14" y2="15"/><line x1="8" y1="18" x2="12" y2="18"/></svg>'
            }
        ];

        var SPOTLIGHT = {
            tag: 'Featured',
            title: 'Sovereign voice engine for Mongolia',
            desc: 'How we shipped a national-scale, in-country AI system in an underserved language.',
            href: '/case-study-sovereign-voice-engine-for-mongolia',
            cta: 'Read the case study'
        };

        var ARROW_RIGHT_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

        // The Resources entry is a trigger only — no navigation on click.
        if (resourcesTrigger.tagName === 'A') {
            resourcesTrigger.addEventListener('click', function (e) { e.preventDefault(); });
        }

        // Decorate with chevron
        resourcesTrigger.classList.add('nav-resources-trigger');
        resourcesTrigger.setAttribute('aria-haspopup', 'true');
        resourcesTrigger.setAttribute('aria-expanded', 'false');
        if (!resourcesTrigger.querySelector('.nav-mega-chevron')) {
            var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chev.setAttribute('class', 'nav-mega-chevron');
            chev.setAttribute('viewBox', '0 0 24 24');
            chev.setAttribute('fill', 'none');
            chev.setAttribute('stroke', 'currentColor');
            chev.setAttribute('stroke-width', '2.5');
            chev.setAttribute('stroke-linecap', 'round');
            chev.setAttribute('stroke-linejoin', 'round');
            chev.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
            resourcesTrigger.appendChild(chev);
        }

        // Build menu DOM
        var menu = document.createElement('div');
        menu.className = 'nav-megamenu nav-megamenu--resources';
        menu.id = 'navResourcesMenu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Resources');

        var inner = document.createElement('div');
        inner.className = 'nav-megamenu-inner nav-resources-inner';

        var itemsCol = document.createElement('div');
        itemsCol.className = 'nav-resources-items';
        ITEMS.forEach(function (item) {
            var a = document.createElement('a');
            a.className = 'nav-resources-item';
            a.href = item.href;
            a.innerHTML =
                '<span class="nav-resources-item-icon">' + item.iconSvg + '</span>' +
                '<span class="nav-resources-item-body">' +
                    '<strong>' + item.title + '</strong>' +
                    '<span>' + item.desc + '</span>' +
                '</span>';
            itemsCol.appendChild(a);
        });

        var spot = document.createElement('div');
        spot.className = 'nav-mega-spotlight';
        spot.innerHTML =
            '<span class="nav-spotlight-tag">' + SPOTLIGHT.tag + '</span>' +
            '<div class="nav-spotlight-content">' +
            '<h4>' + SPOTLIGHT.title + '</h4>' +
            '<p>' + SPOTLIGHT.desc + '</p>' +
            '</div>' +
            '<a class="nav-spotlight-link" href="' + SPOTLIGHT.href + '">' + SPOTLIGHT.cta + ' ' + ARROW_RIGHT_R + '</a>';

        inner.appendChild(itemsCol);
        inner.appendChild(spot);
        menu.appendChild(inner);
        document.body.appendChild(menu);

        // Position flush under nav (same logic as services menu)
        var navEl = document.querySelector('.nav');
        function positionMenu() {
            if (!navEl) return;
            var rect = navEl.getBoundingClientRect();
            menu.style.top = (rect.bottom - 1) + 'px';
        }
        positionMenu();
        window.addEventListener('scroll', positionMenu, { passive: true });
        window.addEventListener('resize', positionMenu);

        var hideTimer;
        function open() {
            if (window.innerWidth <= 1100) return;
            clearTimeout(hideTimer);
            positionMenu();
            if (navEl) navEl.classList.add('nav-mega-open');
            resourcesTrigger.classList.add('is-open');
            resourcesTrigger.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
        }
        function close() {
            if (navEl) navEl.classList.remove('nav-mega-open');
            resourcesTrigger.classList.remove('is-open');
            resourcesTrigger.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
        }
        function delayedClose() {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(close, 180);
        }

        resourcesTrigger.addEventListener('mouseenter', open);
        resourcesTrigger.addEventListener('mouseleave', delayedClose);
        resourcesTrigger.addEventListener('focus', open);
        menu.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        menu.addEventListener('mouseleave', delayedClose);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && !resourcesTrigger.contains(e.target)) close();
        });

        // Expose the resources data to initMobileNav (defined later in this IIFE)
        window.__croncoreNavResources = ITEMS;
    })();

    /* ========================================
       NAV CASE STUDIES MEGA MENU
       Categorized mega-menu (mirrors Services shell)
       under the Case Studies nav link. Only activates
       on pages where a "Case Studies" link is present
       in the nav-pill (currently the home page).
    ======================================== */
    (function initCaseStudiesMenu() {
        var trigger = null;
        var navItems = document.querySelectorAll('.nav-pill .nav-link, .nav-pill > a, .nav-pill > button');
        for (var i = 0; i < navItems.length; i++) {
            if ((navItems[i].textContent || '').trim().toLowerCase() === 'case studies') {
                trigger = navItems[i];
                break;
            }
        }
        if (!trigger) return;

        var GROUPS = [
            {
                id: 'cs-agents',
                title: 'AI Agents, Voice & Platforms',
                anchor: '/case-studies',
                spotlight: {
                    tag: 'Featured Case Study',
                    title: 'Sovereign voice engine for Mongolia',
                    desc: 'How we shipped a national-scale, in-country AI system in an underserved language.',
                    href: '/case-study-sovereign-voice-engine-for-mongolia',
                    cta: 'Read the case study'
                },
                items: [
                    { href: '/case-study-autonomous-sales-agent-drives-record-revenue-growth', title: 'Bezninja — Autonomous Sales Agent', desc: 'Record revenue growth across inbound and outbound sales funnels.' },
                    { href: '/case-study-custom-ai-voice-agent-closes-the-speed-to-lead-gap', title: 'Oracle Merchant Services — AI Voice Agent', desc: 'Custom voice agent closes the speed-to-lead gap and lifts qualified conversations.' },
                    { href: '/case-study-sovereign-voice-engine-for-mongolia', title: 'Bloomlink — Sovereign Voice for Mongolia', desc: 'Low-latency, in-region speech stack built for national telecom.' },
                    { href: '/case-study-architecting-a-ground-up-digital-learning-powerhouse', title: 'Digital Learning Powerhouse', desc: 'Ground-up edtech platform with adaptive AI tutoring at the core.' }
                ]
            },
            {
                id: 'cs-sled',
                title: 'SLED / Public Sector',
                anchor: '/case-studies',
                spotlight: {
                    tag: 'Featured',
                    title: 'Croncore for State, Local & Education',
                    desc: 'Methodology-led RFP and RFQ responses that win on substance — not boilerplate.',
                    href: '/sled-delivery-partner',
                    cta: 'See SLED capabilities'
                },
                items: [
                    { href: '/case-study-derby-downtown-lighting-rfp', title: 'Derby Downtown Lighting RFP', desc: 'Methodology-weighted municipal lighting RFP, built for a U.S. prime.' },
                    { href: '/case-study-macomb-community-college-av-equipment-rfq', title: 'Macomb Community College AV RFQ', desc: 'Strict-specification, commodity-driven AV equipment response.' },
                    { href: '/case-study-south-platte-renew-website-rfp', title: 'South Platte Renew Website RFP', desc: 'WordPress and accessibility-mandated municipal RFP win.' }
                ]
            }
        ];

        var DEFAULT_SPOTLIGHT = GROUPS[0].spotlight;

        var ARROW_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';

        // Decorate trigger with chevron
        trigger.classList.add('nav-services-trigger');
        trigger.setAttribute('aria-haspopup', 'true');
        trigger.setAttribute('aria-expanded', 'false');
        if (!trigger.querySelector('.nav-mega-chevron')) {
            var chev = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            chev.setAttribute('class', 'nav-mega-chevron');
            chev.setAttribute('viewBox', '0 0 24 24');
            chev.setAttribute('fill', 'none');
            chev.setAttribute('stroke', 'currentColor');
            chev.setAttribute('stroke-width', '2.5');
            chev.setAttribute('stroke-linecap', 'round');
            chev.setAttribute('stroke-linejoin', 'round');
            chev.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
            trigger.appendChild(chev);
        }

        // Build menu DOM (reuses Services mega-menu structure/CSS)
        var menu = document.createElement('div');
        menu.className = 'nav-megamenu';
        menu.id = 'navCaseStudiesMenu';
        menu.setAttribute('role', 'menu');
        menu.setAttribute('aria-label', 'Case Studies');

        var inner = document.createElement('div');
        inner.className = 'nav-megamenu-inner';

        var defaultActiveIndex = 0;

        var parentsCol = document.createElement('div');
        parentsCol.className = 'nav-mega-parents';
        GROUPS.forEach(function (g, i) {
            var btn = document.createElement('button');
            btn.className = 'nav-mega-parent' + (i === defaultActiveIndex ? ' active' : '');
            btn.type = 'button';
            btn.setAttribute('data-parent', g.id);
            btn.innerHTML = '<span>' + g.title + '</span>' +
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
            parentsCol.appendChild(btn);
        });

        var subsCol = document.createElement('div');
        subsCol.className = 'nav-mega-subs';
        GROUPS.forEach(function (g, i) {
            var subgroup = document.createElement('div');
            subgroup.className = 'nav-mega-subgroup' + (i === defaultActiveIndex ? ' active' : '');
            subgroup.setAttribute('data-parent', g.id);

            g.items.forEach(function (item) {
                var a = document.createElement('a');
                a.className = 'nav-mega-sub';
                a.href = item.href;
                a.innerHTML = '<strong>' + item.title + '</strong><span>' + item.desc + '</span>';
                subgroup.appendChild(a);
            });

            var allLink = document.createElement('a');
            allLink.className = 'nav-mega-all';
            allLink.href = g.anchor;
            allLink.innerHTML = 'View all case studies ' + ARROW_RIGHT;
            subgroup.appendChild(allLink);
            subsCol.appendChild(subgroup);
        });

        var spot = document.createElement('div');
        spot.className = 'nav-mega-spotlight';
        function renderSpotlight(g) {
            var s = (g && g.spotlight) || DEFAULT_SPOTLIGHT;
            spot.innerHTML =
                '<span class="nav-spotlight-tag">' + s.tag + '</span>' +
                '<div class="nav-spotlight-content">' +
                '<h4>' + s.title + '</h4>' +
                '<p>' + s.desc + '</p>' +
                '</div>' +
                '<a class="nav-spotlight-link" href="' + s.href + '">' + s.cta + ' ' + ARROW_RIGHT + '</a>';
        }
        renderSpotlight(GROUPS[defaultActiveIndex]);

        inner.appendChild(parentsCol);
        inner.appendChild(subsCol);
        inner.appendChild(spot);
        menu.appendChild(inner);
        document.body.appendChild(menu);

        var navEl = document.querySelector('.nav');
        function positionMenu() {
            if (!navEl) return;
            var rect = navEl.getBoundingClientRect();
            menu.style.top = (rect.bottom - 1) + 'px';
        }
        positionMenu();
        window.addEventListener('scroll', positionMenu, { passive: true });
        window.addEventListener('resize', positionMenu);

        var hideTimer;
        function open() {
            if (window.innerWidth <= 1100) return;
            clearTimeout(hideTimer);
            positionMenu();
            if (navEl) navEl.classList.add('nav-mega-open');
            trigger.classList.add('is-open');
            trigger.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
        }
        function close() {
            if (navEl) navEl.classList.remove('nav-mega-open');
            trigger.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
        }
        function delayedClose() {
            clearTimeout(hideTimer);
            hideTimer = setTimeout(close, 180);
        }

        trigger.addEventListener('mouseenter', open);
        trigger.addEventListener('mouseleave', delayedClose);
        trigger.addEventListener('focus', open);
        menu.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        menu.addEventListener('mouseleave', delayedClose);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
        document.addEventListener('click', function (e) {
            if (!menu.contains(e.target) && !trigger.contains(e.target)) close();
        });

        // Expose to initMobileNav so the mobile drilldown can mirror this group
        window.__croncoreNavCaseStudies = GROUPS;
    })();

    /* ========================================
       MOBILE NAV — TKXEL-STYLE DRILLDOWN
       Builds the multi-panel mobile menu inside #mobileNav.
       Root panel + Services drilldown (with accordions) + Resources drilldown.
    ======================================== */
    (function initMobileNav() {
        var overlay = document.getElementById('mobileNav');
        if (!overlay) return;

        var GROUPS = window.__croncoreNavGroups || [];
        var RESOURCES = window.__croncoreNavResources || [];
        var CASE_STUDIES = window.__croncoreNavCaseStudies || null;

        // GROUPS data uses absolute paths like "/services/foo" — those work on
        // every page (root or nested) so we can use them as-is.
        var origAnchors = overlay.querySelectorAll('a');
        function fix(href) { return href; }

        // ---- Capture original simple links (About / Testimonials / FAQ) and the Contact CTA
        //      so they survive the rebuild with their per-page hrefs intact. ----
        var aboutHref = '#about';
        var testHref = '#testimonials';
        var faqHref = '#faq';
        var contactHref = 'contact';
        var hasCaseStudiesNav = !!CASE_STUDIES;
        for (var k = 0; k < origAnchors.length; k++) {
            var ahref = origAnchors[k].getAttribute('href') || '';
            var atext = (origAnchors[k].textContent || '').trim().toLowerCase();
            if (atext === 'about' || ahref.indexOf('#about') !== -1) aboutHref = ahref;
            else if (atext === 'testimonials' || ahref.indexOf('#testimonials') !== -1) testHref = ahref;
            else if (atext === 'faq' || ahref.indexOf('#faq') !== -1) faqHref = ahref;
            else if (atext === 'contact us' || atext === 'contact') contactHref = ahref;
            else if (atext === 'case studies') hasCaseStudiesNav = true;
        }

        // ---- Logo: pull from the page's nav-brand so we get the right paths ----
        var navBrand = document.querySelector('.nav-brand');
        var brandHTML = navBrand ? navBrand.innerHTML : '';

        // ---- SVGs ----
        // Unicode arrow glyphs — render reliably across all browsers without any SVG quirks.
        var CHEV_RIGHT     = '<span class="mobile-link-chevron" aria-hidden="true">›</span>';
        var CHEV_LEFT      = '<span class="mobile-back-chevron" aria-hidden="true">‹</span>';
        var CHEV_DOWN      = '<span class="mobile-accordion-chevron" aria-hidden="true">⌄</span>';
        var ARROW_R_CTA    = '<span class="mobile-cta-arrow" aria-hidden="true">→</span>';
        // Close button still uses an SVG — explicit width/height + viewBox ensure it paints reliably.
        var CLOSE_X    = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

        // ---- Wipe original children and rebuild ----
        overlay.innerHTML = '';

        // ---- Header ----
        var header = document.createElement('div');
        header.className = 'mobile-nav-header';
        var brandLink = document.createElement('a');
        brandLink.className = 'mobile-nav-brand';
        brandLink.href = '/';
        brandLink.setAttribute('aria-label', 'Croncore Home');
        brandLink.innerHTML = brandHTML;
        var closeBtn = document.createElement('button');
        closeBtn.className = 'mobile-close-btn';
        closeBtn.id = 'mobileCloseBtn';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = CLOSE_X;
        header.appendChild(brandLink);
        header.appendChild(closeBtn);
        overlay.appendChild(header);

        // ---- Panels viewport ----
        var panels = document.createElement('div');
        panels.className = 'mobile-panels';
        overlay.appendChild(panels);

        // ---- Root panel ----
        var rootPanel = document.createElement('div');
        rootPanel.className = 'mobile-panel mobile-panel--root';

        function makeRootLink(label, href) {
            var a = document.createElement('a');
            a.href = href;
            // Plain links (no sublinks) get no chevron — only drilldown triggers do.
            a.innerHTML = '<span>' + label + '</span>';
            return a;
        }
        function makeRootTrigger(label, panelId) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'mobile-link';
            b.setAttribute('data-panel', panelId);
            b.setAttribute('aria-haspopup', 'true');
            b.innerHTML = '<span>' + label + '</span>' + CHEV_RIGHT;
            return b;
        }

        rootPanel.appendChild(makeRootTrigger('Services', 'services'));
        if (hasCaseStudiesNav) {
            rootPanel.appendChild(makeRootTrigger('Case Studies', 'case-studies'));
        } else {
            rootPanel.appendChild(makeRootLink('About', aboutHref));
        }
        rootPanel.appendChild(makeRootLink('Testimonials', testHref));
        rootPanel.appendChild(makeRootTrigger('Resources', 'resources'));
        rootPanel.appendChild(makeRootLink('FAQ', faqHref));

        var ctaWrap = document.createElement('div');
        ctaWrap.className = 'mobile-panel-cta-wrap';
        var ctaBtn = document.createElement('a');
        ctaBtn.className = 'btn btn-glow mobile-panel-cta';
        ctaBtn.href = contactHref;
        ctaBtn.innerHTML = 'Contact Us' + ARROW_R_CTA;
        ctaWrap.appendChild(ctaBtn);
        rootPanel.appendChild(ctaWrap);

        panels.appendChild(rootPanel);

        // ---- Services drilldown panel ----
        var servicesPanel = document.createElement('div');
        servicesPanel.className = 'mobile-panel mobile-panel--services';
        servicesPanel.setAttribute('data-panel-id', 'services');

        var sBack = document.createElement('button');
        sBack.type = 'button';
        sBack.className = 'mobile-panel-back';
        sBack.setAttribute('data-back', '');
        sBack.innerHTML = CHEV_LEFT + '<span>Services</span>';
        servicesPanel.appendChild(sBack);

        GROUPS.forEach(function (g) {
            var accordion = document.createElement('div');
            accordion.className = 'mobile-accordion' + (g.placeholder ? ' is-placeholder' : '');

            var toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'mobile-accordion-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '<span>' + g.title + '</span>' + CHEV_DOWN;

            var list = document.createElement('div');
            list.className = 'mobile-accordion-list';

            if (g.placeholder || !g.items || !g.items.length) {
                var soon = document.createElement('span');
                soon.className = 'mobile-accordion-soon';
                soon.textContent = 'Coming soon';
                list.appendChild(soon);
            } else {
                g.items.forEach(function (item) {
                    var a = document.createElement('a');
                    a.href = fix(item.href);
                    a.textContent = item.title;
                    list.appendChild(a);
                });
            }

            accordion.appendChild(toggle);
            accordion.appendChild(list);
            servicesPanel.appendChild(accordion);

            toggle.addEventListener('click', function () {
                var isOpen = accordion.classList.toggle('is-open');
                toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            });
        });

        var sCta = document.createElement('a');
        sCta.className = 'mobile-panel-outline-cta';
        sCta.href = fix('/services');
        sCta.innerHTML = '<span>View all services</span>' + ARROW_R_CTA;
        servicesPanel.appendChild(sCta);

        panels.appendChild(servicesPanel);

        // ---- Resources drilldown panel ----
        var resourcesPanel = document.createElement('div');
        resourcesPanel.className = 'mobile-panel mobile-panel--resources';
        resourcesPanel.setAttribute('data-panel-id', 'resources');

        var rBack = document.createElement('button');
        rBack.type = 'button';
        rBack.className = 'mobile-panel-back';
        rBack.setAttribute('data-back', '');
        rBack.innerHTML = CHEV_LEFT + '<span>Resources</span>';
        resourcesPanel.appendChild(rBack);

        // Resources are flat blue-bullet items, like tkxel's Company panel
        var resList = document.createElement('div');
        resList.className = 'mobile-accordion-list';
        resList.style.maxHeight = 'none';
        RESOURCES.forEach(function (item) {
            var a = document.createElement('a');
            a.href = fix(item.href);
            a.textContent = item.title;
            resList.appendChild(a);
        });
        resourcesPanel.appendChild(resList);

        panels.appendChild(resourcesPanel);

        // ---- Case Studies drilldown panel (only on pages with the Case Studies nav) ----
        if (CASE_STUDIES && CASE_STUDIES.length) {
            var csPanel = document.createElement('div');
            csPanel.className = 'mobile-panel mobile-panel--case-studies';
            csPanel.setAttribute('data-panel-id', 'case-studies');

            var csBack = document.createElement('button');
            csBack.type = 'button';
            csBack.className = 'mobile-panel-back';
            csBack.setAttribute('data-back', '');
            csBack.innerHTML = CHEV_LEFT + '<span>Case Studies</span>';
            csPanel.appendChild(csBack);

            CASE_STUDIES.forEach(function (g) {
                var accordion = document.createElement('div');
                accordion.className = 'mobile-accordion';

                var toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'mobile-accordion-toggle';
                toggle.setAttribute('aria-expanded', 'false');
                toggle.innerHTML = '<span>' + g.title + '</span>' + CHEV_DOWN;

                var list = document.createElement('div');
                list.className = 'mobile-accordion-list';
                g.items.forEach(function (item) {
                    var a = document.createElement('a');
                    a.href = fix(item.href);
                    a.textContent = item.title;
                    list.appendChild(a);
                });

                accordion.appendChild(toggle);
                accordion.appendChild(list);
                csPanel.appendChild(accordion);

                toggle.addEventListener('click', function () {
                    var isOpen = accordion.classList.toggle('is-open');
                    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                });
            });

            var csCta = document.createElement('a');
            csCta.className = 'mobile-panel-outline-cta';
            csCta.href = fix('/case-studies');
            csCta.innerHTML = '<span>View all case studies</span>' + ARROW_R_CTA;
            csPanel.appendChild(csCta);

            panels.appendChild(csPanel);
        }

        // ---- Panel switching ----
        function openSubpanel(id) {
            var target = panels.querySelector('[data-panel-id="' + id + '"]');
            if (!target) return;
            // Reset all subpanels
            panels.querySelectorAll('.mobile-panel:not(.mobile-panel--root)').forEach(function (p) {
                p.classList.remove('is-active');
            });
            target.classList.add('is-active');
            rootPanel.classList.add('is-pushed');
        }
        function backToRoot() {
            panels.querySelectorAll('.mobile-panel:not(.mobile-panel--root)').forEach(function (p) {
                p.classList.remove('is-active');
            });
            rootPanel.classList.remove('is-pushed');
        }

        // Wire root triggers
        rootPanel.querySelectorAll('[data-panel]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                openSubpanel(btn.getAttribute('data-panel'));
            });
        });

        // Wire back buttons
        panels.querySelectorAll('[data-back]').forEach(function (btn) {
            btn.addEventListener('click', backToRoot);
        });

        // Expose for the hamburger toggle to call on close
        overlay.__resetPanels = function () {
            backToRoot();
            panels.querySelectorAll('.mobile-accordion.is-open').forEach(function (a) {
                a.classList.remove('is-open');
                var t = a.querySelector('.mobile-accordion-toggle');
                if (t) t.setAttribute('aria-expanded', 'false');
            });
        };
    })();

    /* ========================================
       THEME TOGGLE
    ======================================== */
    var STORAGE_KEY = 'croncore-theme';
    var themeToggle = document.getElementById('themeToggle');
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');

    function getPreferredTheme() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return 'light';
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#FFFFFF');
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (metaThemeColor) metaThemeColor.setAttribute('content', '#0A0E17');
        }
    }

    var currentTheme = getPreferredTheme();
    applyTheme(currentTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var isLight = document.documentElement.getAttribute('data-theme') === 'light';
            var newTheme = isLight ? 'dark' : 'light';
            applyTheme(newTheme);
            localStorage.setItem(STORAGE_KEY, newTheme);
            if (typeof updateCanvasColors === 'function') {
                updateCanvasColors(newTheme);
            }
        });
    }

    // Removed system theme listener to maintain light mode default
    /*
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    */

    /* ========================================
       NEURAL NETWORK CANVAS (OPTIMIZED)
    ======================================== */
    var canvas = document.getElementById('neuralCanvas');
    if (canvas) {
        var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var isMobile = window.innerWidth <= 768;
        var isSmallScreen = window.innerWidth <= 480;

        if (isSmallScreen || prefersReducedMotion) {
            canvas.style.display = 'none';
        } else {
            var ctx = canvas.getContext('2d');
            var nodes = [];
            var w, h;
            var animationId = null;
            var isPageVisible = true;

            var NODE_COUNT = isMobile ? 30 : 60;
            var CONNECTION_DIST = isMobile ? 150 : 180;
            var connDistSq = CONNECTION_DIST * CONNECTION_DIST;

            // Theme-aware canvas colors
            var canvasNodeColor = 'rgba(0, 212, 255, 0.3)';
            var canvasLineColorBase = [0, 212, 255];

            window.updateCanvasColors = function (theme) {
                if (theme === 'light') {
                    canvasNodeColor = 'rgba(59, 130, 217, 0.35)';
                    canvasLineColorBase = [59, 130, 217];
                } else {
                    canvasNodeColor = 'rgba(0, 212, 255, 0.3)';
                    canvasLineColorBase = [0, 212, 255];
                }
            };

            if (document.documentElement.getAttribute('data-theme') === 'light') {
                updateCanvasColors('light');
            }

            function resize() {
                w = canvas.width = window.innerWidth;
                h = canvas.height = window.innerHeight;
            }
            window.addEventListener('resize', resize);
            resize();

            for (var i = 0; i < NODE_COUNT; i++) {
                nodes.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 2 + 1
                });
            }

            function animateNetwork() {
                if (!isPageVisible) return;

                ctx.clearRect(0, 0, w, h);

                for (var i = 0; i < nodes.length; i++) {
                    var n = nodes[i];
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > w) n.vx *= -1;
                    if (n.y < 0 || n.y > h) n.vy *= -1;

                    for (var j = i + 1; j < nodes.length; j++) {
                        var m = nodes[j];
                        var dx = n.x - m.x;
                        var dy = n.y - m.y;
                        var distSq = dx * dx + dy * dy;
                        if (distSq < connDistSq) {
                            var dist = Math.sqrt(distSq);
                            var alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                            ctx.beginPath();
                            ctx.moveTo(n.x, n.y);
                            ctx.lineTo(m.x, m.y);
                            ctx.strokeStyle = 'rgba(' + canvasLineColorBase[0] + ',' + canvasLineColorBase[1] + ',' + canvasLineColorBase[2] + ',' + alpha + ')';
                            ctx.lineWidth = 0.5;
                            ctx.stroke();
                        }
                    }

                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                    ctx.fillStyle = canvasNodeColor;
                    ctx.fill();
                }
                animationId = requestAnimationFrame(animateNetwork);
            }

            // Pause when tab is hidden
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    isPageVisible = false;
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                } else {
                    isPageVisible = true;
                    if (!animationId) {
                        animateNetwork();
                    }
                }
            });

            animateNetwork();
        }
    }

    /* ========================================
       NAVBAR SCROLL + ACTIVE LINK
    ======================================== */
    var nav = document.getElementById('navbar');
    if (nav) {
        var navLinks = nav.querySelectorAll('.nav-link');
        var sections = [];
        navLinks.forEach(function (link) {
            var href = link.getAttribute('href');
            if (href && href.length > 1 && href.startsWith('#')) {
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
    var hamburger = document.getElementById('hamburger');
    var mobileNav = document.getElementById('mobileNav');
    if (hamburger && mobileNav) {
        function closeMenu() {
            hamburger.classList.remove('open');
            mobileNav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            // Reset to root panel + close any open accordions after the slide-out
            setTimeout(function () {
                if (typeof mobileNav.__resetPanels === 'function') mobileNav.__resetPanels();
            }, 260);
        }

        hamburger.addEventListener('click', function () {
            var isOpen = hamburger.classList.toggle('open');
            mobileNav.classList.toggle('open');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
            if (!isOpen && typeof mobileNav.__resetPanels === 'function') {
                setTimeout(mobileNav.__resetPanels, 260);
            }
        });

        // Close button (rebuilt inside overlay by initMobileNav — use event delegation)
        mobileNav.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('#mobileCloseBtn, .mobile-close-btn');
            if (btn) closeMenu();
        });

        // Close on real link click (anchors that navigate). Buttons that just open subpanels stay.
        mobileNav.addEventListener('click', function (e) {
            var a = e.target.closest && e.target.closest('a[href]');
            if (!a) return;
            var href = a.getAttribute('href');
            // Only close on navigations — skip empty href / "#"
            if (!href || href === '#') return;
            closeMenu();
        });
    }

    /* ========================================
       FLOATING CONTACT BUTTONS — collapse toggle
       Adds a small "×" handle above the floating WhatsApp /
       Contact buttons. Clicking it collapses them into compact
       icon-only circles (the same look as the mobile version);
       expanding restores the labels. The choice is remembered
       per visitor. Runs on DOM ready because the .float-btns
       markup sits after this script in the page.
    ======================================== */
    function initFloatButtons() {
        var floatBtns = document.querySelector('.float-btns');
        if (!floatBtns || floatBtns.querySelector('.float-toggle')) return;

        var STORAGE_KEY = 'croncore-float-collapsed';
        var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
        var ICON_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>';

        var toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.className = 'float-toggle';
        floatBtns.insertBefore(toggle, floatBtns.firstChild);

        function render(collapsed) {
            floatBtns.classList.toggle('is-collapsed', collapsed);
            toggle.innerHTML = collapsed ? ICON_OPEN : ICON_CLOSE;
            toggle.setAttribute('aria-label', collapsed ? 'Show contact buttons' : 'Minimize contact buttons');
            toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
            toggle.setAttribute('title', collapsed ? 'Show contact buttons' : 'Minimize');
        }

        var startCollapsed = false;
        try { startCollapsed = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
        render(startCollapsed);

        toggle.addEventListener('click', function () {
            var collapsed = !floatBtns.classList.contains('is-collapsed');
            render(collapsed);
            try { localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0'); } catch (e) {}
        });
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloatButtons);
    } else {
        initFloatButtons();
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
       CASE STUDIES FILTER
    ======================================== */
    var csFilterBtns = document.querySelectorAll('.cs-filter-btn');
    var csCards = document.querySelectorAll('.cs-card');

    if (csFilterBtns.length && csCards.length) {
        csFilterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                var filter = btn.getAttribute('data-filter');

                // Update active state
                csFilterBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');

                // Show/hide cards
                csCards.forEach(function (card) {
                    var cat = card.getAttribute('data-category');
                    if (filter === 'all' || cat === filter) {
                        card.classList.remove('cs-hidden');
                    } else {
                        card.classList.add('cs-hidden');
                    }
                });

                // Update slider buttons after filtering
                if (typeof updateCsGridButtons === 'function') {
                    setTimeout(updateCsGridButtons, 300); // Small delay for rendering
                }
            });
        });
    }

    /* ========================================
       CASE STUDIES SLIDER (HORIZONTAL SCROL)
    ======================================== */
    var csGrid = document.querySelector('.cs-grid');
    var csPrevBtn = document.querySelector('.cs-prev');
    var csNextBtn = document.querySelector('.cs-next');

    window.updateCsGridButtons = function() {
        if (!csGrid || !csPrevBtn || !csNextBtn) return;
        
        var scrollLeft = csGrid.scrollLeft;
        var maxScroll = csGrid.scrollWidth - csGrid.clientWidth;
        
        // Show buttons only if content exceeds container width
        if (csGrid.scrollWidth > csGrid.clientWidth + 10) {
            csPrevBtn.classList.add('visible');
            csNextBtn.classList.add('visible');
        } else {
            csPrevBtn.classList.remove('visible');
            csNextBtn.classList.remove('visible');
        }

        // Opacity and enabled state based on scroll position
        if (scrollLeft > 10) {
            csPrevBtn.style.opacity = '1';
            csPrevBtn.style.pointerEvents = 'auto';
        } else {
            csPrevBtn.style.opacity = '0.3';
            csPrevBtn.style.pointerEvents = 'none';
        }

        if (scrollLeft < maxScroll - 10) {
            csNextBtn.style.opacity = '1';
            csNextBtn.style.pointerEvents = 'auto';
        } else {
            csNextBtn.style.opacity = '0.3';
            csNextBtn.style.pointerEvents = 'none';
        }
    };

    if (csGrid && csPrevBtn && csNextBtn) {
        csNextBtn.addEventListener('click', function() {
            var scrollAmount = csGrid.clientWidth * 0.8;
            csGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        csPrevBtn.addEventListener('click', function() {
            var scrollAmount = csGrid.clientWidth * 0.8;
            csGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        csGrid.addEventListener('scroll', updateCsGridButtons);
        window.addEventListener('resize', updateCsGridButtons);
        // Initial check after some time to ensure layout is ready
        setTimeout(updateCsGridButtons, 500);
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

    /* ========================================
       SANITY INSIGHTS FETCH & SLIDER (homepage preview)
    ======================================== */
    var insightsGrid = document.querySelector('#home-insights-grid');
    var insightsPrevBtn = document.querySelector('.insights-prev');
    var insightsNextBtn = document.querySelector('.insights-next');

    if (insightsGrid && typeof Sanity !== 'undefined') {
        var hasExistingContent = insightsGrid.querySelectorAll('.insights-card').length > 0;
        var FALLBACK_IMG = 'images/insights1.jpeg';

        var groq = '*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...8] {' +
            '"slug": slug.current, title, excerpt, publishedAt,' +
            'mainImage{asset->{url}, alt},' +
            '"category": category->title,' +
            'body' +
        '}';

        function escHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

        Sanity.fetch(groq)
            .then(function (posts) {
                if (!posts || posts.length === 0) {
                    if (!hasExistingContent) {
                        insightsGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-muted);">No posts available.</p>';
                    }
                    return;
                }

                var html = posts.map(function (post) {
                    var img = post.mainImage
                        ? Sanity.imageUrl(post.mainImage, {width: 800, fit: 'crop', quality: 80})
                        : FALLBACK_IMG;
                    var alt = (post.mainImage && post.mainImage.alt) || post.title || '';
                    var dateStr = post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})
                        : '';
                    var category = post.category || 'Insights';
                    var excerpt = post.excerpt || Sanity.portableTextToPlain(post.body, 150);

                    return '<article class="insights-card in-view">' +
                        '<img src="' + img + '" alt="' + escHtml(alt) + '" class="insights-card-img" style="aspect-ratio: 16/9; object-fit: cover;" width="400" height="225" loading="lazy">' +
                        '<div class="insights-card-body">' +
                            '<span class="insights-card-category">' + escHtml(category) + '</span>' +
                            '<h3 style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">' + escHtml(post.title || '') + '</h3>' +
                            '<p style="overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">' + escHtml(excerpt) + '</p>' +
                            '<div class="insights-card-meta">' +
                                '<span>' + dateStr + '</span>' +
                                '<a href="insights/' + encodeURIComponent(post.slug) + '" class="insights-card-link">Read More <svg class="arrow-icon" viewBox="0 0 24 24">' +
                                    '<line x1="5" y1="12" x2="19" y2="12" />' +
                                    '<polyline points="12 5 19 12 12 19" />' +
                                '</svg></a>' +
                            '</div>' +
                        '</div>' +
                    '</article>';
                }).join('');

                insightsGrid.innerHTML = html;
                initInsightsSlider();
            })
            .catch(function (error) {
                console.error('Sanity insights fetch error:', error);
            });

        function initInsightsSlider() {
            if (!insightsGrid || !insightsPrevBtn || !insightsNextBtn) return;

            function updateInsightsButtons() {
                var scrollLeft = insightsGrid.scrollLeft;
                var maxScroll = insightsGrid.scrollWidth - insightsGrid.clientWidth;
                
                // Show buttons only if content exceeds container width
                if (insightsGrid.scrollWidth > insightsGrid.clientWidth + 10) {
                    insightsPrevBtn.classList.add('visible');
                    insightsNextBtn.classList.add('visible');
                } else {
                    insightsPrevBtn.classList.remove('visible');
                    insightsNextBtn.classList.remove('visible');
                }

                // Opacity and enabled state based on scroll position
                if (scrollLeft > 10) {
                    insightsPrevBtn.style.opacity = '1';
                    insightsPrevBtn.style.pointerEvents = 'auto';
                } else {
                    insightsPrevBtn.style.opacity = '0.3';
                    insightsPrevBtn.style.pointerEvents = 'none';
                }

                if (scrollLeft < maxScroll - 10) {
                    insightsNextBtn.style.opacity = '1';
                    insightsNextBtn.style.pointerEvents = 'auto';
                } else {
                    insightsNextBtn.style.opacity = '0.3';
                    insightsNextBtn.style.pointerEvents = 'none';
                }
            }

            insightsNextBtn.addEventListener('click', function () {
                var scrollAmount = insightsGrid.clientWidth * 0.8;
                insightsGrid.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });

            insightsPrevBtn.addEventListener('click', function () {
                var scrollAmount = insightsGrid.clientWidth * 0.8;
                insightsGrid.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });

            insightsGrid.addEventListener('scroll', updateInsightsButtons);
            window.addEventListener('resize', updateInsightsButtons);
            
            // Initial check after a short delay to ensure rendering is complete
            setTimeout(updateInsightsButtons, 500);
        }
    }

})();
