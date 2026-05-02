# Technical Architecture & File Structure

YouTube Control Center uses a modern Manifest V3 architecture powered by **WXT** and **React**.

## 1. Execution Worlds
The extension operates across two distinct JavaScript environments to bypass security restrictions:

- **Isolated World (`yt-isolated.content.tsx`)**: Manages storage, navigation observers, and logic guards. It cannot see YouTube's internal variables.
- **Main World (`yt-player.content.tsx`)**: Injected directly into the page's JS context. It has full access to the `ytplayer` API for zero-flicker quality and audio switching.

## 2. Directory Map

- `entrypoints/`: Primary logic entry points.
    - `yt-isolated.content.tsx`: The "Brain" - manages settings and observes page changes.
    - `yt-player.content.tsx`: The "Executor" - interacts directly with the YouTube API in the Main World.
    - `resize.content.tsx`: Handles layout changes like Cinema Mode.
    - `background.tsx`: Manages icon states and extension-level events.
    - `popup/`: React-based dashboard UI.
- `lib/`: Core shared libraries.
    - `player-api.ts`: Low-level YouTube API interaction logic.
    - `storage-bridge.ts`: Synchronizes settings between the browser and the web page.
    - `messaging.ts`: Custom event-based messaging between Isolated and Main worlds.
    - `utils.ts`: Shared DOM and visibility helpers.
- `modules/yt/`: Feature-specific handlers (Shorts, Sticky Player, etc).
- `assets/`: Icons, global CSS (Tailwind 4), and static images.
- `docs/`: Technical documentation and permissions justifications.
