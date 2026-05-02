/**
 * PLAYER API UTILITIES
 * 
 * This file contains the "Low-Level" interaction logic with the YouTube Player.
 * It uses native YouTube internal methods (found in the 'ytd-player' element)
 * to change quality and audio tracks without triggering UI events or reloads.
 */

import { qualities } from './types';
import type { QualityPreference, VideoQuality } from './types';
import { getVisibleElement, SELECTORS } from './utils';

// State tracking to prevent redundant API calls
let lastVideoId = '';
let lastAudioAppliedTime = 0;

/**
 * YouTube's internal data structure for quality levels.
 */
type QualityData = {
  qualityLabel: string;
  quality: string;
  isPlayable: boolean;
  formatId?: string;
};

/**
 * Extended type for the YouTube Player DOM element.
 * We access these non-standard methods to control the stream directly.
 */
type YTPlayerElement = HTMLDivElement & {
  setPlaybackQuality?(quality: string): void;
  setPlaybackQualityRange?(quality1: string, quality2: string): void;
  getAvailableQualityData?(): QualityData[];
  getPlaybackQuality?(): string;
  // Audio specific methods
  getAudioTrack?(): any;
  setAudioTrack?(track: any): void;
  getAvailableAudioTracks?(): any[];
};

/**
 * Mapping between human-readable resolutions (p) and YouTube's internal labels.
 */
export const QUALITY_MAP: Record<VideoQuality, string> = {
  4320: 'highres',
  2160: 'hd2160',
  1440: 'hd1440',
  1080: 'hd1080',
  720: 'hd720',
  480: 'large',
  360: 'medium',
  240: 'small',
  144: 'tiny'
};

export const QUALITY_NUMBER = Object.fromEntries<VideoQuality>(
  Object.entries(QUALITY_MAP).map(([number, label]) => {
    const videoQuality = qualities.find(quality => quality === Number(number));
    if (videoQuality === undefined) {
      throw new Error(`[YTCC] Invalid quality value in QUALITY_MAP: ${number}`);
    }
    return [label, videoQuality];
  })
);

function getQualityLabel(quality: VideoQuality): string {
  return QUALITY_MAP[quality];
}

function getAvailableQualityNumber(qualityData: QualityData[]): VideoQuality | null {
  for (const data of qualityData) {
    const num = QUALITY_NUMBER[data.quality];
    if (num !== undefined) return num;
  }
  return null;
}

/**
 * Changes the video quality using YouTube's internal player API.
 * 
 * This function is the "Fast Path" for quality changes. It avoids simulating 
 * clicks on the UI settings menu, which can be slow and cause visual flicker.
 * 
 * @param targetQuality - The desired resolution (e.g., 1080, 720) or null for 'Auto'.
 * @param isSuperResolution - If true, ignores targetQuality and forces the highest possible stream.
 * @param isEnhancedBitrate - If true, prefers the "Premium" (Enhanced Bitrate) version of a resolution.
 */
export function changeQualityViaPlayerAPI(
  targetQuality: QualityPreference, 
  isSuperResolution: boolean,
  isEnhancedBitrate: boolean
) {
  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (!elVideo) return;

  const elPlayer = getVisibleElement<HTMLDivElement>(SELECTORS.player) as YTPlayerElement | undefined;
  if (!elPlayer) return;

  const qualityData = elPlayer.getAvailableQualityData?.();
  if (!qualityData || qualityData.length === 0) return;

  const highestAvailable = getAvailableQualityNumber(qualityData) ?? 144;
  
  const setQualityRange = elPlayer.setPlaybackQualityRange;
  const setQualityLegacy = elPlayer.setPlaybackQuality;

  if (!setQualityRange && !setQualityLegacy) return;

  // Handle 'Auto' or 'Super Resolution' (Highest possible)
  if (isSuperResolution || targetQuality === null) {
    // If Enhanced Bitrate is on, look for 'Premium' in the highest stream (usually 1080p)
    const premiumHighest = isEnhancedBitrate 
      ? qualityData.find(d => d.quality === 'hd1080' && d.qualityLabel.includes('Premium') && d.isPlayable !== false)
      : null;

    const highest = premiumHighest
      ?? qualityData.find(d => d.quality === 'highres')
      ?? qualityData.find(d => d.quality === 'hd2160')
      ?? qualityData.find(d => d.quality === 'hd1440')
      ?? qualityData[0];
    
    if (setQualityRange) {
      try {
        (setQualityRange as any)(highest.quality, highest.quality, highest.formatId);
      } catch (e) {
        setQualityRange(highest.quality, highest.quality);
      }
    } else {
      try {
        (setQualityLegacy as any)(highest.quality, highest.formatId);
      } catch (e) {
        setQualityLegacy?.(highest.quality);
      }
    }
    return;
  }

  const targetLabel = getQualityLabel(targetQuality as VideoQuality);
  
  if (elPlayer.getPlaybackQuality?.() === targetLabel) return;

  // 1. Try to find Enhanced Bitrate (Premium) version first if requested
  let bestQuality: QualityData | undefined;
  
  if (isEnhancedBitrate) {
    bestQuality = qualityData.find(data => 
      QUALITY_NUMBER[data.quality] === QUALITY_NUMBER[targetLabel] && 
      data.qualityLabel.includes('Premium') &&
      data.isPlayable !== false
    );
  }

  // 2. Fallback to regular closest playable quality
  // CRITICAL: We check for isPlayable !== false to avoid triggering Premium popups
  if (!bestQuality) {
    bestQuality = qualityData.find(
      data => QUALITY_NUMBER[data.quality] <= QUALITY_NUMBER[targetLabel] && data.isPlayable !== false
    );
  }

  if (!bestQuality) return;

  if (targetQuality !== null && targetQuality > highestAvailable) return;
  
  if (setQualityRange) {
    // Some player versions accept itag as the 3rd argument in Range
    try {
      (setQualityRange as any)(bestQuality.quality, bestQuality.quality, bestQuality.formatId);
    } catch (e) {
      setQualityRange(bestQuality.quality, bestQuality.quality);
    }
  } else if (setQualityLegacy) {
    // Legacy method often accepts itag as the 2nd argument
    try {
      (setQualityLegacy as any)(bestQuality.quality, bestQuality.formatId);
    } catch (e) {
      setQualityLegacy(bestQuality.quality);
    }
  }
}

