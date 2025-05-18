# ChatGPT Project Theme Automator – Specification

---

## 1. Overview

This script is a Tampermonkey userscript for ChatGPT (chatgpt.com) that automatically applies different themes (user name, assistant name, icon, text color, etc.) for each project or Custom GPT.  
In addition to matching project names, the script also checks the page title (including Custom GPT names and chat names), so themes can be applied based on Custom GPT names as well.

**Main use cases:**

* Easily switch colors, character names, and icons for each project
* Flexibly change user/assistant labels for multiple projects, roleplay, or training scenarios
* Take advantage of ChatGPT Plus "Project" features to visually organize business or hobby chats

---

## 2. Requirements

* ChatGPT official web UI: [https://chatgpt.com/](https://chatgpt.com/)
* Tampermonkey (latest version recommended)
* Browser: Chrome, Firefox, Edge, etc. (latest version recommended)

---

## 3. Script Structure & Customization Options

### 3.1. Configuration

Near the top of the script is the following configuration object:

```js
const CHATGPT_PROJECT_THEME_CONFIG = {
    themeSets: [ ... ],  // Array of project-specific theme objects
    defaultSet: { ... }  // Default theme when no project matches
};
````

#### 3.1.1. themeSets Array

Each element defines a theme for one project:

* `projects`:
  Project name (string or regular expression). Array allows multiple, and you can mix types.
* `user`, `assistant`:

  * `name`: Display name
  * `icon`: Icon image (URL, base64, or SVG)
  * `textcolor`: Text color (CSS color code)

> **Any omitted property will fall back to the corresponding value in `defaultSet`.**

#### 3.1.2. defaultSet Object

* Used when no project name matches, or for free users (no project).
* Can be set in the same way as the project settings.

#### 3.1.3. ICON\_SIZE

```js
const ICON_SIZE = 64; // or 96, 128
```

* Icon size (in pixels)
* 64 is recommended, but you can use 96 or 128 for larger icons

---

### 3.2. Theme Selection & Switching Logic

* The script fetches the current project name: if `a.truncate[href^="/g/"]` exists, it uses that; otherwise, it uses `document.title` (which covers Custom GPT names).

  * First, it checks for an exact string match
  * Next, it checks each regular expression (RegExp)
  * If nothing matches, `defaultSet` is applied

* The theme is reapplied in the following cases:

  * Page navigation (SPA support: `pushState`/`replaceState`/`href` changes)
  * Project name element (`<a>`) textContent changes
  * Chat area (`div > article`) is created or changed

---

### 3.3. Injecting Icons & Display Names

* For each chat message element (`[data-message-author-role]`):

  * Inject an icon and display name at the side (based on user/assistant)
  * Place SVG, `img`, or text elements
  * The required layout CSS is inserted dynamically on first use

---

### 3.4. Changing Text Color

* `user` and `assistant` text colors are set via `textcolor`:

  * Applied only to Markdown elements (p, h1–h6, ul, ol, li, strong, em, blockquote, table, th, td, etc.)
  * **Not** applied to code blocks or math (pre, code, katex, etc.)
* The input box and fixed UI retain their default color via explicit `inherit`

---

### 3.5. Observation & Reapplication Logic

* Uses MutationObserver to monitor:

  * The message area, project name, and the entire chat container
  * Automatically reapplies themes for new chats, navigation, or dynamic changes

---

## 4. Sample Configuration

```js
const CHATGPT_PROJECT_THEME_CONFIG = {
    themeSets: [
        {
            projects: ['project1'],
            user: {},
            assistant: { textcolor: '#FF9900' }
        },
        {
            projects: ['project2'],
            user: {
                name: 'User',
                icon: '<svg ...>',
                textcolor: '#f0e68c'
            },
            assistant: {
                name: 'CPU',
                icon: '<svg ...>'
            }
        }
    ],
    defaultSet: {
        user: {
            name: 'You',
            icon: '<svg ...>'
        },
        assistant: {
            name: 'ChatGPT',
            icon: '<svg ...>'
        }
    }
};
```

* You only need to specify properties you want to override; all others inherit from `defaultSet`.

---

## 5. Notes & Limitations

* **No auto-update:** Always back up your theme configuration before updating the script.
* **No external theme storage:** Settings are embedded in the script.
* **Major ChatGPT UI changes may require script updates.**
* **SVG/base64 icons:** Large images may impact performance.
* **Not tested on mobile devices.**

---

## 6. Recommended Use Cases & Customization Examples

* Personalize your assistant by customizing icons and display names
* Instantly know which project is active by changing colors or icons for each
* Use different characters for each business project, RPG session, or training group
* Express your style with original icons or Google Fonts SVGs
* Advanced users can add custom CSS for further theme tweaks
* To apply a theme to a Custom GPT by name, specify a regular expression that matches the relevant part of the page title. This allows flexible targeting of Custom GPTs.

---

## 7. Expansion Ideas (author does not plan to implement, but contributions are welcome)

* External config file support; simple UI for customization
* Chat bubble background color customization
* Applying themes to the chat input box
* Color themes that adapt to light/dark mode (the author uses only dark mode)
* More detailed customization per theme (badges, decorations, CSS overrides)
* Enhanced multi-language support or automatic project detection

---

## 8. License & Author

* MIT License
* Author: [p65536](https://github.com/p65536)

---
