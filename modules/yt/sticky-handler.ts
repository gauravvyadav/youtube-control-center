/**
 * STICKY PLAYER HANDLER
 * 
 * This module manages the "Pinned Video" layout.
 * It uses a minimalist CSS injection strategy to keep the video player
 * at the top of the viewport while allowing the rest of the page to
 * scroll naturally.
 */

import { SELECTORS } from '@/lib/utils';

let stickyStyleElement: HTMLStyleElement | null = null;

const STICKY_CSS = `
  /* 1. Stealth Containers: Hide scrollbars ONLY for the inner columns */
  #secondary.ytd-watch-flexy, #primary.ytd-watch-flexy {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  #secondary.ytd-watch-flexy::-webkit-scrollbar, 
  #primary.ytd-watch-flexy::-webkit-scrollbar {
    display: none !important;
  }

  /* 2. Sticky Player: Fixed at top-left */
  ytd-watch-flexy:not([theater]):not([fullscreen]) #player-container-outer.ytd-watch-flexy {
    position: sticky !important;
    top: 56px !important;
    z-index: 1000 !important;
    background: var(--yt-spec-base-background) !important;
  }

  /* 3. Independent Sidebar Scroll */
  ytd-watch-flexy:not([theater]):not([fullscreen]) #secondary.ytd-watch-flexy {
    height: calc(100vh - 56px) !important;
    overflow-y: auto !important;
    position: sticky !important;
    top: 56px !important;
    scrollbar-width: none !important;
    padding-bottom: 20px !important;
  }

  /* 4. Restore Main Page Scroll */
  html, body {
    overflow-y: auto !important;
    height: auto !important;
  }
  
  ytd-app, ytd-watch-flexy {
    overflow: visible !important;
  }
`;

export function toggleStickyPlayer(enabled: boolean) {
  if (enabled) {
    if (!stickyStyleElement) {
      stickyStyleElement = document.createElement('style');
      stickyStyleElement.id = 'ytcc-sticky-player-styles';
      stickyStyleElement.textContent = STICKY_CSS;
      document.head.appendChild(stickyStyleElement);
    }
  } else {
    if (stickyStyleElement) {
      stickyStyleElement.remove();
      stickyStyleElement = null;
    }
  }
}
