# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Exclude YouTube Music (`music.youtube.com`) from running content scripts, resolving the split screen / layout cutting in half issue.
- Fix TypeScript type checking mismatch errors in `yt-embed.content.tsx` and `shorts-handler.ts` by ensuring the required `isEnhancedBitrate` field is passed correctly to the `PlayerMessage.APPLY_QUALITY` messenger payload.
- Fix a bug in the audio track selection helper (`forceOriginalAudioTrack`) where it would redundantly switch and reload the audio track even if it was already playing the original audio.

## [0.1.1] - 2026-05-06

### Added
- GitHub link icon added to popup footer.
- Gaurav Labs website link icon added to popup footer.

### Fixed
- Fixed quality resolution dropdown menu being clipped by the Section element's overflow container.

## [0.1.0] - 2026-05-02

### Added
- Initial release of YouTube Control Center.
- Quality Locking (Super Resolution).
- Enhanced Bitrate selection.
- Auto-Resize (Cinema Mode / Default).
- Force Original Audio track.
- Sticky Player functionality.
- Hide YouTube Shorts feature.
- Internationalization (i18n) support for English.
- Premium UI with Light and Dark mode support.
- GitHub repository polish (Badges, Issue Templates, CONTRIBUTING guide).
- Social preview banner.

### Fixed
- Fixed version sync in popup footer to match manifest version.
- Removed shadows from toggles for a cleaner UI.
