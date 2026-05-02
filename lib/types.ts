export const SUFFIX_EBR = 'ebr';
export const SUFFIX_SUPER_RESOLUTION = 'sr';

export const qualities = [4320, 2160, 1440, 1080, 720, 480, 360, 240, 144] as const;
export const fpsSupported = [60, 50, 30] as const;

export type VideoQuality = (typeof qualities)[number];

type AddSuffix<T extends number, S extends string> = `${T}${S}`;

export type EnhancedVideoQuality = AddSuffix<Exclude<VideoQuality, 720 | 480 | 360 | 240 | 144>, typeof SUFFIX_EBR>;

export type SuperResolutionQuality = AddSuffix<VideoQuality, typeof SUFFIX_SUPER_RESOLUTION>;
export type VideoFPS = (typeof fpsSupported)[number];
export type IsEnhancedBitrate = boolean;
export type Progressive = 'p';
export type Spherical = 's';

type QualityLabelRaw = `${VideoQuality}${Progressive | Spherical}`;
export type QualityLabel = QualityLabelRaw | `${QualityLabelRaw}${Exclude<VideoFPS, 30>}`;

export type QualityPreference = number | null;

export type ResizeMode = 'cinema' | 'default';

declare global {
  interface Window {
    ytccLastUserQuality: QualityPreference;
    ytccIsUseSuperResolution: boolean | undefined;
    ytccIsEnhancedBitrate: boolean | undefined;
    ytccForceOriginalAudio: boolean | undefined;
    ytccIsStickyPlayer: boolean | undefined;
    ytccIsHideShorts: boolean | undefined;
    ytccIsResizeVideo: boolean | undefined;
    ytccResizeMode: ResizeMode | undefined;
    ytccExtEnabled: boolean;
  }
}
