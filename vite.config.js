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

// conf.yml lives in config/ (the runtime server reads/writes it there).
// Resolve `?raw` imports of it to a virtual module reading the file directly.
const loadConfigRaw = () => ({
  name: 'load-config-raw',
  enforce: 'pre',
  resolveId(source) {
    // Only virtualize the main conf.yml - a bare endsWith('conf.yml?raw')
    // would also swallow doc-conf.yml?raw / trend-conf.yml?raw imports
    if (
      (source === 'conf.yml?raw' || source.endsWith('/conf.yml?raw')) &&
      !source.startsWith('\0')
    ) {
      return '\0config-conf.yml';
    }
    return null;
  },
  load(id) {
    if (id !== '\0config-conf.yml') return null;
    const file = path.resolve(__dirname, 'config', 'conf.yml');
    return `export default ${JSON.stringify(fs.readFileSync(file, 'utf-8'))}`;
  },
});

// The config YAML files moved out of public/ (to config/), so the dev
// server no longer serves them statically. This plugin mirrors the server.js
// route so runtime axios.get('/xxx.yml') calls keep working in dev.
const serveConfigYml = () => ({
  name: 'serve-config-yml',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const match = req.url.match(/^\/([A-Za-z0-9-_]+)\.yml(\?.*)?$/);
      if (!match) return next();
      const safeName = match[1].replace(/[^a-zA-Z0-9-_]/g, '');
      const file = path.resolve(__dirname, 'config', `${safeName}.yml`);
      if (!fs.existsSync(file)) return next();
      res.setHeader('Content-Type', 'text/yaml');
      return res.end(fs.readFileSync(file, 'utf-8'));
    });
  },
});

// The runtime also fetches '/xxx.yml' via axios in production, so the config
// files must be emitted into the build output, mirroring the dev middleware.
const emitConfigYml = () => ({
  name: 'emit-config-yml',
  enforce: 'post',
  generateBundle() {
    const configDir = path.resolve(__dirname, 'config');
    fs.readdirSync(configDir).forEach((file) => {
      if (/\.ya?ml$/.test(file)) {
        this.emitFile({
          type: 'asset',
          fileName: file,
          source: fs.readFileSync(path.join(configDir, file), 'utf-8'),
        });
      }
    });
  },
});

module.exports = defineConfig(({ mode }) => ({
  base,
  plugins: [
    vue(),
    svgLoader(),
    loadConfigRaw(),
    serveConfigYml(),
    emitConfigYml(),
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
    port: 2333,
  },
}));