export function forceOriginalAudioTrack(forceOriginal: boolean, retryCount = 0) {
  if (!forceOriginal) return;

  const currentId = new URLSearchParams(window.location.search).get('v') || '';
  const now = Date.now();

  // Cooldown: If we already tried to switch audio for this video in the last 5 seconds, skip
  if (lastVideoId === currentId && (now - lastAudioAppliedTime < 5000)) {
    return;
  }

  // 1. Safety: Don't switch during ads
  const isAd = document.querySelector('.ad-showing, .ad-interrupting');
  if (isAd) {
    if (retryCount < 20) {
      setTimeout(() => forceOriginalAudioTrack(forceOriginal, retryCount + 1), 1000);
    }
    return;
  }

  const elPlayer = getVisibleElement<HTMLDivElement>(SELECTORS.player) as any;
  
  // 2. Safety: Ensure player API is ready
  if (!elPlayer || !elPlayer.getAvailableAudioTracks || !elPlayer.setAudioTrack) {
    if (retryCount < 15) {
      setTimeout(() => forceOriginalAudioTrack(forceOriginal, retryCount + 1), 500);
    }
    return;
  }

  // 3. Safety: Ensure player is in a valid playback state
  const state = elPlayer.getPlayerState?.();
  if (state === -1 || state === 5 || state === 3) { 
     if (retryCount < 15) {
       setTimeout(() => forceOriginalAudioTrack(forceOriginal, retryCount + 1), 500);
     }
     return;
  }

  const tracks = elPlayer.getAvailableAudioTracks();
  if (!tracks || tracks.length <= 1) {
    const currentTime = elPlayer.getCurrentTime?.() || 0;
    // If video has been playing for 3s and still only 1 track, it's definitely not a multi-audio video
    if (currentTime > 3.0) {
      return;
    }
    if (retryCount < 15) {
      setTimeout(() => forceOriginalAudioTrack(forceOriginal, retryCount + 1), 1000);
    }
    return;
  }

  // Identify original track
  const originalTrack = tracks.find((t: any) => 
    t.is_original === true || 
    t.isDefault === true ||
    t.id?.includes('original') ||
    t.id?.includes('vcmlnaW5hb') || 
    t.displayName?.toLowerCase().includes('original') ||
    t.audioTrackId?.includes('original')
  ) || tracks.find((t: any) => !t.id?.includes('dubbed'));

  if (originalTrack && !originalTrack.is_active) {
    // 4. Safety: Wait for a solid playback start (5.0s is the Industrial-Safe delay)
    const currentTime = elPlayer.getCurrentTime?.() || 0;
    if (currentTime < 5.0 && retryCount < 60) {
      setTimeout(() => forceOriginalAudioTrack(forceOriginal, retryCount + 1), 500);
      return;
    }

    // 5. NEW: Strict identity check to avoid redundant reloads
    const currentTrack = elPlayer.getAudioTrack?.();
    const trackId = originalTrack.CO?.id || originalTrack.audioTrackId || originalTrack.id;
    
    const isAlreadyOriginal = currentTrack && (
      currentTrack.id === trackId || 
      currentTrack.audioTrackId === trackId ||
      currentTrack.id === originalTrack.id ||
      (currentTrack.displayName && currentTrack.displayName === originalTrack.displayName) ||
      (currentTrack.languageCode && currentTrack.languageCode === originalTrack.languageCode)
    );

    try {
      lastVideoId = currentId;
      lastAudioAppliedTime = now;

      try {
        elPlayer.setAudioTrack(originalTrack);
      } catch (err) {
        elPlayer.setAudioTrack(trackId);
      }
    } catch (e) {
      console.error('[YTCC] Error switching audio track:', e);
    }
  }
}
