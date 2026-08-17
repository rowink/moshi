<template>
  <div id="dashy" :style="topLevelStyleModifications" :class="subPageClassName">
    <Header :pageInfo="pageInfo" />
    <router-view v-if="!isFetching" :key="$route.fullPath" />
    <Footer :text="footerText" v-if="visibleComponents.footer && !isFetching" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import Header from "@/components/PageStrcture/Header.vue";
import Footer from "@/components/PageStrcture/Footer.vue";
import { welcomeMsg } from "@/utils/CoolConsole";
import { useAppStore } from "@/store/modules/appStore";
import ErrorHandler from "@/utils/ErrorHandler";
import {
  localStorageKeys,
  language as defaultLanguage,
} from "@/utils/defaults";

const appStore = useAppStore();
const { availableLocales, locale } = useI18n();

const isFetching = ref(true); // Set to false after the conf has been fetched

watch(
  () => appStore.config,
  () => {
    isFetching.value = false;
  },
);

/* If the user has specified custom text for footer - get it */
const footerText = computed(() =>
  pageInfo.value && pageInfo.value.footerText ? pageInfo.value.footerText : "",
);
const appConfig = computed(() => appStore.appConfig);
const pageInfo = computed(() => appStore.pageInfo);
const visibleComponents = computed(() => appStore.visibleComponents);

/* Keep the document title in sync with the current config's page title.
 * The router sets a title from the build-time config on navigation, but
 * sub-page configs (e.g. doc-conf.yml) load asynchronously and carry their
 * own pageInfo.title, so the title is updated here once they arrive. */
watch(
  () => pageInfo.value?.title,
  (title) => {
    if (title) document.title = title;
  },
  { immediate: true },
);

const subPageClassName = computed(() => {
  const currentSubPage = appStore.currentConfigInfo;
  return currentSubPage && currentSubPage.pageId ? currentSubPage.pageId : "";
});

const topLevelStyleModifications = computed(() => {
  const vc = visibleComponents.value;
  if (!vc.footer && !vc.pageTitle) {
    return "--footer-height: 1rem;";
  } else if (!vc.footer) {
    return "--footer-height: 5rem;";
  } else if (!vc.pageTitle) {
    return "--footer-height: 4rem;";
  }
  return "";
});

/* Injects the users custom CSS as a style tag */
const injectCustomStyles = (usersCss: string) => {
  const style = document.createElement("style");
  style.textContent = usersCss;
  document.head.append(style);
};

/* Auto-detects users language from browser/ os, when not specified */
const autoDetectLanguage = (availibleLocales: string[]) => {
  const isLangSupported = (languageList: string[], userLang: string) =>
    languageList
      .map((lang) => lang.toLowerCase())
      .find((lang) => lang === userLang.toLowerCase());

  const usersBorwserLang1 = window.navigator.language || ""; // e.g. en-GB or ''
  const usersBorwserLang2 = usersBorwserLang1.split("-")[0]; // e.g. en or undefined
  const usersSpairLangs = window.navigator.languages; // e.g [en, en-GB, en-US]
  return (
    isLangSupported(availibleLocales, usersBorwserLang1) ||
    isLangSupported(availibleLocales, usersBorwserLang2) ||
    usersSpairLangs.find((spair) => isLangSupported(availibleLocales, spair)) ||
    defaultLanguage
  );
};

/* Get users language, if not available then call auto-detect */
const getLanguage = () => {
  const allAvailableLocales = availableLocales; // All available locales
  const usersLang =
    localStorage[localStorageKeys.LANGUAGE] || appConfig.value.language;
  if (usersLang) {
    if (allAvailableLocales.includes(usersLang)) {
      return usersLang;
    } else {
      ErrorHandler(`Unsupported Language: '${usersLang}'`);
    }
  }
  return autoDetectLanguage(allAvailableLocales);
};

/* Fetch or detect users language, then apply it */
const applyLanguage = () => {
  const language = getLanguage();
  appStore.setLanguage(language);
  locale.value = language;
  document.getElementsByTagName("html")[0].setAttribute("lang", language);
};

/* Basic initialization tasks on app load */
(async () => {
  await appStore.initializeConfig(); // Initialize config before moving on
  applyLanguage(); // Apply users local language
  if (appConfig.value.customCss) {
    // Inject users custom CSS, if present
    const cleanedCss = appConfig.value.customCss.replace(/<\/?[^>]+(>|$)/g, "");
    injectCustomStyles(cleanedCss);
  }
  welcomeMsg(); // Show message in console
})();
</script>

<style lang="scss">
/* Import styles used globally throughout the app */
@use "@/styles/global-styles";
@use "@/styles/color-palette";
@use "@/styles/dimensions";
@use "@/styles/typography";
@use "@/styles/user-defined-themes";
</style>
