// ==UserScript==
// @name         ChatGPT Project Theme Automator
// @namespace    https://github.com/p65536
// @version      1.0
// @license      MIT
// @description  Automatically applies a theme based on the project name (changes user/assistant names, text color, icon, etc.)
// @author       p65536
// @match        https://chatgpt.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(() => {
    'use strict';

    // ---- Default Settings ----
    const DEFAULT_THEME_CONFIG = {
        options: {
            icon_size: 64
        },
        themeSets: [
            {
                projects: ['project1'],
                user: {
                },
                assistant: {
                    textcolor: '#FF9900'
                }
            },
            {
                projects: ['project2'],
                user: {
                    name: 'User',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 16c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2zm-.01-14C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
                    textcolor: '#f0e68c'
                },
                assistant: {
                    name: 'CPU',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 14c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5zm-.01-12C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>'
                }
            }
        ],
        defaultSet: {
            user: {
                name: 'You',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
            },
            assistant: {
                name: 'ChatGPT',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19.94,9.06C19.5,5.73,16.57,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48C3.74,13.14,4.22,14,5,14h1l0,2c0,1.1,0.9,2,2,2h1 v3h7l0-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5 c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/><path d="M12.5,12.54c-0.41,0-0.74,0.31-0.74,0.73c0,0.41,0.33,0.74,0.74,0.74c0.42,0,0.73-0.33,0.73-0.74 C13.23,12.85,12.92,12.54,12.5,12.54z"/><path d="M12.5,7c-1.03,0-1.74,0.67-2,1.45l0.96,0.4c0.13-0.39,0.43-0.86,1.05-0.86c0.95,0,1.13,0.89,0.8,1.36 c-0.32,0.45-0.86,0.75-1.14,1.26c-0.23,0.4-0.18,0.87-0.18,1.16h1.06c0-0.55,0.04-0.65,0.13-0.82c0.23-0.42,0.65-0.62,1.09-1.27 c0.4-0.59,0.25-1.38-0.01-1.8C13.95,7.39,13.36,7,12.5,7z"/></g></g></svg>'
            }
        }
    };

    // ---- Common Settings for Modal Functions ----
    const MODAL_WIDTH = 440;
    const MODAL_PADDING = 4;
    const MODAL_RADIUS = 8;
    const MODAL_BTN_RADIUS = 5;
    const MODAL_BTN_FONT_SIZE = 13;
    const MODAL_BTN_PADDING = '5px 16px';
    const MODAL_TITLE_MARGIN_BOTTOM = 8;
    const MODAL_BTN_GROUP_GAP = 8;
    const MODAL_TEXTAREA_HEIGHT = 200;

    // ---- Common functions (load/save) ----
    const CONFIG_KEY = 'cpta_config';
    async function loadConfig(key, defaultObj) {
        try {
            const raw = await GM_getValue(key);
            return raw ? JSON.parse(raw) : {...defaultObj};
        } catch {
            return {...defaultObj};
        }
    }
    async function saveConfig(key, obj) {
        await GM_setValue(key, JSON.stringify(obj));
    }

    // ---- Icon settings ----
    let ICON_SIZE = 64;
    const ICON_MARGIN = 12;

    function getIconSizeFromConfig(cfg) {
        if (cfg && cfg.options && typeof cfg.options.icon_size === "number") {
            return cfg.options.icon_size;
        }
        return 64;
    }

    // ---- Cache settings ----
    let CHATGPT_PROJECT_THEME_CONFIG, THEME_SETS, DEFAULT_SET;

    // ---- Internal state ----
    let appliedThemeId = null;
    let themeStyleElem = null;
    let messageObserver = null;
    let containerObserver = null;
    let currentMsgContainer = null;
    let lastProject = null;
    let lastUserColor = null;
    let lastAssistantColor = null;
    // Global singleton for title observer
    let currentAnchorObserver = null;
    let currentObservedAnchor = null;
    let currentTitleObserver = null;
    let currentObservedTitle = null;

    async function init() {
        CHATGPT_PROJECT_THEME_CONFIG = await loadConfig(CONFIG_KEY, DEFAULT_THEME_CONFIG);
        ICON_SIZE = getIconSizeFromConfig(CHATGPT_PROJECT_THEME_CONFIG);
        THEME_SETS = CHATGPT_PROJECT_THEME_CONFIG.themeSets;
        DEFAULT_SET = CHATGPT_PROJECT_THEME_CONFIG.defaultSet;

        ensureCommonUIStyle();
        ensureSettingsBtn();
        waitForMessageContainer();
        observeForNewChat();
        startGlobalProjectElementObserver();
    }
    init();

    // ---- Common UI Style ----
    function ensureCommonUIStyle() {
        if (document.getElementById('cpta-settings-common-style')) return;
        const style = document.createElement('style');
        style.id = 'cpta-settings-common-style';
        style.textContent = `
          #cpta-id-settings-btn {
              transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
          }
          #cpta-id-settings-btn:hover {
              background: var(--interactive-bg-secondary-hover, #e3e3e3) !important;
              border-color: var(--border-default, #888) !important;
              box-shadow: 0 2px 8px var(--border-default, #3336) !important;
          }
        `;
        document.head.appendChild(style);
    }

    // ---- Settings Button ----
    function ensureSettingsBtn() {
        if (document.getElementById('cpta-id-settings-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'cpta-id-settings-btn';
        btn.textContent = '⚙️';
        btn.title = 'Settings (ChatGPT Project Theme Automator)';
        Object.assign(btn.style, {
            position: 'fixed',
            top: '10px',
            right: '320px',
            zIndex: 99999,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--bg-primary, #fff)',
            border: '1px solid var(--border-default, #ccc)',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: 'var(--drop-shadow-xs, 0 1px 1px #0000000d)'
        });
        document.body.appendChild(btn);

        const settingsModal = setupSettingsModal({
            modalId: 'cpta-settings-modal',
            titleText: 'ChatGPT Project Theme Automator Settings',
            onSave: async (cfg) => {
                await saveConfig(CONFIG_KEY, cfg);
                CHATGPT_PROJECT_THEME_CONFIG = cfg;
                ICON_SIZE = getIconSizeFromConfig(cfg);
                THEME_SETS = cfg.themeSets;
                DEFAULT_SET = cfg.defaultSet;
                updateTheme();
            },
            getCurrentConfig: () => Promise.resolve(CHATGPT_PROJECT_THEME_CONFIG),
            anchorBtn: document.getElementById('cpta-id-settings-btn')
        });
        document.getElementById('cpta-id-settings-btn').onclick = () => { settingsModal.open(); };
    }

    // Modal Functions
    function setupSettingsModal({ modalId, titleText, onSave, getCurrentConfig, anchorBtn }) {
        let modalOverlay = document.getElementById(modalId);
        if (modalOverlay) return modalOverlay;

        // styles for hover (Prevent duplication with ID)
        if (!document.getElementById('cpta-modal-btn-hover-style')) {
            const style = document.createElement('style');
            style.id = 'cpta-modal-btn-hover-style';
            style.textContent = `
            #${modalId} button:hover {
                background: var(--interactive-bg-tertiary-hover) !important;
                border-color: var(--border-default) !important;
            }
        `;
            document.head.appendChild(style);
        }

        modalOverlay = document.createElement('div');
        modalOverlay.id = modalId;
        modalOverlay.style.display = 'none';
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.zIndex = '2147483648';
        modalOverlay.style.left = '0';
        modalOverlay.style.top = '0';
        modalOverlay.style.width = '100vw';
        modalOverlay.style.height = '100vh';
        modalOverlay.style.background = 'none';
        modalOverlay.style.pointerEvents = 'auto';

        // modalBox
        const modalBox = document.createElement('div');
        modalBox.style.position = 'absolute';
        modalBox.style.width = MODAL_WIDTH + 'px';
        modalBox.style.padding = MODAL_PADDING + 'px';
        modalBox.style.borderRadius = `var(--radius-lg, ${MODAL_RADIUS}px)`;
        modalBox.style.background = 'var(--main-surface-primary)';
        modalBox.style.color = 'var(--text-primary)';
        modalBox.style.border = '1px solid var(--border-default)';
        modalBox.style.boxShadow = 'var(--drop-shadow-lg, 0 4px 16px #00000026)';
        // left/topはopenModal時に決定

        // Title
        const modalTitle = document.createElement('h5');
        modalTitle.innerText = titleText;
        modalTitle.style.marginTop = '0';
        modalTitle.style.marginBottom = MODAL_TITLE_MARGIN_BOTTOM + 'px';

        // Textarea
        const textarea = document.createElement('textarea');
        textarea.style.width = '100%';
        textarea.style.height = MODAL_TEXTAREA_HEIGHT + 'px';
        textarea.style.boxSizing = 'border-box';
        textarea.style.fontFamily = 'monospace';
        textarea.style.fontSize = '13px';
        textarea.style.marginBottom = '0';
        textarea.style.border = '1px solid var(--border-default)';
        textarea.style.background = 'var(--bg-primary)';
        textarea.style.color = 'var(--text-primary)';

        // error messages
        const msgDiv = document.createElement('div');
        msgDiv.style.color = 'var(--text-danger,#f33)';
        msgDiv.style.marginTop = '2px';
        msgDiv.style.minHeight = '4px';

        // btnGroup
        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.flexWrap = 'wrap';
        btnGroup.style.justifyContent = 'flex-end';
        btnGroup.style.gap = MODAL_BTN_GROUP_GAP + 'px';
        btnGroup.style.marginTop = '8px';

        // btnExport
        const btnExport = document.createElement('button');
        btnExport.type = 'button';
        btnExport.innerText = 'Export';
        Object.assign(btnExport.style, {
            background: 'var(--interactive-bg-tertiary-default)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: `var(--radius-md, ${MODAL_BTN_RADIUS}px)`,
            padding: MODAL_BTN_PADDING,
            fontSize: MODAL_BTN_FONT_SIZE + 'px',
            cursor: 'pointer',
            transition: 'background 0.12s'
        });

        // btnImport
        const btnImport = document.createElement('button');
        btnImport.type = 'button';
        btnImport.innerText = 'Import';
        Object.assign(btnImport.style, {
            background: 'var(--interactive-bg-tertiary-default)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: `var(--radius-md, ${MODAL_BTN_RADIUS}px)`,
            padding: MODAL_BTN_PADDING,
            fontSize: MODAL_BTN_FONT_SIZE + 'px',
            cursor: 'pointer',
            transition: 'background 0.12s'
        });

        // btnSave
        const btnSave = document.createElement('button');
        btnSave.type = 'button';
        btnSave.innerText = 'Save';
        btnSave.style.background = 'var(--interactive-bg-tertiary-default)';
        btnSave.style.color = 'var(--text-primary)';
        btnSave.style.border = '1px solid var(--border-default)';
        btnSave.style.borderRadius = `var(--radius-md, ${MODAL_BTN_RADIUS}px)`;
        btnSave.style.padding = MODAL_BTN_PADDING;
        btnSave.style.fontSize = MODAL_BTN_FONT_SIZE + 'px';
        btnSave.style.cursor = 'pointer';
        btnSave.style.transition = 'background 0.12s';

        // btnCancel
        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerText = 'Cancel';
        btnCancel.style.background = 'var(--interactive-bg-tertiary-default)';
        btnCancel.style.color = 'var(--text-primary)';
        btnCancel.style.border = '1px solid var(--border-default)';
        btnCancel.style.borderRadius = `var(--radius-md, ${MODAL_BTN_RADIUS}px)`;
        btnCancel.style.padding = MODAL_BTN_PADDING;
        btnCancel.style.fontSize = MODAL_BTN_FONT_SIZE + 'px';
        btnCancel.style.cursor = 'pointer';
        btnCancel.style.transition = 'background 0.12s';

        btnGroup.append(btnExport, btnImport, btnSave, btnCancel);
        modalBox.append(modalTitle, textarea, btnGroup, msgDiv);
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);

        // Click to close
        function closeModal() { modalOverlay.style.display = 'none'; }

        // Export (Event Listener)
        btnExport.addEventListener('click', async () => {
            try {
                const config = await getCurrentConfig();
                const jsonString = JSON.stringify(config, null, 2);
                const filename = 'cpta_config.json';
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                msgDiv.textContent = 'Export successful.';
                msgDiv.style.color = 'var(--text-accent, #66b5ff)';
            } catch (e) {
                msgDiv.textContent = 'Export failed: ' + e.message;
                msgDiv.style.color = 'var(--text-danger,#f33)';
            }
        });

        // Import (Event Listener)
        btnImport.addEventListener('click', () => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'application/json';
            fileInput.style.display = 'none';
            document.body.appendChild(fileInput);

            fileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        try {
                            const importedConfig = JSON.parse(e.target.result);
                            textarea.value = JSON.stringify(importedConfig, null, 2);
                            msgDiv.textContent = 'Import successful. Click "Save" to apply the themes.';
                            msgDiv.style.color = 'var(--text-accent, #66b5ff)';
                        } catch (err) {
                            msgDiv.textContent = 'Import failed: ' + err.message;
                            msgDiv.style.color = 'var(--text-danger,#f33)';
                        } finally {
                            document.body.removeChild(fileInput);
                        }
                    };
                    reader.readAsText(file);
                } else {
                    document.body.removeChild(fileInput);
                }
            });

            fileInput.click();
        });

        // Save (Event Listener)
        btnSave.addEventListener('click', async () => {
            try {
                const obj = JSON.parse(textarea.value);
                await onSave(obj);
                closeModal();
            } catch (e) {
                msgDiv.textContent = 'JSON parse error: ' + e.message;
                msgDiv.style.color = 'var(--text-danger,#f33)';
            }
        });

        // Cancel (Event Listener)
        btnCancel.addEventListener('click', closeModal);
        modalOverlay.addEventListener('mousedown', e => {
            if (e.target === modalOverlay) closeModal();
        });

        // --- Put it under the button ---
        async function openModal() {
            let cfg = await getCurrentConfig();
            textarea.value = JSON.stringify(cfg, null, 2);
            msgDiv.textContent = '';
            if (anchorBtn && anchorBtn.getBoundingClientRect) {
                const btnRect = anchorBtn.getBoundingClientRect();
                const margin = 8;
                let left = btnRect.left;
                let top = btnRect.bottom + 4;
                // Prevents right edge from protruding
                if (left + MODAL_WIDTH > window.innerWidth - margin) {
                    left = window.innerWidth - MODAL_WIDTH - margin;
                }
                left = Math.max(left, margin);
                modalBox.style.left = left + 'px';
                modalBox.style.top = top + 'px';
                modalBox.style.transform = '';
            } else {
                modalBox.style.left = '50%';
                modalBox.style.top = '120px';
                modalBox.style.transform = 'translateX(-50%)';
            }
            modalOverlay.style.display = 'block';
        }
        modalOverlay.open = openModal;
        modalOverlay.close = closeModal;
        return modalOverlay;
    }

    // Detect the disappearance of the button with MutationObserver and revive it
    const cptaBtnObserver = new MutationObserver(ensureSettingsBtn);
    cptaBtnObserver.observe(document.body, { childList: true, subtree: true });

    // ======================
    // functions for themes
    // ======================

    const getProjectName = () =>
    document.querySelector('a.truncate[href^="/g/"]')?.textContent.trim()
    || document.title.trim();

    function getActorConfig(actor, set, defaultSet) {
        return {
            name: set[actor]?.name ?? defaultSet[actor].name,
            icon: set[actor]?.icon ?? defaultSet[actor].icon,
            textcolor: set[actor]?.textcolor // textcolor can be undefined
        };
    }

    // Get theme set (priority: exact match → RegExp match → default)
    function getThemeSet() {
        const map = new Map();
        const regexArr = [];
        for (const set of THEME_SETS ?? []) {
            for (const proj of set.projects) {
                if (typeof proj === 'string') {
                    if (/^\/.*\/[gimsuy]*$/.test(proj)) {
                        const lastSlash = proj.lastIndexOf('/');
                        const pattern = proj.slice(1, lastSlash);
                        const flags = proj.slice(lastSlash + 1);
                        try {
                            regexArr.push({ pattern: new RegExp(pattern, flags), set });
                        } catch (e) { }
                    } else {
                        map.set(proj, set);
                    }
                } else if (proj instanceof RegExp) {
                    regexArr.push({ pattern: proj, set });
                }
            }
        }
        const name = getProjectName();
        if (map.has(name)) return map.get(name);
        const regexHit = regexArr.find(r => r.pattern.test(name));
        return regexHit ? regexHit.set : DEFAULT_SET;
    }

    // Generate custom theme CSS
    const createThemeCSS = (userColor, assistantColor) => `
        div[data-message-author-role="assistant"] .markdown p,
        div[data-message-author-role="assistant"] .markdown h1,
        div[data-message-author-role="assistant"] .markdown h2,
        div[data-message-author-role="assistant"] .markdown h3,
        div[data-message-author-role="assistant"] .markdown h4,
        div[data-message-author-role="assistant"] .markdown h5,
        div[data-message-author-role="assistant"] .markdown h6,
        div[data-message-author-role="assistant"] .markdown ul li,
        div[data-message-author-role="assistant"] .markdown ol li,
        div[data-message-author-role="assistant"] .markdown ul li::marker,
        div[data-message-author-role="assistant"] .markdown ol li::marker,
        div[data-message-author-role="assistant"] .markdown strong,
        div[data-message-author-role="assistant"] .markdown em,
        div[data-message-author-role="assistant"] .markdown blockquote,
        div[data-message-author-role="assistant"] .markdown table,
        div[data-message-author-role="assistant"] .markdown th,
        div[data-message-author-role="assistant"] .markdown td {
            color: ${assistantColor} !important;
        }
        div[data-message-author-role="user"] .whitespace-pre-wrap {
            color: ${userColor} !important;
        }
        #fixedTextUIRoot, #fixedTextUIRoot * {
            color: inherit !important;
        }
        `;

    // Apply theme
    function applyTheme(userColor, assistantColor) {
        if (!themeStyleElem) {
            themeStyleElem = document.createElement('style');
            themeStyleElem.id = 'cpta-theme-style';
            document.head.appendChild(themeStyleElem);
        }
        const themeId = `${userColor}_${assistantColor}`;
        if (appliedThemeId === themeId) return;
        if (!userColor && !assistantColor) {
            themeStyleElem.textContent = '';
            appliedThemeId = null;
            return;
        }
        themeStyleElem.textContent = createThemeCSS(userColor, assistantColor);
        appliedThemeId = themeId;
    }

    // Inject icon and display name
    const injectAvatar = msgElem => {
        const baseSet = getThemeSet();
        const role = msgElem.getAttribute('data-message-author-role');
        if (!role) return;
        const set = getActorConfig(role, baseSet, CHATGPT_PROJECT_THEME_CONFIG.defaultSet);

        // Create a unique cache key (based on name, icon, and textcolor)
        const cacheKey = JSON.stringify(set);

        // If already injected with the same content, do nothing
        if (msgElem.__avatarCacheKey === cacheKey) return;

        // If an old avatar exists, remove it (consider cases like theme switching)
        const old = msgElem.querySelector('.side-avatar-container');
        if (old) old.remove();

        const msgWrapper = msgElem.closest('div');
        if (!msgWrapper) return;
        msgWrapper.classList.add('chat-wrapper');

        const container = document.createElement('div');
        container.className = 'side-avatar-container';

        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'side-avatar-icon';

        const icon = set.icon || '';
        if (/^<svg\b/i.test(icon.trim())) {
            iconWrapper.innerHTML = icon;
        } else if (icon) {
            const img = document.createElement('img');
            img.className = 'side-avatar-icon';
            img.src = icon;
            img.alt = role;
            iconWrapper.appendChild(img);
        }

        const nameDiv = document.createElement('div');
        nameDiv.className = 'side-avatar-name';
        nameDiv.textContent = set.name ?? '';

        if (set.textcolor) {
            nameDiv.style.color = set.textcolor;
        } else {
            if (role === 'user') {
                nameDiv.style.color = 'var(--text-secondary, #5d5d5d)';
            } else if (role === 'assistant') {
                nameDiv.style.color = 'var(--text-secondary, #5d5d5d)';
            }
        }

        container.append(iconWrapper, nameDiv);
        msgWrapper.appendChild(container);

        // Cache the injected content
        msgElem.__avatarCacheKey = cacheKey;
    };

    function injectAvatarStyle() {
        const styleId = 'cpta-avatar-style';
        let avatarStyle = document.getElementById(styleId);
        if (avatarStyle) avatarStyle.remove();

        avatarStyle = document.createElement('style');
        avatarStyle.id = styleId;

        avatarStyle.textContent = `

        /*--- borders for debugging ---*/
        //.chat-wrapper { position: relative; border: 1px dashed orange;}
        //.side-avatar-container { border: 1px solid red; }
        //.side-avatar-icon, .side-avatar-icon svg { border: 1px solid blue; }
        //.side-avatar-name { border: 1px solid green; }
        /*--- borders for debugging ---*/

        .side-avatar-container {
            position: absolute;
            top: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: ${ICON_SIZE}px;
            pointer-events: none;
            z-index: 10;
            white-space: normal;
            word-break: break-word;
        }

        .side-avatar-icon,
        .side-avatar-icon svg {
            width: ${ICON_SIZE}px;
            height: ${ICON_SIZE}px;
            border-radius: 50%;
            display: block;
            box-shadow: 0 0 6px rgba(0,0,0,0.2);
            object-fit: cover;
        }

        .side-avatar-name {
            font-size: 0.75rem;
            text-align: center;
            margin-top: 4px;
            width: 100%;
        }

        .chat-wrapper[data-message-author-role="user"] .side-avatar-container {
            right: calc(-${ICON_SIZE}px - ${ICON_MARGIN}px);
        }

        .chat-wrapper[data-message-author-role="assistant"] .side-avatar-container {
            left: calc(-${ICON_SIZE}px - ${ICON_MARGIN}px);
        }

        /*
         * Ensure message content doesn't overlap with the custom avatar.
         * This adds padding to the message content to reserve space for the avatar.
         * While it might not be strictly necessary under current UI conditions,
         * it acts as a safeguard against potential overlaps due to future UI changes or long content.
         */
        div[data-message-author-role="user"] .markdown,
        div[data-message-author-role="user"] .whitespace-pre-wrap {
            padding-right: calc(${ICON_SIZE}px + ${ICON_MARGIN}px);
        }

        div[data-message-author-role="assistant"] .markdown {
            padding-left: calc(${ICON_SIZE}px + ${ICON_MARGIN}px);
        }
    `;
        document.head.appendChild(avatarStyle);
    }

    // MutationObserver for messages
    function setupMessageObserver(container) {
        // 1. If container is null (or undefined), always disconnect the observer and set currentMsgContainer to null
        if (!container || !container.isConnected) {
            messageObserver?.disconnect();
            messageObserver = null;
            currentMsgContainer = null;
            return;
        }

        // 2. If the container is the same as the one currently being observed, do nothing (no need to reset)
        if (container === currentMsgContainer) return;

        // 3. If it's a new container, disconnect the previous observer and set up a new one
        messageObserver?.disconnect();
        messageObserver = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node instanceof HTMLElement && node.hasAttribute('data-message-author-role')) {
                        injectAvatar(node);
                    }
                    node.querySelectorAll?.('[data-message-author-role]').forEach(injectAvatar);
                }
            }
        });
        messageObserver.observe(container, { childList: true, subtree: true });
        currentMsgContainer = container;
    }

    // Detect and monitor the chat area div (containing articles)
    const waitForMessageContainer = () => {
        let observer = null;
        const findAndSetup = () => {
            const container = Array.from(document.querySelectorAll('div'))
            .find(div => div.querySelector('article'));
            if (container) {
                setupMessageObserver(container);
                container.querySelectorAll('[data-message-author-role]').forEach(injectAvatar);
                updateTheme();
                observer?.disconnect();
                return true;
            }
            return false;
        };
        if (findAndSetup()) return;
        observer = new MutationObserver(() => {
            findAndSetup();
            // The observer will be disconnected inside findAndSetup if the target is found
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    // Monitor for new chat page containers
    const observeForNewChat = () => {
        if (containerObserver) return;
        containerObserver = new MutationObserver(() => {
            const container = Array.from(document.querySelectorAll('div'))
            .find(div => div.querySelector('article'));
            if (
                container &&
                container !== currentMsgContainer &&
                container.querySelector('article')
            ) {
                setupMessageObserver(container);
                container.querySelectorAll('[data-message-author-role]').forEach(injectAvatar);
                updateTheme();
            }
        });
        containerObserver.observe(document.body, { childList: true, subtree: true });
    };

    // Handle history operations (URL change detection)
    const handleURLChange = (() => {
        let lastURL = location.href;
        return () => {
            if (location.href !== lastURL) {
                lastURL = location.href;
                waitForMessageContainer();
            }
        };
    })();
    for (const m of ['pushState', 'replaceState']) {
        const orig = history[m];
        history[m] = function (...args) {
            orig.apply(this, args);
            handleURLChange();
        };
    }
    window.addEventListener('popstate', handleURLChange);

    // Reapply theme and redraw all message avatars
    function updateTheme() {
        const baseSet = getThemeSet();
        const userConf = getActorConfig('user', baseSet, DEFAULT_SET);
        const assistantConf = getActorConfig('assistant', baseSet, DEFAULT_SET);
        const project = getProjectName();
        const userColor = userConf.textcolor ?? '';
        const assistantColor = assistantConf.textcolor ?? '';

        // --- Always reapply CSS when color or project name changes ---
        if (
            project !== lastProject ||
            userColor !== lastUserColor ||
            assistantColor !== lastAssistantColor
        ) {
            applyTheme(userColor, assistantColor);
            lastProject = project;
            lastUserColor = userColor;
            lastAssistantColor = assistantColor;
        }

        // --- When the name, icon, etc. change, the bubble is redrawn using the cache key. ---
        const userCacheKey = JSON.stringify(userConf);
        const assistantCacheKey = JSON.stringify(assistantConf);

        document.querySelectorAll('[data-message-author-role]').forEach(msgElem => {
            const role = msgElem.getAttribute('data-message-author-role');
            const expectedKey = role === 'user' ? userCacheKey : assistantCacheKey;
            if (msgElem.__avatarCacheKey !== expectedKey) {
                injectAvatar(msgElem);
            }
        });

        // update icon
        injectAvatarStyle();
    }

    // ---- Global MutationObserver for project name elements ----
    let globalProjectObserver = null;
    function startGlobalProjectElementObserver() {
        if (globalProjectObserver) return;
        globalProjectObserver = new MutationObserver(() => {
            // 1. Watch for a.truncate (project name anchor)
            const anchor = document.querySelector('a.truncate[href^="/g/"]');
            if (anchor && !anchor.hasThemeObserver) {
                setupProjectAnchorObserver(anchor);
                anchor.hasThemeObserver = true;
            }
            // 2. If not found, watch for <title>
            const titleElement = document.querySelector('title');
            if (titleElement && !titleElement.hasThemeObserver && !anchor) {
                setupTitleObserver(titleElement);
                titleElement.hasThemeObserver = true;
            }
        });
        globalProjectObserver.observe(document.body, { childList: true, subtree: true });
    }

    function setupProjectAnchorObserver(anchor) {
        if (currentAnchorObserver && currentObservedAnchor !== anchor) {
            currentAnchorObserver.disconnect();
            // console.log("setupProjectAnchorObserver: disconnected");
            currentAnchorObserver = null;
            if (currentObservedAnchor) currentObservedAnchor.hasThemeObserver = false;
        }
        let prev = anchor.textContent.trim();
        const observer = new MutationObserver(() => {
            const now = anchor.textContent.trim();
            if (now !== prev) {
                prev = now;
                updateTheme();
            }
        });
        observer.observe(anchor, { childList: true, characterData: true, subtree: true });

        currentAnchorObserver = observer;
        currentObservedAnchor = anchor;
        anchor.hasThemeObserver = true;

        // console.log("setupProjectAnchorObserver: New observer for anchor");
    }

    function setupTitleObserver(titleElement) {
        // Disconnect previous observer if watching another title element
        if (currentTitleObserver && currentObservedTitle !== titleElement) {
            currentTitleObserver.disconnect();
            // console.log("setupTitleObserver: disconnected");
            currentTitleObserver = null;
            if (currentObservedTitle) currentObservedTitle.hasThemeObserver = false;
        }
        let prev = titleElement.textContent;
        const observer = new MutationObserver(() => {
            const now = titleElement.textContent;
            if (now !== prev) {
                prev = now;
                updateTheme();
            }
        });
        observer.observe(titleElement, { childList: true, characterData: true, subtree: true });

        // Save references globally
        currentTitleObserver = observer;
        currentObservedTitle = titleElement;
        titleElement.hasThemeObserver = true;

        // console.log("setupTitleObserver: New observer for title");
    }

})();
