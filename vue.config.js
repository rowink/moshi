/**
 * Global config for the main Vue app. ES7 not supported here.
 * See docs for all config options: https://cli.vuejs.org/config
 */
const ProgressBarPlugin = require('progress-bar-webpack-plugin');

// Get app mode: production, development or test
const mode = process.env.NODE_ENV || 'production';

// Get current version
process.env.VUE_APP_VERSION = require('./package.json').version;

// Get default info for PWA
const { pwa } = require('./src/utils/defaults');

// Get base URL
const publicPath = process.env.BASE_URL || '/';

// Should enable Subresource Integrity (SRI) on link and script tags
const integrity = process.env.INTEGRITY === 'true';

// Format for progress bar, shown while app building
const progressFormat = '\x1b[1m\x1b[36mBuilding Dashy\x1b[0m '
  + '[\x1b[1m\x1b[32m:bar\x1b[0m] :percent (:elapsed seconds)';

// Webpack Config
const configureWebpack = {
  mode,
  resolve: {
    fallback: {
      // rss-parser requires Node core modules in its Node-only code paths;
      // in the browser bundle these resolve to empty stubs
      http: false,
      https: false,
      stream: false,
      timers: require.resolve('timers-browserify'),
    },
  },
  module: {
    rules: [
      { test: /.svg$/, loader: 'vue-svg-loader' },
    ],
  },
  plugins: [
    new ProgressBarPlugin({ format: progressFormat }),
  ],
};

module.exports = {
  publicPath,
  pwa,
  integrity,
  lintOnSave: false,
  configureWebpack,
  css: {
    loaderOptions: {
      css: {
        // webpack 5 resolves all url()s; keep public/ absolute paths untouched
        url: {
          filter: (url) => !url.startsWith('/'),
        },
      },
    },
  },
  chainWebpack: config => {
    config.module.rules.delete('svg');
    // Load YAML files as raw strings (replaces vue-cli-plugin-yaml, which
    // depends on webpack 4-only loaders). Parsing happens via js-yaml
    // at the import site - see src/utils/ConfigAccumalator.js
    config.module.rule('yaml')
      .test(/\.ya?ml$/)
      .type('asset/source');
    // cli-plugin-pwa emits manifest.json itself; exclude it from the
    // public/ copy to avoid webpack 5 duplicate-asset errors
    config.plugin('copy').tap(args => {
      args[0].patterns[0].globOptions.ignore.push('**/manifest.json');
      return args;
    });
  },
};
