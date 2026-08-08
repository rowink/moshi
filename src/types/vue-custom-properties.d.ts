export {};

declare module "vue" {
  interface ComponentCustomProperties {
    $toast: {
      show: (message: string, options?: { className?: string }) => void;
    };
  }
}
