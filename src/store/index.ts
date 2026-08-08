import { createPinia } from "pinia";

/*
 * The Pinia instance is created in a separate module to avoid circular imports
 * between the store and utility modules that depend on the store at runtime.
 * Use `useAppStore(pinia)` in non-component modules instead of relying on the
 * globally active Pinia instance.
 */
// eslint-disable-next-line import/prefer-default-export
export const pinia = createPinia();
