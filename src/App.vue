<template>
  <div id="dashy" :style="topLevelStyleModifications" :class="subPageClassName">
    <LoadingScreen :isLoading="isLoading" v-if="shouldShowSplash" />
    <Header :pageInfo="pageInfo" />
    <router-view v-if="!isFetching" />
    <Footer :text="footerText" v-if="visibleComponents.footer && !isFetching" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import Header from '@/components/PageStrcture/Header.vue';
import Footer from '@/components/PageStrcture/Footer.vue';
import LoadingScreen from '@/components/PageStrcture/LoadingScreen.vue';
import { welcomeMsg } from '@/utils/CoolConsole';
import { useAppStore } from '@/store';
import ErrorHandler from '@/utils/ErrorHandler';
import {
  localStorageKeys,
  splashScreenTime,
  language as defaultLanguage,
} from '@/utils/defaults';

export default defineComponent({
  name: 'app',
  components: {
    Header,
    Footer,
    LoadingScreen,
  },
  data() {
    return {
      isLoading: true, // Set to false after mount complete
      isFetching: true, // Set to false after the conf has been fetched
    };
  },
  watch: {
    config() {
      this.isFetching = false;
    },
  },
  computed: {
    appStore() { return useAppStore(); },
    /* If the user has specified custom text for footer - get it */
    footerText() {
      return this.pageInfo && this.pageInfo.footerText ? this.pageInfo.footerText : '';
    },
    /* Determine if splash screen should be shown */
    shouldShowSplash() {
      return (this.appConfig.showSplashScreen);
    },
    config() {
      return this.appStore.config;
    },
    appConfig() {
      return this.appStore.appConfig;
    },
    pageInfo() {
      return this.appStore.pageInfo;
    },
    sections() {
      return this.appStore.pageInfo;
    },
    visibleComponents() {
      return this.appStore.visibleComponents;
    },
    subPageClassName() {
      const currentSubPage = this.appStore.currentConfigInfo;
      return (currentSubPage && currentSubPage.pageId) ? currentSubPage.pageId : '';
    },
    topLevelStyleModifications() {
      const vc = this.visibleComponents;
      if (!vc.footer && !vc.pageTitle) {
        return '--footer-height: 1rem;';
      } else if (!vc.footer) {
        return '--footer-height: 5rem;';
      } else if (!vc.pageTitle) {
        return '--footer-height: 4rem;';
      }
      return '';
    },
  },
  methods: {
    /* Injects the users custom CSS as a style tag */
    injectCustomStyles(usersCss: string) {
      const style = document.createElement('style');
      style.textContent = usersCss;
      document.head.append(style);
    },
    /* Hide splash screen, either after 2 seconds, or immediately based on user preference */
    hideSplash() {
      if (this.shouldShowSplash) {
        setTimeout(() => { this.isLoading = false; }, splashScreenTime || 1000);
      } else {
        this.isLoading = false;
      }
    },

    /* Auto-detects users language from browser/ os, when not specified */
    autoDetectLanguage(availibleLocales: string[]) {
      const isLangSupported = (languageList: string[], userLang: string) => languageList
        .map(lang => lang.toLowerCase()).find((lang) => lang === userLang.toLowerCase());

      const usersBorwserLang1 = window.navigator.language || ''; // e.g. en-GB or or ''
      const usersBorwserLang2 = usersBorwserLang1.split('-')[0]; // e.g. en or undefined
      const usersSpairLangs = window.navigator.languages; // e.g [en, en-GB, en-US]
      return isLangSupported(availibleLocales, usersBorwserLang1)
        || isLangSupported(availibleLocales, usersBorwserLang2)
        || usersSpairLangs.find((spair) => isLangSupported(availibleLocales, spair))
        || defaultLanguage;
    },

    /* Get users language, if not available then call auto-detect */
    getLanguage() {
      const availibleLocales = this.$i18n.availableLocales; // All available locales
      const usersLang = localStorage[localStorageKeys.LANGUAGE] || this.appConfig.language;
      if (usersLang) {
        if (availibleLocales.includes(usersLang)) {
          return usersLang;
        } else {
          ErrorHandler(`Unsupported Language: '${usersLang}'`);
        }
      }
      return this.autoDetectLanguage(availibleLocales);
    },

    /* Fetch or detect users language, then apply it */
    applyLanguage() {
      const language = this.getLanguage();
      this.appStore.setLanguage(language);
      this.$i18n.locale = language;
      document.getElementsByTagName('html')[0].setAttribute('lang', language);
    },
    /* If placeholder element still visible, hide it */
    hideLoader() {
      const loader = document.getElementById('loader');
      if (loader) loader.style.display = 'none';
    },
  },
  /* Basic initialization tasks on app load */
  async mounted() {
    await this.appStore.initializeConfig(); // Initialize config before moving on
    this.applyLanguage(); // Apply users local language
    this.hideSplash(); // Hide the splash screen, if visible
    if (this.appConfig.customCss) { // Inject users custom CSS, if present
      const cleanedCss = this.appConfig.customCss.replace(/<\/?[^>]+(>|$)/g, '');
      this.injectCustomStyles(cleanedCss);
    }
    this.hideLoader(); // If initial placeholder still visible, hide it
    welcomeMsg(); // Show message in console
  },
});
</script>

<style lang="scss">
/* Import styles used globally throughout the app */
@use '@/styles/global-styles';
@use '@/styles/color-palette';
@use '@/styles/dimensions';
@use '@/styles/color-themes';
@use '@/styles/typography';
@use '@/styles/user-defined-themes';

</style>
