<template ref="container">
  <div :class="`item-wrapper wrap-size-${size} span-${makeColumnCount}`" >
    <a @click="itemClicked"
      @long-press="openContextMenu"
      @contextmenu.prevent
      @mouseup.right="openContextMenu"
      v-longPress="true"
      :href="item.url"
      :target="anchorTarget"
      :class="`item ${makeClassList}`"
      v-tooltip="getTooltipOptions()"
      rel="noopener noreferrer" tabindex="0"
      :id="`link-${item.id}`"
      :style="customStyle"
    >
      <!-- Item Text -->
      <div :class="`tile-title  ${!itemIcon? 'bounce no-icon': ''}`" :id="`tile-${item.id}`" >
        <span class="text">{{ item.title }}</span>
        <p class="description">{{ item.description }}</p>
      </div>
      <!-- Item Icon -->
      <Icon :icon="itemIcon" :url="item.url" :size="size" :color="item.color"
        v-bind:style="customStyles" class="bounce" />
      <!-- Small icon, showing opening method on hover -->
      <ItemOpenMethodIcon class="opening-method-icon"
        :isSmall="!itemIcon || size === 'small'"
        :openingMethod="accumulatedTarget"  position="bottom right"
        :hotkey="item.hotkey" />
      <!-- Status indicator dot (if enabled) showing weather service is available -->
      <StatusIndicator
        class="status-indicator"
        v-if="enableStatusCheck"
        :statusSuccess="statusResponse ? statusResponse.successStatus : undefined"
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

<script>
import Icon from '@/components/LinkItems/ItemIcon.vue';
import ItemOpenMethodIcon from '@/components/LinkItems/ItemOpenMethodIcon';
import StatusIndicator from '@/components/LinkItems/StatusIndicator';
import ContextMenu from '@/components/LinkItems/ItemContextMenu';
import ItemMixin from '@/mixins/ItemMixin';
import { useAppStore } from '@/store';

export default {
  name: 'Item',
  mixins: [ItemMixin],
  props: {
    itemSize: String,
    parentSectionTitle: String, // Title of parent section (for add new)
    isAddNew: Boolean, // Only set if 'fake' item used as Add New button
    sectionWidth: Number, // Width of parent section
    sectionDisplayData: Object,
  },
  components: {
    Icon,
    ItemOpenMethodIcon,
    StatusIndicator,
    ContextMenu,
  },
  computed: {
    appStore() { return useAppStore(); },
    /* Returns either item.icon, or appConfig.defaultIcon, or null */
    itemIcon() {
      return this.item.icon || this.appStore.appConfig?.defaultIcon;
    },
    makeColumnCount() {
      if ((this.sectionDisplayData || {}).itemCountX) return this.sectionDisplayData.itemCountX;
      if (this.sectionWidth < 380) return 1;
      if (this.sectionWidth < 520) return 2;
      if (this.sectionWidth < 730) return 3;
      if (this.sectionWidth < 1000) return 4;
      if (this.sectionWidth < 1300) return 5;
      return 0;
    },
    /* Based on item props, adjust class names */
    makeClassList() {
      const { isAddNew, size } = this;
      return `size-${size} ${!this.itemIcon ? 'short' : ''} `
        + `${isAddNew ? 'add-new' : ''}`;
    },
    /* Used by certain themes (material), to show animated CSS icon */
    unicodeOpeningIcon() {
      switch (this.accumulatedTarget) {
        case 'newtab': return '"\\f360"';
        case 'sametab': return '"\\f24d"';
        case 'parent': return '"\\f3bf"';
        case 'top': return '"\\f102"';
        case 'modal': return '"\\f2d0"';
        case 'workspace': return '"\\f0b1"';
        case 'clipboard': return '"\\f0ea"';
        default: return '"\\f054"';
      }
    },
  },
  methods: {
    /* Returns configuration object for the tooltip */
    getTooltipOptions() {
      if (!this.item.description && !this.item.provider) return {}; // If no description, then skip
      const description = this.item.description || '';
      const providerText = this.item.provider ? `<b>Provider</b>: ${this.item.provider}` : '';
      const lb1 = description && providerText ? '<br>' : '';
      const hotkeyText = this.item.hotkey ? `<br>Press '${this.item.hotkey}' to launch` : '';
      const tooltipText = providerText + lb1 + description + hotkeyText;
      return {
        content: tooltipText,
        trigger: 'hover focus',
        hideOnTargetClick: true,
        html: true,
        placement: this.statusResponse ? 'left' : 'auto',
        delay: { show: 600, hide: 200 },
        classes: `item-description-tooltip tooltip-is-${this.size}`,
      };
    },
  },
  mounted() {
    // If ststus checking is enabled, then check service status
    if (this.enableStatusCheck) {
      this.checkWebsiteStatus();
      // If continious status checking is enabled, then start ever-lasting loop
      if (this.statusCheckInterval > 0) {
        this.intervalId = setInterval(this.checkWebsiteStatus, this.statusCheckInterval * 1000);
      }
    }
  },
  beforeDestroy() {
    // Stop periodic status-check when item is destroyed (e.g. navigating in multi-page setup)
    if (this.intervalId) clearInterval(this.intervalId);
  },
};
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
    &.span-1 { min-width: 100%; }
    &.span-2 { min-width: 50%; }
    &.span-3 { min-width: 33%; }
    &.span-4 { min-width: 25%; }
    &.span-5 { min-width: 20%; }
    &.span-6 { min-width: 16%; }
    &.span-7 { min-width: 14%; }
    &.span-8 { min-width: 12.5%; }
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
.item:hover, .item:focus {
  /* Show opening-method icon */
  .opening-method-icon {
    display: block;
  }

  /* Trigger text-marquee for text that doesn't fit */
  .tile-title.is-overflowing{
    .overflow-dots {
      opacity: 0;
    }
    span.text {
      transform: translateX(calc(100px - 100%));
    }
  }

  /* Apply transformation of icons on hover */
  .tile-icon, .tile-svg  {
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
        font-size: .9em;
        line-height: 1rem;
        height: 2rem;
      }
    }
  }
  &:before { // Certain themes (e.g. material) show css animated fas icon on hover
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
.tooltip.item-description-tooltip {
  z-index: 7;
}
</style>
