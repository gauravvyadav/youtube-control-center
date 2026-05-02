import { defaults } from './defaults';

/**
 * GLOBAL UTILITIES
 * 
 * Contains shared helpers for DOM manipulation, visibility checks, 
 * and browser storage interaction.
 */

export const OBSERVER_OPTIONS = Object.freeze<MutationObserverInit>({ childList: true, subtree: true });

// Initialize global state with defaults
window.ytccLastUserQuality = defaults.quality;
window.ytccIsUseSuperResolution = defaults.isUseSuperResolution;
window.ytccIsEnhancedBitrate = defaults.isEnhancedBitrate;
window.ytccForceOriginalAudio = defaults.forceOriginalAudio;
window.ytccExtEnabled = defaults.isExtensionEnabled;

/**
 * DOM Selectors for various YouTube player elements.
 */
export enum SELECTORS {
  title = 'title',
  video = 'video',
  buttonSettings = '.ytp-settings-button, .ytp-settings-button-active',
  sizeToggle = '.ytp-size-button#original-size, .ytp-size-button, .ytp-size-toggle-large, .ytp-size-toggle-small',
  sizeToggleLarge = '.ytp-size-toggle-large',
  sizeToggleSmall = '.ytp-size-toggle-small',
  menuOption = '.ytp-settings-menu[data-layer] .ytp-menuitem',
  menuOptionContent = '.ytp-menuitem-content',
  panelHeaderBack = '.ytp-panel-header button',
  qualityDropDownTrigger = '.ytp-drop-down-label',
  qualityOption = '.ytp-drop-down-menu-button',
  player = '.html5-video-player:not(#inline-preview-player)',
  donationInjectParent = 'ytd-comments',
  labelPremium = '.ytp-premium-label'
}

/**
 * Finds the closest player container for a given video element.
 */
export function getPlayerDiv<T extends HTMLDivElement = HTMLDivElement>(elVideo: HTMLVideoElement): T | null {
  return elVideo.closest<T>(SELECTORS.player);
}

/**
 * Finds the first visible element matching a selector.
 */
export function getVisibleElement<T extends HTMLElement>(selector: SELECTORS): T | undefined {
  return document.querySelectorAll<T>(selector).values().find(isElementVisible);
}

/**
 * Waits for an element to appear in the DOM using MutationObserver.
 */
export async function getElementByMutationObserver<T extends HTMLElement>(
  selector: SELECTORS,
  isVisible = true
): Promise<T> {
  return new Promise<T>(resolve => {
    new MutationObserver((_, observer) => {
      const element = isVisible ? getVisibleElement<T>(selector) : document.querySelector<T>(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    }).observe(document, OBSERVER_OPTIONS);
  });
}

/**
 * Adds a listener for page title changes (indicating navigation).
 */
export async function addGlobalEventListener(addTemporaryBodyListener: () => void) {
  const elTitle =
    document.documentElement.querySelector(SELECTORS.title) ||
    await getElementByMutationObserver<HTMLTitleElement>(SELECTORS.title, false);
  const observer = new MutationObserver(addTemporaryBodyListener);
  observer.observe(elTitle, OBSERVER_OPTIONS);
}

/**
 * Checks if an element is currently visible on the screen.
 */
function isElementVisible(element: HTMLElement): boolean {
  return element?.offsetWidth > 0 && element?.offsetHeight > 0;
}

/**
 * Detects whether an advertisement is currently playing.
 */
export function isAdShowing(): boolean {
  const elPlayer = document.querySelector('.html5-video-player');
  if (elPlayer?.classList.contains('ad-showing') || elPlayer?.classList.contains('ad-interrupting')) {
    return true;
  }

  if (document.querySelector('.ytp-ad-player-overlay, .ytp-ad-message-container, .ytp-ad-skip-button-slot')) {
    return true;
  }

  const player = elPlayer as any;
  if (player && typeof player.getAdState === 'function' && player.getAdState() !== -1) {
    return true;
  }

  return false;
}

/**
 * Wraps browser.storage.get to provide a fallback value.
 */
export async function getStorage<T>({
  area,
  key,
  fallback
}: {
  area: 'local' | 'sync';
  key: string;
  fallback: T;
}): Promise<T> {
  try {
    const result = await browser.storage[area].get(key);
    return (result[key] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Checks if the extension is globally enabled.
 */
export async function getIsExtensionEnabled(fallback: boolean = true): Promise<boolean> {
  return getStorage({
    area: 'local',
    key: 'isExtensionEnabled',
    fallback
  });
}
