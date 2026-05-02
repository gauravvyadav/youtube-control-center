import { changeQualityViaPlayerAPI, forceOriginalAudioTrack } from '@/lib/player-api';
import { embedMessenger, PlayerMessage, shortsMessenger, ytMessenger } from '@/lib/messaging';

/**
 * PLAYER CONTENT SCRIPT (MAIN WORLD)
 * 
 * This script runs in the 'MAIN' world of YouTube pages, giving it direct access
 * to the internal YouTube Player API (window.ytplayer, etc).
 * 
 * It listens for messages from the 'ISOLATED' content scripts and calls 
 * the appropriate player methods.
 */
export default defineContentScript({
  matches: ['*://*.youtube.com/*', '*://youtube.com/*', '*://*.youtube-nocookie.com/*', '*://youtube-nocookie.com/*', '*://youtube.googleapis.com/*'],
  allFrames: true,
  world: 'MAIN',
  runAt: 'document_start',
  main() {
    const handleQuality = (data: { 
      quality: any; 
      isSuperResolution: boolean; 
      isEnhancedBitrate: boolean; 
    }) => {
      changeQualityViaPlayerAPI(data.quality, data.isSuperResolution, data.isEnhancedBitrate);
    };

    const handleAudio = (data: { forceOriginal: boolean }) => {
      forceOriginalAudioTrack(data.forceOriginal);
    };

    // Listen for messages on all possible namespaces (Desktop, Embeds, Shorts)
    ytMessenger.onMessage(PlayerMessage.APPLY_QUALITY, ({ data }) => handleQuality(data));
    ytMessenger.onMessage(PlayerMessage.APPLY_AUDIO, ({ data }) => handleAudio(data));

    embedMessenger.onMessage(PlayerMessage.APPLY_QUALITY, ({ data }) => handleQuality(data));
    embedMessenger.onMessage(PlayerMessage.APPLY_AUDIO, ({ data }) => handleAudio(data));

    shortsMessenger.onMessage(PlayerMessage.APPLY_QUALITY, ({ data }) => handleQuality(data));
    shortsMessenger.onMessage(PlayerMessage.APPLY_AUDIO, ({ data }) => handleAudio(data));
  }
});
