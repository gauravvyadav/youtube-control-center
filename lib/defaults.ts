import { qualities } from './types';

const qualityClosest = qualities.find(quality => quality <= screen.height) ?? qualities[qualities.length - 1];

export const defaults = {
  isExtensionEnabled: true,
  isHideDonationSection: false,
  isHidePromotionSection: false,
  quality: null as number | null,
  isEnhancedBitrate: false,
  isUseSuperResolution: false,
  isResizeVideo: false,
  resizeMode: 'default' as 'cinema' | 'default',
  forceOriginalAudio: false,
  isStickyPlayer: false,
  isHideShorts: false
} as const;
