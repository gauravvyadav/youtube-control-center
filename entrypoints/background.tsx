export default defineBackground(() => {
  const syncIcon = async () => {
    const isEnabled = await storage.getItem<boolean>('local:isExtensionEnabled', { fallback: true });
    updateIcon(isEnabled);
  };

  storage.watch<boolean>('local:isExtensionEnabled', (isEnabled) => {
    updateIcon(isEnabled ?? true);
  });

  syncIcon();
});

function updateIcon(isEnabled: boolean) {
  const iconPath = '/icon/48.png';
  browser.action.setIcon({
    path: {
      '16': iconPath,
      '32': iconPath,
      '48': iconPath,
      '96': iconPath,
      '128': iconPath
    }
  });
}
