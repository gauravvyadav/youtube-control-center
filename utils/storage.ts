import { storage } from '@wxt-dev/storage';

export interface ExtensionSettings {
  enabled: boolean;
  youtube: {
    quality: number;
    forceOriginalAudio: boolean;
    autoResize: boolean;
    shortsAutoScroll: boolean;
    removeShorts: boolean;
    independentSidebar: boolean;
    pinVideo: boolean;
  };
  music: {
    quality: string;
    forceOriginalAudio: boolean;
  };
  theme: 'light' | 'dark';
}

export const DEFAULT_SETTINGS: ExtensionSettings = {
  enabled: true,
  youtube: {
    quality: 1080,
    forceOriginalAudio: false,
    autoResize: true,
    shortsAutoScroll: false,
    removeShorts: false,
    independentSidebar: false,
    pinVideo: false,
  },
  music: {
    quality: 'high',
    forceOriginalAudio: false,
  },
  theme: 'dark',
};

export const settingsStorage = storage.defineItem<ExtensionSettings>(
  'local:settings',
  {
    defaultValue: DEFAULT_SETTINGS,
  }
);
