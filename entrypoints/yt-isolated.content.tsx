import { addStorageListeners, loadStorageValues } from '@/lib/storage-bridge';
import {
  addGlobalEventListener,
  getIsExtensionEnabled,
  getPlayerDiv,
  getVisibleElement,
  isAdShowing,
  OBSERVER_OPTIONS,
  SELECTORS
} from '@/lib/utils';
import { sendQualityToPlayer } from '@/modules/yt/quality-changer';
import { isShortsPage, handleShortsNavigation, sendQualityToMainWorld as sendShortsQuality } from '@/modules/yt/shorts-handler';
import { sendAudioToPlayer } from '@/modules/yt/audio-handler';
import { toggleStickyPlayer } from '@/modules/yt/sticky-handler';
import { toggleShortsRemover } from '@/modules/yt/shorts-remover';

/**
 * ISOLATED CONTENT SCRIPT
 * 
 * This script runs in an isolated world and manages the extension's high-level logic:
 * - Observing page navigation and video element availability.
 * - Loading and listening for storage changes.
 * - Sending commands to the MAIN world player script via messaging.
 */

let titleLast = document.title;
let urlLast = location.href;
let lastSentVideoId = '';
let lastSentSettingsKey = '';

/**
 * Prepares and sends playback settings to the player script.
 * We use a "Settings Key" hash to prevent redundant messages that could 
 * trigger YouTube's security blocks.
 */
async function prepareToChangeQualityOnDesktop(e?: Event) {
  // If disabled, immediately clean up any active layout features
  if (!window.ytccExtEnabled) {
    toggleStickyPlayer(false);
    toggleShortsRemover(false);
    return;
  }

  if (location.pathname.startsWith('/shorts/')) return;

  // Safety: Don't touch the player during ads
  if (isAdShowing()) return;

  // 1. Refresh latest settings from storage
  await loadStorageValues();
  
  // 2. Apply persistent layout features
  toggleStickyPlayer(window.ytccIsStickyPlayer ?? false);
  toggleShortsRemover(window.ytccIsHideShorts ?? false);

  const currentId = new URLSearchParams(window.location.search).get('v') || '';
  
  // Create a unique key for the current configuration state
  const settingsKey = `${window.ytccLastUserQuality}-${window.ytccIsUseSuperResolution}-${window.ytccIsEnhancedBitrate}-${window.ytccForceOriginalAudio}-${window.ytccIsStickyPlayer}-${window.ytccIsHideShorts}-${window.ytccExtEnabled}`;

  // Guard: Only proceed if the video changed or settings were modified
  if (currentId === lastSentVideoId && settingsKey === lastSentSettingsKey) {
    return;
  }

  lastSentVideoId = currentId;
  lastSentSettingsKey = settingsKey;

  const elVideo = e?.target ?? getVisibleElement(SELECTORS.video);
  if (!(elVideo instanceof HTMLVideoElement)) return;
  
  // 3. Dispatch to the player script (Main World)
  if (window.ytccExtEnabled) {
    sendQualityToPlayer(
      window.ytccLastUserQuality,
      window.ytccIsUseSuperResolution ?? false,
      window.ytccIsEnhancedBitrate ?? false
    );
    // Slight delay for audio track switching to ensure API is ready after quality shift
    setTimeout(() => {
      sendAudioToPlayer(window.ytccForceOriginalAudio ?? false);
    }, 500);
  }
}

/**
 * Helper to trigger quality change from external events.
 */
function sendQualityToMainWorld() {
  prepareToChangeQualityOnDesktop();
}

/**
 * Observes the DOM for the initial video element on page load.
 */
function observeForInitialVideo() {
  new MutationObserver((_, observer) => {
    const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
    if (!elVideo) return;

    if (isAdShowing()) return;

    if (isShortsPage()) {
      observer.disconnect();
      void sendShortsQuality();
      return;
    }

    const elPlayer = getPlayerDiv(elVideo);
    if (!elPlayer) return;

    observer.disconnect();
    elVideo.addEventListener('canplay', prepareToChangeQualityOnDesktop);
    void prepareToChangeQualityOnDesktop();
  }).observe(document, OBSERVER_OPTIONS);
}

/**
 * Handles "soft" navigation (page changes without full reload) by listening 
 * for title/URL changes.
 */
async function addTemporaryBodyListenerOnDesktop() {
  if (!window.ytccExtEnabled) return;

  if (titleLast === document.title && urlLast === location.href) return;

  titleLast = document.title;
  urlLast = location.href;

  if (isShortsPage()) {
    const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
    if (!elVideo) return;
    handleShortsNavigation(elVideo);
    return;
  }

  await prepareToChangeQualityOnDesktop();

  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (!elVideo) return;

  const elPlayer = getPlayerDiv(elVideo);
  if (!elPlayer) return;

  elVideo.removeEventListener('canplay', sendQualityToMainWorld);
  elVideo.removeEventListener('canplay', prepareToChangeQualityOnDesktop);
  elVideo.addEventListener('canplay', prepareToChangeQualityOnDesktop);
}

/**
 * Main initialization entry point.
 */
async function init() {
  // Sync settings when they change in the popup
  addStorageListeners(() => {
    if (isShortsPage()) {
      void sendShortsQuality();
      return;
    }
    void prepareToChangeQualityOnDesktop();
  });

  window.ytccExtEnabled = await getIsExtensionEnabled(window.ytccExtEnabled);
  if (!window.ytccExtEnabled) return;

  // Listen for navigation events
  void addGlobalEventListener(addTemporaryBodyListenerOnDesktop);

  // Initial detection
  observeForInitialVideo();
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*', '*://youtube.com/*'],
  runAt: 'document_start',
  main: () => init()
});
