import { defaults } from '@/lib/defaults';
import { getIsExtensionEnabled, getVisibleElement, OBSERVER_OPTIONS, SELECTORS } from '@/lib/utils';
import { isShortsPage, handleShortsNavigation } from '@/modules/yt/shorts-handler';

async function init() {
  window.ytccExtEnabled = await getIsExtensionEnabled(window.ytccExtEnabled);
  if (!window.ytccExtEnabled) return;

  new MutationObserver((_, observer) => {
    if (!isShortsPage()) return;

    const elVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
    if (!elVideo) return;

    observer.disconnect();
    handleShortsNavigation(elVideo);

    new MutationObserver(() => {
      if (!isShortsPage()) return;
      const elNewVideo = getVisibleElement<HTMLVideoElement>(SELECTORS.video);
      if (elNewVideo) handleShortsNavigation(elNewVideo);
    }).observe(document, OBSERVER_OPTIONS);
  }).observe(document, OBSERVER_OPTIONS);
}

export default defineContentScript({
  matches: ['*://*.youtube.com/*', '*://youtube.com/*'],
  runAt: 'document_start',
  main: () => init()
});
