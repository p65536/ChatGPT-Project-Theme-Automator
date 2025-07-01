// ==UserScript==
// @name         ChatGPT Project Theme Automator
// @namespace    https://github.com/p65536
// @version      1.1.1
// @license      MIT
// @description  Automatically applies a theme based on the project name (changes user/assistant names, text color, icon, bubble style, window background, input area style, standing images, etc.)
// @icon         https://chatgpt.com/favicon.ico
// @author       p65536
// @match        https://chatgpt.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(() => {
    'use strict';

    // =================================================================================
    // SECTION: Configuration and Constants
    // Description: Defines default settings, global constants, CSS selectors, and configuration keys.
    // =================================================================================

    // ---- Default Settings & Theme Configuration ----
    const DEFAULT_ICON_SIZE = 64;
    const DEFAULT_THEME_CONFIG = {
        options: {
            icon_size: DEFAULT_ICON_SIZE
        },
        themeSets: [
            {
                projects: ["/project1/"],
                user: {
                    name: null,
                    icon: null,
                    textcolor: null,
                    font: null,
                    bubbleBgColor: null,
                    bubblePadding: null,
                    bubbleBorderRadius: null,
                    bubbleMaxWidth: null,
                    standingImage: null
                },
                assistant: {
                    name: null,
                    icon: null,
                    textcolor: null,
                    font: null,
                    bubbleBgColor: null,
                    bubblePadding: null,
                    bubbleBorderRadius: null,
                    bubbleMaxWidth: null,
                    standingImage: null
                },
                windowBgColor: null,
                windowBgImage: null,
                windowBgSize: null,
                windowBgPosition: null,
                windowBgRepeat: null,
                windowBgAttachment: null,
                inputAreaBgColor: null,
                inputAreaTextColor: null,
                inputAreaPlaceholderColor: null
            }
        ],
        defaultSet: {
            user: {
                name: 'You',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
                textcolor: null,
                font: null,
                bubbleBgColor: null,
                bubblePadding: "6px 10px",
                bubbleBorderRadius: "10px",
                bubbleMaxWidth: null,
                standingImage: null
            },
            assistant: {
                name: 'ChatGPT',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19.94,9.06C19.5,5.73,16.57,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48C3.74,13.14,4.22,14,5,14h1l0,2c0,1.1,0.9,2,2,2h1 v3h7l0-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5 c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/><path d="M12.5,12.54c-0.41,0-0.74,0.31-0.74,0.73c0,0.41,0.33,0.74,0.74,0.74c0.42,0,0.73-0.33,0.73-0.74 C13.23,12.85,12.92,12.54,12.5,12.54z"/><path d="M12.5,7c-1.03,0-1.74,0.67-2,1.45l0.96,0.4c0.13-0.39,0.43-0.86,1.05-0.86c0.95,0,1.13,0.89,0.8,1.36 c-0.32,0.45-0.86,0.75-1.14,1.26c-0.23,0.4-0.18,0.87-0.18,1.16h1.06c0-0.55,0.04-0.65,0.13-0.82c0.23-0.42,0.65-0.62,1.09-1.27 c0.4-0.59,0.25-1.38-0.01-1.8C13.95,7.39,13.36,7,12.5,7z"/></g></g></svg>',
                textcolor: null,
                font: null,
                bubbleBgColor: null,
                bubblePadding: "6px 10px",
                bubbleBorderRadius: "10px",
                bubbleMaxWidth: null,
                standingImage: null
            },
            windowBgColor: null,
            windowBgImage: null,
            windowBgSize: "cover",
            windowBgPosition: "center center",
            windowBgRepeat: "no-repeat",
            windowBgAttachment: "scroll",
            inputAreaBgColor: null,
            inputAreaTextColor: null,
            inputAreaPlaceholderColor: null
        }
    };

    // ---- Global Constants ----
    const CONFIG_KEY = 'cpta_config';
    const ICON_MARGIN = 16;
    const STANDING_IMAGE_Z_INDEX = 'auto';
    const MAX_STANDING_IMAGES_RETRIES = 10;
    const STANDING_IMAGES_RETRY_INTERVAL = 250;
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

    // ---- CSS Selectors  ----
    const SELECTORS = {
        SIDEBAR_WIDTH_TARGET: 'div[id="stage-slideover-sidebar"]',
        CHAT_CONTENT_MAX_WIDTH: 'div[class*="--thread-content-max-width"]',
        CHAT_MAIN_AREA_BG_TARGET: 'main#main',
        BUTTON_SHARE_CHAT: '[data-testid="share-chat-button"]',
        USER_BUBBLE_CSS_TARGET: 'div[data-message-author-role="user"] div:has(> .whitespace-pre-wrap)',
        USER_TEXT_CONTENT_CSS_TARGET: 'div[data-message-author-role="user"] .whitespace-pre-wrap',
        ASSISTANT_BUBBLE_MD_CSS_TARGET: 'div[data-message-author-role="assistant"] div:has(> .markdown)',
        ASSISTANT_MARKDOWN_CSS_TARGET: 'div[data-message-author-role="assistant"] .markdown',
        ASSISTANT_WHITESPACE_CSS_TARGET: 'div[data-message-author-role="assistant"] .whitespace-pre-wrap',
        INPUT_AREA_BG_TARGET: 'form[data-type="unified-composer"] > div:first-child',
        INPUT_TEXT_FIELD_TARGET: 'div.ProseMirror#prompt-textarea',
        INPUT_PLACEHOLDER_TARGET: 'div.ProseMirror#prompt-textarea p.placeholder[data-placeholder]',
        MESSAGE_CONTAINER_OBSERVER_TARGET: 'div[class*="--composer-overlap-px"]',
        MESSAGE_AUTHOR_ROLE_ATTR: '[data-message-author-role]',
        PROJECT_NAME_TITLE_OBSERVER_TARGET: 'title',
    };

    // =================================================================================
    // SECTION: Global State Management
    // Description: Defines and manages the global state of the script.
    // =================================================================================

    const state = {
        CPTA_CONFIG: null,

        themeStyleElem: null,

        lastURL: null,
        lastProject: null,
        lastAppliedThemeSet: null,

        globalProjectObserver: null,
        currentProjectNameSourceObserver: null,
        currentObservedProjectNameSource: null,
        lastObservedProjectName: null,

        containerObserver: null,
        currentMsgContainer: null,
        currentMessageMutator: null,

        cachedProjectName: null,
        cachedThemeSet: null
    };
    let standingImagesRetryCount = 0;

    // =================================================================================
    // SECTION: Utility Functions
    // Description: General helper functions used across the script.
    // =================================================================================

    /**
     * Debounces a function, delaying its execution until after a certain time has passed
     * since the last time it was invoked.
     * @param {Function} func - The function to debounce.
     * @param {number} delay - The delay in milliseconds.
     * @returns {Function} The debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Creates a CSS-compatible url() value from an icon string.
     * Converts SVG strings to a data URL, otherwise returns a standard url().
     * @param {string} icon - The icon string (SVG or URL).
     * @returns {string} A CSS url() value.
     */
    function createIconCssUrl(icon) {
        if (!icon) return 'none';
        if (/^<svg\b/i.test(icon.trim())) {
            // Encode SVG for data URL
            const encodedSvg = encodeURIComponent(icon
                                                  .replace(/"/g, "'") // Use single quotes
                                                  .replace(/\s+/g, ' ') // Minify whitespace
                                                 ).replace(/[()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`); // Escape parentheses
            return `url("data:image/svg+xml,${encodedSvg}")`;
        }
        // Assume it's a regular URL
        return `url(${icon})`;
    }

    /**
     * Formats a string so that it is valid as a CSS background-image value.
     * @param {string | null} value
     * @returns {string | null} formatted value
     */
    function formatCssBgImageValue(value) {
        if (!value) return null;
        const trimmedVal = String(value).trim();

        // If it is already in the form of a CSS function, return it as is.
        if (/^[a-z-]+\(.*\)$/i.test(trimmedVal)) {
            return trimmedVal;
        }

        const escapedVal = trimmedVal.replace(/"/g, '\\"');
        return `url("${escapedVal}")`;
    }

    // =================================================================================
    // SECTION: Configuration Management (GM Storage)
    // Description: Functions for loading and saving script configuration using Greasemonkey storage.
    // =================================================================================

    /**
     * Loads the configuration object from GM_getValue.
     * Uses defaultObj if no saved config is found or if parsing fails.
     * @param {string} key - The storage key for the configuration.
     * @param {object} defaultObj - The default configuration object.
     * @returns {Promise<object>} A promise that resolves to the loaded or default configuration object.
     */
    async function loadConfig(key, defaultObj) {
        try {
            const raw = await GM_getValue(key);
            if (raw) {
                return JSON.parse(raw);
            } else {
                console.log('CPTA: No saved config found. Using default config.');
                return JSON.parse(JSON.stringify(defaultObj));
            }
        } catch (e) {
            console.error('CPTA: Failed to load or parse config. Using default config. Error:', e);
            return JSON.parse(JSON.stringify(defaultObj));
        }
    }

    /**
     * Saves the configuration object to GM_setValue.
     * @param {string} key - The storage key for the configuration.
     * @param {object} obj - The configuration object to save.
     * @returns {Promise<void>} A promise that resolves when the configuration is saved.
     */
    async function saveConfig(key, obj) {
        await GM_setValue(key, JSON.stringify(obj));
    }

    /**
     * Gets the icon size from the configuration object.
     * @param {object} cfg - The configuration object.
     * @returns {number} The icon size.
     */
    function getIconSizeFromConfig(cfg) {
        if (cfg && cfg.options && typeof cfg.options.icon_size === "number") {
            return cfg.options.icon_size;
        }
        return DEFAULT_ICON_SIZE;
    }

    // =================================================================================
    // SECTION: Theme and Actor Configuration Logic
    // Description: Functions to determine the current project, active theme set, and actor-specific configurations.
    // =================================================================================

    /**
     * Gets the current project name from the document title and updates the cache.
     * If the project name changes, it clears the cached theme set.
     * @returns {string} The current project name.
     */
    function getProjectNameAndCache() {
        const currentName = document.title.trim();
        if (currentName !== state.cachedProjectName) {
            state.cachedProjectName = currentName;
            state.cachedThemeSet = null;
        }
        return state.cachedProjectName;
    }

    /**
     * Validates the 'projects' array in each theme set and the default set during config import.
     * Only RegExp objects or strings in the /pattern/flags format are allowed.
     * Throws an error if any entry is not a valid regular expression or does not use the correct string format.
     * This function should be called immediately after importing (parsing) external config JSON.
     *
     * @param {Array<object>} themeSets - Array of theme set objects to validate.
     * @param {object} defaultSet - The default theme set object to validate.
     * @throws {Error} If any projects entry is not a RegExp or a valid /pattern/flags string.
     */
    function validateProjectsConfigOnImport(themeSets, defaultSet) {
        // Validate each theme set
        for (const set of themeSets ?? []) {
            if (!Array.isArray(set.projects)) continue;
            for (const p of set.projects) {
                if (typeof p === 'string') {
                    // Only allow strings matching /pattern/flags format
                    if (!/^\/.*\/[gimsuy]*$/.test(p)) {
                        throw new Error(
                            `All projects entries must be a /pattern/flags-style string or RegExp object. Invalid value: ${p}`
                    );
                    }
                    // Additional check: confirm the RegExp constructor does not throw
                    const lastSlash = p.lastIndexOf('/');
                    const pattern = p.slice(1, lastSlash);
                    const flags = p.slice(lastSlash + 1);
                    try {
                        new RegExp(pattern, flags);
                    } catch (e) {
                        throw new Error(
                            `Invalid regular expression in projects: ${p}\n${e}`
                    );
                    }
                } else if (!(p instanceof RegExp)) {
                    throw new Error(
                        'All projects entries must be RegExp objects or /pattern/flags-style strings.'
                    );
                }
            }
        }
        // Validate the default set
        if (defaultSet && Array.isArray(defaultSet.projects)) {
            for (const p of defaultSet.projects) {
                if (typeof p === 'string') {
                    if (!/^\/.*\/[gimsuy]*$/.test(p)) {
                        throw new Error(
                            `All defaultSet.projects entries must be a /pattern/flags-style string or RegExp object. Invalid value: ${p}`
                    );
                    }
                    const lastSlash = p.lastIndexOf('/');
                    const pattern = p.slice(1, lastSlash);
                    const flags = p.slice(lastSlash + 1);
                    try {
                        new RegExp(pattern, flags);
                    } catch (e) {
                        throw new Error(
                            `Invalid regular expression in defaultSet.projects: ${p}\n${e}`
                    );
                    }
                } else if (!(p instanceof RegExp)) {
                    throw new Error(
                        'All defaultSet.projects entries must be RegExp objects or /pattern/flags-style strings.'
                    );
                }
            }
        }
    }

    /**
     * Retrieves the theme set applicable to the current project.
     * Uses cached theme set if available and project name hasn't changed.
     * @returns {object} The applicable theme set object.
     */
    function getThemeSet() {
        //console.log('[CPTA Debug] getThemeSet: CPTA_CONFIG being used', JSON.stringify(state.CPTA_CONFIG));
        getProjectNameAndCache();
        if (state.cachedThemeSet) {
            return state.cachedThemeSet;
        }

        const regexArr = [];
        for (const set of state.CPTA_CONFIG.themeSets ?? []) {
            for (const proj of set.projects ?? []) {
                if (typeof proj === 'string') {
                    if (/^\/.*\/[gimsuy]*$/.test(proj)) {
                        const lastSlash = proj.lastIndexOf('/');
                        const pattern = proj.slice(1, lastSlash);
                        const flags = proj.slice(lastSlash + 1);
                        try {
                            regexArr.push({ pattern: new RegExp(pattern, flags), set });
                        } catch (e) { /* ignore invalid regex strings in config */ }
                    } else {
                        throw new Error(`[CPTA] projects entry must be a /pattern/flags string: ${proj}`);
                    }
                } else if (proj instanceof RegExp) {
                    regexArr.push({ pattern: new RegExp(proj.source, proj.flags), set });
                }
            }
        }

        const name = state.cachedProjectName;
        const regexHit = regexArr.find(r => r.pattern.test(name));
        const resultSet = regexHit ? regexHit.set : state.CPTA_CONFIG.defaultSet;
        state.cachedThemeSet = resultSet;
        //console.log('[CPTA Debug] getThemeSet: Final resultSet (baseSet):', JSON.stringify(resultSet));
        return resultSet;
    }

    /**
     * Gets the configuration for a specific actor (user/assistant) based on the
     * current theme set and default settings.
     * @param {string} actor - The actor type ('user' or 'assistant').
     * @param {object} set - The current theme set.
     * @param {object} defaultSet - The default theme set from the global configuration.
     * @returns {object} The resolved actor configuration.
     */
    function getActorConfig(actor, set, defaultSet) {
        const currentActorSet = set[actor] ?? {};
        const defaultActorSet = defaultSet[actor] ?? {};

        return {
            name: currentActorSet.name ?? defaultActorSet.name,
            icon: currentActorSet.icon ?? defaultActorSet.icon,
            textcolor: currentActorSet.textcolor,
            font: currentActorSet.font ?? defaultActorSet.font,
            bubbleBgColor: currentActorSet.bubbleBgColor ?? defaultActorSet.bubbleBgColor,
            bubblePadding: currentActorSet.bubblePadding ?? defaultActorSet.bubblePadding,
            bubbleBorderRadius: currentActorSet.bubbleBorderRadius ?? defaultActorSet.bubbleBorderRadius,
            bubbleMaxWidth: currentActorSet.bubbleMaxWidth ?? defaultActorSet.bubbleMaxWidth,
            standingImage: currentActorSet.standingImage ?? defaultActorSet.standingImage,
        };
    }

    // =================================================================================
    // SECTION: DOM Manipulation and Styling - Core Theme Application
    // Description: Functions responsible for generating and applying theme CSS,
    //              managing avatar injection, and handling standing images.
    // =================================================================================

    /**
     * Updates CSS custom properties on the :root element with the current theme's values.
     * @param {object} baseSet - The base theme set.
     * @param {object} userConf - The resolved user configuration.
     * @param {object} assistantConf - The resolved assistant configuration.
     * @param {object} defaultFullConf - The full default configuration for fallback.
     */
    function updateThemeVars(baseSet, userConf, assistantConf, defaultFullConf) {
        const rootStyle = document.documentElement.style;

        const themeVars = {
            // User
            '--cpta-user-name': userConf.name ? `'${userConf.name.replace(/'/g, "\\'")}'` : null,
            '--cpta-user-icon': createIconCssUrl(userConf.icon),
            '--cpta-user-textcolor': userConf.textcolor ?? null,
            '--cpta-user-font': userConf.font ?? null,
            '--cpta-user-bubble-bg': userConf.bubbleBgColor ?? null,
            '--cpta-user-bubble-padding': userConf.bubblePadding ?? null,
            '--cpta-user-bubble-radius': userConf.bubbleBorderRadius ?? null,
            '--cpta-user-bubble-maxwidth': userConf.bubbleMaxWidth ?? null,
            '--cpta-user-bubble-margin-left': userConf.bubbleMaxWidth ? 'auto' : null,
            '--cpta-user-bubble-margin-right': userConf.bubbleMaxWidth ? '0' : null,
            // Assistant
            '--cpta-assistant-name': assistantConf.name ? `'${assistantConf.name.replace(/'/g, "\\'")}'` : null,
            '--cpta-assistant-icon': createIconCssUrl(assistantConf.icon),
            '--cpta-assistant-textcolor': assistantConf.textcolor ?? null,
            '--cpta-assistant-font': assistantConf.font ?? null,
            '--cpta-assistant-bubble-bg': assistantConf.bubbleBgColor ?? null,
            '--cpta-assistant-bubble-padding': assistantConf.bubblePadding ?? null,
            '--cpta-assistant-bubble-radius': assistantConf.bubbleBorderRadius ?? null,
            '--cpta-assistant-bubble-maxwidth': assistantConf.bubbleMaxWidth ?? null,
            '--cpta-assistant-margin-right': assistantConf.bubbleMaxWidth ? 'auto' : null,
            '--cpta-assistant-margin-left': assistantConf.bubbleMaxWidth ? '0' : null,
            // Window/input
            '--cpta-window-bg-color': baseSet.windowBgColor ?? defaultFullConf.windowBgColor,
            '--cpta-window-bg-image': formatCssBgImageValue(baseSet.windowBgImage ?? defaultFullConf.windowBgImage),
            '--cpta-window-bg-size': baseSet.windowBgSize ?? defaultFullConf.windowBgSize,
            '--cpta-window-bg-pos': baseSet.windowBgPosition ?? defaultFullConf.windowBgPosition,
            '--cpta-window-bg-repeat': baseSet.windowBgRepeat ?? defaultFullConf.windowBgRepeat,
            '--cpta-window-bg-attach': baseSet.windowBgAttachment ?? defaultFullConf.windowBgAttachment,
            '--cpta-input-bg': baseSet.inputAreaBgColor ?? defaultFullConf.inputAreaBgColor,
            '--cpta-input-color': baseSet.inputAreaTextColor ?? defaultFullConf.inputAreaTextColor,
            '--cpta-input-ph-color': baseSet.inputAreaPlaceholderColor ?? defaultFullConf.inputAreaPlaceholderColor,
        };

        for (const [key, value] of Object.entries(themeVars)) {
            if (value !== null && value !== undefined) {
                rootStyle.setProperty(key, value);
            } else {
                rootStyle.removeProperty(key);
            }
        }
    }

    /**
     * Creates a static CSS template string that uses CSS variables for theming.
     * This is injected into the page only once.
     * @returns {string} The static CSS ruleset.
     */
    function createThemeCSSTemplate() {
        return `
        /* --- Static Base Styles --- */
        /* These rules are always applied regardless of the theme. */

        ${SELECTORS.USER_BUBBLE_CSS_TARGET},
        ${SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET},
        div[data-message-author-role="assistant"] div:has(> .whitespace-pre-wrap):not(${SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET}) {
            box-sizing: border-box;
        }

        #page-header,
        ${SELECTORS.BUTTON_SHARE_CHAT} {
            background: transparent;
        }

        ${SELECTORS.BUTTON_SHARE_CHAT}:hover {
            background-color: var(--interactive-bg-secondary-hover);
        }

        #fixedTextUIRoot, #fixedTextUIRoot * {
            color: inherit;
        }
    `;
    }

    /**
     * Applies the generated theme CSS to a <style> element in the document head.
     * It only updates the CSS if the themeId (derived from theme content) has changed.
     */
    function applyTheme() {
        // --- 1. Get or create style elements ---
        // Static styles (always present)
        if (!state.themeStyleElem) {
            state.themeStyleElem = document.createElement('style');
            state.themeStyleElem.id = 'cpta-theme-style';
            state.themeStyleElem.textContent = createThemeCSSTemplate();
            document.head.appendChild(state.themeStyleElem);
        }
        // Dynamic rules (content changes based on theme)
        const dynamicRulesStyleId = 'cpta-dynamic-rules-style';
        let dynamicRulesStyleElem = document.getElementById(dynamicRulesStyleId);
        if (!dynamicRulesStyleElem) {
            dynamicRulesStyleElem = document.createElement('style');
            dynamicRulesStyleElem.id = dynamicRulesStyleId;
            document.head.appendChild(dynamicRulesStyleElem);
        }

        // --- 2. Get current theme config ---
        const baseSet = getThemeSet();
        const userConf = getActorConfig('user', baseSet, state.CPTA_CONFIG.defaultSet);
        const assistantConf = getActorConfig('assistant', baseSet, state.CPTA_CONFIG.defaultSet);
        const defaultFullConf = state.CPTA_CONFIG.defaultSet;

        // --- 3. Build dynamic CSS rules based on config ---
        const dynamicRules = [];
        const assistantBubbleSelector = `${SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET}, div[data-message-author-role="assistant"] div:has(> .whitespace-pre-wrap):not(${SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET})`;

        // User Bubble
        if (userConf.textcolor) { dynamicRules.push(`${SELECTORS.USER_TEXT_CONTENT_CSS_TARGET} { color: var(--cpta-user-textcolor); }`); }
        if (userConf.font) { dynamicRules.push(`${SELECTORS.USER_TEXT_CONTENT_CSS_TARGET} { font-family: var(--cpta-user-font); }`); }
        if (userConf.bubbleBgColor) { dynamicRules.push(`${SELECTORS.USER_BUBBLE_CSS_TARGET} { background-color: var(--cpta-user-bubble-bg); }`); }
        if (userConf.bubblePadding) { dynamicRules.push(`${SELECTORS.USER_BUBBLE_CSS_TARGET} { padding: var(--cpta-user-bubble-padding); }`); }
        if (userConf.bubbleBorderRadius) { dynamicRules.push(`${SELECTORS.USER_BUBBLE_CSS_TARGET} { border-radius: var(--cpta-user-bubble-radius); }`); }
        if (userConf.bubbleMaxWidth) {
            dynamicRules.push(`${SELECTORS.USER_BUBBLE_CSS_TARGET} { max-width: var(--cpta-user-bubble-maxwidth); margin-left: var(--cpta-user-bubble-margin-left); margin-right: var(--cpta-user-bubble-margin-right); }`);
        }

        // Assistant Bubble
        if (assistantConf.font) { dynamicRules.push(`${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET}, ${SELECTORS.ASSISTANT_WHITESPACE_CSS_TARGET} { font-family: var(--cpta-assistant-font); }`); }
        if (assistantConf.bubbleBgColor) { dynamicRules.push(`${assistantBubbleSelector} { background-color: var(--cpta-assistant-bubble-bg); }`); }
        if (assistantConf.bubblePadding) { dynamicRules.push(`${assistantBubbleSelector} { padding: var(--cpta-assistant-bubble-padding); }`); }
        if (assistantConf.bubbleBorderRadius) { dynamicRules.push(`${assistantBubbleSelector} { border-radius: var(--cpta-assistant-bubble-radius); }`); }
        if (assistantConf.bubbleMaxWidth) {
            dynamicRules.push(`${assistantBubbleSelector} { max-width: var(--cpta-assistant-bubble-maxwidth); margin-right: var(--cpta-assistant-margin-right); margin-left: var(--cpta-assistant-margin-left); }`);
        }
        if (assistantConf.textcolor) {
            const selectors = [
                `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} p`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h1`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h2`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h3`,
                `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h4`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h5`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} h6`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} ul li`,
                `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} ol li`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} ul li::marker`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} ol li::marker`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} strong`,
                `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} em`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} blockquote`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} table`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} th`, `${SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} td`
            ];
            dynamicRules.push(`${selectors.join(', ')} { color: var(--cpta-assistant-textcolor); }`);
        }

        // Window Background
        if (baseSet.windowBgColor) { dynamicRules.push(`${SELECTORS.CHAT_MAIN_AREA_BG_TARGET} { background-color: var(--cpta-window-bg-color); }`); }
        if (baseSet.windowBgImage) {
            dynamicRules.push(`${SELECTORS.CHAT_MAIN_AREA_BG_TARGET} { background-image: var(--cpta-window-bg-image); background-size: var(--cpta-window-bg-size); background-position: var(--cpta-window-bg-pos); background-repeat: var(--cpta-window-bg-repeat); background-attachment: var(--cpta-window-bg-attach); }`);
        }

        // Input Area
        if (baseSet.inputAreaBgColor) {
            dynamicRules.push(`${SELECTORS.INPUT_AREA_BG_TARGET} { background-color: var(--cpta-input-bg); }`);
            dynamicRules.push(`${SELECTORS.INPUT_TEXT_FIELD_TARGET} { background-color: transparent; }`);
        }
        if (baseSet.inputAreaTextColor) { dynamicRules.push(`${SELECTORS.INPUT_TEXT_FIELD_TARGET} { color: var(--cpta-input-color); }`); }
        if (baseSet.inputAreaPlaceholderColor) { dynamicRules.push(`${SELECTORS.INPUT_PLACEHOLDER_TARGET} { color: var(--cpta-input-ph-color); }`); }

        // --- 4. Apply rules and variables ---
        dynamicRulesStyleElem.textContent = dynamicRules.join('\n');
        updateThemeVars(baseSet, userConf, assistantConf, defaultFullConf);
    }

    // ---- Avatar Management ----
    /**
     * Injects or updates the avatar (icon and name) for a given message element.
     * Uses a data attribute on the message element for caching to avoid redundant updates.
     * @param {HTMLElement} msgElem - The message element with 'data-message-author-role'.
     */
    function injectAvatar(msgElem) {
        const role = msgElem.getAttribute('data-message-author-role');
        if (!role) return;

        const msgWrapper = msgElem.closest('div');
        if (!msgWrapper) return;

        // Do nothing if the avatar container already exists
        if (msgWrapper.querySelector('.side-avatar-container')) return;

        msgWrapper.classList.add('chat-wrapper');

        // Create a structural container without specific styles or content
        const container = document.createElement('div');
        container.className = 'side-avatar-container';

        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'side-avatar-icon';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'side-avatar-name';

        // The actual name and icon are set by CSS via ::after and background-image
        container.append(iconWrapper, nameDiv);
        msgWrapper.appendChild(container);

        // Set min-height to accommodate the avatar
        requestAnimationFrame(() => {
            if (nameDiv.offsetHeight && state.CPTA_CONFIG.options.icon_size) {
                msgWrapper.style.minHeight = (state.CPTA_CONFIG.options.icon_size + nameDiv.offsetHeight) + "px";
            }
        });
    }

    /**
     * Injects or updates the global CSS styles required for avatars.
     */
    function injectAvatarStyle() {
        const styleId = 'cpta-avatar-style';
        let avatarStyle = document.getElementById(styleId);
        if (avatarStyle) avatarStyle.remove();
        avatarStyle = document.createElement('style');
        avatarStyle.id = styleId;
        avatarStyle.textContent = `
         .side-avatar-container {
             position: absolute; top: 0; display: flex; flex-direction: column; align-items: center;
             width: ${state.CPTA_CONFIG.options.icon_size}px;
             pointer-events: none; white-space: normal; word-break: break-word;
         }
         .side-avatar-icon {
             width: ${state.CPTA_CONFIG.options.icon_size}px; height: ${state.CPTA_CONFIG.options.icon_size}px;
             border-radius: 50%; display: block; box-shadow: 0 0 6px rgba(0,0,0,0.2);
             background-size: cover; background-position: center; background-repeat: no-repeat;
         }
         .side-avatar-name {
             font-size: 0.75rem; text-align: center; margin-top: 4px; width: 100%;
         }
         .chat-wrapper[data-message-author-role="user"] .side-avatar-container {
             right: calc(-${state.CPTA_CONFIG.options.icon_size}px - ${ICON_MARGIN}px);
         }
         .chat-wrapper[data-message-author-role="assistant"] .side-avatar-container {
             left: calc(-${state.CPTA_CONFIG.options.icon_size}px - ${ICON_MARGIN}px);
         }
         /* --- Dynamic Content via CSS Variables --- */
         .chat-wrapper[data-message-author-role="user"] .side-avatar-icon {
             background-image: var(--cpta-user-icon);
         }
         .chat-wrapper[data-message-author-role="user"] .side-avatar-name {
             color: var(--cpta-user-textcolor);
         }
         .chat-wrapper[data-message-author-role="user"] .side-avatar-name::after {
             content: var(--cpta-user-name);
         }
         .chat-wrapper[data-message-author-role="assistant"] .side-avatar-icon {
             background-image: var(--cpta-assistant-icon);
         }
         .chat-wrapper[data-message-author-role="assistant"] .side-avatar-name {
             color: var(--cpta-assistant-textcolor);
         }
         .chat-wrapper[data-message-author-role="assistant"] .side-avatar-name::after {
             content: var(--cpta-assistant-name);
         }
         `;
        document.head.appendChild(avatarStyle);
    }

    /**
     * Injects the CSS rules required for standing images.
     */
    function injectStandingImageStyle() {
        const styleId = 'cpta-standing-image-style';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          #cpta-standing-image-user, #cpta-standing-image-assistant {
              position: fixed;
              bottom: 0px;
              height: 100vh;
              min-height: 100px;
              max-height: 100vh;
              z-index: ${STANDING_IMAGE_Z_INDEX};
              pointer-events: none;
              margin: 0; padding: 0;
              background-repeat: no-repeat;
              background-position: bottom center;
              background-size: contain;
          }
          #cpta-standing-image-assistant {
              display: var(--cpta-si-assistant-display, none);
              background-image: var(--cpta-si-assistant-bg-image, none);
              left: var(--cpta-si-assistant-left, 0px);
              width: var(--cpta-si-assistant-width, 0px);
              max-width: var(--cpta-si-assistant-width, 0px);
              mask-image: var(--cpta-si-assistant-mask, none);
              -webkit-mask-image: var(--cpta-si-assistant-mask, none);
          }
          #cpta-standing-image-user {
              display: var(--cpta-si-user-display, none);
              background-image: var(--cpta-si-user-bg-image, none);
              right: 0px;
              width: var(--cpta-si-user-width, 0px);
              max-width: var(--cpta-si-user-width, 0px);
              mask-image: var(--cpta-si-user-mask, none);
              -webkit-mask-image: var(--cpta-si-user-mask, none);
          }
        `;
        document.head.appendChild(style);
    }

    // ---- Standing Image Management ----
    /**
     * Gets the current width of the sidebar.
     * @returns {number} The width of the sidebar in pixels, or 0 if not found/visible.
     */
    function getSidebarWidth() {
        const sidebar = document.querySelector(SELECTORS.SIDEBAR_WIDTH_TARGET);
        if (sidebar && sidebar.offsetParent !== null) {
            const styleWidth = sidebar.style.width;
            if (styleWidth && styleWidth.endsWith('px')) {
                return parseInt(styleWidth, 10);
            }
            if (sidebar.offsetWidth) {
                return sidebar.offsetWidth;
            }
        }
        return 0;
    }

    /**
     * Updates the display and positioning of user and assistant standing images.
     * This function handles retries if essential DOM elements are not initially available.
     * @param {string|null} userImgVal - URL for the user's standing image.
     * @param {string|null} assistantImgVal - URL for the assistant's standing image.
     */
    function updateStandingImages(userImgVal, assistantImgVal) {
        setupStandingImage('cpta-standing-image-user', userImgVal);
        setupStandingImage('cpta-standing-image-assistant', assistantImgVal);

        debouncedRecalculateStandingImagesLayout();
    }

    /**
     * @param {string} id - element id
     * @param {string|null} imgVal - standingImage
     */
    function setupStandingImage(id, imgVal) {
        if (!document.getElementById(id)) {
            const el = document.createElement('div');
            el.id = id;
            document.body.appendChild(el);
        }

        const rootStyle = document.documentElement.style;
        const actorType = id.includes('assistant') ? 'assistant' : 'user';
        const displayVar = `--cpta-si-${actorType}-display`;
        const bgImageVar = `--cpta-si-${actorType}-bg-image`;

        const bgVal = formatCssBgImageValue(imgVal);
        if (!bgVal) {
            rootStyle.setProperty(displayVar, 'none');
            rootStyle.removeProperty(bgImageVar);
            return;
        }

        rootStyle.setProperty(displayVar, 'block');
        rootStyle.setProperty(bgImageVar, bgVal);
    }

    /**
     * Debounced function to recalculate and update the layout of standing images.
     * Typically called on window resize or sidebar resize.
     */
    const debouncedRecalculateStandingImagesLayout = debounce(() => {
        const rootStyle = document.documentElement.style;
        const chatContent = document.querySelector(SELECTORS.CHAT_CONTENT_MAX_WIDTH);

        if (!chatContent) {
            if (standingImagesRetryCount < MAX_STANDING_IMAGES_RETRIES) {
                standingImagesRetryCount++;
                setTimeout(debouncedRecalculateStandingImagesLayout, STANDING_IMAGES_RETRY_INTERVAL);
            } else {
                console.log('[CPTA Debug] Layout calculation: Max retries reached for chatContent.');
                standingImagesRetryCount = 0;
            }
            return;
        }
        standingImagesRetryCount = 0;

        const chatRect = chatContent.getBoundingClientRect();
        const sidebarWidth = getSidebarWidth();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const iconSize = state.CPTA_CONFIG.options.icon_size;

        // Assistant (left) layout calculation
        const assistantWidth = Math.max(0, chatRect.left - (sidebarWidth + iconSize + (ICON_MARGIN * 2)));
        rootStyle.setProperty('--cpta-si-assistant-left', sidebarWidth + 'px');
        rootStyle.setProperty('--cpta-si-assistant-width', assistantWidth + 'px');

        // User (right) layout calculation
        const userWidth = Math.max(0, windowWidth - chatRect.right - (iconSize + (ICON_MARGIN * 2)));
        rootStyle.setProperty('--cpta-si-user-width', userWidth + 'px');

        // Masking logic
        const maskValue = `linear-gradient(to bottom, transparent 0px, rgba(0,0,0,1) 60px, rgba(0,0,0,1) 100%)`;
        const assistantImg = document.getElementById('cpta-standing-image-assistant');
        if (assistantImg && assistantImg.offsetHeight >= (windowHeight - 32)) {
            rootStyle.setProperty('--cpta-si-assistant-mask', maskValue);
        } else {
            rootStyle.setProperty('--cpta-si-assistant-mask', 'none');
        }

        const userImg = document.getElementById('cpta-standing-image-user');
        if (userImg && userImg.offsetHeight >= (windowHeight - 32)) {
            rootStyle.setProperty('--cpta-si-user-mask', maskValue);
        } else {
            rootStyle.setProperty('--cpta-si-user-mask', 'none');
        }
    }, 250);

    /**
     * Updates the min-height of all chat message wrappers to accommodate avatars.
     * Called after settings changes that might affect avatar/name display.
     */
    function updateAllChatWrapperHeight() {
        document.querySelectorAll('.chat-wrapper').forEach(msgWrapper => {
            const container = msgWrapper.querySelector('.side-avatar-container');
            const nameDiv = container?.querySelector('.side-avatar-name');
            if (container && nameDiv && state.CPTA_CONFIG?.options?.icon_size && nameDiv.offsetHeight) {
                msgWrapper.style.minHeight =
                    (state.CPTA_CONFIG.options.icon_size + nameDiv.offsetHeight) + "px";
            }
        });
    }

    // =================================================================================
    // SECTION: UI Elements - Settings Button and Modal
    // Description: Functions for creating and managing the settings button and configuration modal.
    // =================================================================================

    /**
     * Ensures the common UI styles for the settings button and modal are injected.
     */
    function ensureCommonUIStyle() {
        if (document.getElementById('cpta-settings-common-style')) return;
        const style = document.createElement('style');
        style.id = 'cpta-settings-common-style';
        style.textContent = `
          #cpta-id-settings-btn {
              transition: background 0.12s, border-color 0.12s, box-shadow 0.12s;
          }
          #cpta-id-settings-btn:hover {
              background: var(--interactive-bg-secondary-hover) !important;
              border-color: var(--border-default, #888);
              box-shadow: 0 2px 8px var(--border-default, #3336);
          }
          .cpta-modal-button {
              background: var(--interactive-bg-tertiary-default);
              color: var(--text-primary);
              border: 1px solid var(--border-default);
              border-radius: var(--radius-md, ${MODAL_BTN_RADIUS}px);
              padding: ${MODAL_BTN_PADDING};
              font-size: ${MODAL_BTN_FONT_SIZE}px;
              cursor: pointer;
              transition: background 0.12s;
          }
          .cpta-modal-button:hover {
              background: var(--interactive-bg-secondary-hover) !important;
              border-color: var(--border-default);
          }
        `;
        document.head.appendChild(style);
    }

    /**
     * Creates and manages the settings modal dialog.
     * @param {object} options - Options for the modal.
     * @param {string} options.modalId - The ID for the modal overlay element.
     * @param {string} options.titleText - The title text for the modal.
     * @param {Function} options.onSave - Async callback function executed when saving.
     * @param {Function} options.getCurrentConfig - Async function to get the current config for display.
     * @param {HTMLElement} options.anchorBtn - The button element to anchor the modal to.
     * @returns {HTMLElement} The modal overlay element.
     */
    function setupSettingsModal({ modalId, titleText, onSave, getCurrentConfig, anchorBtn }) {
        let modalOverlay = document.getElementById(modalId);
        if (modalOverlay) return modalOverlay;

        modalOverlay = document.createElement('div');
        modalOverlay.id = modalId;
        Object.assign(modalOverlay.style, {
            display: 'none',
            position: 'fixed',
            zIndex: '2147483648',
            left: '0',
            top: '0',
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto'
        });

        const modalBox = document.createElement('div');
        Object.assign(modalBox.style, {
            position: 'absolute',
            width: MODAL_WIDTH + 'px',
            padding: MODAL_PADDING + 'px',
            borderRadius: `var(--radius-lg, ${MODAL_RADIUS}px)`,
            background: 'var(--main-surface-primary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--drop-shadow-lg, 0 4px 16px #00000026)'
        });

        const modalTitle = document.createElement('h5');
        modalTitle.innerText = titleText;
        Object.assign(modalTitle.style, {
            marginTop: '0',
            marginBottom: MODAL_TITLE_MARGIN_BOTTOM + 'px'
        });

        const textarea = document.createElement('textarea');
        Object.assign(textarea.style, {
            width: '100%',
            height: MODAL_TEXTAREA_HEIGHT + 'px',
            boxSizing: 'border-box',
            fontFamily: 'monospace',
            fontSize: '13px',
            marginBottom: '0',
            border: '1px solid var(--border-default)',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        });

        const msgDiv = document.createElement('div');
        Object.assign(msgDiv.style, {
            color: 'var(--text-danger,#f33)',
            marginTop: '2px',
            minHeight: '4px'
        });

        const btnGroup = document.createElement('div');
        Object.assign(btnGroup.style, {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: MODAL_BTN_GROUP_GAP + 'px',
            marginTop: '8px'
        });

        const btnExport = document.createElement('button');
        btnExport.type = 'button';
        btnExport.innerText = 'Export';
        btnExport.classList.add('cpta-modal-button');

        const btnImport = document.createElement('button');
        btnImport.type = 'button';
        btnImport.innerText = 'Import';
        btnImport.classList.add('cpta-modal-button');

        const btnSave = document.createElement('button');
        btnSave.type = 'button';
        btnSave.innerText = 'Save';
        btnSave.classList.add('cpta-modal-button');

        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.innerText = 'Cancel';
        btnCancel.classList.add('cpta-modal-button');

        btnGroup.append(btnExport, btnImport, btnSave, btnCancel);
        modalBox.append(modalTitle, textarea, btnGroup, msgDiv);
        modalOverlay.appendChild(modalBox);
        document.body.appendChild(modalOverlay);

        function closeModal() {
            modalOverlay.style.display = 'none';
        }

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

        btnSave.addEventListener('click', async () => {
            try {
                const obj = JSON.parse(textarea.value);
                // === Add validation here ===
                try {
                    validateProjectsConfigOnImport(obj.themeSets, obj.defaultSet);
                } catch (e) {
                    msgDiv.textContent = 'Invalid projects array: ' + e.message;
                    msgDiv.style.color = 'var(--text-danger,#f33)';
                    return;
                }
                await onSave(obj);
                closeModal();
            } catch (e) {
                msgDiv.textContent = 'JSON parse error: ' + e.message;
                msgDiv.style.color = 'var(--text-danger,#f33)';
            }
        });

        btnCancel.addEventListener('click', closeModal);

        modalOverlay.addEventListener('mousedown', e => {
            if (e.target === modalOverlay) closeModal();
        });

        async function openModal() {
            let cfg = await getCurrentConfig();
            textarea.value = JSON.stringify(cfg, null, 2);
            msgDiv.textContent = '';

            if (anchorBtn && anchorBtn.getBoundingClientRect) {
                const btnRect = anchorBtn.getBoundingClientRect();
                const margin = 8;
                let left = btnRect.left;
                let top = btnRect.bottom + 4;
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

    /**
     * Ensures the settings button is present in the UI.
     * Sets up the click handler to open the settings modal.
     */
    function ensureSettingsBtn() {
        if (document.getElementById('cpta-id-settings-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'cpta-id-settings-btn';
        btn.textContent = '⚙️';
        btn.title = 'Settings (ChatGPT Project Theme Automator)';
        Object.assign(btn.style, {
            position: 'fixed', top: '10px', right: '320px', zIndex: 99999,
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--interactive-bg-secondary-default)', border: '1px solid var(--interactive-border-secondary-default)',
            fontSize: '16px', cursor: 'pointer', boxShadow: 'var(--drop-shadow-xs, 0 1px 1px #0000000d)'
        });
        document.body.appendChild(btn);

        const settingsModal = setupSettingsModal({
            modalId: 'cpta-settings-modal',
            titleText: 'ChatGPT Project Theme Automator Settings',
            onSave: async (cfg) => {
                await saveConfig(CONFIG_KEY, cfg);
                state.CPTA_CONFIG = cfg;
                state.cachedThemeSet = null;
                state.CPTA_CONFIG.options.icon_size = getIconSizeFromConfig(cfg);
                injectAvatarStyle();
                updateTheme();
                updateAllChatWrapperHeight();
            },
            getCurrentConfig: () => Promise.resolve(state.CPTA_CONFIG),
            anchorBtn: document.getElementById('cpta-id-settings-btn')
        });
        document.getElementById('cpta-id-settings-btn').onclick = () => { settingsModal.open(); };
    }

    // Detect the disappearance of the button with MutationObserver and revive it
    const cptaBtnObserver = new MutationObserver(ensureSettingsBtn);
    cptaBtnObserver.observe(document.body, { childList: true, subtree: true });

    // =================================================================================
    // SECTION: DOM Observers and Event Listeners
    // Description: Sets up MutationObservers and event listeners to react to DOM changes,
    //              URL changes, and other events.
    // =================================================================================

    // ---- Message Container Observer ----
    /**
     * Sets up a MutationObserver to watch for added messages within a given container
     * and injects avatars into them.
     * @param {HTMLElement|null} container - The message container element to observe.
     */
    function setupMessageObserver(container) {
        if (!container || !container.isConnected) {
            state.currentMessageMutator?.disconnect(); state.currentMessageMutator = null; state.currentMsgContainer = null; return;
        }
        if (container === state.currentMsgContainer) return;
        state.currentMessageMutator?.disconnect();
        state.currentMessageMutator = new MutationObserver(mutations => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node instanceof HTMLElement && node.hasAttribute('data-message-author-role')) { injectAvatar(node); }
                    node.querySelectorAll?.('[data-message-author-role]').forEach(injectAvatar);
                }
            }
        });
        state.currentMessageMutator.observe(container, { childList: true, subtree: true });
        state.currentMsgContainer = container;
    }

    /**
     * Initializes the MutationObserver for detecting the main message container's
     * appearance or changes, then calls setupMessageObserver.
     */
    function startMessageContainerObserver() {
        if (state.containerObserver) { return; }
        state.containerObserver?.disconnect();

        let initialContainer =
            document.querySelector(SELECTORS.MESSAGE_CONTAINER_OBSERVER_TARGET) ||
            Array.from(document.querySelectorAll('div')).find(div => div.querySelector(SELECTORS.MESSAGE_AUTHOR_ROLE_ATTR));

        if (initialContainer) {
            console.log("CPTA: Initial message container found:", initialContainer);
            setupMessageObserver(initialContainer);
            initialContainer.querySelectorAll('[data-message-author-role]').forEach(injectAvatar);
            updateTheme();
        }

        state.containerObserver = new MutationObserver(() => {
            const newContainer =
                  document.querySelector(SELECTORS.MESSAGE_CONTAINER_OBSERVER_TARGET) ||
                  Array.from(document.querySelectorAll('div')).find(div => div.querySelector(SELECTORS.MESSAGE_AUTHOR_ROLE_ATTR));
            if (newContainer && newContainer !== state.currentMsgContainer) {
                setupMessageObserver(newContainer);
                newContainer.querySelectorAll('[data-message-author-role]').forEach(injectAvatar);
                updateTheme();
            } else if (!newContainer && state.currentMsgContainer) {
                setupMessageObserver(null);
            }
        });

        state.containerObserver.observe(document.body, { childList: true, subtree: true });
    }

    // ---- Project Name (Title) Observer ----
    /**
     * Initializes MutationObservers to detect changes in the document title (project name)
     * and triggers a theme update.
     */
    function startGlobalProjectElementObserver() {
        if (state.globalProjectObserver) return;
        state.globalProjectObserver = new MutationObserver(() => {
            const newTitle = document.querySelector(SELECTORS.PROJECT_NAME_TITLE_OBSERVER_TARGET);
            let targetElement = null;
            let targetTextContent = '';
            if (newTitle) {
                targetElement = newTitle;
                targetTextContent = newTitle.textContent.trim();
            }

            if (targetElement && targetElement !== state.currentObservedProjectNameSource) {
                state.currentProjectNameSourceObserver?.disconnect();
                state.currentObservedProjectNameSource = null;
                state.lastObservedProjectName = null;
                state.currentProjectNameSourceObserver = new MutationObserver(() => {
                    const currentText = (state.currentObservedProjectNameSource?.textContent || '').trim();
                    if (currentText !== state.lastObservedProjectName) {
                        state.lastObservedProjectName = currentText;
                        updateTheme();
                    }
                });
                state.currentProjectNameSourceObserver.observe(targetElement, { childList: true, characterData: true });
                state.currentObservedProjectNameSource = targetElement;
                state.lastObservedProjectName = targetTextContent;
                updateTheme();
            } else if (!targetElement && state.currentObservedProjectNameSource) {
                state.currentProjectNameSourceObserver?.disconnect();
                state.currentObservedProjectNameSource = null;
                state.lastObservedProjectName = null;
                updateTheme();
            }
        });
        state.globalProjectObserver.observe(document.body, { childList: true, subtree: true });

        const initialTitle = document.querySelector(SELECTORS.PROJECT_NAME_TITLE_OBSERVER_TARGET);
        let initialTarget = null;
        if (initialTitle) {
            initialTarget = initialTitle;
        }
        if (initialTarget) {
            state.currentProjectNameSourceObserver = new MutationObserver(() => {
                const currentText = (state.currentObservedProjectNameSource?.textContent || '').trim();
                if (currentText !== state.lastObservedProjectName) {
                    state.lastObservedProjectName = currentText;
                    updateTheme();
                }
            });
            state.currentProjectNameSourceObserver.observe(initialTarget, { childList: true, characterData: true });
            state.currentObservedProjectNameSource = initialTarget;
            state.lastObservedProjectName = (initialTarget?.textContent || '').trim();
            updateTheme();
        }
    }

    // ---- Sidebar Resize Observer ----
    /**
     * Initializes a ResizeObserver to detect changes in the sidebar width
     * and triggers recalculation of standing image layouts.
     * Also handles the appearance/disappearance of the sidebar itself via MutationObserver.
     */
    const sidebarContainerObserver = new MutationObserver(() => {
        startSidebarResizeObserver();
    });
    sidebarContainerObserver.observe(document.body, { childList: true, subtree: true });

    let sidebarResizeObserver = null;
    let lastSidebarElem = null;

    function startSidebarResizeObserver() {
        const sidebar = document.querySelector(SELECTORS.SIDEBAR_WIDTH_TARGET);
        if (!sidebar) {
            lastSidebarElem = null;
            if (sidebarResizeObserver) sidebarResizeObserver.disconnect();
            return;
        }
        if (sidebar === lastSidebarElem) return;
        if (sidebarResizeObserver) sidebarResizeObserver.disconnect();
        lastSidebarElem = sidebar;
        sidebarResizeObserver = new ResizeObserver(() => {
            debouncedRecalculateStandingImagesLayout();
        });
        sidebarResizeObserver.observe(sidebar);
        debouncedRecalculateStandingImagesLayout();
    }

    // ---- URL Change Handling ----
    /**
     * Handles URL changes (via history API or popstate) and triggers a theme update.
     * This is an IIFE that returns the actual handler function.
     */
    const handleURLChange = (() => {
        let localLastURL = location.href;
        return () => {
            if (location.href !== localLastURL) {
                localLastURL = location.href;
                updateTheme();
            }
        };
    })();
    for (const m of ['pushState', 'replaceState']) {
        const orig = history[m];
        history[m] = function (...args) { orig.apply(this, args); handleURLChange(); };
    }
    window.addEventListener('popstate', handleURLChange);

    // =================================================================================
    // SECTION: Core Theme Update Logic
    // Description: The main function that orchestrates theme updates based on various triggers.
    // =================================================================================

    /**
     * Main function to update the theme.
     * It determines if the URL, project, or theme content has changed and applies
     * necessary updates (CSS, standing images, avatars).
     * It also updates the `state.lastURL`, `state.lastProject`, and `state.lastAppliedThemeSet`.
     */
    function updateTheme() {
        const currentLiveURL = location.href;
        const currentProjectName = state.cachedProjectName;

        let urlChanged = false;
        if (currentLiveURL !== state.lastURL) {
            urlChanged = true;
            state.lastURL = currentLiveURL;
        }

        let projectChanged = false;
        if (currentProjectName !== state.lastProject) {
            projectChanged = true;
            state.lastProject = currentProjectName;
        }

        const currentThemeSet = getThemeSet();
        let contentChanged = false;
        if (currentThemeSet !== state.lastAppliedThemeSet) {
            contentChanged = true;
            state.lastAppliedThemeSet = currentThemeSet;
        }

        const themeShouldUpdate = urlChanged || projectChanged || contentChanged;

        if (themeShouldUpdate) {
            applyTheme();
            const userConf = getActorConfig('user', currentThemeSet, state.CPTA_CONFIG.defaultSet);
            const assistantConf = getActorConfig('assistant', currentThemeSet, state.CPTA_CONFIG.defaultSet);
            updateStandingImages(userConf.standingImage, assistantConf.standingImage);
        }
    }

    // =================================================================================
    // SECTION: Initialization
    // Description: Script entry point
    // =================================================================================

    /**
     * Initializes the script: loads configuration, sets up UI elements,
     * observers, and event listeners.
     */
    async function init() {
        state.CPTA_CONFIG = await loadConfig(CONFIG_KEY, DEFAULT_THEME_CONFIG);
        state.CPTA_CONFIG.options.icon_size = getIconSizeFromConfig(state.CPTA_CONFIG);
        injectAvatarStyle();
        injectStandingImageStyle();
        ensureCommonUIStyle();
        ensureSettingsBtn();

        startGlobalProjectElementObserver();
        startMessageContainerObserver();

        // Add resize listener for standing images
        window.addEventListener('resize', debouncedRecalculateStandingImagesLayout);
        startSidebarResizeObserver();
    }

    // ---- Script Entry Point ----
    init();

    // =================================================================================
    // SECTION: Debugging
    // Description: Debugging utilities.
    // =================================================================================

    /**
     * Checks the validity of essential CSS selectors used by the script.
     * Callable from the browser console via `unsafeWindow.cptaCheckSelectors()`.
     * @returns {boolean} True if all checked selectors are found, false otherwise.
     */
    if (typeof unsafeWindow !== 'undefined') {
        unsafeWindow.cptaCheckSelectors = function() {
            const selectorsToCheck = [
                { selector: SELECTORS.SIDEBAR_WIDTH_TARGET, desc: "サイドバー (幅指定)" },
                { selector: SELECTORS.CHAT_CONTENT_MAX_WIDTH, desc: "チャットコンテンツ幅基準要素" },
                { selector: SELECTORS.CHAT_MAIN_AREA_BG_TARGET, desc: "チャットメインエリア (背景適用対象)" },
                { selector: SELECTORS.USER_BUBBLE_CSS_TARGET, desc: "ユーザーメッセージバブル" },
                { selector: SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET, desc: "アシスタントメッセージバブル (Markdown)" },
                { selector: SELECTORS.MESSAGE_AUTHOR_ROLE_ATTR, desc: "任意のメッセージ要素 (アバター注入対象)" },
                { selector: SELECTORS.INPUT_AREA_BG_TARGET, desc: "入力エリアの背景変更対象" },
                { selector: SELECTORS.INPUT_TEXT_FIELD_TARGET, desc: "入力テキストフィールド" },
                { selector: SELECTORS.INPUT_PLACEHOLDER_TARGET, desc: "入力エリアプレースホルダー" },
                { selector: SELECTORS.MESSAGE_CONTAINER_OBSERVER_TARGET, desc: "メッセージコンテナ (Observer用)" },
                { selector: SELECTORS.PROJECT_NAME_TITLE_OBSERVER_TARGET, desc: "ページタイトル (プロジェクト名取得用)" },
            ];

            let allOK = true;
            console.groupCollapsed("CPTA CSS Selector Check");
            for (const {selector, desc} of selectorsToCheck) {
                const el = document.querySelector(selector);
                if (el) {
                    console.log(`✅ [OK] "${selector}"\n     description: ${desc}\n     element found:`, el);
                } else {
                    console.warn(`❌ [NG] "${selector}"\n     description: ${desc}\n     element NOT found.`);
                    allOK = false;
                }
            }
            if (allOK) {
                console.log("🎉 CPTA: All essential selectors are currently valid!");
            } else {
                console.warn("⚠️ CPTA: One or more essential selectors are NOT found. Theme might not apply correctly.");
            }
            console.groupEnd();
            return allOK;
        };
        console.log("CPTA: Debug function cptaCheckSelectors() is available via console (unsafeWindow.cptaCheckSelectors).");
    } else {
        console.warn("CPTA: unsafeWindow is not available. Debug function cptaCheckSelectors() cannot be exposed to console.");
    }



    // 2025-05 Firefox対策: 不要になればこのIIFEごと削除
    // [Firefox限定] チャット表示エリアの謎枠線消去
    // Firefoxはoverflow-y-autoな要素に“アクセシビリティ枠線”を描画するため、overflow-x-hiddenで強制消去
    // ※ 2025-05現在。今後UI仕様変更時は要再検証
    (function() {
        // Firefox判定
        if (!/firefox/i.test(navigator.userAgent)) return;

        // 対象クラスの選択セレクタ
        const SELECTOR = '.flex.h-full.flex-col.overflow-y-auto';

        // スクロール枠線対策を適用
        function fixOverflowXHidden() {
            for (const el of document.querySelectorAll(SELECTOR)) {
                // 既に設定済みなら無駄な再設定はしない
                if (el.style.overflowX !== 'hidden') el.style.overflowX = 'hidden';
            }
        }

        // MutationObserverでDOM変化時にも自動対応
        const observer = new MutationObserver(fixOverflowXHidden);

        // body直下でchildList, subtree監視
        observer.observe(document.body, { childList: true, subtree: true });

        // 初期実行（即時効果・ページ遷移直後対応）
        fixOverflowXHidden();

    })();


})();