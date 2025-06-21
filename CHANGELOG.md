# Changelog

---
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