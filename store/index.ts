import { createPinia } from "pinia";

/*
 * The Pinia instance is created in its own module to avoid circular imports:
 * the store's actions depend on ConfigAccumulator, which reads store state at
 * runtime. Non-component code (e.g. utils) should call `useAppStore(pinia)`
 * with this instance instead of relying on the globally active Pinia.
 */
// eslint-disable-next-line import/prefer-default-export
export const pinia = createPinia();
