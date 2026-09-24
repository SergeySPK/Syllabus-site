/* =========================================================
   Syllabus — интерактив лендинга
   Без зависимостей, без сборки, ES2020+
   ========================================================= */

(function () {
    'use strict';

    /* ---------- Тема (light / dark) ---------- */
    const THEME_KEY = 'syllabus-theme';
    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }

    function initTheme() {
        let theme = null;
        try { theme = localStorage.getItem(THEME_KEY); } catch (e) {}
        if (!theme) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        applyTheme(theme);

        const btn = document.getElementById('themeToggle');
        if (btn) {
            btn.addEventListener('click', () => {
                const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                applyTheme(next);
            });
        }
    }

    /* ---------- Header: эффект при скролле ---------- */
    function initHeaderScroll() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        const update = () => {
            if (window.scrollY > 8) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    /* ---------- Scroll progress bar ---------- */
    function initScrollProgress() {
        const bar = document.getElementById('scrollProgress');
        if (!bar) return;

        let ticking = false;
        const update = () => {
            const doc = document.documentElement;
            const max = doc.scrollHeight - doc.clientHeight;
            const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
            bar.style.width = progress + '%';
            ticking = false;
        };
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
    }

    /* ---------- Мобильное меню ---------- */
    function initMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const nav = document.getElementById('nav');
        if (!toggle || !nav) return;

        const close = () => {
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Закрытие при клике по ссылке
        nav.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', close);
        });

        // Закрытие при клике вне меню
        document.addEventListener('click', (e) => {
            if (!nav.classList.contains('open')) return;
            if (!nav.contains(e.target) && e.target !== toggle) {
                close();
            }
        });

        // Закрытие по Esc
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });

        // Закрытие при resize на десктоп
        window.addEventListener('resize', () => {
            if (window.innerWidth > 860) close();
        });
    }

    /* ---------- Reveal on scroll ---------- */
    function initReveal() {
        const elements = document.querySelectorAll('.reveal');
        if (!elements.length) return;

        if (!('IntersectionObserver' in window)) {
            elements.forEach((el) => el.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
        );

        elements.forEach((el) => observer.observe(el));
    }

    /* ---------- Scroll-to-top ---------- */
    function initScrollTop() {
        const btn = document.getElementById('scrollTop');
        if (!btn) return;

        const update = () => {
            if (window.scrollY > 600) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        };
        update();
        window.addEventListener('scroll', update, { passive: true });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- Активная ссылка в навигации ---------- */
    function initScrollSpy() {
        const sections = document.querySelectorAll('main section[id]');
        const links = document.querySelectorAll('.nav a[href^="#"]');
        if (!sections.length || !links.length) return;

        const linkMap = new Map();
        links.forEach((link) => {
            const id = link.getAttribute('href').slice(1);
            if (id) linkMap.set(id, link);
        });

        const setActive = (id) => {
            links.forEach((l) => l.classList.remove('active'));
            const active = linkMap.get(id);
            if (active) active.classList.add('active');
        };

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length) setActive(visible[0].target.id);
            },
            { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] }
        );

        sections.forEach((s) => observer.observe(s));
    }

    /* ---------- Lightbox ---------- */
    function initLightbox() {
        const triggers = Array.from(document.querySelectorAll('[data-lightbox]'));
        if (!triggers.length) return;

        const lb = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightboxImg');
        const lbCap = document.getElementById('lightboxCaption');
        const btnClose = document.getElementById('lightboxClose');
        const btnPrev = document.getElementById('lightboxPrev');
        const btnNext = document.getElementById('lightboxNext');
        if (!lb || !lbImg) return;

        let currentIndex = 0;

        const show = (index) => {
            currentIndex = (index + triggers.length) % triggers.length;
            const trigger = triggers[currentIndex];
            const src = trigger.getAttribute('data-lightbox');
            const caption = trigger.getAttribute('data-caption')
                || (trigger.querySelector('img') && trigger.querySelector('img').alt)
                || '';

            lbImg.src = src;
            lbImg.alt = caption;
            lbCap.textContent = caption;

            lb.hidden = false;
            document.body.classList.add('lightbox-open');
            // Микротик для анимации появления
            requestAnimationFrame(() => lb.classList.add('open'));
        };

        const close = () => {
            lb.classList.remove('open');
            document.body.classList.remove('lightbox-open');
            // Даём дойти анимации, потом прячем
            setTimeout(() => {
                lb.hidden = true;
                lbImg.src = '';
            }, 200);
        };

        const prev = () => show(currentIndex - 1);
        const next = () => show(currentIndex + 1);

        triggers.forEach((trigger, i) => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                show(i);
            });
        });

        if (btnClose) btnClose.addEventListener('click', close);
        if (btnPrev) btnPrev.addEventListener('click', prev);
        if (btnNext) btnNext.addEventListener('click', next);

        // Клик по фону (не по картинке) закрывает
        lb.addEventListener('click', (e) => {
            if (e.target === lb) close();
        });

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (lb.hidden) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });
    }

    /* ---------- Copy-кнопки в блоках кода ---------- */
    function initCopyButtons() {
        const buttons = document.querySelectorAll('.copy-btn');
        if (!buttons.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener('click', async () => {
                const text = btn.getAttribute('data-copy') || '';
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        // Фолбэк для http:// и старых браузеров
                        const ta = document.createElement('textarea');
                        ta.value = text;
                        ta.setAttribute('readonly', '');
                        ta.style.position = 'absolute';
                        ta.style.left = '-9999px';
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                    }

                    btn.classList.add('copied');
                    const original = btn.innerHTML;
                    btn.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8l3.5 3.5L13 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = original;
                    }, 1600);
                } catch (err) {
                    console.warn('Copy failed', err);
                }
            });
        });
    }

    /* ---------- Год в подвале ---------- */
    function initYear() {
        const el = document.getElementById('year');
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* ---------- Старт ---------- */
    function init() {
        initTheme();
        initHeaderScroll();
        initScrollProgress();
        initMobileMenu();
        initReveal();
        initScrollTop();
        initScrollSpy();
        initLightbox();
        initCopyButtons();
        initYear();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();