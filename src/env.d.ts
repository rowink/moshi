/// <reference types="vite/client" />

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}

declare module '*.svg' {
  import Vue from 'vue';
  export default Vue;
}

declare module 'vue-js-modal';
declare module 'vue-toasted';
declare module 'vue-material-tabs';
declare module 'vue-json-tree-view';
declare module 'vue-select';
declare module 'v-tooltip';

declare const process: {
  env: {
    NODE_ENV: string;
    BASE_URL: string;
    VUE_APP_VERSION?: string;
    VUE_APP_DOMAIN?: string;
    [key: string]: string | undefined;
  };
};

interface ImportMetaEnv {
  readonly VUE_APP_VERSION?: string;
  readonly VUE_APP_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'vue/types/vue' {
  interface Vue {
    $toasted: any;
    $modal: any;
    $vToastify: any;
  }
}

interface HTMLElement {
  $longPressHandler?: EventListenerOrEventListenerObject | null;
}
