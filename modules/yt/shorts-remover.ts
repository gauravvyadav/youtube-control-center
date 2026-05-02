/**
 * SHORTS REMOVER
 * 
 * This module uses CSS injection to hide Shorts-related elements.
 * Targeted elements include sidebar links, home page shelves, 
 * and search result carousels.
 */
let shortsStyleElement: HTMLStyleElement | null = null;

const SHORTS_REMOVER_CSS = `
  /* Hide Sidebar Shorts Tab (Standard & Mini) */
  ytd-guide-entry-renderer:has(a[title="Shorts"]),
  ytd-mini-guide-entry-renderer:has(a[title="Shorts"]),
  ytd-guide-entry-renderer:has(a[href="/shorts"]),
  ytd-mini-guide-entry-renderer:has(a[href="/shorts"]) {
    display: none !important;
  }

  /* Hide Shorts Shelf on Home Page */
  ytd-rich-shelf-renderer[is-shorts] {
    display: none !important;
  }

  /* Hide Shorts Section in Search Results & Subscriptions */
  ytd-reel-shelf-renderer {
    display: none !important;
  }

  /* Hide Shorts suggestions in end-screens */
  .ytp-videowall-still[href*="/shorts/"] {
    display: none !important;
  }
`;

/**
 * Toggles the visibility of YouTube Shorts elements across the site.
 * @param {boolean} enabled - Whether to hide Shorts elements.
 */
export function toggleShortsRemover(enabled: boolean) {
  if (enabled) {
    if (!shortsStyleElement) {
      shortsStyleElement = document.createElement('style');
      shortsStyleElement.id = 'ytcc-shorts-remover-styles';
      shortsStyleElement.textContent = SHORTS_REMOVER_CSS;
      document.head.appendChild(shortsStyleElement);
    }
  } else {
    if (shortsStyleElement) {
      shortsStyleElement.remove();
      shortsStyleElement = null;
    }
  }
}
