/* eslint-disable no-multi-spaces */
// Import core framework and essential utils
import { createApp } from "vue";

// Import component Vue plugins, used throughout the app
import VTooltip from "v-tooltip"; // A Vue directive for Popper.js, tooltip component
import "v-tooltip/dist/v-tooltip.css"; // Base styles for v-tooltip v4 (floating-vue)

// Import base moshi components and utils
import Moshi from "@/App.vue"; // Main moshi Vue app
import router from "./router"; // Router, for navigation
import { pinia } from "@/store"; // Pinia, for local state management
import serviceWorker from "@/utils/InitServiceWorker"; // Service worker initialization
import i18n from "@/i18n"; // vue-i18n instance and language registry
import ErrorReporting from "@/utils/ErrorReporting"; // Error reporting initializer (off)
import clickOutside from "@/directives/ClickOutside"; // Directive for closing popups, modals, etc
import { showToast } from "@/utils/toast";
import { tooltipOptions } from "@/config/defaults";

// Create the Vue 3 app
const app = createApp(Moshi);

// Register Pinia, router and i18n plugins
app.use(pinia);
app.use(router);
app.use(i18n);

// Register global plugins and directives
app.use(VTooltip, tooltipOptions);
app.directive("clickOutside", clickOutside);

// Custom toast provider, replaces vue-toasted
app.config.globalProperties.$toast = { show: showToast };

// When running in dev mode, enable Vue performance tools
const isDevMode = process.env.NODE_ENV === "development";
app.config.performance = isDevMode;

// Checks if service worker not disabled, and if so will registers it
serviceWorker();

// Checks if user enabled error reporting, and if so will initialize it
ErrorReporting(app, router);

// Mount the app, with router, pinia and i18n
app.mount("#app");
