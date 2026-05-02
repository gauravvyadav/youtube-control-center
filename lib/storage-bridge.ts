/**
 * STORAGE BRIDGE
 * 
 * This utility acts as a bridge between the browser's persistent storage
 * (chrome.storage.local) and the web page's JavaScript context.
 * 
 * Since Content Scripts and the Main World are isolated, we use this bridge
 * to load settings once and keep them synchronized on the global 'window' object.
 */

import type { QualityPreference } from './types';
import { getStorage } from './utils';

/**
 * Loads all relevant settings from storage and populates the window object.
 * This is called on every page load to initialize the main script's state.
 * @returns {Promise<void>}
 */
export async function loadStorageValues() {
  window.ytccLastUserQuality = await getStorage<QualityPreference>({
    area: 'local',
    key: 'quality',
    fallback: window.ytccLastUserQuality as QualityPreference
  });

  window.ytccIsUseSuperResolution = await getStorage<boolean>({
    area: 'local',
    key: 'isUseSuperResolution',
    fallback: window.ytccIsUseSuperResolution as boolean
  });

  window.ytccIsEnhancedBitrate = await getStorage<boolean>({
    area: 'local',
    key: 'isEnhancedBitrate',
    fallback: window.ytccIsEnhancedBitrate as boolean
  });

  window.ytccForceOriginalAudio = await getStorage<boolean>({
    area: 'local',
    key: 'forceOriginalAudio',
    fallback: window.ytccForceOriginalAudio as boolean
  });

  window.ytccExtEnabled = await getStorage<boolean>({
    area: 'local',
    key: 'isExtensionEnabled',
    fallback: window.ytccExtEnabled as boolean
  });

  window.ytccIsStickyPlayer = await getStorage<boolean>({
    area: 'local',
    key: 'isStickyPlayer',
    fallback: window.ytccIsStickyPlayer as boolean
  });

  window.ytccIsHideShorts = await getStorage<boolean>({
    area: 'local',
    key: 'isHideShorts',
    fallback: window.ytccIsHideShorts as boolean
  });

  window.ytccIsResizeVideo = await getStorage<boolean>({
    area: 'local',
    key: 'isResizeVideo',
    fallback: window.ytccIsResizeVideo as boolean
  });

  window.ytccResizeMode = await getStorage<'cinema' | 'default'>({
    area: 'local',
    key: 'resizeMode',
    fallback: window.ytccResizeMode as 'cinema' | 'default'
  });
}

/**
 * Sets up listeners for browser storage changes.
 * When a setting is updated in the popup, this updates the internal 
 * window state and triggers the onApply callback.
 * @param {() => void} onApply - Callback function to execute after a setting change.
 */
export function addStorageListeners(onApply: () => void) {
  browser.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;

    if (changes.isExtensionEnabled) {
      window.ytccExtEnabled = changes.isExtensionEnabled.newValue as boolean ?? window.ytccExtEnabled;
      onApply();
      if (!window.ytccExtEnabled) return;
    }

    if (changes.quality) {
      window.ytccLastUserQuality = changes.quality.newValue as QualityPreference;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.isEnhancedBitrate) {
      window.ytccIsEnhancedBitrate = changes.isEnhancedBitrate.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.isUseSuperResolution) {
      window.ytccIsUseSuperResolution = changes.isUseSuperResolution.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.forceOriginalAudio) {
      window.ytccForceOriginalAudio = changes.forceOriginalAudio.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.isStickyPlayer) {
      window.ytccIsStickyPlayer = changes.isStickyPlayer.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.isHideShorts) {
      window.ytccIsHideShorts = changes.isHideShorts.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.isResizeVideo) {
      window.ytccIsResizeVideo = changes.isResizeVideo.newValue as boolean ?? false;
      if (!window.ytccExtEnabled) return;
      onApply();
    }

    if (changes.resizeMode) {
      window.ytccResizeMode = changes.resizeMode.newValue as 'cinema' | 'default' ?? 'default';
      if (!window.ytccExtEnabled) return;
      onApply();
    }
  });
}
