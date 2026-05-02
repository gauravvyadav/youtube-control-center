import { addStorageListeners, loadStorageValues } from '@/lib/storage-bridge';
import {
  addGlobalEventListener,
  getVisibleElement,
  OBSERVER_OPTIONS,
  SELECTORS
} from '@/lib/utils';

/**
 * PLAYER RESIZE CONTENT SCRIPT
 * 
 * Manages the automatic resizing of the YouTube player (e.g., forcing Cinema Mode).
 */

/**
 * Detects whether the player is currently in 'cinema' or 'default' mode.
 */
function getCurrentViewMode(): 'default' | 'cinema' {
  if (document.querySelector(SELECTORS.sizeToggleLarge)) return 'default';
  if (document.querySelector(SELECTORS.sizeToggleSmall)) return 'cinema';
  // Fallback check via cookie
  return document.cookie.match(/wide=([10])/)?.[1] === '1' ? 'cinema' : 'default';
}

/**
 * Clicks the size toggle button if the current mode doesn't match the preference.
 */
function resizePlayerIfNeeded() {
  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (!window.ytccExtEnabled || !window.ytccIsResizeVideo || !elVideo) return;

  const currentMode = getCurrentViewMode();
  if (currentMode !== window.ytccResizeMode) {
    getVisibleElement<HTMLButtonElement>(SELECTORS.sizeToggle)?.click();
  }
}

/**
 * Sets up listeners for video events to trigger resize.
 */
function setupVideoResizeListener(elVideo: HTMLVideoElement) {
  elVideo.removeEventListener('canplay', resizePlayerIfNeeded);
  elVideo.addEventListener('canplay', resizePlayerIfNeeded);
  if (elVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    resizePlayerIfNeeded();
  }
}

/**
 * Helper for navigation events.
 */
function addTemporaryBodyListenerOnDesktop() {
  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (!elVideo) return;
  setupVideoResizeListener(elVideo);
}

/**
 * Main initialization.
 */
async function initPlayerResize() {
  await loadStorageValues();
  
  addStorageListeners(() => {
    resizePlayerIfNeeded();
  });

  addGlobalEventListener(addTemporaryBodyListenerOnDesktop);

  if (!window.ytccExtEnabled) return;

  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (elVideo) {
    setupVideoResizeListener(elVideo);
  } else {
    new MutationObserver((_, observer) => {
      const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
      if (!elVideo) return;
      observer.disconnect();
      setupVideoResizeListener(elVideo);
    }).observe(document, OBSERVER_OPTIONS);
  }
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*', '*://youtube.com/*'],
  runAt: 'document_start',
  main: () => initPlayerResize()
});
