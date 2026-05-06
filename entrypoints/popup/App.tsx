/**
 * POPUP APPLICATION
 * 
 * The main UI for the extension. It allows users to toggle features 
 * and set quality preferences. It uses TailwindCSS for styling and 
 * Framer Motion for animations.
 */
import { useState, useEffect, useCallback } from 'react';
import { Play, Moon, Sun, Maximize, Monitor, Square, Zap, Power, AudioWaveform, Layout, VideoOff } from 'lucide-react';
import { storage } from '@wxt-dev/storage';
import { qualities } from '@/lib/types';
import type { QualityPreference, ResizeMode } from '@/lib/types';

import { CustomSelect } from '@/components/CustomSelect';
import logo from '@/assets/ytcc-logo.png';


interface PopupSettings {
  isExtensionEnabled: boolean;
  quality: QualityPreference;
  isEnhancedBitrate: boolean;
  isUseSuperResolution: boolean;
  isResizeVideo: boolean;
  resizeMode: ResizeMode;
  forceOriginalAudio: boolean;
  isStickyPlayer: boolean;
  isHideShorts: boolean;
}

async function loadAllSettings(): Promise<PopupSettings> {
  const [
    isExtensionEnabled,
    quality,
    isEnhancedBitrate,
    isUseSuperResolution,
    isResizeVideo,
    resizeMode,
    forceOriginalAudio,
    isStickyPlayer,
    isHideShorts
  ] = await Promise.all([
    storage.getItem<boolean>('local:isExtensionEnabled', { fallback: true }),
    storage.getItem<QualityPreference>('local:quality', { fallback: null }),
    storage.getItem<boolean>('local:isEnhancedBitrate', { fallback: false }),
    storage.getItem<boolean>('local:isUseSuperResolution', { fallback: false }),
    storage.getItem<boolean>('local:isResizeVideo', { fallback: false }),
    storage.getItem<ResizeMode>('local:resizeMode', { fallback: 'default' }),
    storage.getItem<boolean>('local:forceOriginalAudio', { fallback: false }),
    storage.getItem<boolean>('local:isStickyPlayer', { fallback: false }),
    storage.getItem<boolean>('local:isHideShorts', { fallback: false })
  ]);

  return {
    isExtensionEnabled: isExtensionEnabled ?? true,
    quality: quality ?? null,
    isEnhancedBitrate: isEnhancedBitrate ?? false,
    isUseSuperResolution: isUseSuperResolution ?? false,
    isResizeVideo: isResizeVideo ?? false,
    resizeMode: resizeMode ?? 'default',
    forceOriginalAudio: forceOriginalAudio ?? false,
    isStickyPlayer: isStickyPlayer ?? false,
    isHideShorts: isHideShorts ?? false
  };
}

const t = (key: string) => browser.i18n.getMessage(key as any);

