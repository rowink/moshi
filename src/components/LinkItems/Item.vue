<template ref="container">
  <div :class="`item-wrapper wrap-size-${size} span-${makeColumnCount}`">
    <a
      @click="itemClicked"
      @long-press="openContextMenu"
      @contextmenu.prevent
      @mouseup.right="openContextMenu"
      v-longPress="true"
      :href="item.url"
      :target="anchorTarget"
      :class="`item ${makeClassList}`"
      v-tooltip="getTooltipOptions()"
      rel="noopener noreferrer"
      tabindex="0"
      :id="`link-${item.id}`"
      :style="customStyle"
    >
      <!-- Item Text -->
      <div
        :class="`tile-title  ${!itemIcon ? 'bounce no-icon' : ''}`"
        :id="`tile-${item.id}`"
      >
        <span class="text">{{ item.title }}</span>
        <p class="description">{{ item.description }}</p>
      </div>
      <!-- Item Icon -->
      <FaviconIcon
        :icon="itemIcon"
        :url="item.url"
        :size="size"
        :color="item.color"
        v-bind:style="customStyles"
        class="bounce"
      />
      <!-- Small icon, showing opening method on hover -->
      <ItemOpenMethodIcon
        class="opening-method-icon"
        :isSmall="!itemIcon || size === 'small'"
        :openingMethod="accumulatedTarget"
        position="bottom right"
        :hotkey="item.hotkey"
      />
      <!-- Status indicator dot (if enabled) showing weather service is available -->
      <StatusIndicator
        class="status-indicator"
        v-if="enableStatusCheck"
        :statusSuccess="
          statusResponse ? statusResponse.successStatus : undefined
        "
        :statusText="statusResponse ? statusResponse.message : undefined"
      />
    </a>
    <!-- Right-click context menu -->
    <ContextMenu
      :show="contextMenuOpen && !isAddNew"
      v-click-outside="closeContextMenu"
      :posX="contextPos.posX"
      :posY="contextPos.posY"
      :id="`context-menu-${item.id}`"
      @launchItem="launchItem"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, PropType } from "vue";
import ItemOpenMethodIcon from "@/components/LinkItems/ItemOpenMethodIcon.vue";
import StatusIndicator from "@/components/LinkItems/StatusIndicator.vue";
import ContextMenu from "@/components/LinkItems/ItemContextMenu.vue";
import useItem, { ItemComposableItem } from "@/composables/useItem";
import vLongPress from "@/directives/LongPress";
import FaviconIcon from "./FaviconIcon.vue";

