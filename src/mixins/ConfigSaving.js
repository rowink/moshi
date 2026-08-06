import ErrorHandler, { InfoHandler } from '@/utils/ErrorHandler';
import { localStorageKeys } from '@/utils/defaults';
import { useAppStore } from '@/store';

export default {
  computed: {
    appStore() { return useAppStore(); },
  },
  data() {
    return {
      saveSuccess: undefined,
      responseText: '',
    };
  },
  methods: {
    saveConfigLocally(config) {
      if (!this.permissions.allowSaveLocally) {
        ErrorHandler('Unable to save changes locally, this feature has been disabled');
        return;
      }
      localStorage.setItem(localStorageKeys.CONF_SECTIONS, JSON.stringify(config.sections));
      localStorage.setItem(localStorageKeys.PAGE_INFO, JSON.stringify(config.pageInfo));
      localStorage.setItem(localStorageKeys.APP_CONFIG, JSON.stringify(config.appConfig));
      if (config.appConfig.theme) {
        localStorage.setItem(localStorageKeys.THEME, config.appConfig.theme);
      }
      InfoHandler('Config has succesfully been saved in browser storage', 'Config Update');
      this.showToast(this.$t('config-editor.success-msg-local'), true);
      this.appStore.setEditMode(false);
    },
    carefullyClearLocalStorage() {
      localStorage.removeItem(localStorageKeys.PAGE_INFO);
      localStorage.removeItem(localStorageKeys.APP_CONFIG);
      localStorage.removeItem(localStorageKeys.CONF_SECTIONS);
    },
  },
};
