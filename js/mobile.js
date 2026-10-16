(function initMobileSupport() {
    const WIDTH_FALLBACK = 900;

    function isMobile() {
        const touchDevice = window.matchMedia(
            '(hover: none) and (pointer: coarse)'
        ).matches;
        const narrow = window.innerWidth <= WIDTH_FALLBACK;
        return touchDevice || narrow;
    }

    function openMobileSidebar() {
        document.body.classList.add('mobile-sidebar-open');
    }

    function closeMobileSidebar() {
        document.body.classList.remove('mobile-sidebar-open');
    }

    function injectCloseButtons() {
        document.querySelectorAll('.plugin-header').forEach(header => {
            if (header.querySelector('.mobile-sidebar-close')) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'mobile-sidebar-close';
            btn.setAttribute('aria-label', 'Close panel');
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24"
                     fill="currentColor">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,
                             6.41L10.59,12L5,17.59L6.41,19L12,
                             13.41L17.59,19L19,17.59L13.41,12L19,
                             6.41Z"/>
                </svg>
            `;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMobileSidebar();
            });
            header.appendChild(btn);
        });
    }

    function bindIconTaps() {
        document.querySelectorAll('.icon-item').forEach(item => {
            if (item.dataset.mobileBound === '1') return;
            item.dataset.mobileBound = '1';

            item.addEventListener('click', () => {
                if (isMobile()) {
                    openMobileSidebar();
                }
            });
        });
    }

    function bindOutsideTapClose() {
        const right = document.querySelector('.right-section');
        if (!right || right.dataset.mobileBound === '1') return;
        right.dataset.mobileBound = '1';

        right.addEventListener('click', () => {
            if (isMobile()
                && document.body.classList.contains(
                    'mobile-sidebar-open')) {
                closeMobileSidebar();
            }
        }, true);
    }

    function bindFileOpenClose() {
        if (document.body.dataset.mobileFileBound === '1') return;
        document.body.dataset.mobileFileBound = '1';

        document.addEventListener('click', (e) => {
            if (!isMobile()) return;
            const fileItem = e.target.closest('.file-item');
            if (!fileItem) return;
            if (e.target.closest('.folder-actions')) return;
            setTimeout(closeMobileSidebar, 180);
        });
    }

    function bindResize() {
        if (window._mobileResizeBound) return;
        window._mobileResizeBound = true;

        window.addEventListener('resize', () => {
            if (!isMobile()) {
                closeMobileSidebar();
            }
        });
    }

    function runAll() {
        injectCloseButtons();
        bindIconTaps();
        bindOutsideTapClose();
        bindFileOpenClose();
        bindResize();
    }

    function start() {
        runAll();
        setTimeout(runAll, 2500);

        const observer = new MutationObserver(() => {
            if (isMobile()) injectCloseButtons();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
})();
