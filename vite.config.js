/**
 * Vite config for moshi (Vue 3).
 * Replaces the previous Vue CLI (webpack 5) build chain.
 */
const path = require('path');
const fs = require('fs');
const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue');
const { VitePWA } = require('vite-plugin-pwa');
const svgLoader = require('vite-svg-loader');
const pkg = require('./package.json');

const base = process.env.BASE_URL || '/';

// conf.yml must stay in public/ (Docker volume mount + runtime server
// reads/writes), but Vite forbids importing from the public dir. Resolve
// `?raw` imports of it to a virtual module reading the file directly.
const loadPublicConfigRaw = () => ({
  name: 'load-public-config-raw',
  enforce: 'pre',
  resolveId(source) {
    if (source.endsWith('conf.yml?raw') && !source.startsWith('\0')) {
      return '\0public-conf.yml';
    }
    return null;
  },
  load(id) {
    if (id !== '\0public-conf.yml') return null;
    const file = path.resolve(__dirname, 'public', 'conf.yml');
    return `export default ${JSON.stringify(fs.readFileSync(file, 'utf-8'))}`;
  },
});

module.exports = defineConfig(({ mode }) => ({
  base,
  plugins: [
    vue(),
    svgLoader(),
    loadPublicConfigRaw(),
    VitePWA({
      filename: 'service-worker.js',
      injectRegister: false, // moshi registers the SW itself in InitServiceWorker.js
      registerType: 'prompt',
      manifest: false, // manifest.json is kept in public/ and copied as-is
      workbox: {
        // The main bundle exceeds workbox's default 2 MiB precache limit
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Vue CLI resolved extension-less imports to .vue files; Vite's default
    // list omits .vue, so it is appended here
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  // Dart Sass deprecation warnings from legacy stylesheets cannot be fixed in
  // source, so they are silenced here. Note: 'mixed-decls' must NOT be listed -
  // it is obsolete in current Sass, and silencing it triggers a warning itself.
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },
  // moshi reads build-time values via process.env.*; Vite only exposes
  // import.meta.env by default, so the used variables are defined here
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.BASE_URL': JSON.stringify(base),
    'process.env.VUE_APP_VERSION': JSON.stringify(pkg.version),
    'process.env.VUE_APP_DOMAIN': JSON.stringify(process.env.VUE_APP_DOMAIN || ''),
  },
  server: {
    port: 8080,
  },
}));