function App() {
  const [settings, setSettings] = useState<PopupSettings>({} as PopupSettings);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadAllSettings().then(val => {
      setSettings(val);
      setLoading(false);
    });
    
    storage.getItem<'light' | 'dark'>('local:theme', { fallback: 'light' }).then(val => {
      const t = val ?? 'light';
      setTheme(t);
      localStorage.setItem('ytcc-theme', t);
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const updateSetting = useCallback(async <K extends keyof PopupSettings>(key: K, value: PopupSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      storage.setItem(`local:${key}`, value);
      return updated;
    });
  }, []);

  const toggleExtension = useCallback(() => {
    updateSetting('isExtensionEnabled', !settings.isExtensionEnabled);
  }, [settings.isExtensionEnabled, updateSetting]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      storage.setItem('local:theme', next);
      localStorage.setItem('ytcc-theme', next);
      return next;
    });
  }, []);

  if (loading) {
    return <div className="w-[320px] h-120 bg-surface-950 flex items-center justify-center font-bold text-zinc-400">{t('loading')}</div>;
  }

  return (
    <div className="w-[320px] h-120 flex flex-col overflow-hidden bg-surface-50 dark:bg-surface-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-5 h-5" />
          <h1 className="text-[15px] font-bold">{t('extensionName')}</h1>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-900 transition-colors duration-300"
          >
            {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-500" />}
          </button>
          <button 
            onClick={toggleExtension}
            className={`p-2 rounded-lg transition-colors duration-300 ${settings.isExtensionEnabled ? 'text-brand hover:bg-brand/10' : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}
          >
            <Power size={16} />
          </button>
        </div>
      </header>

      <main className={`relative z-10 flex-1 overflow-y-auto px-2 py-2 space-y-2 custom-scrollbar transition-all duration-300 ${!settings.isExtensionEnabled ? 'opacity-50 grayscale pointer-events-none select-none' : ''}`}>
        <div className="space-y-2">
          <Section title={t('quality')}>
            <div className="flex justify-between items-center px-1 py-1">
              <span className="font-medium text-[13px] text-zinc-500">{t('resolution')}</span>
              <CustomSelect 
                value={settings.quality}
                onChange={(val) => updateSetting('quality', val)}
                options={[
                  { value: null, label: 'Auto' },
                  ...qualities.map(q => ({ value: q, label: `${q}p` }))
                ]}
              />
            </div>
          </Section>

          <Section title={t('enhancedQuality')}>
            <div className="py-1 space-y-1">
              <FeatureItem 
                icon={<AudioWaveform size={14} />}
                label={t('superResolution')}
                color="text-purple-500"
                enabled={settings.isUseSuperResolution}
                setEnabled={(val) => updateSetting('isUseSuperResolution', val)}
                description={t('superResolutionDesc')}
              />
              <FeatureItem 
                icon={<Zap size={14} />}
                label={t('enhancedBitrate')}
                color="text-amber-500"
                enabled={settings.isEnhancedBitrate}
                setEnabled={(val) => updateSetting('isEnhancedBitrate', val)}
                description={t('enhancedBitrateDesc')}
              />
            </div>
          </Section>

          <Section title={t('player')}>
            <div className="py-1 space-y-1">
              <FeatureItem 
                icon={<Monitor size={14} />}
                label={t('autoResize')}
                color="text-emerald-500"
                enabled={settings.isResizeVideo}
                setEnabled={(val) => updateSetting('isResizeVideo', val)}
                description={t('autoResizeDesc')}
              />
              {settings.isResizeVideo && (
                <div className="flex gap-2 px-1 py-1">
                  <button
                    onClick={() => updateSetting('resizeMode', 'cinema')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-1 rounded transition-all ${
                      settings.resizeMode === 'cinema'
                        ? 'bg-brand text-white'
                        : 'bg-surface-100 dark:bg-surface-900 text-zinc-500'
                    }`}
                  >
                    <Monitor size={12} />
                    {t('cinemaMode')}
                  </button>
                  <button
                    onClick={() => updateSetting('resizeMode', 'default')}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-[11px] font-bold py-1 rounded transition-all ${
                      settings.resizeMode === 'default'
                        ? 'bg-brand text-white'
                        : 'bg-surface-100 dark:bg-surface-900 text-zinc-500'
                    }`}
                  >
                    <Square size={12} />
                    {t('defaultMode')}
                  </button>
                </div>
              )}
            </div>
          </Section>

          <Section title={t('experience')}>
            <div className="py-1 space-y-1">
              <FeatureItem 
                icon={<Maximize size={14} />}
                label={t('forceOriginalAudio')}
                color="text-cyan-500"
                enabled={settings.forceOriginalAudio}
                setEnabled={(val) => updateSetting('forceOriginalAudio', val)}
                description={t('forceOriginalAudioDesc')}
              />
              <FeatureItem 
                icon={<Layout size={14} />}
                label={t('stickyVideo')}
                color="text-rose-500"
                enabled={settings.isStickyPlayer}
                setEnabled={(val) => updateSetting('isStickyPlayer', val)}
                description={t('stickyVideoDesc')}
              />
              <FeatureItem 
                icon={<VideoOff size={14} />}
                label={t('hideShorts')}
                color="text-red-500"
                enabled={settings.isHideShorts}
                setEnabled={(val) => updateSetting('isHideShorts', val)}
                description={t('hideShortsDesc')}
              />
            </div>
          </Section>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${settings.isExtensionEnabled ? 'bg-green-500 animate-pulse' : 'bg-zinc-400'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-500 ${settings.isExtensionEnabled ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {settings.isExtensionEnabled ? t('active') : t('disabled')}
            </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/gauravvyadav/youtube-control-center"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-300"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
          <a
            href="https://gauravlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -6 68 38" width="28" height="16">
              <g transform="translate(0, 12) skewX(-15)">
                <g fill="currentColor">
                  <rect x="-15" y="-15" width="25" height="7" />
                  <rect x="-15" y="-8" width="7" height="16" />
                  <rect x="-15" y="8" width="25" height="7" />
                  <rect x="3" y="-1" width="7" height="9" />
                  <rect x="-5" y="-1" width="8" height="7" />
                </g>
                <g fill="currentColor" opacity="0.5">
                  <rect x="18" y="-15" width="7" height="30" />
                  <rect x="25" y="8" width="13" height="7" />
                </g>
                <rect x="31" y="-15" width="7" height="7" fill="#0ea5e9" />
              </g>
            </svg>
          </a>
          <span className="text-[13px] font-medium text-zinc-400">v{browser.runtime.getManifest().version}</span>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-1 transition-colors duration-300">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-600 mb-1.5 px-2 transition-colors duration-300">{title}</h3>
      <div className="bg-white dark:bg-surface-900/40 rounded-xl px-1 py-0.5 transition-all duration-300">
        <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50 transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label, color, enabled, setEnabled, description }: { icon: React.ReactNode; label: string; color: string; enabled: boolean; setEnabled: (val: boolean) => void; description?: string }) {
  return (
    <div 
      onClick={() => setEnabled(!enabled)}
      className="group flex items-center justify-between py-2.5 px-3 m-0.5 hover:bg-surface-100 dark:hover:bg-surface-900/40 transition-all duration-300 cursor-pointer rounded-lg"
    >
      <div className="flex items-center gap-3">
        <div className={`transition-colors duration-300 ${color}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-[13px] leading-tight group-hover:text-brand transition-colors">{label}</span>
          {description && <span className="text-[11px] text-zinc-400 dark:text-zinc-600">{description}</span>}
        </div>
      </div>
      
      <div className={`w-8 h-4.5 rounded-full transition-all duration-500 relative flex items-center px-0.5 border ${
        enabled 
          ? 'bg-brand border-brand' 
          : 'bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
      }`}>
        <div className={`w-3 h-3 bg-white rounded-full transition-all duration-500 ${
          enabled ? 'translate-x-3.5' : 'translate-x-0'
        } group-hover:scale-110`} />
      </div>
    </div>
  );
}

export default App;
