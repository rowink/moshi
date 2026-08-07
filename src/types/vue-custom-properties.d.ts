export {};

declare module 'vue' {
  interface ComponentCustomProperties {
    $toasted: any;
    $modal: any;
    $vToastify: any;
    $i18n: any;
    $route: any;
    $router: any;
    $refs: any;
    $t: (key: string, ...args: unknown[]) => string;
  }
}