const props = defineProps({
  item: {
    type: Object as PropType<ItemComposableItem>,
    default: (): ItemComposableItem => ({}),
  },
  itemSize: String,
  parentSectionTitle: String, // Title of parent section (for add new)
  isAddNew: Boolean, // Only set if 'fake' item used as Add New button
  sectionWidth: Number, // Width of parent section
  sectionDisplayData: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

const emit = defineEmits(["itemClicked", "triggerModal"]);

const {
  appStore,
  statusResponse,
  contextMenuOpen,
  contextPos,
  customStyles,
  size,
  enableStatusCheck,
  accumulatedTarget,
  anchorTarget,
  itemClicked,
  launchItem,
  openContextMenu,
  closeContextMenu,
} = useItem(
  {
    item: props.item,
    isAddNew: props.isAddNew,
    itemSize: props.itemSize,
  },
  emit as (_event: string, ..._args: unknown[]) => void,
);

/* Returns either item.icon, or appConfig.defaultIcon, or null */
const itemIcon = computed(
  () => props.item.icon || appStore.appConfig?.defaultIcon,
);

const makeColumnCount = computed(() => {
  if ((props.sectionDisplayData || {}).itemCountX)
    return props.sectionDisplayData.itemCountX;
  if (props.sectionWidth! < 380) return 1;
  if (props.sectionWidth! < 520) return 2;
  if (props.sectionWidth! < 730) return 3;
  if (props.sectionWidth! < 1000) return 4;
  if (props.sectionWidth! < 1300) return 5;
  return 0;
});

/* Based on item props, adjust class names */
const makeClassList = computed(
  () =>
    `size-${size.value} ${!itemIcon.value ? "short" : ""} ` +
    `${props.isAddNew ? "add-new" : ""}`,
);

/* Used by certain themes (material), to show animated CSS icon */
const unicodeOpeningIcon = computed(() => {
  switch (accumulatedTarget.value) {
    case "newtab":
      return '"\\f360"';
    case "sametab":
      return '"\\f24d"';
    case "parent":
      return '"\\f3bf"';
    case "top":
      return '"\\f102"';
    case "modal":
      return '"\\f2d0"';
    case "clipboard":
      return '"\\f0ea"';
    default:
      return '"\\f054"';
  }
});

const customStyle = computed(
  () =>
    `--open-icon:${unicodeOpeningIcon.value};` +
    `color:${props.item?.color};` +
    `background:${props.item?.backgroundColor}`,
);

/* Returns configuration object for the tooltip */
function getTooltipOptions() {
  if (!props.item.description && !props.item.provider) return {}; // If no description, then skip
  const description = props.item.description || "";
  const providerText = props.item.provider
    ? `<b>Provider</b>: ${props.item.provider}`
    : "";
  const lb1 = description && providerText ? "<br>" : "";
  const hotkeyText = props.item.hotkey
    ? `<br>Press '${props.item.hotkey}' to launch`
    : "";
  const tooltipText = providerText + lb1 + description + hotkeyText;
  return {
    content: tooltipText,
    triggers: ["hover", "focus"],
    autoHide: true,
    html: true,
    placement: statusResponse.value ? "left" : "auto",
    delay: { show: 600, hide: 200 },
    popperClass: `item-description-tooltip tooltip-is-${size.value}`,
  };
}
</script>

<style lang="scss">
.item-wrapper {
  flex-grow: 1;
  flex-basis: 6rem;
  &.wrap-size-large {
    flex-basis: 12rem;
  }
  &.wrap-size-small {
    flex-grow: revert;
    &.span-1 {
      min-width: 100%;
    }
    &.span-2 {
      min-width: 50%;
    }
    &.span-3 {
      min-width: 33%;
    }
    &.span-4 {
      min-width: 25%;
    }
    &.span-5 {
      min-width: 20%;
    }
    &.span-6 {
      min-width: 16%;
    }
    &.span-7 {
      min-width: 14%;
    }
    &.span-8 {
      min-width: 12.5%;
    }
  }
}

.item {
  flex-grow: 1;
  color: var(--item-text-color);
  vertical-align: middle;
  margin: 0.5rem;
  background: var(--item-background);
  text-align: center;
  padding: 2px;
  outline: 2px solid transparent;
  border: 1px solid var(--outline-color);
  border-radius: var(--curve-factor);
  box-shadow: var(--item-shadow);
  cursor: pointer;
  text-decoration: none;
  position: relative;
  transition: all 0.2s ease-in-out 0s;
  &:hover {
    box-shadow: var(--item-hover-shadow);
    background: var(--item-background-hover);
    color: var(--item-text-color-hover);
  }
  &:focus {
    outline: 2px solid var(--primary);
  }
  &.add-new {
    border: 2px dashed var(--primary) !important;
  }
  &.short:not(.size-large) {
    height: 2rem;
  }
}

/* Text in tile */
.tile-title {
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 120px;
  height: 30px;
  position: relative;
  padding: 0;
  z-index: 2;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  word-break: keep-all;
  span.text {
    white-space: nowrap;
  }
}

/* Colored dot showing service status */
.status-indicator {
  position: absolute;
  top: 0;
  right: 0;
}

.opening-method-icon {
  display: none; // Hidden by default, visible on hover
}

/* Manage hover and focus actions */
.item:hover,
.item:focus {
  /* Show opening-method icon */
  .opening-method-icon {
    display: block;
  }

  /* Trigger text-marquee for text that doesn't fit */
  .tile-title.is-overflowing {
    .overflow-dots {
      opacity: 0;
    }
    span.text {
      transform: translateX(calc(100px - 100%));
    }
  }

  /* Apply transformation of icons on hover */
  .tile-icon,
  .tile-svg {
    filter: var(--item-icon-transform-hover);
  }
}

/* Edit icon, visible in edit mode */
p.description {
  display: none; // By default, we don't show the description
}

/* Specify layout for alternate sized icons */
.item {
  /* Small Tile Specific Themes */
  &.size-small {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    align-items: center;
    height: 2rem;
    padding-top: 0.25rem;
    padding-left: 0.5rem;
    div img {
      width: 2rem;
    }
    .tile-title {
      height: fit-content;
      min-height: 1.2rem;
      text-align: left;
      max-width: 12rem;
      overflow: hidden;
      span.text {
        text-align: left;
        padding-left: 10%;
      }
    }
  }
  /* Medium Tile Specific Themes */
  &.size-medium {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: auto;
    div img {
      width: 2.5rem;
      margin-bottom: 0.25rem;
    }
    .tile-title {
      min-width: 100px;
      max-width: 160px;
      &.no-icon {
        text-align: left;
        width: 100%;
        max-width: inherit;
        margin-left: 0.5rem;
      }
    }
  }
  /* Large Tile Specific Themes */
  &.size-large {
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;
    text-align: left;
    overflow: hidden;
    align-items: center;
    max-height: 6rem;
    margin: 0.2rem;
    padding: 0.5rem;
    img {
      padding: 0.1rem 0.25rem;
    }
    .tile-title {
      height: auto;
      padding: 0.1rem 0.25rem;
      span.text {
        position: relative;
        font-weight: bold;
        font-size: 1.1rem;
        width: 100%;
      }
      p.description {
        margin: 0;
        display: block;
        white-space: pre-wrap;
        text-overflow: ellipsis;
        font-size: 0.9em;
        line-height: 1rem;
        height: 2rem;
      }
    }
  }
  &:before {
    // Certain themes (e.g. material) show css animated fas icon on hover
    display: none;
    font-family: FontAwesome;
    content: var(--open-icon, "\f054") !important;
  }
}
</style>

<!-- An un-scoped style tag, since tooltip is outside this DOM tree -->
<style lang="scss">
.disabled-link {
  pointer-events: none;
}
.v-popper__popper.item-description-tooltip {
  z-index: 7;
}
</style>
