// ==UserScript==
// @name         ChatGPT Project Theme Automator
// @namespace    https://github.com/p65536
// @version      1.0.4
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
                bubblePadding: null,
                bubbleBorderRadius: null,
                bubbleMaxWidth: null,
                standingImage: null
            },
            assistant: {
                name: 'ChatGPT',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19.94,9.06C19.5,5.73,16.57,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48C3.74,13.14,4.22,14,5,14h1l0,2c0,1.1,0.9,2,2,2h1 v3h7l0-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5 c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/><path d="M12.5,12.54c-0.41,0-0.74,0.31-0.74,0.73c0,0.41,0.33,0.74,0.74,0.74c0.42,0,0.73-0.33,0.73-0.74 C13.23,12.85,12.92,12.54,12.5,12.54z"/><path d="M12.5,7c-1.03,0-1.74,0.67-2,1.45l0.96,0.4c0.13-0.39,0.43-0.86,1.05-0.86c0.95,0,1.13,0.89,0.8,1.36 c-0.32,0.45-0.86,0.75-1.14,1.26c-0.23,0.4-0.18,0.87-0.18,1.16h1.06c0-0.55,0.04-0.65,0.13-0.82c0.23-0.42,0.65-0.62,1.09-1.27 c0.4-0.59,0.25-1.38-0.01-1.8C13.95,7.39,13.36,7,12.5,7z"/></g></g></svg>',
                textcolor: null,
                font: null,
                bubbleBgColor: null,
                bubblePadding: "10px 14px",
                bubbleBorderRadius: "16px",
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

        appliedThemeId: null,
        themeStyleElem: null,

        lastURL: null,
        lastProject: null,
        lastAppliedThemeProps: null,

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
                        throw new Error(`[ThemeAutomator] projects entry must be a /pattern/flags string: ${proj}`);
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

    // ---- CSS Theme Application ----
    /**
     * Creates the CSS string based on the current theme settings.
     * @returns {string} The generated CSS rules.
     */
    function createThemeCSS() {
        const baseSet = getThemeSet();
        const userConf = getActorConfig('user', baseSet, state.CPTA_CONFIG.defaultSet);
        const assistantConf = getActorConfig('assistant', baseSet, state.CPTA_CONFIG.defaultSet);
        const defaultFullConf = state.CPTA_CONFIG.defaultSet;

        let cssRules = [];

        // --- User Styles ---
        const userBubbleSelector = SELECTORS.USER_BUBBLE_CSS_TARGET;
        const userTextContentSelector = SELECTORS.USER_TEXT_CONTENT_CSS_TARGET;
        let userBubbleStyles = [];

        if (userConf.bubbleBgColor) { userBubbleStyles.push(`background-color: ${userConf.bubbleBgColor};`); }
        if (userConf.bubblePadding) { userBubbleStyles.push(`padding: ${userConf.bubblePadding};`); }
        if (userConf.bubbleBorderRadius) { userBubbleStyles.push(`border-radius: ${userConf.bubbleBorderRadius};`); }
        if (userConf.bubbleMaxWidth) {
            userBubbleStyles.push(`max-width: ${userConf.bubbleMaxWidth};`);
            userBubbleStyles.push(`margin-left: auto;`);
            userBubbleStyles.push(`margin-right: 0;`);
        }
        if (userBubbleStyles.length > 0) {
            if (userConf.bubblePadding || userConf.bubbleBorderRadius) { userBubbleStyles.push('box-sizing: border-box;'); }
            cssRules.push(`${userBubbleSelector} { ${userBubbleStyles.join(' ')} }`);
        }
        if (userConf.font) { cssRules.push(`${userTextContentSelector} { font-family: ${userConf.font}; }`); }
        if (userConf.textcolor) { cssRules.push(`${userTextContentSelector} { color: ${userConf.textcolor}; }`); }

        // --- Assistant Styles ---
        const assistantBubbleSelector = SELECTORS.ASSISTANT_BUBBLE_MD_CSS_TARGET;
        const assistantMarkdownSelector = SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET;
        const assistantWhitespaceSelector = SELECTORS.ASSISTANT_WHITESPACE_CSS_TARGET;
        let assistantBubbleStyles = [];

        if (assistantConf.bubbleBgColor) { assistantBubbleStyles.push(`background-color: ${assistantConf.bubbleBgColor};`); }
        if (assistantConf.bubblePadding) { assistantBubbleStyles.push(`padding: ${assistantConf.bubblePadding};`); }
        if (assistantConf.bubbleBorderRadius) { assistantBubbleStyles.push(`border-radius: ${assistantConf.bubbleBorderRadius};`); }
        if (assistantConf.bubbleMaxWidth) {
            assistantBubbleStyles.push(`max-width: ${assistantConf.bubbleMaxWidth};`);
            assistantBubbleStyles.push(`margin-right: auto;`);
            assistantBubbleStyles.push(`margin-left: 0;`);
        }

        if (assistantBubbleStyles.length > 0) {
            if (assistantConf.bubblePadding || assistantConf.bubbleBorderRadius) { assistantBubbleStyles.push('box-sizing: border-box;'); }
            cssRules.push(`${assistantBubbleSelector} { ${assistantBubbleStyles.join(' ')} }`);

            const assistantCodeBubbleSelector = `div[data-message-author-role="assistant"] div:has(> .whitespace-pre-wrap):not(${assistantBubbleSelector})`;
            if (assistantBubbleStyles.some(style => style.startsWith('background-color:') || style.startsWith('padding:') || style.startsWith('border-radius:'))) {
                cssRules.push(`${assistantCodeBubbleSelector} { ${assistantBubbleStyles.join(' ')} }`);
            }
        }

        if (assistantConf.font) { cssRules.push(`${assistantMarkdownSelector}, ${assistantWhitespaceSelector} { font-family: ${assistantConf.font}; }`); }
        if (assistantConf.textcolor) {
            cssRules.push(`
                ${assistantMarkdownSelector} p,
                ${assistantMarkdownSelector} h1, ${assistantMarkdownSelector} h2, ${assistantMarkdownSelector} h3, ${assistantMarkdownSelector} h4, ${assistantMarkdownSelector} h5, ${assistantMarkdownSelector} h6,
                ${assistantMarkdownSelector} ul li, ${assistantMarkdownSelector} ol li,
                ${assistantMarkdownSelector} ul li::marker, ${assistantMarkdownSelector} ol li::marker,
                ${assistantMarkdownSelector} strong, ${assistantMarkdownSelector} em,
                ${assistantMarkdownSelector} blockquote,
                ${assistantMarkdownSelector} table, ${assistantMarkdownSelector} th, ${assistantMarkdownSelector} td {
                color: ${assistantConf.textcolor};
            }`);
        }

        // --- Window/Chat Area Background Styles ---
        const chatAreaSelector = SELECTORS.CHAT_MAIN_AREA_BG_TARGET;
        let windowStyles = [];

        const windowBgColor = baseSet.windowBgColor ?? defaultFullConf.windowBgColor ?? null;
        const windowBgImage = baseSet.windowBgImage ?? defaultFullConf.windowBgImage ?? null;
        const windowBgSize = baseSet.windowBgSize ?? defaultFullConf.windowBgSize;
        const windowBgPosition = baseSet.windowBgPosition ?? defaultFullConf.windowBgPosition;
        const windowBgRepeat = baseSet.windowBgRepeat ?? defaultFullConf.windowBgRepeat;
        const windowBgAttachment = baseSet.windowBgAttachment ?? defaultFullConf.windowBgAttachment;

        if (windowBgColor) { windowStyles.push(`background-color: ${windowBgColor};`); }
        if (windowBgImage) {
            windowStyles.push(`background-image: ${windowBgImage};`);
            if (windowBgSize) { windowStyles.push(`background-size: ${windowBgSize};`); }
            if (windowBgPosition) { windowStyles.push(`background-position: ${windowBgPosition};`); }
            if (windowBgRepeat) { windowStyles.push(`background-repeat: ${windowBgRepeat};`); }
            if (windowBgAttachment) { windowStyles.push(`background-attachment: ${windowBgAttachment};`); }
        }
        if (windowStyles.length > 0) {
            cssRules.push(`${chatAreaSelector} { ${windowStyles.join(' ')} }`);

            // patch for Header
            cssRules.push(`#page-header { background: transparent; }`);

            // patch for Share button
            cssRules.push(`${SELECTORS.BUTTON_SHARE_CHAT} { background: transparent; }`);
            cssRules.push(`${SELECTORS.BUTTON_SHARE_CHAT}:hover { background-color: var(--interactive-bg-secondary-hover);}`);
        }

        // --- Chat Input Area Styles ---
        const inputAreaConf = {
            bgColor: baseSet.inputAreaBgColor ?? defaultFullConf.inputAreaBgColor ?? null,
            textColor: baseSet.inputAreaTextColor ?? defaultFullConf.inputAreaTextColor ?? null,
            placeholderColor: baseSet.inputAreaPlaceholderColor ?? defaultFullConf.inputAreaPlaceholderColor ?? null,
        };

        const inputBarSelector = SELECTORS.INPUT_AREA_BG_TARGET;
        const textInputFieldSelector = SELECTORS.INPUT_TEXT_FIELD_TARGET;
        const placeholderSelector = SELECTORS.INPUT_PLACEHOLDER_TARGET;

        let inputBarStyles = [];
        if (inputAreaConf.bgColor) {
            inputBarStyles.push(`background-color: ${inputAreaConf.bgColor};`);
        }
        if (inputBarStyles.length > 0) {
            cssRules.push(`${inputBarSelector} { ${inputBarStyles.join(' ')} }`);
        }

        let textInputFieldStyles = [];
        if (inputAreaConf.textColor) {
            textInputFieldStyles.push(`color: ${inputAreaConf.textColor};`);
        }
        textInputFieldStyles.push(`background-color: transparent;`);

        if (textInputFieldStyles.length > 0) {
            cssRules.push(`${textInputFieldSelector} { ${textInputFieldStyles.join(' ')} }`);
        }

        if (inputAreaConf.placeholderColor) {
            cssRules.push(`${placeholderSelector} { color: ${inputAreaConf.placeholderColor}; }`);
        }

        cssRules.push(`#fixedTextUIRoot, #fixedTextUIRoot * { color: inherit; }`);
        return cssRules.join('\n');
    }

    /**
     * Applies the generated theme CSS to a <style> element in the document head.
     * It only updates the CSS if the themeId (derived from theme content) has changed.
     */
    function applyTheme() {
        if (!state.themeStyleElem) {
            state.themeStyleElem = document.createElement('style');
            state.themeStyleElem.id = 'cpta-theme-style';
            document.head.appendChild(state.themeStyleElem);
        }
        const css = createThemeCSS();
        const baseSet = getThemeSet();
        const userConf = getActorConfig('user', baseSet, state.CPTA_CONFIG.defaultSet);
        const assistantConf = getActorConfig('assistant', baseSet, state.CPTA_CONFIG.defaultSet);
        const defaultFullConf = state.CPTA_CONFIG.defaultSet;

        // same structure as currentThemeContentProps (except: url, project)
        const themeIdParts = [
            userConf.name ?? '',
            userConf.icon ?? '',
            userConf.textcolor ?? '',
            userConf.font ?? '',
            userConf.bubbleBgColor ?? '',
            userConf.bubblePadding ?? '',
            userConf.bubbleBorderRadius ?? '',
            userConf.bubbleMaxWidth ?? '',
            userConf.standingImage ?? '',
            assistantConf.name ?? '',
            assistantConf.icon ?? '',
            assistantConf.textcolor ?? '',
            assistantConf.font ?? '',
            assistantConf.bubbleBgColor ?? '',
            assistantConf.bubblePadding ?? '',
            assistantConf.bubbleBorderRadius ?? '',
            assistantConf.bubbleMaxWidth ?? '',
            assistantConf.standingImage ?? '',
            baseSet.windowBgColor ?? defaultFullConf.windowBgColor ?? '',
            baseSet.windowBgImage ?? defaultFullConf.windowBgImage ?? '',
            baseSet.windowBgSize ?? defaultFullConf.windowBgSize,
            baseSet.windowBgPosition ?? defaultFullConf.windowBgPosition,
            baseSet.windowBgRepeat ?? defaultFullConf.windowBgRepeat,
            baseSet.windowBgAttachment ?? defaultFullConf.windowBgAttachment,
            baseSet.inputAreaBgColor ?? defaultFullConf.inputAreaBgColor ?? '',
            baseSet.inputAreaTextColor ?? defaultFullConf.inputAreaTextColor ?? '',
            baseSet.inputAreaPlaceholderColor ?? defaultFullConf.inputAreaPlaceholderColor ?? '',
        ];
        const themeId = themeIdParts.map(p => String(p ?? '')).join('_');

        if (state.appliedThemeId === themeId) return;
        state.themeStyleElem.textContent = css;
        state.appliedThemeId = themeId;
    }

    // ---- Avatar Management ----
    /**
     * Injects or updates the avatar (icon and name) for a given message element.
     * Uses a data attribute on the message element for caching to avoid redundant updates.
     * @param {HTMLElement} msgElem - The message element with 'data-message-author-role'.
     */
    function injectAvatar(msgElem) {
        const baseSet = getThemeSet();
        const role = msgElem.getAttribute('data-message-author-role');
        if (!role) return;
        const set = getActorConfig(role, baseSet, state.CPTA_CONFIG.defaultSet);

        const cacheKey = JSON.stringify(set);
        if (msgElem.getAttribute('data-cpta-avatar-key') === cacheKey) return;

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
        requestAnimationFrame(() => {
            if (nameDiv.offsetHeight && state.CPTA_CONFIG.options.icon_size) {
                msgWrapper.style.minHeight = (state.CPTA_CONFIG.options.icon_size + nameDiv.offsetHeight) + "px";
            }
        });
        msgElem.setAttribute('data-cpta-avatar-key', cacheKey);
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
        .side-avatar-icon, .side-avatar-icon svg {
            width: ${state.CPTA_CONFIG.options.icon_size}px; height: ${state.CPTA_CONFIG.options.icon_size}px;
            border-radius: 50%; display: block; box-shadow: 0 0 6px rgba(0,0,0,0.2); object-fit: cover;
        }
        .side-avatar-name {
            font-size: 0.75rem; text-align: center; margin-top: 4px; width: 100%;
        }
        .chat-wrapper[data-message-author-role="user"] .side-avatar-container {
            right: calc(-${state.CPTA_CONFIG.options.icon_size}px - ${ICON_MARGIN}px);
        }
        .chat-wrapper[data-message-author-role="assistant"] .side-avatar-container {
            left: calc(-${state.CPTA_CONFIG.options.icon_size}px - ${ICON_MARGIN}px);
        }`;
        document.head.appendChild(avatarStyle);
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
     * @param {string|null} userImgUrl - URL for the user's standing image.
     * @param {string|null} assistantImgUrl - URL for the assistant's standing image.
     */
    function updateStandingImages(userImgUrl, assistantImgUrl) {
        const userImgId = 'cpta-standing-image-user';
        const assistantImgId = 'cpta-standing-image-assistant';
        let userImg = document.getElementById(userImgId);
        let assistantImg = document.getElementById(assistantImgId);

        const setupImage = (imgElement, imgId, imgUrl) => {
            let el = imgElement;
            if (imgUrl) {
                if (!el) {
                    el = document.createElement('img');
                    el.id = imgId;
                    document.body.appendChild(el);
                }
                el.src = imgUrl;
                Object.assign(el.style, {
                    display: 'block',
                    position: 'fixed',
                    bottom: '0px',
                    height: 'auto',
                    maxHeight: '100vh',
                    //width: 'auto',
                    //maxWidth: '100vw',
                    objectFit: 'contain',
                    zIndex: String(STANDING_IMAGE_Z_INDEX),
                    pointerEvents: 'none',
                    margin: '0',
                    padding: '0',
                    left: '',
                    right: '',
                    top: ''
                });
            } else if (el) {
                el.style.display = 'none';
                el.src = '';
            }
            return el;
        };

        userImg = setupImage(userImg, userImgId, userImgUrl);
        assistantImg = setupImage(assistantImg, assistantImgId, assistantImgUrl);

        // chat area
        const chatContent = document.querySelector(typeof SELECTORS !== "undefined" ? SELECTORS.CHAT_CONTENT_MAX_WIDTH : "");
        if (!chatContent) {
            if (userImg) userImg.style.display = 'none';
            if (assistantImg) assistantImg.style.display = 'none';

            // Retry process (to deal with the problem of the character portrait not being displayed immediately after reloading)
            if (typeof standingImagesRetryCount !== "undefined" && typeof MAX_STANDING_IMAGES_RETRIES !== "undefined" && typeof debouncedRecalculateStandingImagesLayout === "function") {
                if (standingImagesRetryCount < MAX_STANDING_IMAGES_RETRIES) {
                    standingImagesRetryCount++;
                    setTimeout(() => {
                        debouncedRecalculateStandingImagesLayout();
                    }, typeof STANDING_IMAGES_RETRY_INTERVAL !== "undefined" ? STANDING_IMAGES_RETRY_INTERVAL : 400);
                } else {
                    console.log('[CPTA Debug] updateStandingImages: Max retries reached for chatContent.');
                    standingImagesRetryCount = 0;
                }
            }
            return;
        }
        if (typeof standingImagesRetryCount !== "undefined") standingImagesRetryCount = 0;

        const chatRect = chatContent.getBoundingClientRect();
        const sidebarWidth = getSidebarWidth();
        const windowWidth = window.innerWidth;

        // A function that creates a transparent mask on top of an image (if the image height is greater than the screen height)
        function applyStandingImageMask(img) {
            if (!img) return;
            const apply = () => {
                const visibleHeight = img.offsetHeight;
                const windowHeight = window.innerHeight;
                const maskVal = "linear-gradient(to bottom, transparent 0px, rgba(0,0,0,1) 60px, rgba(0,0,0,1) 100%)";
                if (visibleHeight >= (windowHeight - 32)) {
                    img.style.maskImage = maskVal;
                    img.style.webkitMaskImage = maskVal;
                } else {
                    img.style.maskImage = "";
                    img.style.webkitMaskImage = "";
                }
            };
            if (img.complete && img.naturalWidth > 0) {
                requestAnimationFrame(apply);
            } else {
                img.onload = () => requestAnimationFrame(apply);
            }
        }

        // Assistant standing image (left aligned)
        if (assistantImg && assistantImgUrl) {
            assistantImg.style.left = sidebarWidth + 'px';
            assistantImg.style.right = '';
            assistantImg.style.top = '';
            assistantImg.style.maxWidth = Math.max(0, chatRect.left - (sidebarWidth + state.CPTA_CONFIG.options.icon_size + (ICON_MARGIN) * 2)) + 'px';
            assistantImg.style.width = Math.max(0, chatRect.left - (sidebarWidth + state.CPTA_CONFIG.options.icon_size + (ICON_MARGIN) * 2)) + 'px';

            // transparent mask
            applyStandingImageMask(assistantImg);

        }

        // User standing image (right aligned)
        if (userImg && userImgUrl) {
            userImg.style.right = '0px';
            userImg.style.left = '';
            userImg.style.top = '';
            userImg.style.maxWidth = Math.max(0, windowWidth - chatRect.right - (state.CPTA_CONFIG.options.icon_size + (ICON_MARGIN) * 2)) + 'px';
            userImg.style.width = Math.max(0, windowWidth - chatRect.right - (state.CPTA_CONFIG.options.icon_size + (ICON_MARGIN) * 2)) + 'px';

            // transparent mask
            applyStandingImageMask(userImg);
        }
    }

    /**
     * Debounced function to recalculate and update the layout of standing images.
     * Typically called on window resize or sidebar resize.
     */
    const debouncedRecalculateStandingImagesLayout = debounce(() => {
        standingImagesRetryCount = 0;
        // Recalculate based on current config, in case only layout changed
        const currentTheme = getThemeSet();
        const userConf = getActorConfig('user', currentTheme, state.CPTA_CONFIG.defaultSet);
        const assistantConf = getActorConfig('assistant', currentTheme, state.CPTA_CONFIG.defaultSet);
        updateStandingImages(userConf.standingImage, assistantConf.standingImage);
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
     * It also updates the `state.lastURL`, `state.lastProject`, and `state.lastAppliedThemeProps`.
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

        const baseSet = getThemeSet();
        const userConf = getActorConfig('user', baseSet, state.CPTA_CONFIG.defaultSet);
        const assistantConf = getActorConfig('assistant', baseSet, state.CPTA_CONFIG.defaultSet);
        const defaultFullConf = state.CPTA_CONFIG.defaultSet;

        // same structure as user config (except: url, project)
        const currentThemeContentProps = {
            userName: userConf.name ?? '',
            userIcon: userConf.icon ?? '',
            userColor: userConf.textcolor ?? '',
            userFont: userConf.font ?? '',
            userBubbleBgColor: userConf.bubbleBgColor ?? '',
            userBubbleBorderRadius: userConf.bubbleBorderRadius ?? '',
            userBubbleMaxWidth: userConf.bubbleMaxWidth ?? '',
            userBubblePadding: userConf.bubblePadding ?? '',
            userStandingImage: userConf.standingImage ?? '',
            assistantName: assistantConf.name ?? '',
            assistantIcon: assistantConf.icon ?? '',
            assistantBubbleBgColor: assistantConf.bubbleBgColor ?? '',
            assistantBubbleBorderRadius: assistantConf.bubbleBorderRadius ?? '',
            assistantBubbleMaxWidth: assistantConf.bubbleMaxWidth ?? '',
            assistantBubblePadding: assistantConf.bubblePadding ?? '',
            assistantColor: assistantConf.textcolor ?? '',
            assistantFont: assistantConf.font ?? '',
            assistantStandingImage: assistantConf.standingImage ?? '',
            windowBgColor: baseSet.windowBgColor ?? defaultFullConf.windowBgColor ?? '',
            windowBgImage: baseSet.windowBgImage ?? defaultFullConf.windowBgImage ?? '',
            windowBgSize: baseSet.windowBgSize ?? defaultFullConf.windowBgSize ?? '',
            windowBgPosition: baseSet.windowBgPosition ?? defaultFullConf.windowBgPosition ?? '',
            windowBgRepeat: baseSet.windowBgRepeat ?? defaultFullConf.windowBgRepeat ?? '',
            windowBgAttachment: baseSet.windowBgAttachment ?? defaultFullConf.windowBgAttachment ?? '',
            inputAreaBgColor: baseSet.inputAreaBgColor ?? defaultFullConf.inputAreaBgColor ?? '',
            inputAreaTextColor: baseSet.inputAreaTextColor ?? defaultFullConf.inputAreaTextColor ?? '',
            inputAreaPlaceholderColor: baseSet.inputAreaPlaceholderColor ?? defaultFullConf.inputAreaPlaceholderColor ?? '',
        };

        const previousThemeContentProps = state.lastAppliedThemeProps || {};
        let contentChanged = false;

        for (const key in currentThemeContentProps) {
            const currentVal = (currentThemeContentProps[key] === null || currentThemeContentProps[key] === undefined) ? '' : String(currentThemeContentProps[key]);
            const lastVal = (previousThemeContentProps[key] === null || previousThemeContentProps[key] === undefined) ? '' : String(previousThemeContentProps[key]);
            if (currentVal !== lastVal) {
                contentChanged = true;
                break;
            }
        }

        if (!contentChanged) {
            for (const key in previousThemeContentProps) {
                if (!currentThemeContentProps.hasOwnProperty(key)) {
                    contentChanged = true;
                    break;
                }
            }
        }

        const themeShouldUpdate = urlChanged || projectChanged || contentChanged;

        // console.log('[CPTA Debug] updateTheme: urlChanged:', urlChanged, 'projectChanged:', projectChanged, 'contentChanged:', contentChanged, 'themeShouldUpdate:', themeShouldUpdate);

        if (themeShouldUpdate) {
            applyTheme();
            updateStandingImages(userConf.standingImage, assistantConf.standingImage);
            document.querySelectorAll('[data-message-author-role]').forEach(msgElem => {
                injectAvatar(msgElem);
            });

            if (contentChanged) {
                state.lastAppliedThemeProps = { ...currentThemeContentProps };
            }
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
                { selector: SELECTORS.MESSAGE_AUTHOR_ROLE_ATTR, desc: "任意のメッセージ要素 (アバター注入対象)" }, // 属性セレクタなのでquerySelectorの使い方が少し異なるが、ここではセレクタ文字列として
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