// ==UserScript==
// @name         ChatGPT Project Theme Automator
// @namespace    https://github.com/p65536
// @version      1.2.3
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
    // Description: Defines default settings, global constants, and CSS selectors.
    // =================================================================================

    // ---- Default Settings & Theme Configuration ----
    const CONSTANTS = {
        CONFIG_KEY: 'cpta_config',
        ICON_SIZE: 64,
        ICON_MARGIN: 16,
        RETRY: {
            MAX_STANDING_IMAGES: 10,
            STANDING_IMAGES_INTERVAL: 250,
        },
        Z_INDICES: {
            SETTINGS_BUTTON: 10000,
            SETTINGS_PANEL: 11000,
            THEME_MODAL: 12000,
            JSON_MODAL: 15000,
            STANDING_IMAGE: 'auto',
            BUBBLE_NAVIGATION: 'auto',
        },
        MODAL: {
            WIDTH: 440,
            PADDING: 4,
            RADIUS: 8,
            BTN_RADIUS: 5,
            BTN_FONT_SIZE: 13,
            BTN_PADDING: '5px 16px',
            TITLE_MARGIN_BOTTOM: 8,
            BTN_GROUP_GAP: 8,
            TEXTAREA_HEIGHT: 200,
        },
        SELECTORS: {
            // --- Selectors for messages ---
            USER_MESSAGE: 'div[data-message-author-role="user"]',
            ASSISTANT_MESSAGE: 'div[data-message-author-role="assistant"]',

            // --- Class Name Constants ---
            CLASS_WHITESPACE_PRE_WRAP: 'whitespace-pre-wrap',
            CLASS_MARKDOWN: 'markdown',

            // --- Custom Class Selectors (to be added by JS) ---
            // These are robust against UI changes from ChatGPT side.
            USER_BUBBLE: '.cpta-user-bubble',
            ASSISTANT_MD_BUBBLE: '.cpta-assistant-md-bubble',
            ASSISTANT_PRE_BUBBLE: '.cpta-assistant-pre-bubble',

            // --- Selectors for finding elements to tag ---
            RAW_USER_BUBBLE: 'div:has(> .whitespace-pre-wrap)',
            RAW_ASSISTANT_MD_BUBBLE: 'div:has(> .markdown)',
            RAW_ASSISTANT_PRE_BUBBLE: 'div:has(> .whitespace-pre-wrap)',

            // --- Other UI Selectors ---
            SIDEBAR_WIDTH_TARGET: 'div[id="stage-slideover-sidebar"]',
            CHAT_CONTENT_MAX_WIDTH: 'div[class*="--thread-content-max-width"]',
            CHAT_MAIN_AREA_BG_TARGET: 'main#main',
            BUTTON_SHARE_CHAT: '[data-testid="share-chat-button"]',
            INPUT_AREA_BG_TARGET: 'form[data-type="unified-composer"] > div:first-child',
            INPUT_TEXT_FIELD_TARGET: 'div.ProseMirror#prompt-textarea',
            INPUT_PLACEHOLDER_TARGET: 'div.ProseMirror#prompt-textarea p.placeholder[data-placeholder]',
            TITLE_OBSERVER_TARGET: 'title',
        }
    };

    // Add dependent properties to the SELECTORS object after its initial definition.
    CONSTANTS.SELECTORS.USER_TEXT_CONTENT_CSS_TARGET = `${CONSTANTS.SELECTORS.USER_MESSAGE} .${CONSTANTS.SELECTORS.CLASS_WHITESPACE_PRE_WRAP}`;
    CONSTANTS.SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET = `${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} .${CONSTANTS.SELECTORS.CLASS_MARKDOWN}`;
    CONSTANTS.SELECTORS.ASSISTANT_WHITESPACE_CSS_TARGET = `${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} .${CONSTANTS.SELECTORS.CLASS_WHITESPACE_PRE_WRAP}`;

    /**
     * @typedef {object} ActorConfig
     * @property {string | null} name
     * @property {string | null} icon
     * @property {string | null} textColor
     * @property {string | null} font
     * @property {string | null} bubbleBackgroundColor
     * @property {string | null} bubblePadding
     * @property {string | null} bubbleBorderRadius
     * @property {string | null} bubbleMaxWidth
     * @property {string | null} standingImageUrl
     */

    /**
     * @typedef {object} ThemeSet
     * @property {{id: string, name: string, matchPatterns: string[]}} metadata
     * @property {ActorConfig} user
     * @property {ActorConfig} assistant
     * @property {{backgroundColor: string | null, backgroundImageUrl: string | null, backgroundSize: string | null, backgroundPosition: string | null, backgroundRepeat: string | null, backgroundAttachment: string | null}} window
     * @property {{backgroundColor: string | null, textColor: string | null, placeholderColor: string | null}} inputArea
     */

    /**
     * @typedef {object} CPTAConfig
     * @property {{icon_size: number, chat_content_max_width: string | null}} options
     * @property {{collapsible_button: {enabled: boolean, display_threshold_multiplier: number}, scroll_to_top_button: {enabled: boolean, display_threshold_multiplier: number}, sequential_nav_buttons: {enabled: boolean}}} features
     * @property {ThemeSet[]} themeSets
     * @property {Omit<ThemeSet, 'metadata'>} defaultSet
     */

    /** @type {CPTAConfig} */
    const DEFAULT_THEME_CONFIG = {
        options: {
            icon_size: CONSTANTS.ICON_SIZE,
            chat_content_max_width: null
        },
        features: {
            collapsible_button: {
                enabled: true,
                display_threshold_multiplier: 2
            },
            scroll_to_top_button: {
                enabled: true,
                display_threshold_multiplier: 2
            },
            sequential_nav_buttons: {
                enabled: true
            }
        },
        themeSets: [
            {
                metadata: {
                    id: 'cpta-theme-example-1',
                    name: 'Project Example',
                    matchPatterns: ["/project1/i"]
                },
                assistant: {
                    name: null,
                    icon: null,
                    textColor: null,
                    font: null,
                    bubbleBackgroundColor: null,
                    bubblePadding: null,
                    bubbleBorderRadius: null,
                    bubbleMaxWidth: null,
                    standingImageUrl: null
                },
                user: {
                    name: null,
                    icon: null,
                    textColor: null,
                    font: null,
                    bubbleBackgroundColor: null,
                    bubblePadding: null,
                    bubbleBorderRadius: null,
                    bubbleMaxWidth: null,
                    standingImageUrl: null
                },
                window: {
                    backgroundColor: null,
                    backgroundImageUrl: null,
                    backgroundSize: null,
                    backgroundPosition: null,
                    backgroundRepeat: null,
                    backgroundAttachment: null
                },
                inputArea: {
                    backgroundColor: null,
                    textColor: null,
                    placeholderColor: null
                }
            }
        ],
        defaultSet: {
            assistant: {
                name: 'ChatGPT',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19.94,9.06C19.5,5.73,16.57,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48C3.74,13.14,4.22,14,5,14h1l0,2c0,1.1,0.9,2,2,2h1 v3h7l0-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5 c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/><path d="M12.5,12.54c-0.41,0-0.74,0.31-0.74,0.73c0,0.41,0.33,0.74,0.74,0.74c0.42,0,0.73-0.33,0.73-0.74 C13.23,12.85,12.92,12.54,12.5,12.54z"/><path d="M12.5,7c-1.03,0-1.74,0.67-2,1.45l0.96,0.4c0.13-0.39,0.43-0.86,1.05-0.86c0.95,0,1.13,0.89,0.8,1.36 c-0.32,0.45-0.86,0.75-1.14,1.26c-0.23,0.4-0.18,0.87-0.18,1.16h1.06c0-0.55,0.04-0.65,0.13-0.82c0.23-0.42,0.65-0.62,1.09-1.27 c0.4-0.59,0.25-1.38-0.01-1.8C13.95,7.39,13.36,7,12.5,7z"/></g></g></svg>',
                textColor: null,
                font: null,
                bubbleBackgroundColor: null,
                bubblePadding: "6px 10px",
                bubbleBorderRadius: "10px",
                bubbleMaxWidth: null,
                standingImageUrl: null
            },
            user: {
                name: 'You',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
                textColor: null,
                font: null,
                bubbleBackgroundColor: null,
                bubblePadding: "6px 10px",
                bubbleBorderRadius: "10px",
                bubbleMaxWidth: null,
                standingImageUrl: null
            },
            window: {
                backgroundColor: null,
                backgroundImageUrl: null,
                backgroundSize: "cover",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "scroll"
            },
            inputArea: {
                backgroundColor: null,
                textColor: null,
                placeholderColor: null
            }
        }
    };

    // =================================================================================
    // SECTION: Utility Functions
    // Description: General helper functions used across the script.
    // =================================================================================

    /**
     * @param {Function} func
     * @param {number} delay
     * @returns {Function}
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Waits for a specific element to appear in the DOM using MutationObserver for efficiency.
     * @param {string} selector The CSS selector for the element.
     * @param {object} [options]
     * @param {number} [options.timeout=10000] The maximum time to wait in milliseconds.
     * @returns {Promise<HTMLElement | null>} A promise that resolves with the element or null if timed out.
     */
    function waitForElement(selector, { timeout = 10000 } = {}) {
        return new Promise((resolve) => {
            // First, check if the element already exists.
            const el = document.querySelector(selector);
            if (el) {
                return resolve(el);
            }

            const observer = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) {
                    observer.disconnect();
                    clearTimeout(timer);
                    resolve(found);
                }
            });

            const timer = setTimeout(() => {
                observer.disconnect();
                console.warn(`[CPTA] Timed out after ${timeout}ms waiting for element "${selector}"`);
                resolve(null);
            }, timeout);

            observer.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
        });
    }

    /**
     * @param {string | null} icon
     * @returns {string}
     */
    function createIconCssUrl(icon) {
        if (!icon) return 'none';
        if (/^<svg\b/i.test(icon.trim())) {
            const encodedSvg = encodeURIComponent(
                icon
                .replace(/"/g, "'")
                .replace(/\s+/g, ' ')
            ).replace(/[()]/g, (c) => `%${c.charCodeAt(0).toString(16)}`);
            return `url("data:image/svg+xml,${encodedSvg}")`;
        }
        return `url(${icon})`;
    }

    /**
     * @param {string | null} value
     * @returns {string | null}
     */
    function formatCssBgImageValue(value) {
        if (!value) return null;
        const trimmedVal = String(value).trim();
        if (/^[a-z-]+\(.*\)$/i.test(trimmedVal)) {
            return trimmedVal;
        }
        const escapedVal = trimmedVal.replace(/"/g, '\\"');
        return `url("${escapedVal}")`;
    }

    /**
     * Helper function to check if an item is a non-array object.
     * @param {*} item The item to check.
     * @returns {boolean}
     */
    function isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item));
    }

    /**
     * Recursively merges the properties of a source object into a target object.
     * The target object is mutated. This is ideal for merging a partial user config into a complete default config.
     * @param {object} target The target object (e.g., a deep copy of default config).
     * @param {object} source The source object (e.g., user config).
     * @returns {object} The mutated target object.
     */
    function deepMerge(target, source) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceVal = source[key];
                if (isObject(sourceVal) && Object.prototype.hasOwnProperty.call(target, key) && isObject(target[key])) {
                    // If both are objects, recurse
                    deepMerge(target[key], sourceVal);
                } else if (typeof sourceVal !== 'undefined') {
                    // Otherwise, overwrite or set the value from the source
                    target[key] = sourceVal;
                }
            }
        }
        return target;
    }

    /**
     * Generates a unique ID string.
     * @returns {string}
     */
    function generateUniqueId() {
        return 'cpta-theme-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Gets the current width of the sidebar.
     * @returns {number}
     */
    function getSidebarWidth() {
        const sidebar = document.querySelector(CONSTANTS.SELECTORS.SIDEBAR_WIDTH_TARGET);
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
     * @namespace ColorUtils
     * @description A collection of utility functions for color conversion and parsing.
     */
    const ColorUtils = {
        /**
         * Converts HSV color values to RGB.
         * @param {number} h - Hue (0-360)
         * @param {number} s - Saturation (0-100)
         * @param {number} v - Value (0-100)
         * @returns {{r: number, g: number, b: number}} RGB object (0-255).
         */
        hsvToRgb(h, s, v) {
            s /= 100; v /= 100;
            let r, g, b;
            const i = Math.floor(h / 60);
            const f = (h / 60) - i, p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
            switch (i % 6) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                case 5: r = v; g = p; b = q; break;
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        },

        /**
         * Converts RGB color values to HSV.
         * @param {number} r - Red (0-255)
         * @param {number} g - Green (0-255)
         * @param {number} b - Blue (0-255)
         * @returns {{h: number, s: number, v: number}} HSV object.
         */
        rgbToHsv(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, v = max;
            const d = max - min;
            s = max === 0 ? 0 : d / max;
            if (max === min) { h = 0; }
            else {
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
        },

        /**
         * Converts an RGB object to a CSS rgb() or rgba() string with modern space-separated syntax.
         * @param {number} r - Red (0-255)
         * @param {number} g - Green (0-255)
         * @param {number} b - Blue (0-255)
         * @param {number} [a=1] - Alpha (0-1)
         * @returns {string} CSS color string.
         */
        rgbToString(r, g, b, a = 1) {
            if (a < 1) {
                return `rgb(${r} ${g} ${b} / ${a.toFixed(2).replace(/\.?0+$/, '') || 0})`;
            }
            return `rgb(${r} ${g} ${b})`;
        },

        /**
         * Parses a color string into an RGBA object. Handles various CSS color formats.
         * @param {string | null} str - The CSS color string.
         * @returns {{r: number, g: number, b: number, a: number} | null} RGBA object or null if invalid.
         */
        parseColorString(str) {
            if (!str || String(str).trim() === '') return null;
            const s = String(str).trim();

            // Check for balanced parentheses in function-like color strings like rgb() or hsl()
            if (/^(rgb|rgba|hsl|hsla)\(/.test(s)) {
                const openParenCount = (s.match(/\(/g) || []).length;
                const closeParenCount = (s.match(/\)/g) || []).length;
                if (openParenCount !== closeParenCount) {
                    return null; // Return null if parentheses are not balanced
                }
            }

            const temp = document.createElement('div');
            // Set a known invalid color to see if the browser can override it.
            temp.style.color = 'initial';
            temp.style.color = s;

            // If the browser could not parse the string `s`, `temp.style.color` will be empty string or 'initial'.
            // This is a more reliable way to check for validity than getComputedStyle alone.
            if (temp.style.color === '' || temp.style.color === 'initial') {
                return null;
            }

            // To get the RGBA values, we must append it to the DOM.
            document.body.appendChild(temp);
            const computedColor = window.getComputedStyle(temp).color;
            document.body.removeChild(temp);

            const rgbaMatch = computedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
            if (rgbaMatch) {
                return {
                    r: parseInt(rgbaMatch[1], 10),
                    g: parseInt(rgbaMatch[2], 10),
                    b: parseInt(rgbaMatch[3], 10),
                    a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
                };
            }
            return null;
        }
    }

    // =================================================================================
    // SECTION: Event-Driven Architecture (Pub/Sub)
    // Description: A simple event bus for decoupled communication between classes.
    // =================================================================================

    const EventBus = {
        events: {},
        /**
         * @param {string} event
         * @param {Function} listener
         */
        subscribe(event, listener) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
        },
        /**
         * @param {string} event
         * @param {any} [data]
         */
        publish(event, data) {
            if (!this.events[event]) {
                return;
            }
            this.events[event].forEach(listener => listener(data));
        }
    };
    // =================================================================================
    // SECTION: Configuration Management (GM Storage)
    // =================================================================================

    class ConfigManager {
        constructor() {
            /** @type {CPTAConfig | null} */
            this.config = null;
        }

        /**
         * Ensures all themes have a unique themeId.
         * @private
         */
        _ensureUniqueThemeIds() {
            if (!this.config || !Array.isArray(this.config.themeSets)) return;
            const seenIds = new Set();
            this.config.themeSets.forEach(theme => {
                const id = theme.metadata?.id;
                // Assign a new ID if it's missing, not a string, empty, or a duplicate.
                if (typeof id !== 'string' || id.trim() === '' || seenIds.has(id)) {
                    if (!theme.metadata) theme.metadata = {};
                    theme.metadata.id = generateUniqueId();
                }
                seenIds.add(theme.metadata.id);
            });
        }

        async load() {
            let userConfig = {};
            try {
                const raw = await GM_getValue(CONSTANTS.CONFIG_KEY);
                if (raw) {
                    userConfig = JSON.parse(raw);
                }
            } catch (e) {
                console.error('[CPTA] Failed to parse saved config. Using default config. Error:', e);
                this.config = JSON.parse(JSON.stringify(DEFAULT_THEME_CONFIG));
                return;
            }

            // Create a complete config object by merging user settings into a deep copy of the defaults.
            // This ensures this.config always has a complete structure.
            const completeConfig = JSON.parse(JSON.stringify(DEFAULT_THEME_CONFIG));
            this.config = deepMerge(completeConfig, userConfig);
            // Add safeguard to ensure all themeIds are present and unique.
            this._ensureUniqueThemeIds();
        }

        /** @param {CPTAConfig} obj */
        async save(obj) {
            this.config = obj;
            await GM_setValue(CONSTANTS.CONFIG_KEY, JSON.stringify(obj));
        }

        /** @returns {CPTAConfig | null} */
        get() {
            return this.config;
        }

        /**
         * @returns {number}
         */
        getIconSize() {
            return this.config.options.icon_size;
        }
    }

    // =================================================================================
    // SECTION: Theme and Style Management
    // =================================================================================

    /**
     * Data-driven CSS generation
     * - This map defines the relationship between config properties and CSS rules.
     * - To add a new style, you only need to add an entry here, not change the logic.
     */
    const STYLE_RULE_MAP = {
        user: {
            textColor: {
                selector: CONSTANTS.SELECTORS.USER_TEXT_CONTENT_CSS_TARGET,
                property: 'color',
                varName: 'user-textColor'
            },
            font: {
                selector: CONSTANTS.SELECTORS.USER_TEXT_CONTENT_CSS_TARGET,
                property: 'font-family',
                varName: 'user-font'
            },
            bubbleBackgroundColor: {
                selector: `${CONSTANTS.SELECTORS.USER_MESSAGE} ${CONSTANTS.SELECTORS.RAW_USER_BUBBLE}`,
                property: 'background-color',
                varName: 'user-bubble-bg'
            },
            bubblePadding: {
                selector: `${CONSTANTS.SELECTORS.USER_MESSAGE} ${CONSTANTS.SELECTORS.RAW_USER_BUBBLE}`,
                property: 'padding',
                varName: 'user-bubble-padding'
            },
            bubbleBorderRadius: {
                selector: `${CONSTANTS.SELECTORS.USER_MESSAGE} ${CONSTANTS.SELECTORS.RAW_USER_BUBBLE}`,
                property: 'border-radius',
                varName: 'user-bubble-radius'
            }
        },
        assistant: {
            textColor: {
                selector: [CONSTANTS.SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET, CONSTANTS.SELECTORS.ASSISTANT_WHITESPACE_CSS_TARGET],
                property: 'color',
                varName: 'assistant-textColor'
            },
            font: {
                selector: [CONSTANTS.SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET, CONSTANTS.SELECTORS.ASSISTANT_WHITESPACE_CSS_TARGET],
                property: 'font-family',
                varName: 'assistant-font'
            },
            bubbleBackgroundColor: {
                selector: [`${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE}`, `${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE}`],
                property: 'background-color',
                varName: 'assistant-bubble-bg'
            },
            bubblePadding: {
                selector: [`${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE}`, `${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE}`],
                property: 'padding',
                varName: 'assistant-bubble-padding'
            },
            bubbleBorderRadius: {
                selector: [`${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE}`, `${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} ${CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE}`],
                property: 'border-radius',
                varName: 'assistant-bubble-radius'
            },
        },
        inputArea: {
            textColor: {
                selector: CONSTANTS.SELECTORS.INPUT_TEXT_FIELD_TARGET,
                property: 'color',
                varName: 'input-color'
            },
            placeholderColor: {
                selector: CONSTANTS.SELECTORS.INPUT_PLACEHOLDER_TARGET,
                property: 'color',
                varName: 'input-ph-color'
            }
        }
    };

    class StyleGenerator {
        /**
         * @param {ConfigManager} configManager
         */
        constructor(configManager) {
            this.configManager = configManager;
        }

        /**
         * Creates the static CSS template.
         * @returns {string}
         */
        generateStaticCss() {
            return `
                ${CONSTANTS.SELECTORS.USER_BUBBLE},
                ${CONSTANTS.SELECTORS.ASSISTANT_MD_BUBBLE},
                ${CONSTANTS.SELECTORS.ASSISTANT_PRE_BUBBLE} {
                    box-sizing: border-box;
                }
                #page-header,
                ${CONSTANTS.SELECTORS.BUTTON_SHARE_CHAT} {
                    background: transparent;
                }
                ${CONSTANTS.SELECTORS.BUTTON_SHARE_CHAT}:hover {
                    background-color: var(--interactive-bg-secondary-hover);
                }
                #fixedTextUIRoot, #fixedTextUIRoot * {
                    color: inherit;
                }
                ${CONSTANTS.SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} {
                    overflow-x: auto;
                    padding-bottom: 8px;
                }
                ${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} div[class*="tableContainer"],
                ${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} div[class*="tableWrapper"] {
                    width: auto;
                    overflow-x: auto;
                    box-sizing: border-box;
                    display: block;
                }
                /* (2025/07/01) ChatGPT UI change fix: Remove bottom gradient that conflicts with theme backgrounds.
                 */
                .content-fade::after {
                    background: none !important;
                }
            `;
        }

        /**
         * Builds dynamic CSS rules based on the theme.
         * @param {ThemeSet} baseSet
         * @param {ActorConfig} userConf
         * @param {ActorConfig} assistantConf
         * @returns {string[]}
         */
        generateDynamicCss(baseSet, userConf, assistantConf) {
            const dynamicRules = [];
            const configs = { user: userConf, assistant: assistantConf, inputArea: baseSet.inputArea };
            for (const group in STYLE_RULE_MAP) {
                for (const prop in STYLE_RULE_MAP[group]) {
                    if (configs[group] && configs[group][prop]) {
                        const rule = STYLE_RULE_MAP[group][prop];
                        const selectors = Array.isArray(rule.selector) ? rule.selector.join(', ') : rule.selector;
                        dynamicRules.push(`${selectors} { ${rule.property}: var(--cpta-${rule.varName}); }`);
                    }
                }
            }

            if (userConf.bubbleMaxWidth) {
                dynamicRules.push(`${CONSTANTS.SELECTORS.USER_BUBBLE} { max-width: var(--cpta-user-bubble-maxwidth); margin-left: var(--cpta-user-bubble-margin-left); margin-right: var(--cpta-user-bubble-margin-right); }`);
            }

            if (assistantConf.bubbleMaxWidth) {
                const assistantBubbleSelector = `${CONSTANTS.SELECTORS.ASSISTANT_MD_BUBBLE}, ${CONSTANTS.SELECTORS.ASSISTANT_PRE_BUBBLE}`;
                dynamicRules.push(`
                  ${assistantBubbleSelector} {
                    max-width: var(--cpta-assistant-bubble-maxwidth);
                    margin-right: var(--cpta-assistant-margin-right);
                    margin-left: var(--cpta-assistant-margin-left);
                  }
                `);
            }
            if (assistantConf.textColor) {
                const childSelectors = [
                    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul li',
                    'ol li', 'ul li::marker', 'ol li::marker', 'strong',
                    'em', 'blockquote', 'table', 'th', 'td'
                ];
                const fullSelectors = childSelectors.map(s => `${CONSTANTS.SELECTORS.ASSISTANT_MARKDOWN_CSS_TARGET} ${s}`);
                dynamicRules.push(`${fullSelectors.join(', ')} { color: var(--cpta-assistant-textColor); }`);
            }

            if (baseSet.window?.backgroundColor) {
                dynamicRules.push(`${CONSTANTS.SELECTORS.CHAT_MAIN_AREA_BG_TARGET} { background-color: var(--cpta-window-bg-color); }`);
            }
            if (baseSet.window?.backgroundImageUrl) {
                dynamicRules.push(`
                  ${CONSTANTS.SELECTORS.CHAT_MAIN_AREA_BG_TARGET} {
                    background-image: var(--cpta-window-bg-image);
                    background-size: var(--cpta-window-bg-size);
                    background-position: var(--cpta-window-bg-pos);
                    background-repeat: var(--cpta-window-bg-repeat);
                    background-attachment: var(--cpta-window-bg-attach);
                  }
                `);
            }

            if (baseSet.inputArea?.backgroundColor) {
                dynamicRules.push(`${CONSTANTS.SELECTORS.INPUT_AREA_BG_TARGET} { background-color: var(--cpta-input-bg); }`);
                dynamicRules.push(`${CONSTANTS.SELECTORS.INPUT_TEXT_FIELD_TARGET} { background-color: transparent; }`);
            }

            // Only apply the max-width rule if the user has set a value.
            const userMaxWidthSetting = this.configManager.get()?.options.chat_content_max_width;
            if (userMaxWidthSetting) {
                dynamicRules.push(`${CONSTANTS.SELECTORS.CHAT_CONTENT_MAX_WIDTH} { max-width: var(--cpta-chat-content-max-width); }`);
            }

            return dynamicRules;
        }


        /**
         * Generates an object of all CSS variables for the theme.
         * @param {ThemeSet} baseSet
         * @param {ActorConfig} userConf
         * @param {ActorConfig} assistantConf
         * @param {ThemeSet} defaultFullConf
         * @returns {Object<string, string|null>} Key-value pairs of CSS variables.
         */
        generateThemeVariables(baseSet, userConf, assistantConf, defaultFullConf) {
            const themeVars = {
                '--cpta-user-name': userConf.name ? `'${userConf.name.replace(/'/g, "\\'")}'` : null,
                '--cpta-user-icon': createIconCssUrl(userConf.icon),
                '--cpta-user-textColor': userConf.textColor ?? null,
                '--cpta-user-font': userConf.font ?? null,
                '--cpta-user-bubble-bg': userConf.bubbleBackgroundColor ?? null,
                '--cpta-user-bubble-padding': userConf.bubblePadding ?? null,
                '--cpta-user-bubble-radius': userConf.bubbleBorderRadius ?? null,
                '--cpta-user-bubble-maxwidth': userConf.bubbleMaxWidth ?? null,
                '--cpta-user-bubble-margin-left': userConf.bubbleMaxWidth ? 'auto' : null,
                '--cpta-user-bubble-margin-right': userConf.bubbleMaxWidth ? '0' : null,
                '--cpta-assistant-name': assistantConf.name ? `'${assistantConf.name.replace(/'/g, "\\'")}'` : null,
                '--cpta-assistant-icon': createIconCssUrl(assistantConf.icon),
                '--cpta-assistant-textColor': assistantConf.textColor ?? null,
                '--cpta-assistant-font': assistantConf.font ?? null,
                '--cpta-assistant-bubble-bg': assistantConf.bubbleBackgroundColor ?? null,
                '--cpta-assistant-bubble-padding': assistantConf.bubblePadding ?? null,
                '--cpta-assistant-bubble-radius': assistantConf.bubbleBorderRadius ?? null,
                '--cpta-assistant-bubble-maxwidth': assistantConf.bubbleMaxWidth ?? null,
                '--cpta-assistant-margin-right': assistantConf.bubbleMaxWidth ? 'auto' : null,
                '--cpta-assistant-margin-left': assistantConf.bubbleMaxWidth ? '0' : null,
                '--cpta-window-bg-color': baseSet.window?.backgroundColor ?? defaultFullConf.window?.backgroundColor,
                '--cpta-window-bg-image': formatCssBgImageValue(baseSet.window?.backgroundImageUrl ?? defaultFullConf.window?.backgroundImageUrl),
                '--cpta-window-bg-size': baseSet.window?.backgroundSize ?? defaultFullConf.window?.backgroundSize,
                '--cpta-window-bg-pos': baseSet.window?.backgroundPosition ?? defaultFullConf.window?.backgroundPosition,
                '--cpta-window-bg-repeat': baseSet.window?.backgroundRepeat ?? defaultFullConf.window?.backgroundRepeat,
                '--cpta-window-bg-attach': baseSet.window?.backgroundAttachment ?? defaultFullConf.window?.backgroundAttachment,
                '--cpta-input-bg': baseSet.inputArea?.backgroundColor ?? defaultFullConf.inputArea?.backgroundColor,
                '--cpta-input-color': baseSet.inputArea?.textColor ?? defaultFullConf.inputArea?.textColor,
                '--cpta-input-ph-color': baseSet.inputArea?.placeholderColor ?? defaultFullConf.inputArea?.placeholderColor,
            };
            const setButtonPositionVar = (actor, config) => {
                const varName = `--cpta-${actor}-collapsible-btn-pos`;
                const maxWidth = config.bubbleMaxWidth;
                if (maxWidth && typeof maxWidth === 'string') {
                    const match = maxWidth.match(/^(\d+\.?\d*)\s*(%|px)$/);
                    if (match) {
                        const value = parseFloat(match[1]);
                        const unit = match[2];
                        themeVars[varName] = `${value / 2}${unit}`;
                        return;
                    }
                }
                themeVars[varName] = '50%';
            };
            setButtonPositionVar('assistant', assistantConf);
            setButtonPositionVar('user', userConf);

            return themeVars;
        }
    }

    class ThemeManager {
        /**
         * @param {ConfigManager} configManager
         * @param {StandingImageManager} standingImageManager
         */
        constructor(configManager, standingImageManager) {
            this.configManager = configManager;
            this.standingImageManager = standingImageManager; // Store reference to call it later
            this.styleGenerator = new StyleGenerator(configManager);
            this.themeStyleElem = null;
            this.lastURL = null;
            this.lastTitle = null;
            this.lastAppliedThemeSet = null;
            this.cachedTitle = null;
            this.cachedThemeSet = null;

            EventBus.subscribe('cpta:themeUpdate', () => this.updateTheme());
            EventBus.subscribe('cpta:layoutRecalculate', () => this.applyChatContentMaxWidth());
        }

        /**
         * @returns {string}
         */
        getProjectNameAndCache() {
            const currentTitle = document.title.trim();
            if (currentTitle !== this.cachedTitle) {
                this.cachedTitle = currentTitle;
                this.cachedThemeSet = null;
            }
            return this.cachedTitle;
        }

        /** @returns {ThemeSet} */
        getThemeSet() {
            this.getProjectNameAndCache();
            if (this.cachedThemeSet) {
                return this.cachedThemeSet;
            }
            const config = this.configManager.get();
            const regexArr = [];
            for (const set of config.themeSets ?? []) {
                for (const proj of set.metadata?.matchPatterns ?? []) {
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
            const name = this.cachedTitle;
            const regexHit = regexArr.find(r => r.pattern.test(name));
            const resultSet = regexHit ? regexHit.set : config.defaultSet;
            this.cachedThemeSet = resultSet;
            return resultSet;
        }

        /**
         * @param {'user' | 'assistant'} actor
         * @param {ThemeSet} set
         * @param {ThemeSet} defaultSet
         * @returns {ActorConfig}
         */
        getActorConfig(actor, set, defaultSet) {
            const currentActorSet = set[actor] ?? {};
            const defaultActorSet = defaultSet[actor] ?? {};

            return {
                name: currentActorSet.name ?? defaultActorSet.name,
                icon: currentActorSet.icon ?? defaultActorSet.icon,
                textColor: currentActorSet.textColor,
                font: currentActorSet.font ?? defaultActorSet.font,
                bubbleBackgroundColor: currentActorSet.bubbleBackgroundColor ?? defaultActorSet.bubbleBackgroundColor,
                bubblePadding: currentActorSet.bubblePadding ?? defaultActorSet.bubblePadding,
                bubbleBorderRadius: currentActorSet.bubbleBorderRadius ?? defaultActorSet.bubbleBorderRadius,
                bubbleMaxWidth: currentActorSet.bubbleMaxWidth ?? defaultActorSet.bubbleMaxWidth,
                standingImageUrl: currentActorSet.standingImageUrl ?? defaultActorSet.standingImageUrl,
            };
        }

        /**
         * Main theme update handler.
         */
        updateTheme() {
            const currentLiveURL = location.href;
            const currentTitle = this.getProjectNameAndCache();
            const urlChanged = currentLiveURL !== this.lastURL;
            if (urlChanged) this.lastURL = currentLiveURL;
            const titleChanged = currentTitle !== this.lastTitle;
            if (titleChanged) this.lastTitle = currentTitle;

            const config = this.configManager.get();
            const currentThemeSet = this.getThemeSet();
            const contentChanged = currentThemeSet !== this.lastAppliedThemeSet;
            if (contentChanged) this.lastAppliedThemeSet = currentThemeSet;

            const themeShouldUpdate = urlChanged || titleChanged || contentChanged;
            if (themeShouldUpdate) {
                const userConf = this.getActorConfig('user', currentThemeSet, config.defaultSet);
                const assistantConf = this.getActorConfig('assistant', currentThemeSet, config.defaultSet);
                this.applyThemeStyles(currentThemeSet, userConf, assistantConf, config.defaultSet);
                // Delegate standing image update to its manager
                this.standingImageManager.updateStandingImages(userConf.standingImageUrl, assistantConf.standingImageUrl);
                this.applyChatContentMaxWidth();
            }
        }

        /**
         * Applies all theme-related styles to the document.
         * @param {ThemeSet} baseSet
         * @param {ActorConfig} userConf
         * @param {ActorConfig} assistantConf
         * @param {ThemeSet} defaultFullConf
         */
        applyThemeStyles(baseSet, userConf, assistantConf, defaultFullConf) {
            // Static styles
            if (!this.themeStyleElem) {
                this.themeStyleElem = document.createElement('style');
                this.themeStyleElem.id = 'cpta-theme-style';
                this.themeStyleElem.textContent = this.styleGenerator.generateStaticCss();
                document.head.appendChild(this.themeStyleElem);
            }
            // Dynamic rules
            const dynamicRulesStyleId = 'cpta-dynamic-rules-style';
            let dynamicRulesStyleElem = document.getElementById(dynamicRulesStyleId);
            if (!dynamicRulesStyleElem) {
                dynamicRulesStyleElem = document.createElement('style');
                dynamicRulesStyleElem.id = dynamicRulesStyleId;
                document.head.appendChild(dynamicRulesStyleElem);
            }
            // Generate and apply dynamic styles and variables
            const dynamicRules = this.styleGenerator.generateDynamicCss(baseSet, userConf, assistantConf);
            dynamicRulesStyleElem.textContent = dynamicRules.join('\n');

            const themeVars = this.styleGenerator.generateThemeVariables(baseSet, userConf, assistantConf, defaultFullConf);
            const rootStyle = document.documentElement.style;
            for (const [key, value] of Object.entries(themeVars)) {
                if (value !== null && value !== undefined) {
                    rootStyle.setProperty(key, value);
                } else {
                    rootStyle.removeProperty(key);
                }
            }
        }

        /**
         * Calculates and applies the dynamic max-width for the chat content area.
         */
        applyChatContentMaxWidth() {
            const rootStyle = document.documentElement.style;
            const config = this.configManager.get();
            if (!config) return;

            const userMaxWidth = config.options.chat_content_max_width;
            // If user has not set a custom width, do nothing and remove the variable to use the default style.
            if (!userMaxWidth) {
                rootStyle.removeProperty('--cpta-chat-content-max-width');
                return;
            }

            const themeSet = this.getThemeSet();
            const iconSize = config.options.icon_size;
            const hasStandingImage = themeSet.user.standingImageUrl || themeSet.assistant.standingImageUrl;

            // Calculate the required margin on each side for avatar, padding, and standing image.
            let requiredMarginPerSide = (iconSize + CONSTANTS.ICON_MARGIN) * 2; // Space for avatar icon and its own padding.
            if (hasStandingImage) {
                const minStandingImageWidth = iconSize * 2;
                requiredMarginPerSide += minStandingImageWidth;
            }

            const sidebarWidth = getSidebarWidth();
            const totalRequiredMargin = sidebarWidth + (requiredMarginPerSide * 2);
            const maxAllowedWidth = window.innerWidth - totalRequiredMargin;
            // Use CSS min() to ensure the user's value does not exceed the allowed space.
            const finalMaxWidth = `min(${userMaxWidth}, ${maxAllowedWidth}px)`;
            rootStyle.setProperty('--cpta-chat-content-max-width', finalMaxWidth);
        }
    }

    class AvatarManager {
        /**
         * @param {ConfigManager} configManager
         */
        constructor(configManager) {
            this.configManager = configManager;
        }

        /**
         * Initializes the manager by injecting styles and subscribing to events.
         */
        init() {
            this.injectAvatarStyle();
            EventBus.subscribe('cpta:avatarInject', (elem) => this.injectAvatar(elem));
        }

        /**
         * Injects the avatar element into the message wrapper.
         * @param {HTMLElement} msgElem
         */
        injectAvatar(msgElem) {
            const role = msgElem.getAttribute('data-message-author-role');
            if (!role) return;

            // --- Avatar Injection Logic ---
            const msgWrapper = msgElem.closest('.w-full');
            if (!msgWrapper || msgWrapper.querySelector('.side-avatar-container')) return;
            msgWrapper.classList.add('chat-wrapper');

            const container = document.createElement('div');
            container.className = 'side-avatar-container';
            const iconWrapper = document.createElement('span');
            iconWrapper.className = 'side-avatar-icon';
            const nameDiv = document.createElement('div');
            nameDiv.className = 'side-avatar-name';
            container.append(iconWrapper, nameDiv);
            msgWrapper.appendChild(container);
            const setMinHeight = (retryCount = 0) => {
                requestAnimationFrame(() => {
                    const iconSize = this.configManager.getIconSize();
                    const nameHeight = nameDiv.offsetHeight;

                    if (nameHeight > 0 && iconSize) {
                        msgWrapper.style.minHeight = (iconSize + nameHeight) + "px";
                    } else if (retryCount < 5) {
                        setTimeout(() => setMinHeight(retryCount + 1), 50);
                    }
                });
            };
            setMinHeight();
        }

        /**
         * Injects the CSS for avatar styling.
         */
        injectAvatarStyle() {
            const styleId = 'cpta-avatar-style';
            if (document.getElementById(styleId)) document.getElementById(styleId).remove();

            const avatarStyle = document.createElement('style');
            avatarStyle.id = styleId;
            const iconSize = this.configManager.getIconSize();

            document.documentElement.style.setProperty('--cpta-icon-size', `${iconSize}px`);
            document.documentElement.style.setProperty('--cpta-icon-margin', `${CONSTANTS.ICON_MARGIN}px`);
            avatarStyle.textContent = `
                .side-avatar-container {
                    position: absolute;
                    top: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: ${iconSize}px;
                    pointer-events: none;
                    white-space: normal;
                    word-break: break-word;
                }
                .side-avatar-icon {
                    width: ${iconSize}px;
                    height: ${iconSize}px;
                    border-radius: 50%;
                    display: block;
                    box-shadow: 0 0 6px rgb(0 0 0 / 0.2);
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                .side-avatar-name {
                    font-size: 0.75rem;
                    text-align: center;
                    margin-top: 4px;
                    width: 100%;
                }
                .chat-wrapper[data-message-author-role="user"] .side-avatar-container {
                    right: calc(-${iconSize}px - ${CONSTANTS.ICON_MARGIN}px);
                }
                .chat-wrapper[data-message-author-role="assistant"] .side-avatar-container {
                    left: calc(-${iconSize}px - ${CONSTANTS.ICON_MARGIN}px);
                }
                .chat-wrapper[data-message-author-role="user"] .side-avatar-icon {
                    background-image: var(--cpta-user-icon);
                }
                .chat-wrapper[data-message-author-role="user"] .side-avatar-name {
                    color: var(--cpta-user-textColor);
                }
                .chat-wrapper[data-message-author-role="user"] .side-avatar-name::after {
                    content: var(--cpta-user-name);
                }
                .chat-wrapper[data-message-author-role="assistant"] .side-avatar-icon {
                    background-image: var(--cpta-assistant-icon);
                }
                .chat-wrapper[data-message-author-role="assistant"] .side-avatar-name {
                    color: var(--cpta-assistant-textColor);
                }
                .chat-wrapper[data-message-author-role="assistant"] .side-avatar-name::after {
                    content: var(--cpta-assistant-name);
                }
            `;
            document.head.appendChild(avatarStyle);
        }

        /**
         * Updates the minimum height for all chat wrappers.
         */
        updateAllChatWrapperHeight() {
            document.querySelectorAll('.chat-wrapper').forEach(msgWrapper => {
                const container = msgWrapper.querySelector('.side-avatar-container');
                const nameDiv = container?.querySelector('.side-avatar-name');
                const iconSize = this.configManager.getIconSize();
                if (container && nameDiv && iconSize && nameDiv.offsetHeight) {
                    msgWrapper.style.minHeight = (iconSize + nameDiv.offsetHeight) + "px";
                }
            });
        }
    }

    class CollapsibleBubbleManager {
        /**
         * @param {ConfigManager} configManager
         */
        constructor(configManager) {
            this.configManager = configManager;
        }

        /**
         * Initializes the manager by injecting styles and subscribing to events.
         */
        init() {
            this.injectCollapsibleBubbleStyle();
            // Subscribe to message completion events.
            EventBus.subscribe('cpta:messageComplete', (elem) => {
                // Only setup immediately if the feature is already enabled.
                if (this.configManager.get()?.features.collapsible_button.enabled) {
                    this.setupCollapsibleBubble(elem);
                    this.updateButtonVisibility(elem);
                }
            });
        }

        /**
         * Injects the CSS for the collapsible bubble feature.
         */
        injectCollapsibleBubbleStyle() {
            const styleId = 'cpta-collapsible-bubble-style';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .cpta-collapsible-parent {
                    position: relative;
                }
                .cpta-collapsible-parent::before {
                    content: '';
                    position: absolute;
                    top: -24px;
                    inset-inline: 0;
                    height: 24px;
                }
                .cpta-collapsible-toggle-btn {
                    position: absolute;
                    top: -24px;
                    width: 24px;
                    height: 24px;
                    padding: 4px;
                    border-radius: 5px;
                    box-sizing: border-box;
                    cursor: pointer;
                    color: var(--text-secondary);
                    visibility: hidden;
                    opacity: 0;
                    transition: visibility 0s linear 0.1s, opacity 0.1s ease-in-out;
                }
                .cpta-collapsible-toggle-btn.cpta-hidden {
                    display: none;
                }
                [data-message-author-role="assistant"] .cpta-collapsible-toggle-btn {
                    left: var(--cpta-assistant-collapsible-btn-pos);
                    transform: translateX(-50%);
                }
                [data-message-author-role="user"] .cpta-collapsible-toggle-btn {
                    right: var(--cpta-user-collapsible-btn-pos);
                    transform: translateX(50%);
                }
                .cpta-collapsible-parent:hover .cpta-collapsible-toggle-btn {
                    visibility: visible;
                    opacity: 1;
                    transition-delay: 0s;
                }
                .cpta-collapsible-toggle-btn:hover {
                    background-color: var(--gizmo-button-background, rgb(255 255 255 / 0.05));
                    color: var(--text-primary);
                }
                .cpta-collapsible-toggle-btn svg {
                    width: 100%;
                    height: 100%;
                    transition: transform 0.2s ease-in-out;
                }
                .cpta-collapsible-content {
                    overflow: hidden;
                    max-height: 999999px;
                }
                .cpta-collapsible.cpta-bubble-collapsed .cpta-collapsible-content {
                    max-height: var(--cpta-icon-size, 128px);
                    border: 1px dashed var(--text-secondary, #8e8e8e);
                    box-sizing: border-box;
                }
                .cpta-collapsible.cpta-bubble-collapsed .cpta-collapsible-toggle-btn svg {
                    transform: rotate(-180deg);
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Re-evaluates and updates the visibility of all collapsible buttons on the page.
         * This method now also ensures that all messages are properly set up or cleaned up.
         */
        updateAllButtons() {
            const config = this.configManager.get();
            if (!config) return;

            const featureConfig = config.features.collapsible_button;
            const allMessageElements = document.querySelectorAll('div[data-message-author-role]');
            allMessageElements.forEach(messageElement => {
                if (featureConfig.enabled) {
                    // Feature is ON: Ensure setup and update visibility.
                    this.setupCollapsibleBubble(messageElement);
                    this.updateButtonVisibility(messageElement);
                } else {
                    // Feature is OFF: Clean up any existing elements.
                    const msgWrapper = messageElement.closest('.w-full');
                    if (msgWrapper && msgWrapper.classList.contains('cpta-collapsible-processed')) {
                        const toggleBtn = messageElement.querySelector('.cpta-collapsible-toggle-btn');
                        if (toggleBtn) {
                            toggleBtn.classList.add('cpta-hidden');
                        }
                        msgWrapper.classList.remove('cpta-bubble-collapsed');
                    }
                }
            });
        }

        /**
         * Updates the visibility of a single collapsible button based on its content height.
         * This function assumes the feature is ENABLED.
         * @param {HTMLElement} messageElement
         */
        updateButtonVisibility(messageElement) {
            const config = this.configManager.get();
            if (!config) return;

            const toggleBtn = messageElement.querySelector('.cpta-collapsible-toggle-btn');
            if (!toggleBtn) return;

            const multiplier = config.features.collapsible_button.display_threshold_multiplier;
            const threshold = config.options.icon_size * multiplier;
            const bubbleElement = messageElement.querySelector('.cpta-collapsible-content');
            if (!bubbleElement) return;

            requestAnimationFrame(() => {
                const msgWrapper = messageElement.closest('.w-full');
                const isCollapsed = msgWrapper && msgWrapper.classList.contains('cpta-bubble-collapsed');

                // Always show the button if the bubble is collapsed, otherwise check height against threshold.
                const shouldHide = !isCollapsed && (multiplier >= 0 && bubbleElement.scrollHeight <= threshold);
                toggleBtn.classList.toggle('cpta-hidden', shouldHide);
            });
        }

        /**
         * Sets up a collapsible toggle for a message bubble (one-time setup).
         * @param {HTMLElement} messageElement
         */
        setupCollapsibleBubble(messageElement) {
            const msgWrapper = messageElement.closest('.w-full');
            if (!msgWrapper || msgWrapper.classList.contains('cpta-collapsible-processed')) {
                return;
            }

            const role = messageElement.getAttribute('data-message-author-role');
            const bubbleElement = role === 'user' ?
                  messageElement.querySelector(CONSTANTS.SELECTORS.RAW_USER_BUBBLE) :
            messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE) || messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE);

            if (!bubbleElement) {
                return;
            }

            msgWrapper.classList.add('cpta-collapsible-processed');
            msgWrapper.classList.add('cpta-collapsible');

            bubbleElement.classList.add('cpta-collapsible-content');
            bubbleElement.parentElement.classList.add('cpta-collapsible-parent');
            if (!bubbleElement.parentElement.querySelector('.cpta-collapsible-toggle-btn')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'cpta-collapsible-toggle-btn';
                toggleBtn.type = 'button';
                toggleBtn.title = 'Toggle message';
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>';
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    msgWrapper.classList.toggle('cpta-bubble-collapsed');
                });
                bubbleElement.parentElement.appendChild(toggleBtn);
            }
        }
    }

    class BubbleNavigationManager {
        /**
         * @param {ConfigManager} configManager
         */
        constructor(configManager) {
            this.configManager = configManager;
            this.navContainers = new Map();
        }

        /**
         * Initializes the manager by injecting styles and subscribing to events.
         */
        init() {
            this.injectBubbleNavigationStyle();
            EventBus.subscribe('cpta:messageComplete', (elem) => {
                if (this.configManager.get()?.features.sequential_nav_buttons.enabled) {
                    this.setupNavigationButtons(elem);
                }
            });
            EventBus.subscribe('cpta:turnComplete', (turnNode) => {
                if (this.configManager.get()?.features.scroll_to_top_button.enabled) {
                    this.handleTurnCompletion(turnNode);
                }
            });
            EventBus.subscribe('cpta:navButtonsUpdate', () => this.updateAllPrevNextButtons());
            EventBus.subscribe('cpta:navigation', () => this.navContainers.clear());
        }

        /**
         * Injects the CSS for the bubble navigation UI.
         */
        injectBubbleNavigationStyle() {
            const styleId = 'cpta-bubble-nav-style';
            if (document.getElementById(styleId)) document.getElementById(styleId).remove();
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                .cpta-bubble-nav-container {
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 24px;
                    z-index: ${CONSTANTS.Z_INDICES.BUBBLE_NAVIGATION};
                }
                .cpta-nav-buttons {
                    position: relative;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    visibility: hidden;
                    opacity: 0;
                    transition: visibility 0s linear 0.1s, opacity 0.1s ease-in-out;
                    pointer-events: auto;
                }
                .cpta-bubble-parent-with-nav:hover .cpta-nav-buttons,
                .cpta-bubble-nav-container:hover .cpta-nav-buttons {
                    visibility: visible;
                    opacity: 1;
                    transition-delay: 0s;
                }
                ${CONSTANTS.SELECTORS.ASSISTANT_MESSAGE} .cpta-bubble-nav-container {
                    left: -25px;
                }
                ${CONSTANTS.SELECTORS.USER_MESSAGE} .cpta-bubble-nav-container {
                    right: -25px;
                }
                .cpta-nav-group-top {
                    position: absolute;
                    top: 4px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .cpta-nav-group-top.cpta-hidden {
                    display: none;
                }
                .cpta-nav-group-bottom {
                    position: absolute;
                    bottom: 12px;
                }
                 .cpta-nav-group-bottom.cpta-hidden {
                    display: none;
                }
                .cpta-bubble-nav-btn {
                    width: 20px;
                    height: 20px;
                    padding: 2px;
                    border-radius: 5px;
                    box-sizing: border-box;
                    cursor: pointer;
                    background: var(--interactive-bg-tertiary-default);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-default);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease-in-out;
                }
                .cpta-bubble-nav-btn:hover {
                    background-color: var(--gizmo-button-background, rgb(255 255 255 / 0.05));
                    color: var(--text-primary);
                }
                .cpta-bubble-nav-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }
                .cpta-bubble-nav-btn svg {
                    width: 100%;
                    height: 100%;
                }
            `;
            document.head.appendChild(style);
        }

        /**
         * Re-evaluates and updates the visibility of all navigation buttons on the page.
         */
        updateAllButtons() {
            const config = this.configManager.get();
            if (!config) return;

            const seqNavEnabled = config.features.sequential_nav_buttons.enabled;
            const topNavEnabled = config.features.scroll_to_top_button.enabled;
            // Retroactively setup buttons for existing elements if features were just enabled.
            if (seqNavEnabled || topNavEnabled) {
                const allMessageElements = document.querySelectorAll('div[data-message-author-role]');
                const allTurnNodes = document.querySelectorAll('article[data-testid^="conversation-turn-"]');

                if (seqNavEnabled) {
                    allMessageElements.forEach(elem => this.setupNavigationButtons(elem));
                }
                if (topNavEnabled) {
                    allTurnNodes.forEach(turn => this.handleTurnCompletion(turn));
                }
            }

            // Update visibility for all potentially existing containers.
            this.navContainers.forEach((container, messageElement) => {
                const topGroup = container.querySelector('.cpta-nav-group-top');
                if (topGroup) {
                    topGroup.classList.toggle('cpta-hidden', !seqNavEnabled);
                }

                const bottomGroup = container.querySelector('.cpta-nav-group-bottom');

                if (bottomGroup) {
                    const turnNode = messageElement.closest('article[data-testid^="conversation-turn-"]');
                    const shouldShow = topNavEnabled && this._shouldShowScrollTop(turnNode, messageElement);
                    bottomGroup.classList.toggle('cpta-hidden', !shouldShow);
                }
            });
            if (seqNavEnabled) {
                this.updateAllPrevNextButtons();
            }
        }

        _getOrCreateNavContainer(messageElement) {
            if (this.navContainers.has(messageElement)) {
                return this.navContainers.get(messageElement);
            }

            const bubbleParent = messageElement.querySelector(CONSTANTS.SELECTORS.RAW_USER_BUBBLE)?.parentElement || messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE)?.parentElement || messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE)?.parentElement;
            if (!bubbleParent) return null;

            bubbleParent.classList.add('cpta-bubble-parent-with-nav');
            bubbleParent.style.position = 'relative';

            const container = document.createElement('div');
            container.className = 'cpta-bubble-nav-container';

            const buttonsWrapper = document.createElement('div');
            buttonsWrapper.className = 'cpta-nav-buttons';
            container.appendChild(buttonsWrapper);

            bubbleParent.appendChild(container);
            this.navContainers.set(messageElement, container);
            return container;
        }

        _createNavButton(title, iconSvg, cssClass) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'cpta-bubble-nav-btn';
            if (cssClass) btn.classList.add(cssClass);
            btn.title = title;
            btn.dataset.originalTitle = title;
            btn.innerHTML = iconSvg;
            return btn;
        }

        setupNavigationButtons(messageElement) {
            // This setup should only run if the container for this element doesn't have the top group yet.
            const container = this._getOrCreateNavContainer(messageElement);
            if (!container || container.querySelector('.cpta-nav-group-top')) return;

            const buttonsWrapper = container.querySelector('.cpta-nav-buttons');
            const ICONS = {
                PREV: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>',
                NEXT: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/></svg>'
            };
            const topGroup = document.createElement('div');
            topGroup.className = 'cpta-nav-group-top';

            const prevBtn = this._createNavButton('Scroll to previous message', ICONS.PREV, 'cpta-nav-prev');
            const nextBtn = this._createNavButton('Scroll to next message', ICONS.NEXT, 'cpta-nav-next');
            topGroup.append(prevBtn, nextBtn);
            buttonsWrapper.appendChild(topGroup);

            const role = messageElement.getAttribute('data-message-author-role');
            if (role) {
                /**
                 * Scrolls to the target message element by directly manipulating scrollTop.
                 * This avoids the layout-recalculation side effects of scrollIntoView() in Chrome.
                 * @param {HTMLElement} targetElement The message element to scroll to.
                 */
                const scrollToTarget = (targetElement) => {
                    // This selector points to the main scrollable container for the chat history.
                    const scrollContainer = document.querySelector('main#main .flex.h-full.flex-col.overflow-y-auto');
                    const targetTurnNode = targetElement.closest('article[data-testid^="conversation-turn-"]');

                    if (scrollContainer && targetTurnNode) {
                        scrollContainer.scrollTop = targetTurnNode.offsetTop;
                    } else {
                        // Fallback to the old method if the container isn't found for some reason.
                        targetElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                    }
                };

                // Add dynamic listeners that calculate the target on click.
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const allRoleMessages = Array.from(document.querySelectorAll(`div[data-message-author-role="${role}"]`));
                    const currentIndex = allRoleMessages.findIndex(el => el === messageElement);
                    if (currentIndex > 0) {
                        scrollToTarget(allRoleMessages[currentIndex - 1]);
                    }
                });

                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const allRoleMessages = Array.from(document.querySelectorAll(`div[data-message-author-role="${role}"]`));
                    const currentIndex = allRoleMessages.findIndex(el => el === messageElement);
                    if (currentIndex < allRoleMessages.length - 1) {
                        scrollToTarget(allRoleMessages[currentIndex + 1]);
                    }
                });
            }
        }

        _shouldShowScrollTop(turnNode, messageElement) {
            if (!turnNode || !messageElement) return false;
            const config = this.configManager.get();
            const topNavConfig = config.features.scroll_to_top_button;
            const multiplier = topNavConfig.display_threshold_multiplier;
            const threshold = config.options.icon_size * multiplier;
            const assistantMessages = Array.from(turnNode.querySelectorAll(CONSTANTS.SELECTORS.ASSISTANT_MESSAGE));
            if (assistantMessages.length > 1 && assistantMessages.indexOf(messageElement) > 0) {
                return true;
            }

            const bubbleElement = messageElement.querySelector(CONSTANTS.SELECTORS.RAW_USER_BUBBLE) || messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_MD_BUBBLE) || messageElement.querySelector(CONSTANTS.SELECTORS.RAW_ASSISTANT_PRE_BUBBLE);
            return bubbleElement && (multiplier < 0 || bubbleElement.scrollHeight > threshold);
        }

        handleTurnCompletion(turnNode) {
            const allMessagesInTurn = turnNode.querySelectorAll('div[data-message-author-role]');
            allMessagesInTurn.forEach(messageElement => {
                if (!this._shouldShowScrollTop(turnNode, messageElement)) return;

                const container = this._getOrCreateNavContainer(messageElement);
                if (!container || container.querySelector('.cpta-nav-group-bottom')) return;

                const buttonsWrapper = container.querySelector('.cpta-nav-buttons');
                const bottomGroup = document.createElement('div');

                bottomGroup.className = 'cpta-nav-group-bottom';
                const topBtn = this._createNavButton('Scroll to top of this message', '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M440-160v-480L280-480l-56-56 256-256 256 256-56 56-160-160v480h-80Zm-200-640v-80h400v80H240Z"/></svg>', 'cpta-nav-top');
                topBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    turnNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
                bottomGroup.appendChild(topBtn);
                buttonsWrapper.appendChild(bottomGroup);
            });
        }

        updateAllPrevNextButtons() {
            const disabledHint = '(No message to scroll to)';
            ['user', 'assistant'].forEach(role => {
                const messages = Array.from(document.querySelectorAll(`div[data-message-author-role="${role}"]`));
                messages.forEach((message, index) => {
                    const container = this.navContainers.get(message);
                    if (!container) return;


                    const prevBtn = container.querySelector('.cpta-nav-prev');
                    if (prevBtn) {
                        const isDisabled = (index === 0);
                        prevBtn.disabled = isDisabled;
                        prevBtn.title = isDisabled ? `${prevBtn.dataset.originalTitle} ${disabledHint}` : prevBtn.dataset.originalTitle;
                    }

                    const nextBtn = container.querySelector('.cpta-nav-next');
                    if (nextBtn) {
                        const isDisabled = (index === messages.length - 1);
                        nextBtn.disabled = isDisabled;
                        nextBtn.title = isDisabled ? `${nextBtn.dataset.originalTitle} ${disabledHint}` : nextBtn.dataset.originalTitle;
                    }
                });
            });
        }
    }

    class StandingImageManager {
        /**
         * @param {ConfigManager} configManager
         */
        constructor(configManager) {
            this.configManager = configManager;
            this.standingImagesRetryCount = 0;
            this.debouncedRecalculateStandingImagesLayout = debounce(this.recalculateStandingImagesLayout.bind(this), CONSTANTS.RETRY.STANDING_IMAGES_INTERVAL);
        }

        /**
         * Initializes the manager by injecting styles and subscribing to events.
         */
        init() {
            this.injectStandingImageStyle();
            EventBus.subscribe('cpta:layoutRecalculate', () => this.debouncedRecalculateStandingImagesLayout());
        }

        /**
         * Injects the CSS for the standing images.
         */
        injectStandingImageStyle() {
            const styleId = 'cpta-standing-image-style';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #cpta-standing-image-user,
                #cpta-standing-image-assistant {
                    position: fixed;
                    bottom: 0px;
                    height: 100vh;
                    min-height: 100px;
                    max-height: 100vh;
                    z-index: ${CONSTANTS.Z_INDICES.STANDING_IMAGE};
                    pointer-events: none;
                    margin: 0;
                    padding: 0;
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

        /**
         * Updates both standing images based on the current theme.
         * @param {string | null} userImgVal
         * @param {string | null} assistantImgVal
         */
        updateStandingImages(userImgVal, assistantImgVal) {
            this.setupStandingImage('cpta-standing-image-user', userImgVal);
            this.setupStandingImage('cpta-standing-image-assistant', assistantImgVal);
            this.debouncedRecalculateStandingImagesLayout();
        }

        /**
         * Sets up a single standing image element.
         * @param {string} id
         * @param {string | null} imgVal
         */
        setupStandingImage(id, imgVal) {
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
         * Recalculates the layout for the standing images.
         */
        async recalculateStandingImagesLayout() {
            const rootStyle = document.documentElement.style;
            // Use waitForElement to ensure the chat content area is available.
            const chatContent = await waitForElement(CONSTANTS.SELECTORS.CHAT_CONTENT_MAX_WIDTH);
            if (!chatContent) {
                // If chatContent is not found after timeout, stop the process.
                return;
            }

            const chatRect = chatContent.getBoundingClientRect();
            const sidebarWidth = getSidebarWidth();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const iconSize = this.configManager.getIconSize();

            // Assistant (left)
            const assistantWidth = Math.max(0, chatRect.left - (sidebarWidth + iconSize + (CONSTANTS.ICON_MARGIN * 2)));
            rootStyle.setProperty('--cpta-si-assistant-left', sidebarWidth + 'px');
            rootStyle.setProperty('--cpta-si-assistant-width', assistantWidth + 'px');

            // User (right)
            const userWidth = Math.max(0, windowWidth - chatRect.right - (iconSize + (CONSTANTS.ICON_MARGIN * 2)));
            rootStyle.setProperty('--cpta-si-user-width', userWidth + 'px');

            // Masking
            const maskValue = `linear-gradient(to bottom, transparent 0px, rgb(0 0 0 / 1) 60px, rgb(0 0 0 / 1) 100%)`;
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
        }
    }

    // =================================================================================
    // SECTION: UI Elements - Components and Manager
    // =================================================================================

    /**
     * @abstract
     * @description Base class for a UI component.
     */
    class UIComponent {
        constructor(callbacks = {}) {
            this.callbacks = callbacks;
            this.element = null;
        }

        /** @abstract */
        render() {
            throw new Error("Component must implement render method.");
        }

        destroy() {
            this.element?.remove();
            this.element = null;
        }
    }

    /**
     * @class ColorPickerPopupManager
     * @description Manages the lifecycle and interaction of color picker popups within a given container.
     */
    class ColorPickerPopupManager {
        constructor(containerElement) {
            this.container = containerElement;
            this.activePicker = null;
            this._isSyncing = false;

            // Bind methods
            this._handleClick = this._handleClick.bind(this);
            this._handleOutsideClick = this._handleOutsideClick.bind(this);
        }

        init() {
            this.container.addEventListener('click', this._handleClick);
        }

        destroy() {
            this._closePicker();
            this.container.removeEventListener('click', this._handleClick);
        }

        _handleClick(e) {
            const swatch = e.target.closest('.cpta-color-swatch');
            if (swatch) {
                this._togglePicker(swatch);
            }
        }

        _togglePicker(swatchElement) {
            if (this.activePicker && this.activePicker.swatch === swatchElement) {
                this._closePicker();
                return;
            }
            this._closePicker();
            this._openPicker(swatchElement);
        }

        _openPicker(swatchElement) {
            const targetId = swatchElement.dataset.controlsColor;
            const textInput = this.container.querySelector(`#cpta-form-${targetId}`);
            if (!textInput) return;

            const popupWrapper = document.createElement('div');
            popupWrapper.className = 'cpta-color-picker-popup';
            const pickerRoot = document.createElement('div');
            popupWrapper.appendChild(pickerRoot);
            this.container.appendChild(popupWrapper);

            const picker = new CustomColorPickerComponent(pickerRoot, {
                initialColor: textInput.value || 'rgb(128 128 128 / 1)'
            });
            picker.render();

            this.activePicker = { picker, popupWrapper, textInput, swatch: swatchElement };
            this._positionPicker(popupWrapper, swatchElement);

            this._setupBindings();

            requestAnimationFrame(() => {
                document.addEventListener('click', this._handleOutsideClick, { capture: true });
            });
        }

        _closePicker() {
            if (!this.activePicker) return;
            this.activePicker.picker.destroy();
            this.activePicker.popupWrapper.remove();
            this.activePicker = null;
            document.removeEventListener('click', this._handleOutsideClick, { capture: true });
        }

        _setupBindings() {
            const { picker, textInput, swatch, pickerRoot } = this.activePicker;

            // Sync picker to text input initially
            this._isSyncing = true;
            const initialColor = picker.getColor();
            textInput.value = initialColor;
            swatch.querySelector('.cpta-color-swatch-value').style.backgroundColor = initialColor;
            textInput.classList.remove('is-invalid');
            this._isSyncing = false;

            // Picker -> Text Input
            picker.rootElement.addEventListener('color-change', e => {
                if (this._isSyncing) return;
                this._isSyncing = true;
                textInput.value = e.detail.color;
                swatch.querySelector('.cpta-color-swatch-value').style.backgroundColor = e.detail.color;
                textInput.classList.remove('is-invalid');
                this._isSyncing = false;
            });

            // Text Input -> Picker
            const syncFromText = () => {
                if (this._isSyncing) return;
                this._isSyncing = true;
                const value = textInput.value.trim();
                const isValid = value === '' || picker.setColor(value);
                textInput.classList.toggle('is-invalid', value !== '' && !isValid);
                if (isValid) {
                    swatch.querySelector('.cpta-color-swatch-value').style.backgroundColor = value || 'transparent';
                }
                this._isSyncing = false;
            };
            textInput.addEventListener('input', syncFromText);
        }

        _positionPicker(popupWrapper, swatchElement) {
            const dialogRect = this.container.getBoundingClientRect();
            const swatchRect = swatchElement.getBoundingClientRect();
            const pickerHeight = popupWrapper.offsetHeight;
            const pickerWidth = popupWrapper.offsetWidth;
            const margin = 4;

            let top = swatchRect.bottom - dialogRect.top + margin;
            let left = swatchRect.left - dialogRect.left;

            if (swatchRect.bottom + pickerHeight + margin > dialogRect.bottom) {
                top = (swatchRect.top - dialogRect.top) - pickerHeight - margin;
            }
            if (swatchRect.left + pickerWidth > dialogRect.right) {
                left = (swatchRect.right - dialogRect.left) - pickerWidth;
            }

            left = Math.max(margin, left);
            top = Math.max(margin, top);

            popupWrapper.style.top = `${top}px`;
            popupWrapper.style.left = `${left}px`;
        }

        _handleOutsideClick(e) {
            if (!this.activePicker) return;
            if (this.activePicker.swatch.contains(e.target)) {
                return;
            }
            if (this.activePicker.popupWrapper.contains(e.target)) {
                return;
            }
            this._closePicker();
        }
    }

    /**
     * @class CustomColorPickerComponent
     * @description A self-contained, reusable color picker UI component.
     */
    class CustomColorPickerComponent {
        constructor(rootElement, options = {}) {
            this.rootElement = rootElement;
            this.options = { initialColor: 'rgb(255 0 0 / 1)', ...options };
            this.state = { h: 0, s: 100, v: 100, a: 1 };
            this.dom = {};
            this.isUpdating = false;

            // Bind event handlers to the instance to ensure `this` context is correct
            this._handleSvPointerMove = this._handleSvPointerMove.bind(this);
            this._handleSvPointerUp = this._handleSvPointerUp.bind(this);
        }

        render() {
            this._createDom();
            Object.assign(this.dom, {
                svPlane: this.rootElement.querySelector('.cpta-sv-plane'),
                svThumb: this.rootElement.querySelector('.sv-thumb'),
                hueSlider: this.rootElement.querySelector('.hue-slider input'),
                alphaSlider: this.rootElement.querySelector('.alpha-slider input'),
                alphaTrack: this.rootElement.querySelector('.alpha-slider .slider-track')
            });
            this._attachEventListeners();
            this.setColor(this.options.initialColor);
        }

        destroy() {
            // Clean up global event listeners to prevent memory leaks
            window.removeEventListener('pointermove', this._handleSvPointerMove);
            window.removeEventListener('pointerup', this._handleSvPointerUp);

            // Check if rootElement still exists before trying to remove it
            if (this.rootElement) {
                this.rootElement.remove();
            }
            this.rootElement = null;
            this.dom = {};
        }

        setColor(rgbString) {
            const parsed = ColorUtils.parseColorString(rgbString);
            if (parsed) {
                const { r, g, b, a } = parsed;
                const { h, s, v } = ColorUtils.rgbToHsv(r, g, b);
                this.state = { h, s, v, a };
                this._requestUpdate();
                return true;
            }
            return false;
        }

        getColor() {
            const { h, s, v, a } = this.state;
            const { r, g, b } = ColorUtils.hsvToRgb(h, s, v);
            return ColorUtils.rgbToString(r, g, b, a);
        }

        _createDom() {
            this.rootElement.innerHTML = `
                <div class="cpta-color-picker" aria-label="Color picker">
                    <div class="cpta-sv-plane" role="slider" tabindex="0" aria-label="Saturation and Value">
                        <div class="gradient-white"></div>
                        <div class="gradient-black"></div>
                        <div class="sv-thumb"></div>
                    </div>
                    <div class="cpta-slider-group hue-slider">
                        <div class="slider-track hue-track"></div>
                        <input type="range" min="0" max="360" step="1" aria-label="Hue">
                    </div>
                    <div class="cpta-slider-group alpha-slider">
                        <div class="alpha-checkerboard"></div>
                        <div class="slider-track"></div>
                        <input type="range" min="0" max="1" step="0.01" aria-label="Alpha">
                    </div>
                </div>
            `;
        }

        _handleSvPointerDown(e) {
            e.preventDefault();
            this.dom.svPlane.focus();
            this._updateSv(e.clientX, e.clientY);
            window.addEventListener('pointermove', this._handleSvPointerMove);
            window.addEventListener('pointerup', this._handleSvPointerUp);
        }

        _handleSvPointerMove(e) {
            this._updateSv(e.clientX, e.clientY);
        }

        _handleSvPointerUp() {
            window.removeEventListener('pointermove', this._handleSvPointerMove);
            window.removeEventListener('pointerup', this._handleSvPointerUp);
        }

        _updateSv(clientX, clientY) {
            const rect = this.dom.svPlane.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
            const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
            this.state.s = Math.round((x / rect.width) * 100);
            this.state.v = Math.round((1 - y / rect.height) * 100);
            this._requestUpdate();
        }

        _attachEventListeners() {
            const { svPlane, hueSlider, alphaSlider } = this.dom;

            svPlane.addEventListener('pointerdown', this._handleSvPointerDown.bind(this));
            svPlane.addEventListener('keydown', (e) => {
                if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
                e.preventDefault();
                const sStep = e.shiftKey ? 10 : 1;
                const vStep = e.shiftKey ? 10 : 1;
                switch (e.key) {
                    case 'ArrowLeft': this.state.s = Math.max(0, this.state.s - sStep); break;
                    case 'ArrowRight': this.state.s = Math.min(100, this.state.s + sStep); break;
                    case 'ArrowUp': this.state.v = Math.min(100, this.state.v + vStep); break;
                    case 'ArrowDown': this.state.v = Math.max(0, this.state.v - vStep); break;
                }
                this._requestUpdate();
            });

            hueSlider.addEventListener('input', () => { this.state.h = parseInt(hueSlider.value, 10); this._requestUpdate(); });
            alphaSlider.addEventListener('input', () => { this.state.a = parseFloat(alphaSlider.value); this._requestUpdate(); });
        }

        _requestUpdate() {
            if (this.isUpdating) return;
            this.isUpdating = true;
            requestAnimationFrame(() => {
                this._updateUIDisplay();
                this._dispatchChangeEvent();
                this.isUpdating = false;
            });
        }

        _updateUIDisplay() {
            const { h, s, v, a } = this.state;
            const { svPlane, svThumb, hueSlider, alphaSlider, alphaTrack } = this.dom;
            const { r, g, b } = ColorUtils.hsvToRgb(h, s, v);

            svPlane.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
            svThumb.style.left = `${s}%`;
            svThumb.style.top = `${100 - v}%`;
            svThumb.style.backgroundColor = `rgb(${r} ${g} ${b})`;

            hueSlider.value = h;
            alphaSlider.value = a;

            alphaTrack.style.background = `linear-gradient(to right, transparent, rgb(${r} ${g} ${b}))`;

            svPlane.setAttribute('aria-valuetext', `Saturation ${s}%, Value ${v}%`);
            hueSlider.setAttribute('aria-valuenow', h);
            alphaSlider.setAttribute('aria-valuenow', a.toFixed(2));
        }

        _dispatchChangeEvent() {
            // Check if rootElement exists before dispatching event to prevent errors after destruction
            if (this.rootElement) {
                this.rootElement.dispatchEvent(new CustomEvent('color-change', {
                    detail: {
                        color: this.getColor()
                    },
                    bubbles: true // Allow the event to bubble up to the modal
                }));
            }
        }
    }

    /**
     * Manages the main settings button (⚙️).
     */
    class SettingsButtonComponent extends UIComponent {
        constructor(callbacks) {
            super(callbacks);
        }

        render() {
            if (document.getElementById('cpta-settings-button')) {
                document.getElementById('cpta-settings-button').remove();
            }

            const btn = document.createElement('button');
            btn.id = 'cpta-settings-button';
            btn.textContent = '⚙️';
            btn.title = 'Settings (ChatGPT Project Theme Automator)';
            Object.assign(btn.style, {
                position: 'fixed', top: '10px', right: '320px', zIndex: CONSTANTS.Z_INDICES.SETTINGS_BUTTON,
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--interactive-bg-secondary-default)',
                border: '1px solid var(--interactive-border-secondary-default)',
                fontSize: '16px', cursor: 'pointer',
                boxShadow: 'var(--drop-shadow-xs, 0 1px 1px #0000000d)',
                transition: 'background 0.12s, border-color 0.12s, box-shadow 0.12s'
            });
            this.element = btn;
            document.body.appendChild(this.element);
            this._setupEventListeners();
            return this.element;
        }

        _setupEventListeners() {
            this.element.addEventListener('click', (e) => {
                e.stopPropagation();
                this.callbacks.onClick?.();
            });
            this.element.addEventListener('mouseenter', () => {
                this.element.style.background = 'var(--interactive-bg-secondary-hover)';
                this.element.style.borderColor = 'var(--border-default, #888)';
            });
            this.element.addEventListener('mouseleave', () => {
                this.element.style.background = 'var(--interactive-bg-secondary-default)';
                this.element.style.borderColor = 'var(--interactive-border-secondary-default)';
            });
        }
    }

    /**
     * Manages the settings panel/submenu.
     */
    class SettingsPanelComponent extends UIComponent {
        constructor(callbacks) {
            super(callbacks);
        }

        render() {
            if (document.getElementById('cpta-settings-panel')) {
                document.getElementById('cpta-settings-panel').remove();
            }
            this._injectStyles();

            this.element = this._createPanelElement();
            document.body.appendChild(this.element);

            this._setupEventListeners();
            return this.element;
        }

        toggle() {
            const shouldShow = this.element.style.display === 'none';
            if (shouldShow) {
                this.show();
            } else {
                this.hide();
            }
        }

        async show() {
            await this._populateForm();
            const anchorRect = this.callbacks.getAnchorElement().getBoundingClientRect();

            let top = anchorRect.bottom + 4;
            let left = anchorRect.left;

            this.element.style.display = 'block';
            const panelWidth = this.element.offsetWidth;
            const panelHeight = this.element.offsetHeight;

            if (left + panelWidth > window.innerWidth - 8) {
                left = window.innerWidth - panelWidth - 8;
            }
            if (top + panelHeight > window.innerHeight - 8) {
                top = window.innerHeight - panelHeight - 8;
            }

            this.element.style.left = `${Math.max(8, left)}px`;
            this.element.style.top = `${Math.max(8, top)}px`;
        }

        hide() {
            this.element.style.display = 'none';
        }

        _createPanelElement() {
            const panelContainer = document.createElement('div');
            panelContainer.id = 'cpta-settings-panel';
            panelContainer.style.display = 'none';
            panelContainer.setAttribute('role', 'menu');

            const createFormRow = (label, ...children) => {
                const row = document.createElement('div');
                row.className = 'cpta-submenu-row';
                row.appendChild(label);
                children.forEach(child => row.appendChild(child));
                return row;
            };
            const createInput = (id, type = 'text', tooltip = '') => {
                const input = document.createElement('input');
                input.id = id;
                input.type = type;
                if (tooltip) input.title = tooltip;
                return input;
            };
            const createLabel = (forId, text, tooltip = '') => {
                const label = document.createElement('label');
                label.htmlFor = forId;
                label.textContent = text;
                if (tooltip) label.title = tooltip;
                return label;
            };
            const createFeatureGroup = (...rows) => {
                const group = document.createElement('div');
                group.className = 'cpta-feature-group';
                rows.forEach(row => group.appendChild(row));
                return group;
            };

            const optionsFieldset = document.createElement('fieldset');
            optionsFieldset.className = 'cpta-submenu-fieldset';
            optionsFieldset.innerHTML = '<legend>Options</legend>';
            const iconSizeTooltip = "Specifies the size of the chat icons in pixels. Default is 64.";
            const iconSizeInput = createInput('cpta-opt-icon-size', 'text', iconSizeTooltip);
            const pxUnit = document.createElement('span');
            pxUnit.textContent = 'px';
            pxUnit.className = 'cpta-input-unit';
            const chatWidthTooltip = "Sets the maximum width of the chat content. Enter any valid CSS value like '720px', '80%', or '65vw'. Leave blank for the default.";
            const chatWidthInput = createInput('cpta-opt-chat-max-width', 'text', chatWidthTooltip);

            optionsFieldset.append(
                createFormRow(createLabel('cpta-opt-icon-size', 'Icon size:', iconSizeTooltip), iconSizeInput, pxUnit),
                createFormRow(createLabel('cpta-opt-chat-max-width', 'Chat content max width:', chatWidthTooltip), chatWidthInput)
            );
            const featuresFieldset = document.createElement('fieldset');
            featuresFieldset.className = 'cpta-submenu-fieldset';
            featuresFieldset.innerHTML = '<legend>Features</legend>';
            const collapsibleCheckTooltip = "When enabled, a button to collapse the message bubble will appear at the top of each message.";
            const collapsibleCheck = createInput('cpta-feat-collapsible-enabled', 'checkbox', collapsibleCheckTooltip);
            const collapsibleThresholdTooltip = "The threshold for showing the collapse button, based on the message height as a multiple of the icon size. '2' means the button appears on messages taller than twice the icon size. '0' shows it always.";
            const collapsibleThreshold = createInput('cpta-feat-collapsible-threshold', 'text', collapsibleThresholdTooltip);
            const scrollTopCheckTooltip = "When enabled, a button to scroll to the top of the message will appear on long multi-part responses or tall messages.";
            const scrollTopCheck = createInput('cpta-feat-scroll-top-enabled', 'checkbox', scrollTopCheckTooltip);
            const scrollTopThresholdTooltip = "The threshold for showing the scroll-to-top button, based on message height as a multiple of the icon size. '2' means the button appears on messages taller than twice the icon size. '0' shows it always.";
            const scrollTopThreshold = createInput('cpta-feat-scroll-top-threshold', 'text', scrollTopThresholdTooltip);
            const seqNavCheckTooltip = "When enabled, navigation buttons will appear to jump to the next or previous message from the same author (user/assistant).";
            const seqNavCheck = createInput('cpta-feat-seq-nav-enabled', 'checkbox', seqNavCheckTooltip);
            const collapsibleGroup = createFeatureGroup(
                createFormRow(createLabel('cpta-feat-collapsible-enabled', 'Collapsible button', collapsibleCheckTooltip), collapsibleCheck),
                createFormRow(createLabel('cpta-feat-collapsible-threshold', 'Display threshold multiplier:', collapsibleThresholdTooltip), collapsibleThreshold)
            );
            const scrollTopGroup = createFeatureGroup(
                createFormRow(createLabel('cpta-feat-scroll-top-enabled', 'Scroll to top button', scrollTopCheckTooltip), scrollTopCheck),
                createFormRow(createLabel('cpta-feat-scroll-top-threshold', 'Display threshold multiplier:', scrollTopThresholdTooltip), scrollTopThreshold)
            );
            const seqNavGroup = createFeatureGroup(
                createFormRow(createLabel('cpta-feat-seq-nav-enabled', 'Sequential nav button', seqNavCheckTooltip), seqNavCheck)
            );
            featuresFieldset.append(collapsibleGroup, scrollTopGroup, seqNavGroup);

            const themesFieldset = document.createElement('fieldset');
            themesFieldset.className = 'cpta-submenu-fieldset';
            themesFieldset.innerHTML = `<legend>Themes</legend>`;
            // Create and add the "Edit Themes..." button
            const editThemesBtn = document.createElement('button');
            editThemesBtn.id = 'cpta-submenu-edit-themes-btn';
            editThemesBtn.className = 'cpta-modal-button';
            editThemesBtn.textContent = 'Edit Themes...';
            editThemesBtn.style.width = '100%';
            editThemesBtn.title = 'Open the theme editor to create and modify themes.';
            themesFieldset.appendChild(editThemesBtn);

            const footer = document.createElement('div');
            footer.className = 'cpta-submenu-footer';
            const jsonBtn = document.createElement('button');
            jsonBtn.id = 'cpta-submenu-json-btn';
            jsonBtn.className = 'cpta-modal-button';
            jsonBtn.textContent = 'JSON';
            jsonBtn.title = "Opens the advanced settings modal to directly edit, import, or export the entire configuration in JSON format.";
            const saveBtn = document.createElement('button');
            saveBtn.id = 'cpta-submenu-save-btn';
            saveBtn.className = 'cpta-modal-button';
            saveBtn.textContent = 'Save';
            saveBtn.title = "Saves all changes made in this panel and applies them immediately.";
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cpta-submenu-cancel-btn';
            cancelBtn.className = 'cpta-modal-button';
            cancelBtn.textContent = 'Cancel';
            cancelBtn.title = "Discards all changes made in this panel and closes it.";
            footer.append(jsonBtn, saveBtn, cancelBtn);

            panelContainer.append(optionsFieldset, featuresFieldset, themesFieldset, footer);
            return panelContainer;
        }

        async _populateForm() {
            if (!this.callbacks.getCurrentConfig) return;
            const config = await this.callbacks.getCurrentConfig();

            this.element.querySelector('#cpta-opt-icon-size').value = config.options.icon_size || '';
            this.element.querySelector('#cpta-opt-chat-max-width').value = config.options.chat_content_max_width || '';

            const features = config.features;
            const collapsibleCheck = this.element.querySelector('#cpta-feat-collapsible-enabled');
            const collapsibleThreshold = this.element.querySelector('#cpta-feat-collapsible-threshold');
            collapsibleCheck.checked = features.collapsible_button.enabled;
            collapsibleThreshold.value = features.collapsible_button.display_threshold_multiplier;
            collapsibleThreshold.disabled = !collapsibleCheck.checked;
            const scrollTopCheck = this.element.querySelector('#cpta-feat-scroll-top-enabled');
            const scrollTopThreshold = this.element.querySelector('#cpta-feat-scroll-top-threshold');
            scrollTopCheck.checked = features.scroll_to_top_button.enabled;
            scrollTopThreshold.value = features.scroll_to_top_button.display_threshold_multiplier;
            scrollTopThreshold.disabled = !scrollTopCheck.checked;

            this.element.querySelector('#cpta-feat-seq-nav-enabled').checked = features.sequential_nav_buttons.enabled;
        }

        async _collectDataFromForm() {
            const currentConfig = await this.callbacks.getCurrentConfig();
            const newConfig = JSON.parse(JSON.stringify(currentConfig));

            const iconSize = parseInt(this.element.querySelector('#cpta-opt-icon-size').value, 10);
            newConfig.options.icon_size = isNaN(iconSize) ? CONSTANTS.ICON_SIZE : iconSize;
            newConfig.options.chat_content_max_width = this.element.querySelector('#cpta-opt-chat-max-width').value || null;

            const features = newConfig.features;
            features.collapsible_button.enabled = this.element.querySelector('#cpta-feat-collapsible-enabled').checked;
            features.collapsible_button.display_threshold_multiplier = parseFloat(this.element.querySelector('#cpta-feat-collapsible-threshold').value);
            features.scroll_to_top_button.enabled = this.element.querySelector('#cpta-feat-scroll-top-enabled').checked;
            features.scroll_to_top_button.display_threshold_multiplier = parseFloat(this.element.querySelector('#cpta-feat-scroll-top-threshold').value);
            features.sequential_nav_buttons.enabled = this.element.querySelector('#cpta-feat-seq-nav-enabled').checked;
            return newConfig;
        }

        _setupEventListeners() {
            this.element.querySelector('#cpta-submenu-save-btn').addEventListener('click', async () => {
                const newConfig = await this._collectDataFromForm();
                this.callbacks.onSave?.(newConfig);
                this.hide();
            });
            this.element.querySelector('#cpta-submenu-cancel-btn').addEventListener('click', () => {
                this.hide();
            });
            this.element.querySelector('#cpta-submenu-json-btn').addEventListener('click', () => {
                this.callbacks.onShowJsonModal?.();
                this.hide();
            });
            this.element.querySelector('#cpta-submenu-edit-themes-btn').addEventListener('click', () => {
                this.callbacks.onShowThemeModal?.();
                this.hide();
            });
            const collapsibleCheck = this.element.querySelector('#cpta-feat-collapsible-enabled');
            const collapsibleThreshold = this.element.querySelector('#cpta-feat-collapsible-threshold');
            collapsibleCheck.addEventListener('change', () => {
                collapsibleThreshold.disabled = !collapsibleCheck.checked;
            });
            const scrollTopCheck = this.element.querySelector('#cpta-feat-scroll-top-enabled');
            const scrollTopThreshold = this.element.querySelector('#cpta-feat-scroll-top-threshold');
            scrollTopCheck.addEventListener('change', () => {
                scrollTopThreshold.disabled = !scrollTopCheck.checked;
            });
        }

        _injectStyles() {
            const styleId = 'cpta-ui-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #cpta-settings-panel {
                    position: fixed;
                    width: 340px;
                    background: var(--sidebar-surface-primary);
                    color: var(--text-primary);
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 20px 0 rgb(0 0 0 / 15%);
                    padding: 12px;
                    z-index: ${CONSTANTS.Z_INDICES.SETTINGS_PANEL};
                    border: 1px solid var(--border-medium);
                    font-size: 0.9em;
                }
                .cpta-submenu-fieldset {
                    border: 1px solid var(--border-default);
                    border-radius: var(--radius-md);
                    padding: 8px 12px 12px; margin: 0 0 12px 0;
                }
                .cpta-submenu-fieldset legend {
                    padding: 0 4px;
                    font-weight: 500; color: var(--text-secondary);
                }
                .cpta-submenu-row {
                    display: flex;
                    align-items: center; justify-content: flex-start;
                    gap: 8px; margin-top: 8px;
                }
                .cpta-submenu-row label {
                    flex-shrink: 0;
                    margin-inline-end: auto;
                }
                .cpta-submenu-row input[type="text"] {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-default); border-radius: var(--radius-sm);
                    padding: 4px 6px; transition: opacity 0.2s, background-color 0.2s;
                    flex-shrink: 0;
                }
                #cpta-opt-icon-size, #cpta-opt-chat-max-width, #cpta-feat-collapsible-threshold, #cpta-feat-scroll-top-threshold {
                    width: 3.5em;
                }
                .cpta-input-unit { color: var(--text-secondary);
                }
                .cpta-submenu-row input[type="text"]:disabled {
                    background-color: var(--surface-secondary, #2A2A2E);
                    opacity: 0.6; cursor: not-allowed;
                }
                .cpta-submenu-row input[type="checkbox"] { margin: 0;
                    flex-shrink: 0; }
                .cpta-feature-group { padding: 8px 0;
                }
                .cpta-feature-group:not(:first-child) { border-top: 1px solid var(--border-light);
                }
                .cpta-feature-group .cpta-submenu-row:first-child { margin-top: 0;
                }
                .cpta-feature-group .cpta-submenu-row:not(:first-child) {
                    padding-inline-start: 1em;
                }
                .cpta-submenu-note { font-size: 0.9em;
                    color: var(--text-secondary); margin: 4px 0 0 0; line-height: 1.3; }
                .cpta-submenu-footer {
                    display: flex;
                    justify-content: flex-end; gap: 8px; margin-top: 4px;
                    border-top: 1px solid var(--border-light); padding-top: 12px;
                }
                #cpta-submenu-json-btn {
                    margin-inline-end: auto;
                }
                .cpta-modal-button {
                    background: var(--interactive-bg-tertiary-default);
                    color: var(--text-primary);
                    border: 1px solid var(--border-default); border-radius: var(--radius-md, ${CONSTANTS.MODAL.BTN_RADIUS}px);
                    padding: ${CONSTANTS.MODAL.BTN_PADDING}; font-size: ${CONSTANTS.MODAL.BTN_FONT_SIZE}px;
                    cursor: pointer; transition: background 0.12s;
                }
                .cpta-modal-button:hover {
                    background: var(--interactive-bg-secondary-hover) !important;
                    border-color: var(--border-default);
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Manages the JSON editing modal.
     */
    class JsonModalComponent extends UIComponent {
        constructor(callbacks) {
            super(callbacks);
        }

        render() {
            if (document.getElementById('cpta-json-modal')) {
                document.getElementById('cpta-json-modal').remove();
            }
            this._injectStyles();
            this.element = this._createModalElement();
            document.body.appendChild(this.element);
            this._setupEventListeners();
            return this.element;
        }

        /**
         * @private
         * @description Injects the necessary CSS for the dialog and its backdrop.
         */
        _injectStyles() {
            const styleId = 'cpta-json-modal-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #cpta-json-modal {
                    padding: 0;
                    border: none;
                    background: transparent;
                    max-width: 100vw;
                    max-height: 100vh;
                    overflow: visible;
                    z-index: ${CONSTANTS.Z_INDICES.JSON_MODAL};
                }
                #cpta-json-modal::backdrop {
                    background: rgb(0 0 0 / 0.5);
                    pointer-events: auto;
                }
            `;
            document.head.appendChild(style);
        }

        async open(anchorElement) {
            const config = await this.callbacks.getCurrentConfig();
            this.element.querySelector('textarea').value = JSON.stringify(config, null, 2);
            this.element.querySelector('.cpta-modal-msg').textContent = '';

            if (typeof this.element.showModal === 'function') {
                this.element.showModal();
            } else {
                // Fallback for environments where showModal might not be available
                this.element.style.display = 'block';
            }

            // Reposition the dialog to be relative to the anchor element.
            // This logic is applied after showModal() to override default positioning.
            if (anchorElement && typeof anchorElement.getBoundingClientRect === 'function') {
                const dialog = this.element;
                const modalBox = dialog.querySelector('.cpta-modal-box');
                const btnRect = anchorElement.getBoundingClientRect();
                const margin = 8;

                // Use modalBox width as the dialog's own width is less predictable
                const modalWidth = modalBox.offsetWidth || CONSTANTS.MODAL.WIDTH;

                let left = btnRect.left;
                let top = btnRect.bottom + 4;

                if (left + modalWidth > window.innerWidth - margin) {
                    left = window.innerWidth - modalWidth - margin;
                }

                // Apply styles to position the dialog absolutely
                Object.assign(dialog.style, {
                    position: 'absolute',
                    left: `${Math.max(left, margin)}px`,
                    top: `${top}px`,
                    margin: '0', // Reset any inherited or default margin
                    transform: 'none' // Reset centering transform
                });
            }
        }

        close() {
            if (this.element && typeof this.element.close === 'function') {
                try {
                    this.element.close();
                } catch (e) {
                    // Ignore errors if the dialog is already closed.
                }
            } else {
                // Fallback
                this.element.style.display = 'none';
            }
        }

        _createModalElement() {
            const dialogElement = document.createElement('dialog');
            dialogElement.id = 'cpta-json-modal';

            const modalBox = document.createElement('div');
            modalBox.className = 'cpta-modal-box';
            Object.assign(modalBox.style, {
                width: `${CONSTANTS.MODAL.WIDTH}px`,
                padding: `${CONSTANTS.MODAL.PADDING * 4}px`,
                borderRadius: `var(--radius-lg, ${CONSTANTS.MODAL.RADIUS}px)`,
                background: 'var(--main-surface-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--drop-shadow-lg, 0 4px 16px #00000026)',
            });
            const modalTitle = document.createElement('h5');
            modalTitle.innerText = 'ChatGPT Project Theme Automator Settings';
            Object.assign(modalTitle.style, {
                marginTop: '0',
                marginBottom: `${CONSTANTS.MODAL.TITLE_MARGIN_BOTTOM}px`
            });
            const textarea = document.createElement('textarea');
            Object.assign(textarea.style, {
                width: '100%',
                height: `${CONSTANTS.MODAL.TEXTAREA_HEIGHT}px`,
                boxSizing: 'border-box',
                fontFamily: 'monospace',
                fontSize: '13px',
                marginBottom: '0',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
            });
            const msgDiv = document.createElement('div');
            msgDiv.className = 'cpta-modal-msg';
            Object.assign(msgDiv.style, {
                color: 'var(--text-danger,#f33)',
                marginTop: '2px',
                minHeight: '1.2em'
            });
            const btnGroup = document.createElement('div');
            Object.assign(btnGroup.style, {
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
                gap: `${CONSTANTS.MODAL.BTN_GROUP_GAP}px`,
                marginTop: '8px',
            });
            const createButton = (text, id) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerText = text;
                btn.id = `cpta-json-modal-${id}-btn`;
                btn.classList.add('cpta-modal-button');
                return btn;
            };
            btnGroup.append(
                createButton('Export', 'export'), createButton('Import', 'import'),
                createButton('Save', 'save'), createButton('Cancel', 'cancel')
            );
            modalBox.append(modalTitle, textarea, msgDiv, btnGroup);
            dialogElement.appendChild(modalBox);
            return dialogElement;
        }

        _setupEventListeners() {
            const msgDiv = this.element.querySelector('.cpta-modal-msg');
            this.element.querySelector('#cpta-json-modal-export-btn').addEventListener('click', async () => {
                try {
                    const config = await this.callbacks.getCurrentConfig();
                    const jsonString = JSON.stringify(config, null, 2);
                    const blob = new Blob([jsonString], {
                        type: 'application/json'
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cpta_config.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    msgDiv.textContent = 'Export successful.';
                    msgDiv.style.color = 'var(--text-accent, #66b5ff)';
                } catch (e) {
                    msgDiv.textContent = `Export failed: ${e.message}`;
                    msgDiv.style.color = 'var(--text-danger,#f33)';
                }
            });
            this.element.querySelector('#cpta-json-modal-import-btn').addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'application/json';
                fileInput.onchange = (event) => {
                    const file = event.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            try {
                                const importedConfig = JSON.parse(e.target.result);
                                this.element.querySelector('textarea').value = JSON.stringify(importedConfig, null, 2);

                                msgDiv.textContent = 'Import successful. Click "Save" to apply.';
                                msgDiv.style.color = 'var(--text-accent, #66b5ff)';
                            } catch (err) {

                                msgDiv.textContent = `Import failed: ${err.message}`;
                                msgDiv.style.color = 'var(--text-danger,#f33)';
                            }
                        };
                        reader.readAsText(file);
                    }
                };
                fileInput.click();
            });
            this.element.querySelector('#cpta-json-modal-save-btn').addEventListener('click', async () => {
                try {
                    const obj = JSON.parse(this.element.querySelector('textarea').value);
                    this._validateMatchPatternsOnImport(obj.themeSets);
                    await this.callbacks.onSave(obj);
                    this.close();
                } catch (e) {
                    msgDiv.textContent = e.message;
                    msgDiv.style.color = 'var(--text-danger,#f33)';
                }
            });
            this.element.querySelector('#cpta-json-modal-cancel-btn').addEventListener('click', () => this.close());
            this.element.addEventListener('click', e => {
                // Close the dialog if the backdrop is clicked.
                if (e.target === this.element) {
                    this.close();
                }
            });
        }

        _validateMatchPatternsOnImport(themeSets) {
            const validate = (sets) => {
                for (const set of sets ?? []) {
                    if (!set.metadata || !Array.isArray(set.metadata.matchPatterns)) continue;
                    for (const p of set.metadata.matchPatterns ?? []) {
                        if (typeof p === 'string') {
                            if (!/^\/.*\/[gimsuy]*$/.test(p)) {
                                throw new Error(`Invalid format. Must be /pattern/flags string: ${p}`);
                            }
                            try {
                                const lastSlash = p.lastIndexOf('/');
                                new RegExp(p.slice(1, lastSlash), p.slice(lastSlash + 1));
                            } catch (e) {
                                throw new Error(`Invalid RegExp: ${p}\n${e}`);
                            }
                        } else if (!(p instanceof RegExp)) {
                            throw new Error('Entries must be RegExp objects or /pattern/flags strings.');
                        }
                    }
                }
            };
            validate(themeSets);
        }
    }

    /**
     * Manages the Theme Settings modal.
     */
    class ThemeModalComponent extends UIComponent {
        constructor(callbacks) {
            super(callbacks);
            this.activeThemeKey = null;
            this.colorPickerManager = null;
        }

        render() {
            if (document.getElementById('cpta-theme-modal')) {
                document.getElementById('cpta-theme-modal').remove();
            }
            this._injectStyles();
            this.element = this._createModalElement();
            document.body.appendChild(this.element);
            this._setupEventListeners();
            return this.element;
        }

        async open(selectThemeKey) {
            if (!this.callbacks.getCurrentConfig) return;
            const config = await this.callbacks.getCurrentConfig();
            if (!config) return;

            // Initialize the color picker manager for this modal instance
            this.colorPickerManager = new ColorPickerPopupManager(this.element);
            this.colorPickerManager.init();

            const themeSelect = this.element.querySelector('#cpta-theme-select');
            const currentSelectedValue = selectThemeKey || this.activeThemeKey || 'defaultSet';
            themeSelect.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = 'defaultSet';
            defaultOption.textContent = 'Default Settings';
            themeSelect.appendChild(defaultOption);
            config.themeSets.forEach((theme, index) => {
                const option = document.createElement('option');
                const themeName = (typeof theme.metadata?.name === 'string' && theme.metadata.name.trim() !== '') ? theme.metadata.name : `Theme ${index + 1}`;
                option.value = theme.metadata.id;
                option.textContent = themeName;
                themeSelect.appendChild(option);
            });
            themeSelect.value = currentSelectedValue;

            if (!themeSelect.value) {
                themeSelect.value = 'defaultSet';
            }

            this.activeThemeKey = themeSelect.value;
            if (typeof this.element.showModal === 'function') {
                this.element.showModal();
            } else {
                this.element.style.display = 'flex';
            }

            themeSelect.dispatchEvent(new Event('change'));
        }

        close() {
            // Clean up the color picker manager
            this.colorPickerManager?.destroy();
            this.colorPickerManager = null;

            if (this.element && typeof this.element.close === 'function') {
                try {
                    this.element.close();
                } catch (e) {
                    // Ignore error if dialog is already closed
                }
            } else {
                this.element.style.display = 'none';
            }
        }

        _createModalElement() {
            const dialogElement = document.createElement('dialog');
            dialogElement.id = 'cpta-theme-modal';

            const modalBox = document.createElement('div');
            modalBox.className = 'cpta-theme-modal-box';

            const modalTitle = document.createElement('h5');
            modalTitle.innerText = 'ChatGPT Project Theme Automator - Theme settings';

            const sanitizeTooltip = (text) => text.replace(/"/g, '&quot;');
            const createTextField = (label, id, tooltip = '') => `
                <div class="cpta-form-field">
                    <label for="cpta-form-${id}" title="${sanitizeTooltip(tooltip)}">${label}:</label>
                    <input type="text" id="cpta-form-${id}">
                </div>`;
            const createColorField = (label, id, tooltip = '') => {
                const hint = 'Click the swatch to open the color picker. Accepts any valid CSS color string.';
                const fullTooltip = tooltip ? `${tooltip}\n---\n${hint}` : hint;
                return `
                <div class="cpta-form-field">
                    <label for="cpta-form-${id}" title="${sanitizeTooltip(fullTooltip)}">${label}:</label>
                    <div class="cpta-color-field-wrapper">
                        <input type="text" id="cpta-form-${id}" autocomplete="off">
                        <button type="button" class="cpta-color-swatch" data-controls-color="${id}" title="Open color picker">
                            <span class="cpta-color-swatch-checkerboard"></span>
                            <span class="cpta-color-swatch-value"></span>
                        </button>
                    </div>
                </div>`;
            };
            const createSelectField = (label, id, options, tooltip = '') => `
                <div class="cpta-form-field">
                    <label for="cpta-form-${id}" title="${sanitizeTooltip(tooltip)}">${label}:</label>
                    <select id="cpta-form-${id}">
                        <option value="">(not set)</option>
                        ${options.map(o => `<option value="${o}">${o}</option>`).join('')}
                    </select>
                </div>`;
            const createSliderField = (label, id, min, max, step, tooltip = '') => `
                <div class="cpta-form-field">
                    <label for="cpta-form-${id}" title="${sanitizeTooltip(tooltip)}">${label}:</label>
                    <div class="cpta-slider-field">
                        <input type="range" id="cpta-form-${id}-slider" min="${min}" max="${max}" step="${step}" data-slider-for="${id}">
                        <input type="text" id="cpta-form-${id}" data-slider-input-for="${id}">
                    </div>
                </div>`;
            const header = document.createElement('div');
            header.className = 'cpta-theme-modal-header';
            header.innerHTML = `
                <label for="cpta-theme-select" title="Select a theme to edit.">Theme:</label>
                <select id="cpta-theme-select" title="Select a theme to edit."></select>
                <button id="cpta-theme-up-btn" class="cpta-modal-button cpta-move-btn" title="Move selected theme up.">▲</button>
                <button id="cpta-theme-down-btn" class="cpta-modal-button cpta-move-btn" title="Move selected theme down.">▼</button>
                <div class="cpta-header-spacer"></div>
                <button id="cpta-theme-new-btn" class="cpta-modal-button" title="Create a new theme (saves immediately).">New</button>
                <button id="cpta-theme-copy-btn" class="cpta-modal-button" title="Create a copy of the selected theme (saves immediately).">Copy</button>
                <button id="cpta-theme-delete-btn" class="cpta-modal-button" title="Delete the selected theme (saves immediately). This cannot be undone.">Delete</button>
            `;

            // --- Main Content Area ---
            const content = document.createElement('div');
            content.className = 'cpta-theme-modal-content';
            content.innerHTML = `
                <div class="cpta-theme-general-settings">
                    <div class="cpta-form-field">
                        <label for="cpta-form-metadata-name" title="Enter a unique name for this theme.">Name:</label>
                        <input type="text" id="cpta-form-metadata-name">
                    </div>
                    <div class="cpta-form-field">
                        <label for="cpta-form-metadata-matchPatterns" title="Enter one RegEx pattern per line to automatically apply this theme (e.g., /My Project/i).">Patterns (one per line):</label>
                        <textarea id="cpta-form-metadata-matchPatterns" rows="3"></textarea>
                    </div>
                </div>
                <hr class="cpta-theme-separator" tabindex="-1">
                <div class="cpta-theme-scrollable-area">
                    <div class="cpta-theme-grid">
                        <fieldset><legend>🤖Assistant</legend>
                            ${createTextField('Name', 'assistant-name', 'The name displayed for the assistant.')}
                            ${createTextField('Icon', 'assistant-icon', "URL or <svg> code for the assistant's icon.")}
                            ${createColorField('Text color', 'assistant-textColor', 'Color of the text inside the bubble.')}
                            ${createTextField('Font', 'assistant-font', 'Font family for the text. Font names with spaces must be quoted (e.g., "Times New Roman").')}
                            ${createColorField('Bubble Background', 'assistant-bubbleBackgroundColor', 'Background color of the message bubble.')}
                            ${createTextField('Bubble padding', 'assistant-bubblePadding', 'Inner padding of the bubble (e.g., 6px 10px).')}
                            ${createSliderField('Bubble radius', 'assistant-bubbleBorderRadius', 0, 50, 1, 'Corner roundness of the bubble (e.g., 10px).')}
                            ${createTextField('Bubble max Width', 'assistant-bubbleMaxWidth', 'Maximum width of the bubble (e.g., 80% or 600px).')}
                            ${createTextField('Standing image', 'assistant-standingImageUrl', "URL for the character's standing image displayed on the side.")}
                        </fieldset>
                        <fieldset><legend>👤User</legend>
                            ${createTextField('Name', 'user-name', 'The name displayed for the user.')}
                            ${createTextField('Icon', 'user-icon', "URL or <svg> code for the user's icon.")}
                            ${createColorField('Text color', 'user-textColor', 'Color of the text inside the bubble.')}
                            ${createTextField('Font', 'user-font', 'Font family for the text. Font names with spaces must be quoted (e.g., "Times New Roman").')}
                            ${createColorField('Bubble Background', 'user-bubbleBackgroundColor', 'Background color of the message bubble.')}
                            ${createTextField('Bubble padding', 'user-bubblePadding', 'Inner padding of the bubble (e.g., 6px 10px).')}
                            ${createSliderField('Bubble radius', 'user-bubbleBorderRadius', 0, 50, 1, 'Corner roundness of the bubble (e.g., 10px).')}
                            ${createTextField('Bubble max Width', 'user-bubbleMaxWidth', 'Maximum width of the bubble (e.g., 80% or 600px).')}
                            ${createTextField('Standing image', 'user-standingImageUrl', "URL for the character's standing image displayed on the side.")}
                        </fieldset>
                        <fieldset><legend>🌄Background</legend>
                            ${createColorField('Background color', 'window-backgroundColor', 'Main background color of the chat window.')}
                            ${createTextField('Background image', 'window-backgroundImageUrl', 'URL for the main background image.')}
                            ${createSelectField('Background size', 'window-backgroundSize', ['auto', 'cover', 'contain'], 'How the background image is sized.')}
                            ${createTextField('Background position', 'window-backgroundPosition', 'Position of the background image (e.g., center center).')}
                            ${createSelectField('Background repeat', 'window-backgroundRepeat', ['no-repeat', 'repeat', 'repeat-x', 'repeat-y'], 'How the background image is repeated.')}
                            ${createSelectField('Background attachment', 'window-backgroundAttachment', ['scroll', 'fixed', 'local'], 'Whether the background image scrolls with the content.')}
                        </fieldset>
                        <fieldset><legend>⌨Input area</legend>
                            ${createColorField('Background color', 'inputArea-backgroundColor', 'Background color of the text input area.')}
                            ${createColorField('Text color', 'inputArea-textColor', 'Color of the text you type.')}
                            ${createColorField('Placeholder color', 'inputArea-placeholderColor', 'Color of the placeholder text (e.g., "Message ChatGPT...").')}
                        </fieldset>
                    </div>
                </div>
            `;
            // --- Footer ---
            const footer = document.createElement('div');
            footer.className = 'cpta-theme-modal-footer';
            const createButton = (text, id, title = '') => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.innerText = text;
                btn.id = `cpta-theme-modal-${id}-btn`;
                btn.classList.add('cpta-modal-button');
                if (title) btn.title = title;
                return btn;
            };
            footer.append(
                createButton('Apply', 'apply', 'Save changes and keep the modal open.'),
                createButton('Save', 'save', 'Save changes and close the modal.'),
                createButton('Cancel', 'cancel', 'Discard changes and close the modal.')
            );
            modalBox.append(modalTitle, header, content, footer);
            dialogElement.appendChild(modalBox);
            return dialogElement;
        }

        _setupEventListeners() {
            this.element.querySelector('#cpta-theme-modal-cancel-btn').addEventListener('click', () => this.close());
            this.element.querySelector('#cpta-theme-select').addEventListener('change', (e) => this._populateFormWithThemeData(e.target.value));
            this.element.querySelector('#cpta-theme-modal-save-btn').addEventListener('click', () => this._handleThemeAction(true));
            this.element.querySelector('#cpta-theme-modal-apply-btn').addEventListener('click', () => this._handleThemeAction(false));
            this.element.querySelector('#cpta-theme-new-btn').addEventListener('click', () => this._handleThemeNew());
            this.element.querySelector('#cpta-theme-copy-btn').addEventListener('click', () => this._handleThemeCopy());
            this.element.querySelector('#cpta-theme-delete-btn').addEventListener('click', () => this._handleThemeDelete());
            this.element.querySelector('#cpta-theme-up-btn').addEventListener('click', () => this._handleThemeMove(-1));
            this.element.querySelector('#cpta-theme-down-btn').addEventListener('click', () => this._handleThemeMove(1));
            // --- Event listeners for slider controls ---
            this.element.addEventListener('input', e => {
                if (e.target.matches('input[data-slider-for]')) {
                    const textInput = this.element.querySelector(`input[data-slider-input-for="${e.target.dataset.sliderFor}"]`);
                    if (textInput) textInput.value = `${e.target.value}px`;
                } else if (e.target.matches('input[data-slider-input-for]')) {
                    const slider = this.element.querySelector(`input[data-slider-for="${e.target.dataset.sliderInputFor}"]`);
                    if (slider) {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= slider.min && val <= slider.max) {
                            slider.value = val;
                        } else {
                            // Reset slider to its minimum value if the input is empty or invalid.
                            slider.value = slider.min;
                        }
                    }
                }
            });
            // Dynamic tooltip listener
            this.element.addEventListener('mouseover', e => {
                const target = e.target;
                if (target.matches('input[type="text"], textarea')) {
                    if (target.offsetWidth < target.scrollWidth || target.offsetHeight < target.scrollHeight) {
                        target.title = target.value;
                    }
                }
            });
            this.element.addEventListener('mouseout', e => {
                if (e.target.matches('input[type="text"], textarea')) {
                    e.target.title = '';
                }
            });
        }

        /**
         * Populates all form fields with data from a selected theme.
         * @param {string} themeKey The key of the theme to load ('defaultSet' or themeId).
         */
        async _populateFormWithThemeData(themeKey) {
            this.activeThemeKey = themeKey;
            const config = await this.callbacks.getCurrentConfig();
            if (!config) return;

            const isDefault = themeKey === 'defaultSet';
            const theme = isDefault ?
                  config.defaultSet : config.themeSets.find(t => t.metadata.id === themeKey);

            if (!theme) return;
            const setVal = (id, value) => {
                const el = this.element.querySelector(`#cpta-form-${id}`);
                if (el) el.value = value ?? '';
            };

            const setSliderVal = (id, value) => {
                const textInput = this.element.querySelector(`#cpta-form-${id}`);
                const slider = this.element.querySelector(`#cpta-form-${id}-slider`);
                if (textInput) textInput.value = value ?? '';
                if (slider) {
                    const numVal = parseInt(value, 10);
                    slider.value = !isNaN(numVal) ? numVal : slider.min;
                }
            };
            // Populate metadata fields
            if (!isDefault) {
                setVal('metadata-name', theme.metadata.name);
                setVal('metadata-matchPatterns', Array.isArray(theme.metadata.matchPatterns) ? theme.metadata.matchPatterns.join('\n') : '');
            }

            // Populate actor fields
            ['user', 'assistant'].forEach(actor => {
                const actorConf = theme[actor] || {};
                setVal(`${actor}-name`, actorConf.name);
                setVal(`${actor}-icon`, actorConf.icon);
                setVal(`${actor}-textColor`, actorConf.textColor);
                setVal(`${actor}-font`, actorConf.font);
                setVal(`${actor}-bubbleBackgroundColor`, actorConf.bubbleBackgroundColor);
                setVal(`${actor}-bubblePadding`, actorConf.bubblePadding);
                setSliderVal(`${actor}-bubbleBorderRadius`, actorConf.bubbleBorderRadius);
                setVal(`${actor}-bubbleMaxWidth`, actorConf.bubbleMaxWidth);
                setVal(`${actor}-standingImageUrl`, actorConf.standingImageUrl);
            });
            // Populate window fields
            const windowConf = theme.window || {};
            setVal('window-backgroundColor', windowConf.backgroundColor);
            setVal('window-backgroundImageUrl', windowConf.backgroundImageUrl);
            setVal('window-backgroundSize', windowConf.backgroundSize);
            setVal('window-backgroundPosition', windowConf.backgroundPosition);
            setVal('window-backgroundRepeat', windowConf.backgroundRepeat);
            setVal('window-backgroundAttachment', windowConf.backgroundAttachment);
            // Populate input area fields
            const inputConf = theme.inputArea || {};
            setVal('inputArea-backgroundColor', inputConf.backgroundColor);
            setVal('inputArea-textColor', inputConf.textColor);
            setVal('inputArea-placeholderColor', inputConf.placeholderColor);

            // Update all color swatches based on the new text values
            this.element.querySelectorAll('.cpta-color-swatch-value').forEach(swatchValue => {
                const swatch = swatchValue.closest('.cpta-color-swatch');
                const targetId = swatch.dataset.controlsColor;
                const textInput = this.element.querySelector(`#cpta-form-${targetId}`);
                if (textInput) {
                    swatchValue.style.backgroundColor = textInput.value || 'transparent';
                }
            });
            const generalSettingsEl = this.element.querySelector('.cpta-theme-general-settings');
            const separatorEl = this.element.querySelector('.cpta-theme-separator');
            const upBtn = this.element.querySelector('#cpta-theme-up-btn');
            const downBtn = this.element.querySelector('#cpta-theme-down-btn');
            if (isDefault) {
                generalSettingsEl.style.display = 'none';
                separatorEl.style.display = 'none';
                upBtn.disabled = true;
                downBtn.disabled = true;
            } else {
                generalSettingsEl.style.display = 'grid';
                separatorEl.style.display = 'block';
                const index = config.themeSets.findIndex(t => t.metadata.id === themeKey);
                upBtn.disabled = (index === 0);
                downBtn.disabled = (index === config.themeSets.length - 1);
            }
            this.element.querySelector('#cpta-theme-delete-btn').disabled = isDefault;
        }

        _collectThemeDataFromForm() {
            const getVal = (id) => this.element.querySelector(`#cpta-form-${id}`).value.trim() || null;
            const themeData = {
                metadata: {}, user: {}, assistant: {}, window: {}, inputArea: {}
            };
            // Collect metadata
            themeData.metadata.name = getVal('metadata-name');
            themeData.metadata.matchPatterns = this.element.querySelector('#cpta-form-metadata-matchPatterns').value.split('\n').map(p => p.trim()).filter(p => p);

            // Collect actor data
            ['user', 'assistant'].forEach(actor => {
                themeData[actor].name = getVal(`${actor}-name`);
                themeData[actor].icon = getVal(`${actor}-icon`);
                themeData[actor].textColor = getVal(`${actor}-textColor`);
                themeData[actor].font = getVal(`${actor}-font`);
                themeData[actor].bubbleBackgroundColor = getVal(`${actor}-bubbleBackgroundColor`);
                themeData[actor].bubblePadding = getVal(`${actor}-bubblePadding`);
                themeData[actor].bubbleBorderRadius = getVal(`${actor}-bubbleBorderRadius`);
                themeData[actor].bubbleMaxWidth = getVal(`${actor}-bubbleMaxWidth`);
                themeData[actor].standingImageUrl = getVal(`${actor}-standingImageUrl`);
            });
            // Collect window data
            themeData.window.backgroundColor = getVal('window-backgroundColor');
            themeData.window.backgroundImageUrl = getVal('window-backgroundImageUrl');
            themeData.window.backgroundSize = getVal('window-backgroundSize');
            themeData.window.backgroundPosition = getVal('window-backgroundPosition');
            themeData.window.backgroundRepeat = getVal('window-backgroundRepeat');
            themeData.window.backgroundAttachment = getVal('window-backgroundAttachment');
            // Collect input area data
            themeData.inputArea.backgroundColor = getVal('inputArea-backgroundColor');
            themeData.inputArea.textColor = getVal('inputArea-textColor');
            themeData.inputArea.placeholderColor = getVal('inputArea-placeholderColor');

            return themeData;
        }

        async _handleThemeAction(shouldClose) {
            const config = await this.callbacks.getCurrentConfig();
            const newConfig = JSON.parse(JSON.stringify(config));
            const themeData = this._collectThemeDataFromForm();
            const isDefault = this.activeThemeKey === 'defaultSet';
            if (!isDefault) {
                // Validate theme name
                const newName = themeData.metadata.name;
                if (!newName || newName.trim() === '') {
                    alert('Theme Name cannot be empty.');
                    return;
                }
                const isDuplicate = newConfig.themeSets.some(t =>
                                                             t.metadata.id !== this.activeThemeKey &&
                                                             t.metadata.name &&
                                                             t.metadata.name.trim().toLowerCase() === newName.trim().toLowerCase()
                                                            );
                if (isDuplicate) {
                    alert('This theme name is already in use. Please choose a different name.');
                    return;
                }

                // Validate patterns to ensure they are valid regular expressions
                for (const p of themeData.metadata.matchPatterns) {
                    if (!/^\/.*\/[gimsuy]*$/.test(p)) {
                        alert(`Invalid format for pattern: "${p}".\nIt must be a /pattern/flags string (e.g., /My Project/i).`);
                        return;
                    }
                    try {
                        const lastSlash = p.lastIndexOf('/');
                        new RegExp(p.slice(1, lastSlash), p.slice(lastSlash + 1));
                    } catch (e) {
                        alert(`Invalid RegExp in pattern: "${p}".\nError: ${e.message}`);
                        return;
                    }
                }
            }

            if (isDefault) {
                // For defaultSet, we don't save metadata.
                // We merge only the relevant parts.
                newConfig.defaultSet.user = themeData.user;
                newConfig.defaultSet.assistant = themeData.assistant;
                newConfig.defaultSet.window = themeData.window;
                newConfig.defaultSet.inputArea = themeData.inputArea;
            } else {
                const index = newConfig.themeSets.findIndex(t => t.metadata.id === this.activeThemeKey);
                if (index !== -1) {
                    // Preserve existing themeId during update
                    const existingId = newConfig.themeSets[index].metadata.id;
                    newConfig.themeSets[index] = { ...newConfig.themeSets[index], ...themeData };
                    newConfig.themeSets[index].metadata.id = existingId;
                }
            }

            await this.callbacks.onSave(newConfig);
            if (shouldClose) {
                this.close();
            } else {
                await this.open(this.activeThemeKey);
            }
        }

        _proposeUniqueName(baseName, existingNamesSet) {
            let proposedName = baseName;
            let counter = 2;
            while (existingNamesSet.has(proposedName.trim().toLowerCase())) {
                proposedName = `${baseName} ${counter}`;
                counter++;
            }
            return proposedName;
        }

        async _handleThemeNew() {
            const config = await this.callbacks.getCurrentConfig();
            const existingNames = new Set(config.themeSets.map(t => t.metadata.name?.trim().toLowerCase()));
            const proposedName = this._proposeUniqueName('New Theme', existingNames);
            const newName = prompt('Enter a name for the new theme:', proposedName);
            if (!newName || newName.trim() === '') return;
            if (existingNames.has(newName.trim().toLowerCase())) {
                alert('This theme name is already in use.');
                return;
            }
            const newTheme = {
                metadata: { id: generateUniqueId(), name: newName, matchPatterns: [] },
                user: {}, assistant: {}, window: {}, inputArea: {}
            };
            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.themeSets.push(newTheme);
            await this.callbacks.onSave(newConfig);
            await this.open(newTheme.metadata.id);
        }

        async _handleThemeCopy() {
            const config = await this.callbacks.getCurrentConfig();
            const isDefault = this.activeThemeKey === 'defaultSet';
            let themeToCopy;
            if (isDefault) {
                // Create a temporary full ThemeSet structure from the defaultSet
                themeToCopy = {
                    metadata: { name: 'Default' },
                    ...config.defaultSet
                };
            } else {
                themeToCopy = config.themeSets.find(t => t.metadata.id === this.activeThemeKey);
            }
            if (!themeToCopy) return;

            const originalName = themeToCopy.metadata.name || 'Theme';
            const baseName = `${originalName} Copy`;
            const existingNames = new Set(config.themeSets.map(t => t.metadata.name?.trim().toLowerCase()));
            const proposedName = this._proposeUniqueName(baseName, existingNames);
            const newName = prompt('Enter a name for the copied theme:', proposedName);
            if (!newName || newName.trim() === '') return;
            if (existingNames.has(newName.trim().toLowerCase())) {
                alert('This theme name is already in use.');
                return;
            }

            const newTheme = JSON.parse(JSON.stringify(themeToCopy));
            // Ensure the new theme has a proper metadata structure
            if (!newTheme.metadata) newTheme.metadata = {};
            newTheme.metadata.id = generateUniqueId();
            newTheme.metadata.name = newName;
            if (isDefault) {
                newTheme.metadata.matchPatterns = [];
            }

            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.themeSets.push(newTheme);
            await this.callbacks.onSave(newConfig);
            await this.open(newTheme.metadata.id);
        }

        async _handleThemeDelete() {
            const themeKey = this.activeThemeKey;
            if (themeKey === 'defaultSet') return;

            const config = await this.callbacks.getCurrentConfig();
            const themeToDelete = config.themeSets.find(t => t.metadata.id === themeKey);
            const themeName = themeToDelete?.metadata.name || `Theme with id ${themeKey}`;

            if (!confirm(`Are you sure you want to delete the theme "${themeName}"?`)) return;
            const newConfig = JSON.parse(JSON.stringify(config));
            newConfig.themeSets = newConfig.themeSets.filter(t => t.metadata.id !== themeKey);
            await this.callbacks.onSave(newConfig);
            await this.open('defaultSet');
        }

        async _handleThemeMove(direction) {
            const themeKey = this.activeThemeKey;
            if (themeKey === 'defaultSet') return;

            const config = await this.callbacks.getCurrentConfig();
            const currentIndex = config.themeSets.findIndex(t => t.metadata.id === themeKey);
            if (currentIndex === -1) return;

            const newIndex = currentIndex + direction;
            if (newIndex < 0 || newIndex >= config.themeSets.length) {
                return;
            }

            const newConfig = JSON.parse(JSON.stringify(config));
            const item = newConfig.themeSets.splice(currentIndex, 1)[0];
            newConfig.themeSets.splice(newIndex, 0, item);

            await this.callbacks.onSave(newConfig);
            await this.open(themeKey);
        }

        _injectStyles() {
            const styleId = 'cpta-theme-modal-styles';
            if (document.getElementById(styleId)) return;
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                #cpta-theme-modal {
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    padding: 0;
                    border: none;
                    background: transparent;
                    max-width: 100vw;
                    max-height: 100vh;
                    z-index: ${CONSTANTS.Z_INDICES.THEME_MODAL};
                }
                #cpta-theme-modal::backdrop {
                    background: rgb(0 0 0 / 0.5);
                }
                .cpta-theme-modal-box {
                    width: 880px;
                    max-height: 90vh;
                    background: var(--main-surface-primary);
                    color: var(--text-primary);
                    border-radius: 8px; border: 1px solid var(--border-default);
                    box-shadow: var(--drop-shadow-lg, 0 4px 16px #00000026);
                    padding: 16px;
                    display: flex; flex-direction: column;
                    gap: 16px;
                }
                .cpta-theme-modal-box h5 {
                    margin: 0;
                    font-weight: 600; padding: 0; border: none;
                }
                .cpta-theme-modal-header {
                    display: flex;
                    align-items: center; gap: 8px;
                    border-bottom: 1px solid var(--border-default); padding-bottom: 16px;
                }
                .cpta-theme-modal-header label {
                    flex-shrink: 0;
                }
                .cpta-theme-modal-header select {
                    flex-grow: 1;
                }
                .cpta-move-btn {
                    padding: 2px 6px;
                    line-height: 1.2;
                    min-width: 28px;
                }
                .cpta-header-spacer {
                    width: 16px;
                    flex-shrink: 0;
                }
                .cpta-theme-modal-content {
                    display: flex;
                    flex-direction: column; gap: 16px;
                    overflow: hidden; /* Prevent parent from scrolling */
                }
                .cpta-theme-separator {
                    border: none;
                    border-top: 1px solid var(--border-default);
                    margin: 0;
                }
                .cpta-theme-general-settings {
                    display: grid;
                    grid-template-columns: 1fr 1fr; gap: 16px;
                }
                .cpta-theme-scrollable-area {
                    overflow-y: auto;
                    padding-right: 8px; /* For scrollbar */
                }
                .cpta-theme-scrollable-area:focus {
                    outline: none;
                }
                .cpta-theme-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr; gap: 16px;
                }
                .cpta-theme-modal-box fieldset {
                    border: 1px solid var(--border-medium);
                    border-radius: var(--radius-md);
                    padding: 12px; margin: 0; display: flex; flex-direction: column; gap: 8px;
                }
                .cpta-theme-modal-box fieldset legend {
                    padding: 0 4px;
                    font-weight: 500; color: var(--text-secondary);
                }
                .cpta-form-field { display: flex; flex-direction: column; gap: 4px; }
                .cpta-form-field label { font-size: 0.9em; color: var(--text-secondary); }
                .cpta-color-field-wrapper { display: flex; gap: 8px; }
                .cpta-color-field-wrapper input[type="text"] { flex-grow: 1; }
                .cpta-color-field-wrapper input[type="text"].is-invalid { outline: 2px solid #ff5555; outline-offset: -2px;}
                .cpta-color-swatch {
                    width: 32px;
                    height: 32px; flex-shrink: 0; padding: 2px; border: 1px solid var(--border-default);
                    border-radius: var(--radius-sm); background-color: transparent; cursor: pointer; position: relative;
                }
                .cpta-color-swatch-checkerboard, .cpta-color-swatch-value {
                    position: absolute;
                    inset: 2px; width: auto; height: auto;
                }
                .cpta-color-swatch-checkerboard {
                    background-image: repeating-conic-gradient(#808080 0% 25%, #c0c0c0 0% 50%);
                    background-size: 12px 12px;
                }
                .cpta-color-swatch-value {
                    transition: background-color 0.1s;
                }

                .cpta-theme-modal-box input, .cpta-theme-modal-box textarea, .cpta-theme-modal-box select {
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    border: 1px solid var(--border-default); border-radius: var(--radius-sm);
                    padding: 6px 8px; width: 100%; box-sizing: border-box;
                }
                .cpta-theme-modal-box textarea { resize: vertical; }
                .cpta-theme-modal-footer {
                    display: flex;
                    justify-content: flex-end; gap: 8px;
                    border-top: 1px solid var(--border-default); padding-top: 16px;
                }
                .cpta-slider-field {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .cpta-slider-field input[type="range"] {
                    flex-grow: 1;
                }
                .cpta-slider-field input[type="text"] {
                    width: 5em;
                    flex-shrink: 0;
                    text-align: right;
                }

                /* Custom Color Picker Popup Styles */
                .cpta-color-picker-popup {
                    position: absolute;
                    z-index: 10;
                    width: 280px;
                    background-color: var(--main-surface-primary);
                    padding: 16px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-default);
                    box-shadow: 0 4px 12px rgb(0 0 0 / 0.2);
                }
                .cpta-color-picker-popup .cpta-color-picker {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .cpta-color-picker-popup .cpta-sv-plane {
                    position: relative;
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    cursor: crosshair;
                    touch-action: none;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .cpta-color-picker-popup .cpta-sv-plane:focus {
                    outline: 2px solid deepskyblue;
                }
                .cpta-color-picker-popup .cpta-sv-plane .gradient-white,
                .cpta-color-picker-popup .cpta-sv-plane .gradient-black {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .cpta-color-picker-popup .cpta-sv-plane .gradient-white {
                    background: linear-gradient(to right, white, transparent);
                }
                .cpta-color-picker-popup .cpta-sv-plane .gradient-black {
                    background: linear-gradient(to top, black, transparent);
                }
                .cpta-color-picker-popup .cpta-sv-plane .sv-thumb {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 2px 1px rgb(0 0 0 / 0.5);
                    box-sizing: border-box;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }
                .cpta-color-picker-popup .cpta-slider-group {
                    position: relative;
                    cursor: pointer;
                    height: 20px;
                }
                .cpta-color-picker-popup .cpta-slider-group .slider-track,
                .cpta-color-picker-popup .cpta-slider-group .alpha-checkerboard {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 100%;
                    height: 12px;
                    border-radius: 6px;
                    pointer-events: none;
                }
                .cpta-color-picker-popup .cpta-slider-group .alpha-checkerboard {
                    background-image: repeating-conic-gradient(#808080 0% 25%, #c0c0c0 0% 50%);
                    background-size: 12px 12px;
                }
                .cpta-color-picker-popup .cpta-slider-group .hue-track {
                    background: linear-gradient(
                        to right,
                        hsl(0,100%,50%),
                        hsl(60,100%,50%),
                        hsl(120,100%,50%),
                        hsl(180,100%,50%),
                        hsl(240,100%,50%),
                        hsl(300,100%,50%),
                        hsl(360,100%,50%)
                    );
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"] {
                    -webkit-appearance: none;
                    appearance: none;
                    position: relative;
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    background-color: transparent;
                    cursor: pointer;
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"]:focus {
                    outline: none;
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 2px 1px rgb(0 0 0 / 0.5);
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 0 2px 1px rgb(0 0 0 / 0.5);
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"]:focus::-webkit-slider-thumb {
                    outline: 2px solid deepskyblue;
                    outline-offset: 1px;
                }
                .cpta-color-picker-popup .cpta-slider-group input[type="range"]:focus::-moz-range-thumb {
                    outline: 2px solid deepskyblue;
                    outline-offset: 1px;
                }
            `;
            document.head.appendChild(style);
        }
    }

    class UIManager {
        /** * @param {(config: CPTAConfig) => Promise<void>} onSaveCallback
         * @param {() => Promise<CPTAConfig>} getCurrentConfigCallback
         */
        constructor(onSaveCallback, getCurrentConfigCallback) {
            this.onSave = onSaveCallback;
            this.getCurrentConfig = getCurrentConfigCallback;

            this.settingsButton = new SettingsButtonComponent({
                onClick: () => this.settingsPanel.toggle()
            });
            this.settingsPanel = new SettingsPanelComponent({
                onSave: (newConfig) => this.onSave(newConfig),
                onShowJsonModal: () => this.jsonModal.open(this.settingsButton.element),
                onShowThemeModal: () => this.themeModal.open(),
                getCurrentConfig: () => this.getCurrentConfig(),
                getAnchorElement: () => this.settingsButton.element
            });
            this.jsonModal = new JsonModalComponent({
                onSave: (newConfig) => this.onSave(newConfig),
                getCurrentConfig: () => this.getCurrentConfig()
            });
            this.themeModal = new ThemeModalComponent({
                onSave: (newConfig) => this.onSave(newConfig),
                getCurrentConfig: () => this.getCurrentConfig()
            });
        }

        init() {
            this.settingsButton.render();
            this.settingsPanel.render();
            this.jsonModal.render();
            this.themeModal.render();
        }
    }

    // =================================================================================
    // SECTION: DOM Observers and Event Listeners
    // =================================================================================

    class ObserverManager {
        constructor() {
            this.currentTitleSourceObserver = null;
            this.currentObservedTitleSource = null;
            this.lastObservedTitle = null;
            this.sidebarResizeObserver = null;
            this.lastSidebarElem = null;
            // The new, single, shared observer for general purpose monitoring.
            this.mainObserver = null;
            // For tasks that run on ANY mutation.
            this.anyMutationTasks = [];
            // For tasks that run when a specific element is ADDED.
            this.registeredNodeAddedTasks = [];
            // To track conversation turns that have not yet completed generation.
            this.pendingTurnNodes = new Set();
            // Debounced function for updating navigation buttons.
            this.debouncedNavUpdate = debounce(() => EventBus.publish('cpta:navButtonsUpdate'), 100);
        }

        /**
         * A public method to register a task that runs when a node matching the selector is added.
         * @param {string} selector
         * @param {Function} callback
         */
        registerNodeAddedTask(selector, callback) {
            this.registeredNodeAddedTasks.push({ selector, callback });
        }

        /**
         * Clears all pending conversation turns.
         * Useful when navigating away from a chat.
         */
        cleanupPendingTurns() {
            this.pendingTurnNodes.clear();
        }

        /**
         * Scans the document for all existing conversation turns and processes them.
         * This is crucial for applying themes after page loads or navigations.
         */
        scanForExistingTurns() {
            const existingTurnNodes = Array.from(document.querySelectorAll('article[data-testid^="conversation-turn-"]'));
            if (existingTurnNodes.length > 0) {
                for (const turnNode of existingTurnNodes) {
                    // The check for already-observed nodes is now handled inside _processTurnSingle.
                    this._processTurnSingle(turnNode);
                }
            }
        }

        /**
         * The main callback, a dispatcher that calls specialized handlers.
         * @param {MutationRecord[]} mutations
         */
        _handleMainMutations(mutations) {
            this._garbageCollectPendingTurns(mutations);
            this._dispatchAnyMutationTasks(mutations);
            this._dispatchNodeAddedTasks(mutations);
            this._checkPendingTurns();
        }

        /**
         * Handles tasks that run on any mutation.
         * @param {MutationRecord[]} mutations
         */
        _dispatchAnyMutationTasks(mutations) {
            for (const task of this.anyMutationTasks) {
                task(mutations);
            }
        }

        /**
         * Handles tasks for newly added nodes.
         * @param {MutationRecord[]} mutations
         */
        _dispatchNodeAddedTasks(mutations) {
            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.addedNodes.length) {
                    for (const addedNode of mutation.addedNodes) {
                        if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
                        for (const task of this.registeredNodeAddedTasks) {
                            if (addedNode.matches(task.selector)) {
                                task.callback(addedNode);
                            }
                            addedNode.querySelectorAll(task.selector).forEach(task.callback);
                        }
                    }
                }
            }
        }

        /**
         * Removes any pending turn nodes that have been removed from the DOM to prevent memory leaks.
         * @param {MutationRecord[]} mutations
         * @private
         */
        _garbageCollectPendingTurns(mutations) {
            if (this.pendingTurnNodes.size === 0) return;

            for (const mutation of mutations) {
                if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                    for (const removedNode of mutation.removedNodes) {
                        if (removedNode.nodeType !== Node.ELEMENT_NODE) continue;

                        // Check if the removed node itself was a pending turn
                        if (this.pendingTurnNodes.has(removedNode)) {
                            this.pendingTurnNodes.delete(removedNode);
                        }

                        // Check if any descendants of the removed node were pending turns
                        const descendantTurns = removedNode.querySelectorAll('article[data-testid^="conversation-turn-"]');
                        for (const turnNode of descendantTurns) {
                            if (this.pendingTurnNodes.has(turnNode)) {
                                this.pendingTurnNodes.delete(turnNode);
                            }
                        }
                    }
                }
            }
        }

        /**
         * Checks if a conversation turn is complete.
         * @param {HTMLElement} turnNode
         * @returns {boolean}
         * @private
         */
        _isTurnComplete(turnNode) {
            // A turn is complete if it's a user message, or if it's an assistant
            // message that has the action buttons (like copy) rendered.
            const userMessageElement = turnNode.querySelector(CONSTANTS.SELECTORS.USER_MESSAGE);
            return !!(userMessageElement || turnNode.querySelector('div.flex.justify-start:has(button[data-testid="copy-turn-action-button"])'));
        }

        /**
         * Checks all pending conversation turns for completion.
         * @private
         */
        _checkPendingTurns() {
            if (this.pendingTurnNodes.size === 0) return;

            for (const turnNode of this.pendingTurnNodes) {
                // Re-inject avatars for pending turns on every mutation to prevent them
                // from disappearing due to React re-renders during streaming.
                const allElementsInTurn = turnNode.querySelectorAll('div[data-message-author-role]');
                allElementsInTurn.forEach(elem => {
                    EventBus.publish('cpta:avatarInject', elem);
                });

                if (this._isTurnComplete(turnNode)) {
                    // Re-run messageComplete event for all elements in the now-completed turn
                    allElementsInTurn.forEach(elem => {
                        EventBus.publish('cpta:messageComplete', elem);
                    });
                    EventBus.publish('cpta:turnComplete', turnNode);

                    this.debouncedNavUpdate();
                    this.pendingTurnNodes.delete(turnNode);
                }
            }
        }

        start() {
            // Setup and start the new, single, shared observer.
            this.mainObserver = new MutationObserver(this._handleMainMutations.bind(this));
            this.mainObserver.observe(document.body, { childList: true, subtree: true });

            this.startConversationTurnObserver();
            this.startGlobalTitleObserver();
            this.startSidebarObserver();
            this.startURLChangeObserver();
        }

        /**
         * @private
         * @description Sets up the monitoring for conversation turns.
         */
        startConversationTurnObserver() {
            // Register a task for newly added turn nodes.
            this.registerNodeAddedTask('article[data-testid^="conversation-turn-"]', (addedNode) => {
                const turnNodes = [];
                // Collect the root added node if it's a turnNode.
                if (addedNode.matches && addedNode.matches('article[data-testid^="conversation-turn-"]')) {
                    turnNodes.push(addedNode);
                }
                // Collect all descendant turnNodes.
                if (addedNode.querySelectorAll) {
                    turnNodes.push(...addedNode.querySelectorAll('article[data-testid^="conversation-turn-"]'));
                }

                // Process all unique turnNodes found in the added subtree.
                const uniqueTurnNodes = [...new Set(turnNodes)];
                for (const turnNode of uniqueTurnNodes) {
                    this._processTurnSingle(turnNode);
                }
            });
            // Initial batch processing for all existing turnNodes on page load.
            this.scanForExistingTurns();
        }

        /**
         * @private
         * @description Sets up the monitoring for title changes.
         */
        startGlobalTitleObserver() {
            const setupTitleObserver = (targetElement) => {
                if (!targetElement || targetElement === this.currentObservedTitleSource) return;
                this.currentTitleSourceObserver?.disconnect();
                this.lastObservedTitle = (targetElement.textContent || '').trim();
                this.currentObservedTitleSource = targetElement;
                EventBus.publish('cpta:themeUpdate');
                this.currentTitleSourceObserver = new MutationObserver(() => {
                    const currentText = (this.currentObservedTitleSource?.textContent || '').trim();
                    if (currentText !== this.lastObservedTitle) {
                        this.lastObservedTitle = currentText;
                        EventBus.publish('cpta:themeUpdate');
                    }
                });
                this.currentTitleSourceObserver.observe(targetElement, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            };

            const checkTitleAndSetupObserver = () => {
                const newTitle = document.querySelector(CONSTANTS.SELECTORS.TITLE_OBSERVER_TARGET);
                if (newTitle) {
                    setupTitleObserver(newTitle);
                } else if (!newTitle && this.currentObservedTitleSource) {
                    this.currentTitleSourceObserver?.disconnect();
                    this.currentObservedTitleSource = null;
                    this.lastObservedTitle = null;
                    EventBus.publish('cpta:themeUpdate');
                }
            };
            this.anyMutationTasks.push(debounce(checkTitleAndSetupObserver, 150));
            checkTitleAndSetupObserver();
        }

        /**
         * @private
         * @description Sets up the monitoring for sidebar appearance and resize.
         */
        startSidebarObserver() {
            const checkAndSetupResizeObserver = () => {
                const sidebar = document.querySelector(CONSTANTS.SELECTORS.SIDEBAR_WIDTH_TARGET);
                if (!sidebar) {
                    if (this.lastSidebarElem) {
                        this.sidebarResizeObserver?.disconnect();
                        this.lastSidebarElem = null;
                    }
                    return;
                }
                if (sidebar === this.lastSidebarElem) return;
                this.sidebarResizeObserver?.disconnect();
                this.lastSidebarElem = sidebar;
                this.sidebarResizeObserver = new ResizeObserver(() => EventBus.publish('cpta:layoutRecalculate'));
                this.sidebarResizeObserver.observe(sidebar);
                EventBus.publish('cpta:layoutRecalculate');
            };
            this.anyMutationTasks.push(debounce(checkAndSetupResizeObserver, 150));
            checkAndSetupResizeObserver();
            window.addEventListener('resize', () => EventBus.publish('cpta:layoutRecalculate'));
        }

        /**
         * @private
         * @description Sets up the monitoring for URL changes.
         */
        startURLChangeObserver() {
            let lastHref = location.href;
            const handler = () => {
                if (location.href !== lastHref) {
                    lastHref = location.href;
                    this.cleanupPendingTurns();
                    EventBus.publish('cpta:themeUpdate');
                    EventBus.publish('cpta:navigation');
                    // Give the DOM a moment to settle after navigation, then re-scan existing turns.
                    setTimeout(() => this.scanForExistingTurns(), 200);
                }
            };
            for (const m of ['pushState', 'replaceState']) {
                const orig = history[m];
                history[m] = function(...args) {
                    orig.apply(this, args);
                    handler();
                };
            }
            window.addEventListener('popstate', handler);
        }

        /**
         * Processes a single turnNode, adding it to the pending queue if it's not already complete.
         * @param {HTMLElement} turnNode
         */
        _processTurnSingle(turnNode) {
            if (turnNode.nodeType !== Node.ELEMENT_NODE || this.pendingTurnNodes.has(turnNode)) return;

            // --- Initial State Processing ---
            const initialElements = turnNode.querySelectorAll('div[data-message-author-role]');
            initialElements.forEach(elem => {
                EventBus.publish('cpta:avatarInject', elem);
            });

            if (this._isTurnComplete(turnNode)) {
                // If the turn is already complete when we first see it, process it immediately.
                initialElements.forEach(elem => {
                    EventBus.publish('cpta:messageComplete', elem);
                });
                EventBus.publish('cpta:turnComplete', turnNode);
                this.debouncedNavUpdate();
            } else {
                // Otherwise, add it to the pending list to be checked by the main observer.
                this.pendingTurnNodes.add(turnNode);
            }
        }
    }

    // =================================================================================
    // SECTION: Main Application Controller
    // =================================================================================

    class ThemeAutomator {
        constructor() {
            this.configManager = new ConfigManager();
            // Pass both callbacks to the UIManager constructor
            this.uiManager = new UIManager(
                this.handleSave.bind(this),
                () => Promise.resolve(this.configManager.get())
            );
            this.observerManager = new ObserverManager();

            // Instantiate all the specialized managers
            this.standingImageManager = new StandingImageManager(this.configManager);
            this.themeManager = new ThemeManager(this.configManager, this.standingImageManager);
            this.avatarManager = new AvatarManager(this.configManager);
            this.collapsibleBubbleManager = new CollapsibleBubbleManager(this.configManager);
            this.bubbleNavManager = new BubbleNavigationManager(this.configManager);
        }

        async init() {
            await this.configManager.load();
            // Initialize all managers
            this.avatarManager.init();
            this.standingImageManager.init();
            this.collapsibleBubbleManager.init();
            this.bubbleNavManager.init();
            this.uiManager.init();
            this.observerManager.start();

            // Initial theme update
            this.themeManager.updateTheme();
            // Apply browser-specific fixes after initialization.
            this._applyFirefoxFixes();
        }

        /** @param {CPTAConfig} newConfig */
        async handleSave(newConfig) {
            await this.configManager.save(newConfig);
            this.themeManager.cachedThemeSet = null;
            // Re-inject avatar style in case icon size changed
            this.avatarManager.injectAvatarStyle();
            // Trigger a theme update which will cascade to all modules
            this.themeManager.updateTheme();
            // Update heights for all wrappers
            this.avatarManager.updateAllChatWrapperHeight();
            // Always re-evaluate visibility of all dynamic buttons upon any setting change.
            // This ensures robustness and maintainability over granular change detection.
            this.collapsibleBubbleManager.updateAllButtons();
            this.bubbleNavManager.updateAllButtons();
        }

        /**
         * @description Checks if all CSS selectors defined in the CONSTANTS.SELECTORS object are valid and exist in the current DOM.
         * @returns {boolean} True if all selectors are valid, otherwise false.
         */
        checkSelectors() {
            // Automatically create the checklist from the CONSTANTS.SELECTORS object.
            const selectorsToCheck = Object.entries(CONSTANTS.SELECTORS).map(([key, selector]) => {
                // Create a description from the key name.
                const desc = key.replace(/_/g, ' ').toLowerCase().replace(/ \w/g, L => L.toUpperCase());
                return {
                    selector,
                    desc
                };
            });
            let allOK = true;
            console.groupCollapsed("[CPTA] CSS Selector Check");
            for (const {
                selector,
                desc
            } of selectorsToCheck) {
                try {
                    const el = document.querySelector(selector);
                    if (el) {
                        console.log(`[CPTA] ✅ [OK] "${selector}"\n     description: ${desc}\n     element found:`, el);
                    } else {
                        console.warn(`[CPTA] ❌ [NG] "${selector}"\n     description: ${desc}\n     element NOT found.`);
                        allOK = false;
                    }
                } catch (e) {
                    console.error(`[CPTA] 💥 [ERROR] Invalid selector "${selector}"\n     description: ${desc}\n     error:`, e.message);
                    allOK = false;
                }
            }
            if (allOK) {
                console.log("[CPTA] 🎉 All essential selectors are currently valid!");
            } else {
                console.warn("[CPTA] ⚠ One or more essential selectors are NOT found or invalid. The script might not function correctly.");
            }
            console.groupEnd();
            return allOK;
        }

        /**
         * @private
         * @description Applies specific layout fixes for Firefox.
         */
        _applyFirefoxFixes() {
            if (!/firefox/i.test(navigator.userAgent)) return;
            const SELECTOR = 'main#main .flex.h-full.flex-col.overflow-y-auto';
            const fixOverflowXHidden = (el) => {
                // The element itself is passed, no need to querySelectorAll again.
                if (el.style.overflowX !== 'hidden') el.style.overflowX = 'hidden';
            };

            // Register this task with the central observer.
            this.observerManager.registerNodeAddedTask(SELECTOR, fixOverflowXHidden);
            // Initial fix for elements that already exist on load.
            document.querySelectorAll(SELECTOR).forEach(fixOverflowXHidden);
        }
    }

    // ---- Script Entry Point ----
    const automator = new ThemeAutomator();
    automator.init();

    // ---- Debugging ----
    // Description: Exposes a debug function to the console.
    try {
        if (typeof exportFunction === 'function') {
            exportFunction(automator.checkSelectors.bind(automator), unsafeWindow, {
                defineAs: 'cptaCheckSelectors'
            });
        } else if (typeof unsafeWindow !== 'undefined') {
            unsafeWindow.cptaCheckSelectors = () => automator.checkSelectors();
        }
        console.log("[CPTA] Debug function is available. Type `cptaCheckSelectors()` in console to run.");
    } catch (e) {
        console.error("[CPTA] Could not expose debug function to console.", e);
    }

})();