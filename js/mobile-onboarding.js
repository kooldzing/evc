/* Mobile onboarding: welcome popup + "Get Started" pointer */
(function () {
    'use strict';

    const STORAGE_KEY_WELCOME = 'mobile-welcome-dismissed';
    const STORAGE_KEY_POINTER = 'get-started-pointer-dismissed';
    const METAMASK_HELP_URL =
        'https://help.phantom.com/';

    function isMobile() {
        const touch = window.matchMedia(
            '(hover: none) and (pointer: coarse)'
        ).matches;
        const narrow = window.innerWidth <= 900;
        return touch || narrow;
    }

    // ---- Welcome modal -------------------------------------

    function buildWelcomeModal() {
        if (document.getElementById('mobile-welcome-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'mobile-welcome-modal';
        modal.className = 'mobile-welcome-modal';
        modal.innerHTML = `
            <div class="mobile-welcome-overlay"></div>
            <div class="mobile-welcome-card">
                <div class="mobile-welcome-icon">📱</div>
                <h2>You're on Mobile</h2>
                <p>
                    Make sure you're accessing the compiler from a
                    <strong>DApp Browser</strong> inside a Web3 wallet
                    like <strong>Phantom Wallet</strong>.
                </p>
                <p style="font-size:13px;">
                    Don't know how to find your DApp Browser in your
                    Phantom Wallet app?
                    <a href="${METAMASK_HELP_URL}"
                       target="_blank" rel="noopener noreferrer">
                        Follow this guide →
                    </a>
                </p>
                <div class="mobile-welcome-actions">
                    <button class="remix-btn remix-btn-secondary"
                            id="mobile-welcome-later">
                        Maybe later
                    </button>
                    <button class="remix-btn remix-btn-primary"
                            id="mobile-welcome-ok">
                        Got it
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        function close() {
            modal.classList.remove('active');
            try {
                sessionStorage.setItem(STORAGE_KEY_WELCOME, '1');
            } catch (e) {}
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
                showPointerIfNeeded();
            }, 300);
        }

        modal.querySelector('#mobile-welcome-ok')
            .addEventListener('click', close);
        modal.querySelector('#mobile-welcome-later')
            .addEventListener('click', close);
        modal.querySelector('.mobile-welcome-overlay')
            .addEventListener('click', close);
    }

    function showWelcomeModal() {
        let dismissed = false;
        try {
            dismissed =
                sessionStorage.getItem(STORAGE_KEY_WELCOME) === '1';
        } catch (e) {}

        if (dismissed) {
            showPointerIfNeeded();
            return;
        }

        buildWelcomeModal();
        requestAnimationFrame(() => {
            const modal =
                document.getElementById('mobile-welcome-modal');
            if (modal) modal.classList.add('active');
        });
    }

    // ---- Pointer -------------------------------------------

    function getFileExplorerIcon() {
        // Prefer the explicit attribute, but fall back to the
        // first icon in the panel (File Explorer is always #1).
        const byAttr = document.querySelector(
            '.remix-icon-panel ' +
            '.icon-item[data-plugin="fileManager"]'
        );
        if (byAttr) return byAttr;

        return document.querySelector(
            '.remix-icon-panel .icon-item'
        );
    }

    function buildPointer() {
        if (document.getElementById('get-started-pointer')) {
            return null;
        }

        const pointer = document.createElement('div');
        pointer.id = 'get-started-pointer';
        pointer.className = 'get-started-pointer';
        pointer.innerHTML = `
            <div class="get-started-bubble">
                <span class="get-started-label-text">
                    Tap to Get Started
                </span>
                <button class="get-started-dismiss"
                        id="get-started-dismiss-btn"
                        aria-label="Dismiss">×</button>
            </div>
            <div class="get-started-arrow">
                <svg viewBox="0 0 24 32" fill="currentColor">
                    <path d="M10 0h4v20h6L12 32 4 20h6z"/>
                </svg>
            </div>
        `;
        document.body.appendChild(pointer);

        pointer.querySelector('#get-started-dismiss-btn')
            .addEventListener('click', (e) => {
                e.stopPropagation();
                hidePointer();
            });

        return pointer;
    }

    function positionPointer() {
        const pointer =
            document.getElementById('get-started-pointer');
        const target = getFileExplorerIcon();
        if (!pointer || !target) return;

        const measureAndPlace = (attempt) => {
            attempt = attempt || 0;

            const rect = target.getBoundingClientRect();
            const pH = pointer.offsetHeight;
            const pW = pointer.offsetWidth;

            // Retry until everything has real dimensions
            if ((pH === 0 || pW === 0 || rect.width === 0)
                && attempt < 10) {
                setTimeout(
                    () => measureAndPlace(attempt + 1), 80);
                return;
            }

            // On mobile the target should be near the bottom.
            // If it's not, the mobile CSS hasn't kicked in yet.
            const screenH = window.innerHeight;
            if (rect.top < screenH * 0.6 && attempt < 10) {
                setTimeout(
                    () => measureAndPlace(attempt + 1), 100);
                return;
            }

            const iconCenterX = rect.left + rect.width / 2;
            const iconTop = rect.top;

            // Try to center the bubble on the icon, but clamp
            // to viewport edges so it doesn't get cut off.
            const margin = 8;
            let left = iconCenterX - pW / 2;
            left = Math.max(margin,
                Math.min(
                    window.innerWidth - pW - margin, left));

            // Compute where the arrow should sit INSIDE the
            // pointer so it still points at the icon's center
            // even when the bubble got clamped.
            const arrowOffsetX = iconCenterX - left;
            pointer.style.setProperty(
                '--arrow-x', arrowOffsetX + 'px');

            let top = iconTop - pH - 6;
            top = Math.max(8, top);

            pointer.style.left = left + 'px';
            pointer.style.top = top + 'px';
        };

        requestAnimationFrame(() => measureAndPlace(0));
    }

    function showPointerIfNeeded() {
        if (!isMobile()) return;

        let dismissed = false;
        try {
            dismissed =
                localStorage.getItem(STORAGE_KEY_POINTER) === '1';
        } catch (e) {}
        if (dismissed) return;

        const pointer = buildPointer();
        if (!pointer) return;

        requestAnimationFrame(() => {
            pointer.classList.add('active');
            positionPointer();
        });

        window.addEventListener('resize', positionPointer);
        window.addEventListener(
            'orientationchange', positionPointer);

        // Auto-hide once the user opens the file explorer
        const target = getFileExplorerIcon();
        if (target) {
            const onTap = () => {
                hidePointer();
                target.removeEventListener('click', onTap);
            };
            target.addEventListener('click', onTap);
        }
    }

    function hidePointer() {
        const pointer =
            document.getElementById('get-started-pointer');
        if (pointer) {
            pointer.classList.remove('active');
            setTimeout(() => {
                if (pointer.parentNode) {
                    pointer.parentNode.removeChild(pointer);
                }
            }, 200);
        }
        try {
            localStorage.setItem(STORAGE_KEY_POINTER, '1');
        } catch (e) {}
        window.removeEventListener('resize', positionPointer);
        window.removeEventListener(
            'orientationchange', positionPointer);
    }

    function init() {
        if (!isMobile()) return;
        // Wait until the loader finishes (~2s in app.js)
        setTimeout(showWelcomeModal, 2200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
