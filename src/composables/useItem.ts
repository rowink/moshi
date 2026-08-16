/**
 * Composable version of the ItemMixin, for use in <script setup> components.
 * Handles status checks, context menus and item launch behaviour.
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import axios from "axios";
import { useI18n } from "vue-i18n";
import ErrorHandler from "@/utils/ErrorHandler";
import { showToast } from "@/utils/toast";
import {
  openingMethod as defaultOpeningMethod,
  serviceEndpoints,
  localStorageKeys,
  iconSize as defaultSize,
} from "@/utils/defaults";
import { useAppStore } from "@/store/modules/appStore";
import { Item, ItemTarget } from "@/types/types";

/* Extend the Item interface with optional fields only used by this composable */
export interface ItemComposableItem extends Item {
  backgroundColor?: string;
  statusCheckInterval?: number;
  unicodeOpeningIcon?: string;
}

interface StatusResponse {
  statusText?: string;
  statusSuccess?: boolean;
  message?: string;
  successStatus?: boolean;
}

interface ItemComposableProps {
  item?: ItemComposableItem;
  isAddNew?: boolean;
  itemSize?: string;
  url?: string;
}

export const useItem = (
  props: ItemComposableProps,
  emit: (event: string, ...args: unknown[]) => void,
) => {
  const appStore = useAppStore();
  const { t } = useI18n();

  const appConfig = computed(() => appStore.appConfig);

  const statusResponse = ref<StatusResponse | undefined>(undefined);
  const contextMenuOpen = ref(false);
  const intervalId = ref<number | undefined>(undefined); // status-check setInterval() id
  const contextPos = reactive({
    posX: undefined as number | undefined,
    posY: undefined as number | undefined,
  });
  const customStyles = reactive({
    color: props.item?.color,
    background: props.item?.backgroundColor,
  });

  const size = computed(() => {
    const validSizes = ["small", "medium", "large"];
    if (props.itemSize && validSizes.includes(props.itemSize))
      return props.itemSize;
    return appStore.iconSize || defaultSize;
  });

  /* Determines if user has enabled online status checks */
  const enableStatusCheck = computed(() => {
    const globalPref = appConfig.value.statusCheck || false;
    const itemPref = props.item?.statusCheck;
    return typeof itemPref === "boolean" ? itemPref : globalPref;
  });

  /* Determine how often to re-fire status checks */
  const statusCheckInterval = computed(() => {
    let interval =
      props.item?.statusCheckInterval || appConfig.value.statusCheckInterval;
    if (!interval) return 0;
    if (interval > 60) interval = 60;
    if (interval < 1) interval = 0;
    return interval;
  });

  const accumulatedTarget = computed<ItemTarget>(() => {
    return (
      props.item?.target ||
      appConfig.value.defaultOpeningMethod ||
      defaultOpeningMethod
    );
  });

  /* Convert config target value, into HTML anchor target attribute */
  const anchorTarget = computed(() => {
    const target = accumulatedTarget.value;
    switch (target) {
      case "sametab":
        return "_self";
      case "newtab":
        return "_blank";
      case "parent":
        return "_parent";
      case "top":
        return "_top";
      default:
        return undefined;
    }
  });

  /* Get href for anchor, if not opening in modal/ clipboard */
  const hyperLinkHref = computed(() => {
    const nothing = "#";
    const url = props.url || props.item?.url || nothing;
    const noAnchorNeeded = ["modal", "clipboard"];
    return noAnchorNeeded.includes(accumulatedTarget.value) ? nothing : url;
  });

  /* Pulls together all user options, returns URL + Get params for ping endpoint */
  const statusCheckApiUrl = computed(() => {
    const {
      url,
      statusCheckUrl,
      statusCheckHeaders,
      statusCheckAllowInsecure,
      statusCheckAcceptCodes,
      statusCheckMaxRedirects,
    } = props.item || {};
    const encode = (str: string) => encodeURIComponent(str);
    statusResponse.value = undefined;
    // Find base URL, where the API is hosted
    const baseUrl = process.env.VUE_APP_DOMAIN || window.location.origin;
    // Find correct URL to check, and encode
    const urlToCheck = `?&url=${encode(String(statusCheckUrl || url))}`;
    // Get, stringify and encode any headers
    const headers = statusCheckHeaders
      ? `&headers=${encode(JSON.stringify(statusCheckHeaders))}`
      : "";
    // Deterimine if user disabled security
    const enableInsecure = statusCheckAllowInsecure
      ? "&enableInsecure=true"
      : "";
    const acceptCodes = statusCheckAcceptCodes
      ? `&acceptCodes=${statusCheckAcceptCodes}`
      : "";
    const maxRedirects = statusCheckMaxRedirects
      ? `&maxRedirects=${statusCheckMaxRedirects}`
      : "";
    // Construct the full API endpoint's URL with GET params
    return (
      `${baseUrl}${serviceEndpoints.statusCheck}/${urlToCheck}` +
      `${headers}${enableInsecure}${acceptCodes}${maxRedirects}`
    );
  });

  const customStyle = computed(() => {
    return (
      `--open-icon:${unicodeOpeningIcon.value};` +
      `color:${props.item?.color};` +
      `background:${props.item?.backgroundColor}`
    );
  });

  const unicodeOpeningIcon = computed(() => props.item?.unicodeOpeningIcon);

  /* Checks if a given service is currently online */
  const checkWebsiteStatus = () => {
    const endpoint = statusCheckApiUrl.value;
    axios
      .get(endpoint)
      .then((response) => {
        if (response.data) statusResponse.value = response.data;
      })
      .catch(() => {
        // Something went very wrong.
        statusResponse.value = {
          statusText: "Failed to make request",
          statusSuccess: false,
        };
      });
  };

  /* Called when an item is clicked, manages the opening of modal & resets the search field */
  const itemClicked = (e: MouseEvent) => {
    const url = props.url || props.item?.url;
    // For certain opening methods, prevent default and manually navigate
    if (e.ctrlKey) {
      e.preventDefault();
      window.open(url, "_blank");
    } else if (e.altKey || accumulatedTarget.value === "modal") {
      e.preventDefault();
      emit("triggerModal", url);
    } else if (accumulatedTarget.value === "clipboard") {
      e.preventDefault();
      copyToClipboard(url);
    }
    // Emit event to clear search field, etc
    emit("itemClicked");
    // Update the most/ last used ledger, for smart-sorting
    if (!appConfig.value.disableSmartSort) {
      incrementMostUsedCount(props.item?.id);
      incrementLastUsedCount(props.item?.id);
    }
  };

  /* Open item, using specified method */
  const launchItem = (method: string, link?: string) => {
    const url = link || props.item?.url;
    contextMenuOpen.value = false;
    switch (method) {
      case "newtab":
        window.open(url, "_blank");
        break;
      case "sametab":
        window.open(url, "_self");
        break;
      case "modal":
        emit("triggerModal", url);
        break;
      case "clipboard":
        copyToClipboard(url);
        break;
      default:
        window.open(url, "_blank");
    }
  };

  /* Open custom context menu, and set position */
  const openContextMenu = (e?: MouseEvent) => {
    contextMenuOpen.value = !contextMenuOpen.value;
    if (e && window) {
      // Calculate placement based on cursor and scroll position
      contextPos.posX = e.clientX + window.pageXOffset;
      contextPos.posY = e.clientY + window.pageYOffset;
    }
  };

  /* Closes the context menu, called when user clicks literally anywhere */
  const closeContextMenu = () => {
    contextMenuOpen.value = false;
  };

  /* Copies a string to the users clipboard / shows error if not possible  */
  const copyToClipboard = (content: string | undefined) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(String(content));
      showToast(t("context-menus.item.copied-toast"), {
        className: "toast-success",
      });
    } else {
      ErrorHandler(
        "Clipboard access requires HTTPS. See: https://bit.ly/3N5WuAA",
      );
      showToast("Unable to copy, see log", {
        className: "toast-error",
      });
    }
  };

  /* Used for smart-sort when sorting items by most used apps */
  const incrementMostUsedCount = (itemId: string | undefined) => {
    const mostUsed = JSON.parse(
      localStorage.getItem(localStorageKeys.MOST_USED) || "{}",
    );
    let counter = mostUsed[itemId as string] || 0;
    counter += 1;
    mostUsed[itemId as string] = counter;
    localStorage.setItem(localStorageKeys.MOST_USED, JSON.stringify(mostUsed));
  };

  /* Used for smart-sort when sorting by last used apps */
  const incrementLastUsedCount = (itemId: string | undefined) => {
    const lastUsed = JSON.parse(
      localStorage.getItem(localStorageKeys.LAST_USED) || "{}",
    );
    lastUsed[itemId as string] = new Date().getTime();
    localStorage.setItem(localStorageKeys.LAST_USED, JSON.stringify(lastUsed));
  };

  /* Stops the interval used to re-fire status checks */
  const stopStatusCheck = () => {
    if (intervalId.value) {
      clearInterval(intervalId.value);
      intervalId.value = undefined;
    }
  };

  /* Start status checking, and re-fire every interval */
  const startStatusCheck = () => {
    if (enableStatusCheck.value) checkWebsiteStatus();
    if (statusCheckInterval.value > 0) {
      intervalId.value = window.setInterval(
        checkWebsiteStatus,
        statusCheckInterval.value * 1000,
      );
    }
  };

  onMounted(() => {
    startStatusCheck();
  });

  onBeforeUnmount(() => {
    stopStatusCheck();
  });

  return {
    appStore,
    appConfig,
    statusResponse,
    contextMenuOpen,
    intervalId,
    contextPos,
    customStyles,
    size,
    enableStatusCheck,
    statusCheckInterval,
    accumulatedTarget,
    anchorTarget,
    hyperLinkHref,
    statusCheckApiUrl,
    customStyle,
    unicodeOpeningIcon,
    checkWebsiteStatus,
    itemClicked,
    launchItem,
    openContextMenu,
    closeContextMenu,
    copyToClipboard,
    incrementMostUsedCount,
    incrementLastUsedCount,
    startStatusCheck,
    stopStatusCheck,
  };
};

export default useItem;
