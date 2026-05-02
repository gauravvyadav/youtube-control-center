import { ytMessenger, PlayerMessage } from '@/lib/messaging';

/**
 * Sends a message to the player script to force the original audio track.
 * @param {boolean} forceOriginal - Whether to force the original audio track.
 */
export function sendAudioToPlayer(forceOriginal: boolean) {
  void ytMessenger.sendMessage(PlayerMessage.APPLY_AUDIO, { forceOriginal });
}
