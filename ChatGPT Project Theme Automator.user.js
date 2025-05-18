// ==UserScript==
// @name         ChatGPT Project Theme Automator
// @namespace    https://github.com/p65536
// @version      1.0
// @license      MIT
// @description  Automatically applies a theme based on the project name (changes user/assistant names, text color, icon, etc.)
// @author       p65536
// @match        https://chatgpt.com/*
// @grant        none
// ==/UserScript==

// [How to specify project names]
// projects: ['Project 1', 'Project 2'],  // For exact string match, enclose the string in single quotes. For multiple matches, list them separated by commas.
// projects: [/^Project\d+$/],            // For regular expressions, enclose the pattern in slashes (//). For multiple matches, separate patterns with commas, or write a single pattern to match multiple projects.
// projects: ['Project 1', /^Project\d+$/], // You can mix exact string and regular expression patterns.
//
// [Configurable items]
// For both `user` and `assistant`, you can set the following:
//   name: Display name. Note: If the name is too long, it may look awkward due to wrapping/centering in the icon width.
//   icon: Icon image. You can use either a URL or a base64-encoded image.
//   textcolor: Text color (e.g., '#b0c4de'). If omitted, the text color will not be changed.

(() => {
    'use strict';

    // ========== CONFIGURATION ==========
    /**
      * Define project and theme settings in CHATGPT_PROJECT_THEME_CONFIG.
      * projects: Project name (string) or RegExp (can be mixed)
      * user/assistant: { name, icon, textcolor }
    */

    // ==UserConfig==
    const CHATGPT_PROJECT_THEME_CONFIG = {
        themeSets: [
            {
                // Theme settings for 'project1'
                projects: ['project1'],
                // If you don't specify settings for user, name/icon/textcolor are inherited from defaultSet.
                user: {
                },
                // If you only want to change assistant's textcolor, name/icon will be inherited from defaultSet.
                assistant: {
                    textcolor: '#FF9900'
                }
            },
            {
                // Theme settings for 'project2'
                projects: ['project2'],
                // To set all (name, icon, textcolor) for user:
                user: {
                    name: 'User',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 16c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2zm-.01-14C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
                    textcolor: '#f0e68c'
                },
                // To set only name and icon for assistant: textcolor will be inherited from defaultSet.
                assistant: {
                    name: 'CPU',
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 14c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5zm-.01-12C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>'
                }
            }
        ],
        defaultSet: {
            // If only name and icon are specified, text color will not change (same as original ChatGPT)
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
    // ==/UserConfig==
    // ==============================

    // ======================
    // Load theme configuration
    // ======================
    const THEME_SETS = CHATGPT_PROJECT_THEME_CONFIG.themeSets;
    const DEFAULT_SET = CHATGPT_PROJECT_THEME_CONFIG.defaultSet;

    // ---- Constants ----
    const ICON_SIZE = 64;
    const ICON_MARGIN = 16;
    const ICON_OFFSET = ICON_SIZE + ICON_MARGIN;

    // ---- Internal state ----
    let appliedThemeId = null;
    let themeStyleElem = null;
    let messageObserver = null;
    let containerObserver = null;
    let currentMsgContainer = null;
    let lastProject = null;
    // Global singleton for title observer
    let currentAnchorObserver = null;
    let currentObservedAnchor = null;
    let currentTitleObserver = null;
    let currentObservedTitle = null;

    // ---- Utility functions ----

    // Get the current project name
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
    const getThemeSet = (() => {
        const map = new Map();
        const regexArr = [];
        for (const set of THEME_SETS) {
            for (const proj of set.projects) {
                if (typeof proj === 'string') map.set(proj, set);
                else if (proj instanceof RegExp) regexArr.push({ pattern: proj, set });
            }
        }
        return () => {
            const name = getProjectName();
            if (map.has(name)) return map.get(name);
            const regexHit = regexArr.find(r => r.pattern.test(name));
            return regexHit ? regexHit.set : DEFAULT_SET;
        };
    })();

    // Generate custom theme CSS
    const createThemeCSS = (userColor, assistantColor) => `
        /*
          Change text color for each element in the assistant's output.
          - In ChatGPT, only the assistant's side renders Markdown as HTML elements,
            so specify each selector (h1-h6, p, ul/ol, li, strong, em, blockquote, table, etc.).
          - We don't want to apply color to code blocks (pre, code) or math (like katex),
            so selectors are restricted to exclude those elements.
          - If more elements need to be styled, simply add them to this list for easy maintenance and extension.
        */
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
        /*
          Change text color for user messages.
          - By ChatGPT's specification, user messages are always displayed as plain text (no Markdown or HTML markup).
          - Target only .whitespace-pre-wrap (there are no other decorative elements).
        */
        div[data-message-author-role="user"] .whitespace-pre-wrap {
            color: ${userColor} !important;
        }

        /*
          Restore default color for fixed UI elements (e.g., text input area)
          - To prevent the theme color from affecting UI parts, explicitly specify 'inherit'.
          - #fixedTextUIRoot: fixed UI parts such as ChatGPT's input UI.
        */
        #fixedTextUIRoot, #fixedTextUIRoot * {
            color: inherit !important;
        }
        `;

    // Apply theme
    function applyTheme(userColor, assistantColor) {
        if (!themeStyleElem) {
            themeStyleElem = document.createElement('style');
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
    // Remove theme
    function removeTheme() {
        if (themeStyleElem) {
            themeStyleElem.textContent = '';
            appliedThemeId = null;
        }
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
        container.style[role === 'user' ? 'right' : 'left'] = `-${ICON_OFFSET}px`;

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

        container.append(iconWrapper, nameDiv);
        msgWrapper.appendChild(container);

        // Cache the injected content
        msgElem.__avatarCacheKey = cacheKey;
    };

    // Inject icon and layout CSS (only once)
    (() => {
        const avatarStyle = document.createElement('style');
        avatarStyle.textContent = `
        .chat-wrapper { position: relative; }
        .side-avatar-container {
            position: absolute;
            top: 0;
            display: flex; flex-direction: column; align-items: center;
            width: ${ICON_SIZE}px; pointer-events: none; z-index: 10;
        }
        /* Use the same class for both SVG and img */
        .side-avatar-icon,
        .side-avatar-icon svg {
            width: ${ICON_SIZE}px; height: ${ICON_SIZE}px;
            border-radius: 50%;
            display: block;
            box-shadow: 0 0 6px rgba(0,0,0,0.2);
            object-fit: cover;
        }
        .side-avatar-name {
            font-size: 0.75rem; text-align: center; color: #888; margin-top: 4px;
        }
    `;
        document.head.appendChild(avatarStyle);
    })();

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
        if (project !== lastProject) {
            applyTheme(userColor, assistantColor);
        }
        lastProject = project;

        // Redraw only the differences
        const userCacheKey = JSON.stringify(userConf);
        const assistantCacheKey = JSON.stringify(assistantConf);

        document.querySelectorAll('[data-message-author-role]').forEach(msgElem => {
            const role = msgElem.getAttribute('data-message-author-role');
            const expectedKey = role === 'user' ? userCacheKey : assistantCacheKey;
            if (msgElem.__avatarCacheKey !== expectedKey) {
                injectAvatar(msgElem);
            }
        });
    }

    // ---- Global MutationObserver for project name elements ----
    let globalProjectObserver = null;
    function startGlobalProjectElementObserver() {
        if (globalProjectObserver) return; // Only start once
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

    // ---- Initialization ----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            waitForMessageContainer();
            observeForNewChat();
            startGlobalProjectElementObserver();
        });
    } else {
        waitForMessageContainer();
        observeForNewChat();
        startGlobalProjectElementObserver();
    }

})();
