/**
 * Vite config for Dashy (Vue 2.7).
 * Replaces the previous Vue CLI (webpack 5) build chain.
 */
const path = require('path');
const fs = require('fs');
const { defineConfig } = require('vite');
const vue = require('@vitejs/plugin-vue2');
const { VitePWA } = require('vite-plugin-pwa');
const svgToVue = require('svg-to-vue');
const pkg = require('./package.json');

const base = process.env.BASE_URL || '/';

// Compile SVGs imported as Vue components (replaces vue-svg-loader).
// svg-to-vue runs SVGO, then compiles the result into a functional render
// function via vue-template-compiler. Its CJS output is re-exported as ESM.
const svgAsVueComponent = () => ({
  name: 'svg-as-vue-component',
  enforce: 'pre',
  async load(id) {
    if (!id.endsWith('.svg')) return;
    const content = fs.readFileSync(id, 'utf-8');
    const component = await svgToVue(content, { svgoPath: id });
    return component.replace('module.exports =', 'export default');
  },
});

module.exports = defineConfig(({ mode }) => ({
  base,
  plugins: [
    vue(),
    svgAsVueComponent(),
    VitePWA({
      filename: 'service-worker.js',
      injectRegister: false, // Dashy registers the SW itself in InitServiceWorker.js
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
  // Dart Sass deprecation warnings from vue-select (node_modules) cannot be
  // fixed in source, so they are silenced here. src/ styles no longer use
  // @import or global built-ins.
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['import', 'global-builtin'],
      },
    },
  },
  // Dashy reads build-time values via process.env.*; Vite only exposes
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
