/// <reference types="vite/client" />

declare module 'v-tooltip';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module '*.svg' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

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

interface HTMLElement {
  $longPressHandler?: EventListenerOrEventListenerObject | null;
}
