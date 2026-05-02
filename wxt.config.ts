import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';
import packageJson from './package.json';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: '__MSG_extensionName__',
    description: '__MSG_extensionDescription__',
    default_locale: 'en',
    version: packageJson.version,
    browser_specific_settings: {
      gecko: {
        id: 'youtube-control-center@gauravvyadav',
        strict_min_version: '142.0',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
    permissions: ['storage', 'tabs', 'scripting', 'activeTab'],
    action: {
      default_icon: 'icon/48.png',
    },
    icons: {
      '16': 'icon/16.png',
      '32': 'icon/32.png',
      '48': 'icon/48.png',
      '96': 'icon/96.png',
      '128': 'icon/128.png',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
