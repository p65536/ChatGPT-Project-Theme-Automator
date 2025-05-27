# ChatGPT Project Theme Automator Settings JSON: Full Reference & Samples

## Overview

This page summarizes the purpose, usage examples, accepted values, and important notes for each configuration property.  
If you're unsure how to customize your settings, refer to this guide.
For even more details, see any standard online CSS reference.

**Note:**  
The property names used in this script's settings are not always the same as the corresponding CSS property names.  
For deeper technical details, search the web using the CSS property name (not the script setting name).  
You can find the corresponding CSS property in the "Notes" column.

---

## JSON Structure

Below is an example of the settings JSON structure.  
**Copy-paste ready samples** are also available in the [`samples`](../samples) folder.

```json
{
  "options": {
    "icon_size": 64
  },
  "themeSets": [
    {
      "projects": [
        "/\\[theme1\\]/i"
      ],
      "user": {
        "name": "You",
        "icon": "url, SVG, base64, ...",
        "textcolor": "#89c4f4",
        "font": "Meiryo, sans-serif",
        "bubbleBgColor": "#232e3b",
        "bubblePadding": "10px 14px",
        "bubbleBorderRadius": "16px",
        "bubbleMaxWidth": "70%",
        "standingImage": ""
      },
      "assistant": {
        "name": "ChatGPT",
        "icon": "url, SVG, base64, ...",
        "textcolor": "#ffe4e1",
        "font": "Meiryo, sans-serif",
        "bubbleBgColor": "#384251",
        "bubblePadding": "10px 14px",
        "bubbleBorderRadius": "16px",
        "bubbleMaxWidth": "90%",
        "standingImage": ""
      },
      "windowBgColor": "#151b22",
      "windowBgImage": "url('url here')",
      "windowBgSize": "cover",
      "windowBgPosition": "center center",
      "windowBgRepeat": "no-repeat",
      "windowBgAttachment": "scroll",
      "inputAreaBgColor": "#202531",
      "inputAreaTextColor": "#e3e3e3",
      "inputAreaPlaceholderColor": "#5e6b7d"
    },
    {
      "(you can add as many themes as you want)"
    }
  ],
  "defaultSet": {
    "user": {
      "name": "You",
      "icon": "",
      "textcolor": "#009688",
      "font": null,
      "bubbleBgColor": null,
      "bubblePadding": null,
      "bubbleBorderRadius": null,
      "bubbleMaxWidth": null,
      "standingImage": null
    },
    "assistant": {
      "name": "ChatGPT",
      "icon": "",
      "textcolor": "#ff9800",
      "font": null,
      "bubbleBgColor": null,
      "bubblePadding": null,
      "bubbleBorderRadius": null,
      "bubbleMaxWidth": null,
      "standingImage": null
    },
    "windowBgColor": null,
    "windowBgImage": null,
    "windowBgSize": "cover",
    "windowBgPosition": "center center",
    "windowBgRepeat": "no-repeat",
    "windowBgAttachment": "fixed",
    "inputAreaBgColor": null,
    "inputAreaTextColor": null,
    "inputAreaPlaceholderColor": null
  }
}
```

---

## Overall Structure

| Key Name     | Description / Example                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------- |
| `options`    | Global script options                                                                             |
| `themeSets`  | Theme definitions. You can create multiple theme sets.                                            |
| `defaultSet` | The default theme. This is used if no `themeSets` definition matches the current project/session. |

---

## `"options"` Settings

| Property      | Purpose / Description                   | Example  | Notes & Allowed Values                                       |
|---------------|----------------------------------------|----------|--------------------------------------------------------------|
| icon_size     | Icon size for user/assistant icons      | 64       | Default is `64`. <br> Recommended: `64`, `96`, or `128`.     |

### Display Example

| icon_size | Description / Recommended Use  | Example                                                |
|-----------|-------------------------------|--------------------------------------------------------|
| 64        | **Default size** / standard   | ![icon_size=64](./cpta_iconsize_64.webp)               |
| 96        | Larger icons                  | ![icon_size=96](./cpta_iconsize_96.webp)               |
| 128       | Extra-large (character art)   | ![icon_size=128](./cpta_iconsize_128.webp)             |

---

#### Sample JSON (`options` section)

