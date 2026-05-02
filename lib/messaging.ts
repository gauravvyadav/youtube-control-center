import { defineCustomEventMessaging } from '@webext-core/messaging/page';
import type { QualityPreference } from '@/lib/types';

export enum PlayerMessage {
  APPLY_QUALITY = 'applyQuality',
  APPLY_AUDIO = 'applyAudio'
}

type QualityPayload = {
  quality: QualityPreference;
  isSuperResolution: boolean;
  isEnhancedBitrate: boolean;
};

type AudioPayload = {
  forceOriginal: boolean;
};

type PlayerMessengerSchema = {
  [PlayerMessage.APPLY_QUALITY](payload: QualityPayload): void;
  [PlayerMessage.APPLY_AUDIO](payload: AudioPayload): void;
};

function createPlayerMessenger(namespace: string) {
  return defineCustomEventMessaging<PlayerMessengerSchema>({ namespace });
}

export const ytMessenger = createPlayerMessenger('ytcc-yt');
export const embedMessenger = createPlayerMessenger('ytcc-embed');
export const shortsMessenger = createPlayerMessenger('ytcc-shorts');
