# ChatGPT Project Theme Automator

![license](https://img.shields.io/badge/license-MIT-green)
![userscript](https://img.shields.io/badge/userscript-Tampermonkey-blueviolet)
![platform](https://img.shields.io/badge/platform-ChatGPT-lightgrey)
![topic](https://img.shields.io/badge/topic-theme_automator-ff69b4)
![topic](https://img.shields.io/badge/topic-ui_enhancement-9cf)

[![Download](https://img.shields.io/badge/Download-ChatGPT_Project_Theme_Automator.user.js-blue?style=flat-square\&logo=download)](https://github.com/p65536/ChatGPT-Project-Theme-Automator/raw/main/ChatGPT%20Project%20Theme%20Automator.user.js)

![version](https://img.shields.io/badge/version-1.0.0-blue)  
Last updated: **2025/05/28**  
[View changelog](./CHANGELOG.md)

[日本語READMEはこちら](./README_ja.md)

---

## Overview

**ChatGPT Project Theme Automator** is a Tampermonkey userscript that brings "automatic theme switching" to ChatGPT's UI.  
This script allows you to flexibly customize **user/assistant names, text colors, icon images, chat bubble style, background images, standing images,** and more—per project, per custom GPT, or even per chat title.

* Themes can be matched not just to project names, but also to **custom GPT names or chat titles**, making this script useful even for free users.
* **All settings are managed in JSON**—easy to export/import and recommended to edit in your favorite editor.

  >### Related Script
  >**[ChatGPT Quick Text Buttons](https://github.com/p65536/ChatGPT-Quick-Text-Buttons)**  
  >A userscript that adds customizable "quick text" buttons to the ChatGPT chat window.

---

## Features

* **Automatic theme switching** based on project name, custom GPT name, or chat title (matching via regular expressions)
* Customize user/assistant display names, icons, and text colors
* **Show separate "standing images"** for both user and assistant (left/right of chat window)
* Icons can be set using SVG, PNG, JPEG, Base64, or external URLs
* Specify matching conditions using regular expressions for maximum flexibility
* **Easy export/import** of your entire theme configuration (JSON format)
* Includes starter samples—perfect for users new to JSON configuration

---

## Screenshots & Usage Examples

### 1. Default Theme Example  
When no specific project matches, the default theme applies.

![Default theme example](./docs/cpta_theme_sample_default.webp)

### 2. Multiple Themes per Project/Custom GPT/Chat  
You can define as many themes as you want—each matched to project names, custom GPTs, or chat titles.

![Theme sample #1](./docs/cpta_theme_sample_theme1.webp)

### 3. Another Theme Example

![Theme sample #2](./docs/cpta_theme_sample_theme2.webp)

### 4. Add Personality with Standing Images & Custom Icons  
You can display full-body "standing images" and custom icons for both user and assistant.

![Theme sample #3](./docs/cpta_theme_sample_game.webp)

### 5. Enhance Conversations with Your Personal Assistant  
You can create a fully customized visual style for each project or character. (By the way, this is my personal assistant.)

![Theme sample #4](./docs/cpta_theme_sample_haruna.webp)

### 6. Example of Customizable Items  
For a detailed explanation, see [manual_json.md](./docs/manual_json.md).

![Customizable items](./docs/cpta_customizable_items.webp)

---

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Download the latest version of  
   [`ChatGPT Project Theme Automator.user.js`](./ChatGPT%20Project%20Theme%20Automator.user.js) from this repository.
3. In Tampermonkey, create a new script and paste the code, or simply drag and drop the `.user.js` file into Tampermonkey.

---

## Update

1. (Recommended) Export your settings before updating.
2. In the Tampermonkey dashboard, open this script and replace the entire content with the new version.

---

## How to Use

* Open the **settings** screen by clicking the gear icon at the top right of the chat window.
* Specify your theme(s) for each project, custom GPT, or chat using **JSON format**.  
  *Recommended:* Edit your JSON in your favorite editor, then copy & paste it, or import a JSON file directly.

---

## Sample Settings

The easiest way to get started is to copy a sample from the [`samples`](./samples) folder and modify the properties to your liking.  
You can import a sample JSON in either of the following ways.  
*Note: The samples use public SVG icons from Google Fonts.*

- Copy the sample JSON text and paste it into the settings screen’s textarea, then click `Save`.
- Download a sample JSON file, then use the `Import` function on the settings screen and click `Save`.

After applying your settings, the configuration in `defaultSet` should be active by default.  
Next, to test how themes are applied for specific projects, custom GPTs, or chats, try the following:

- Set your chat title to start with `[Theme1]` → The `[Theme1]` theme will be applied.
- Set your chat title to start with `[Theme2]` → The `[Theme2]` theme will be applied.
- Set your chat title to start with `[Game]` → The `[Game]` theme will be applied.

The sample includes four themes: one default and three project-specific themes.  
Feel free to edit these settings as you like.

For full details on JSON format and available settings, see  
**[ChatGPT Project Theme Automator Settings JSON: Complete Guide & Samples](./docs/manual_json.md)**

---

## SVG Escape Bookmarklet

You can set SVG code as an icon, but when adding SVG code to your JSON configuration, you need to escape all `"` as `\"`.
Manually escaping every quote can be tedious, so a simple **bookmarklet** tool is provided for easy conversion.  
A bookmarklet is a special type of bookmark that stores JavaScript code and allows you to run it with a single click.  
Follow the steps below to add it to your bookmarks.

### 1. Select all of the text below (triple click) and **drag and drop** it to your bookmarks bar:

```js
javascript:(async()=>{function e(s){return s.replace(/\\/g,"\\\\").replace(/\"/g,'\\\"').replace(/\n/g,"");}try{const t=await navigator.clipboard.readText();if(!t.trim().startsWith("<svg")){alert("Clipboard does not contain SVG code.");return;}const a=e(t);await navigator.clipboard.writeText(a);alert("The SVG has been escaped and copied to your clipboard! Paste it into the icon item.");}catch(r){alert("Failed: "+r.message);}})()
```

### 2. When prompted, give the bookmarklet any name you like (e.g., "ConvSVG").

(Example dialogs are shown below for Firefox.)

  #### Add to bookmark

  ![Bookmark registration dialog](./docs/cpta_a001.png)

  #### Save with any name

  ![Example: name as ConvSVG](./docs/cpta_a002.png)

  #### Added to bookmark

  ![Bookmark added](./docs/cpta_a004.png)

### 3. Usage

1. Copy the SVG code you want to use (e.g., from [Google Fonts](https://fonts.google.com/icons)).

   ![Google Fonts copy SVG](./docs/cpta_a003.png)

2. Click the “ConvSVG” bookmarklet.

   ![Bookmarklet running](./docs/cpta_a004.png)

3. The escaped SVG code is now in your clipboard.

   ![Success message](./docs/cpta_a005.png)

4. Paste it into the `"icon"` property in your JSON configuration:

   ```json
   "icon": "Paste here"
   ```

---

## Tips & Customization Ideas

* Give your assistant a unique personality by setting icons, names, and colors.
* Visually distinguish between different projects or sessions at a glance—great for multitaskers.
* Role-play and tabletop gaming: set character themes per project/session.
* Use your own icons or SVGs from Google Fonts for a personalized look.
* Extend the appearance with custom CSS fonts or color themes.
* Powerful regular expression matching lets you apply themes exactly where you want.

---

## Limitations & Notes

* **There is no auto-update feature.**  
  When a new version is released, you need to manually update the script.
* Major UI changes on ChatGPT.com may break compatibility.
* Tested on Firefox. Should also work on Chromium-based browsers, but not guaranteed.

---

## License

MIT License

---

## Author

* [p65536](https://github.com/p65536)

---

## Known Issues

- When the assistant outputs a table, the content may overflow the chat bubble—especially if you set a custom bubble width. (Thinking about the best solution. Maybe a horizontal scrollbar?)

---

## Future Plans

### Planned Features

- Make assistant/user names display in a single line (currently, long names wrap under the icon).
- Refine theme application when switching projects from the sidebar (currently, the chat list and project files may not reflect the theme).
- Option to set a background/mask behind user/assistant names for better visibility (now transparent, so names may be hard to read on some backgrounds).

### Ideas Under Consideration (not planned)

- GUI for settings (editing JSON is sufficient for most users)
- Auto-update support (manual version control is more transparent)
- Cloud sync for settings (local export/import is enough)
- Theme application for sidebar (seems unnecessary)
- Change input area font (is this needed?)
- On/off toggle for applying themes to the top toolbar area (originally excluded, but including it improves visual consistency)

---