```json
  "options": {
    "icon_size": 64
  },
````

---

## `"themeSets"` Settings

| Property | Purpose / Description                                                                                                                                                                                                                                                              | Example                                                | Notes & Allowed Values                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| projects | Match the window title using these conditions. <br>**Must be an array of regular expression strings.** <br><br>**Backslashes (`\`) must be double-escaped (`\\`) in JSON.** <br><br>Main uses:<br>- Partial match on project name<br>- Custom GPT (custom AI) name<br>- Chat title | `[ "/myproject/i", "/^Project\\d+/", "/^\\[BUG\\]/" ]` | Array of regex strings, format: `"/pattern/flags"`. <br> See online regex references for syntax. <br> To match most projects, just write `"/your-project-name/i"`. <br> To apply this theme to multiple projects, list them comma-separated in the array. <br>**Examples:**<br>- Contains `"myproject"` (case-insensitive)<br>- Starts with `"Project"+number`<br>- Starts with `"[BUG]"` |

---

#### Sample JSON (`projects` section)

```json
{
  "projects": [
    "/myproject/i",
    "/^Project\\d+/",
    "/^\\[BUG\\]/"
  ],
}
```

---

## User / Assistant Settings

| Property            | Purpose / Description                        | Example                                    | Notes & Allowed Values                                                                                                                                               |
|---------------------|---------------------------------------------|--------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **name**            | Display name                                | `"You"` <br> `"ChatGPT"`                   | Any string value                                                                                                               |
| **icon**            | Icon image, SVG, base64, etc.               | `"https://.../icon.png"` <br> `"SVG code"` <br> `"data:image/png;base64,..."` | Try [Google Fonts](https://fonts.google.com/icons) for SVGs.<br>When writing SVG code in JSON, all `"` must be escaped as `\"`. See the bookmarklet tool in the README for easy conversion. |
| **textcolor**       | Text color                                  | `"#89c4f4"`                                | CSS color code (`#`, `rgb()`, color names, etc.)                                                                               |
| **font**            | Font for the chat bubble                    | `"Meiryo, sans-serif"`                     | Any valid CSS font declaration                                                                                                |
| **bubbleBgColor**   | Bubble background color                     | `"#222833"` <br> `"#343541"`               | CSS property: background-color                                                                                                |
| **bubblePadding**   | Bubble inner padding                        | `"10px 14px"`                              | CSS property: padding                                                                                                         |
| **bubbleBorderRadius** | Bubble corner radius                     | `"16px"`                                   | CSS property: border-radius (px, %)                                                                                           |
| **bubbleMaxWidth**  | Maximum width of the bubble                 | `"400px"`                                  | CSS property: max-width (px, %)                                                                                               |
| **standingImage**   | Standing image URL                          | `"https://.../sample.png"`                 | URL only (no `url()` needed)                                                                                                  |

---

## Background Settings

| Property            | Purpose / Description                          | Example                                        | Notes & Allowed Values                                                              |
|---------------------|------------------------------------------------|------------------------------------------------|-------------------------------------------------------------------------------------|
| **windowBgColor**   | Chat window background color                   | `"#11131c"`                                    | CSS property: background-color                                                      |
| **windowBgImage**   | Chat window background image                   | `"url('https://.../bg.png')"`                  | CSS property: background-image format. <br>**Always use `url('...')`.** Gradients allowed, e.g., `linear-gradient(...)`    |
| **windowBgSize**    | Background image size                          | `"cover"` <br> `"contain"` <br> `"auto"`       | CSS property: background-size                                                       |
| **windowBgPosition**| Background image position                      | `"center center"` <br> `"left top"`            | CSS property: background-position                                                   |
| **windowBgRepeat**  | Background image repeat                        | `"no-repeat"` <br> `"repeat"` <br> `"repeat-x"`| CSS property: background-repeat                                                     |
| **windowBgAttachment** | Background image attachment (scroll/fixed)  | `"scroll"` <br> `"fixed"`                      | CSS property: background-attachment                                                 |

---

## Input Area Settings

| Property                  | Purpose / Description                        | Example      | Notes & Allowed Values                                        |
|---------------------------|----------------------------------------------|--------------|---------------------------------------------------------------|
| **inputAreaBgColor**          | Input area background color                | `"#21212a"`  | CSS property: background-color (color code)                   |
| **inputAreaTextColor**        | Input area text color                      | `"#e3e3e3"`  | CSS property: color (color code)                              |
| **inputAreaPlaceholderColor** | Input area placeholder text color          | `"#888"`     | CSS property: color (color code)                              |

---

## `"defaultSet"` Settings

The default theme, applied if none of the `"themeSets"` match.  
Has the same structure as the items in `"themeSets"`, but without a `"projects"` array.

---

## Tips

- If you specify the chat bubble background color using `rgba()`, you can control transparency and let the background show through.
- If you do **not** want to override ChatGPT’s default appearance for chats that don’t match any theme, set all properties in `defaultSet` to `null`. In this case, non-matching chats will display using the original ChatGPT theme.
- If you want to use local images for icons, backgrounds, or standing images, encoding them as `base64` is possible. However, keep in mind this will increase the size of your JSON and may impact performance. Whenever possible, it’s recommended to use online resources (URLs).
