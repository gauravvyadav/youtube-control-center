# Extension Permissions

This document outlines the permissions required by the YouTube Control Center extension and the justification for each, as required for Google Web Store review.

| Permission | Purpose | Webstore Justification |
|------------|---------|------------------------|
| `storage` | Save user preferences. | Required to persist user settings like quality preferences, theme, and layout options across browser sessions. |
| `tabs` | Track and manage YouTube tabs. | Necessary to identify which tabs are running YouTube and to ensure settings are synchronized correctly across multiple open player instances. |
| `scripting` | Execute code in the Main World. | Essential for Manifest V3 compliance to interact with the internal YouTube Player API. This is the only secure way to control quality and audio tracks directly. |
| `activeTab` | Temporary context access. | Used to allow the extension's popup to securely communicate with the active YouTube tab when the user interacts with the dashboard. |

## Host Permissions

The extension requires access to:
- `*://*.youtube.com/*`
- `*://youtube.com/*`

**Justification:** The extension is designed specifically to enhance the user experience on YouTube. Access is required to inject content scripts that manage playback, quality, and layout features.
