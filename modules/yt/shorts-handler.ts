import { shortsMessenger, PlayerMessage } from '@/lib/messaging';
import type { QualityPreference } from '@/lib/types';
import { storage } from '@wxt-dev/storage';

/**
 * SHORTS HANDLER
 * 
 * Manages playback settings specifically for YouTube Shorts.
 */

/**
 * Checks if the current page is a YouTube Shorts page.
 */
export function isShortsPage(): boolean {
  return location.pathname.startsWith('/shorts/');
}

/**
 * Fetches settings from storage and sends them to the Shorts messenger.
 */
export async function sendQualityToMainWorld() {
  const quality = await storage.getItem<QualityPreference>('local:quality', {
    fallback: null
  });
  const isSuperResolution = await storage.getItem<boolean>('local:isUseSuperResolution', {
    fallback: false
  });
  const forceOriginal = await storage.getItem<boolean>('local:forceOriginalAudio', {
    fallback: false
  });

  void shortsMessenger.sendMessage(PlayerMessage.APPLY_QUALITY, {
    quality: quality ?? null,
    isSuperResolution: isSuperResolution ?? false
  });
  void shortsMessenger.sendMessage(PlayerMessage.APPLY_AUDIO, {
    forceOriginal: forceOriginal ?? false
  });
}

/**
 * Sets up listeners for Shorts video elements to apply settings on playback.
 */
export function handleShortsNavigation(elVideo: HTMLVideoElement) {
  elVideo.removeEventListener('canplay', sendQualityToMainWorld);
  if (elVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    void sendQualityToMainWorld();
  } else {
    elVideo.addEventListener('canplay', sendQualityToMainWorld, { once: true });
  }
}
