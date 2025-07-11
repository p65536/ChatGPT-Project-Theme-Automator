# Changelog

## [1.2.3] - 2025-07-03

### Fixes
* **Fixed scroll area shrinking bug**: Resolved an issue where the scrollable area would shrink when using the message navigation buttons in Chrome-based browsers. The fix replaces `scrollIntoView()` with direct control of the `scrollTop` property.

### Improvements
- **Optimized DOM Observation**: Replaced per-turn `MutationObserver` instances with a single shared observer that manages all turns, significantly reducing memory usage and improving performance on long conversations.

### Refactoring
- **Class Responsibility Separation**: Moved CSS generation logic from `ThemeManager` to a new `StyleGenerator` class.
- **Centralized Constants**: Consolidated all configuration values (such as CSS selectors and Z-INDEX) into a single `CONSTANTS` object.
- **Eliminated Redundancy**: Unified ID generation and completion check logic into shared utility functions to improve code readability and maintain DRY principles.

## [1.2.2] - 2025-07-02

### Fixes
- Fixed a bug where regular expressions were not checked correctly when importing JSON.

## [1.2.1] - 2025-07-02

### Fixes
- Added CSS to remove the gradient at the bottom of the screen, which was introduced in the ChatGPT UI update on July 1, 2025. This resolves an issue where custom backgrounds were being obscured by the gradient.

### Improvements
- Improved the stability of theme application when displaying chat history or navigating between different chats. Added a process to scan all existing conversation turns on page load, making it less likely for themes to be missed. Specifically, this resolves an issue where the theme would not apply to the assistant's first message in a Custom GPT chat.

### Refactoring
- Refactored the method for applying themes to message bubbles. The injection of custom classes (e.g., `.cpta-user-bubble`) has been removed in favor of a simpler and more reliable CSS selector method. This reduces DOM manipulation and lowers the risk of conflicts with other scripts.

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