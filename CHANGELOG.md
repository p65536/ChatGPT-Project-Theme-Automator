# Changelog

## [1.2.0] - 2025-07-01

### New Features
- **GUI-based Settings Management**
  - Completely revamped the settings panel and theme editor, allowing most settings to be configured intuitively through the GUI without direct JSON editing.
- **Message Collapsing**
  - Long messages are now automatically collapsed and can be expanded as needed. The threshold and on/off state can be adjusted in the settings (`features.collapsible_button`).
- **Message Navigation**
  - Added "Previous," "Next," and "Scroll to Top" buttons for each user/assistant message, controlled via `features.sequential_nav_buttons` and `features.scroll_to_top_button`.
- **Custom Chat Width**
  - You can now set the maximum width of the chat area using `options.chat_content_max_width`. It dynamically adjusts based on the presence of standing images and the sidebar.

### Improvements
- **Table Display Improvement**
  - Fixed an issue where wide tables would overflow the chat bubble. They are now contained within the bubble with a horizontal scrollbar.

### Breaking Changes
- **Configuration JSON Structure Change**
  - The structure of the settings JSON has been completely overhauled. As a result, **it is no longer compatible with versions prior to v1.1.1.**
  - **Please use the [Configuration File Converter](https://p65536.github.io/ChatGPT-Project-Theme-Automator/tools/convert_json.html) to migrate your settings.**
  - Key changes include: property names converted to camelCase, `projects` changed to `metadata.matchPatterns`, etc.

### Refactoring
- **Architectural Overhaul**
  - The entire codebase was restructured into a modern, class-based design with separated responsibilities, significantly improving maintainability and extensibility.
- **Improved Robustness of CSS Selectors**
  - The script now applies its own unique class names (e.g., `cpta-user-bubble`), making it more resilient to UI changes from ChatGPT.
- **Optimized DOM Observation**
  - Switched to a per-conversation-turn monitoring system to optimize and stabilize the timing of dependent features (like message collapsing).
- **Enhanced Settings Auto-Completion**
  - Implemented a recursive merge (`deepMerge`) with default settings, allowing older or partial configuration files to run safely.
- **Strengthened Debugging Features**
  - Added the `cptaCheckSelectors()` function to allow for a one-time check of all CSS selector validity.

## [1.1.1] - 2025-06-21
- (Fix) Fixed an issue where the chat bubble width, input area background, and text color would become transparent when their settings were null. Now, when unset, the default ChatGPT design is applied.
- (Change) Unified the logic so that for bubble width, bubble background color, input area properties, etc., if the value is null or unset, the corresponding CSS is not output at all.

## [1.1.0] - 2025-06-21
- (Changed) Significantly refactored the avatar injection logic for improved performance and maintainability.
- (Changed) Standing Image Implementation**: Changed the implementation of standing images from using `<img>` tags to using the `background-image` property on `<div>` elements.
- (Changed) Specify `bubblePadding` and `bubbleBorderRadius` in `defaultSet`.
- (Added) Enhanced Standing Images**: Following the implementation change, the `standingImage` property now supports CSS functions like `linear-gradient()`, allowing for gradients and other complex backgrounds in addition to standard image URLs.

## [1.0.4] - 2025-06-10
- Set the script icon to the ChatGPT icon.
- Changed the selector for obtaining the sidebar width due to changes in the ChatGPT UI.

## [1.0.3] - 2025-06-01
- In the development version, the "i" flag was automatically added to regular expressions. Although it was supposed to be removed for the release, some code remained, so it has now been fully deleted.

## [1.0.2] - 2025-05-31
- Adjusted the z-index of standing images (set to 'auto' for now; this change is intended to prevent display conflicts with other scripts)

## [1.0.1] - 2025-05-30
- Fixed inappropriate samples (embedded code)

## [1.0.0] - 2025-05-28
- First public release