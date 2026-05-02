import { embedMessenger, PlayerMessage } from '@/lib/messaging';
import { addStorageListeners, loadStorageValues } from '@/lib/storage-bridge';
import { getIsExtensionEnabled, getVisibleElement, SELECTORS } from '@/lib/utils';

function sendQualityToMainWorld() {
  void embedMessenger.sendMessage(PlayerMessage.APPLY_QUALITY, {
    quality: window.ytccLastUserQuality ?? null,
    isSuperResolution: window.ytccIsUseSuperResolution ?? false
  });
}

async function init() {
  addStorageListeners(sendQualityToMainWorld);

  window.ytccExtEnabled = await getIsExtensionEnabled(window.ytccExtEnabled);
  if (!window.ytccExtEnabled) return;

  await loadStorageValues();

  const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
  if (!elVideo) {
    const observer = new MutationObserver((_, obs) => {
      const elVideoFound = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
      if (!elVideoFound) return;
      obs.disconnect();
      checkAndSendQuality(elVideoFound);
    });
    observer.observe(document, { childList: true, subtree: true });
    return;
  }

  checkAndSendQuality(elVideo);
}

async function checkAndSendQuality(elVideo: HTMLVideoElement) {
  if (elVideo.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
    await new Promise<void>(resolve => elVideo.addEventListener('canplay', () => resolve(), { once: true }));
  }

  sendQualityToMainWorld();
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*'],
  includeGlobs: ['*://*.youtube.com/embed/*', '*://*.youtube-nocookie.com/embed/*'],
  allFrames: true,
  runAt: 'document_start',
  main: () => init()
});
