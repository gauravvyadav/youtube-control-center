import { PlayerMessage, ytMessenger } from '@/lib/messaging';
import type { QualityPreference } from '@/lib/types';

/**
 * Sends a message to the player script (running in the MAIN world)
 * to update the playback quality using the internal YouTube API.
 * 
 * @param targetQuality - The desired resolution (p) or null for 'Auto'.
 * @param isSuperResolution - If true, forces the highest available quality.
 * @param isEnhancedBitrate - If true, prefers premium quality streams.
 */
export function sendQualityToPlayer(
  targetQuality: QualityPreference, 
  isSuperResolution: boolean,
  isEnhancedBitrate: boolean
) {
  const qualityToUse = isSuperResolution ? null : targetQuality;
  void ytMessenger.sendMessage(PlayerMessage.APPLY_QUALITY, { 
    quality: qualityToUse, 
    isSuperResolution,
    isEnhancedBitrate
  });
}
