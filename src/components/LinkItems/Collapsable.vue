<template>
  <div
    v-bind:class="[
      { 'is-open': isExpanded, 'full-height': cutToHeight },
      `collapsable ${rowColSpanClass}`,
      sectionClassName,
    ]"
    :style="`${color ? 'background: ' + color : ''}; ${sanitizeCustomStyles(customStyles)};`"
  >
    <input
      :id="sectionKey"
      class="toggle"
      type="checkbox"
      v-model="checkboxState"
      tabIndex="-1"
    />
    <label
      :for="sectionKey"
      class="lbl-toggle"
      tabindex="-1"
    >
      <Icon
        v-if="icon"
        :icon="icon"
        size="small"
        :url="title"
        class="section-icon"
      />
      <h3>{{ title }}</h3>
    </label>
    <div class="collapsible-content">
      <div class="content-inner">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import vLongPress from "@/directives/LongPress";
import { localStorageKeys } from "@/utils/defaults";
import Icon from "@/components/LinkItems/ItemIcon.vue";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  uniqueKey: String, // Generated unique ID
  title: String, // The section title
  icon: String, // An optional section icon
  collapsed: Boolean, // Optional override collapse state
  cols: Number, // Set section horizontal col span / width
  rows: Number, // Set section vertical row span / height
  color: String, // Optional color override
  customStyles: String, // Optional custom stylings
  cutToHeight: Boolean, // To set section height with content height
});
const emit = defineEmits(["openContextMenu"]);

const sectionKey = computed(() => `collapsible-${props.uniqueKey}`);
const rowColSpanClass = computed(() => {
  const { rows, cols } = props;
  return `${checkSpanNum(cols, "col")} ${checkSpanNum(rows, "row")}`;
});
const sectionClassName = computed(() => {
  if (!props.title) return "unnamed-section";
  return `section_${props.title.replaceAll(" ", "-").toLowerCase()}`;
});
/* Used to fetch initial collapse state, and set new collapse state on change */
const isExpanded = computed({
  get() {
    if (props.collapsed !== undefined) return !props.collapsed;
    const collapseStateObject = locallyStoredCollapseStates();
    if (collapseStateObject[props.uniqueKey as string] !== undefined) {
      return collapseStateObject[props.uniqueKey as string];
    }
    return true;
  },
  set(newState: boolean) {
    const collapseState = locallyStoredCollapseStates();
    collapseState[props.uniqueKey as string] = newState;
    localStorage.setItem(
      localStorageKeys.COLLAPSE_STATE,
      JSON.stringify(collapseState),
    );
  },
});

const checkboxState = ref(true);

onMounted(() => {
  checkboxState.value = isExpanded.value;
});

watch(checkboxState, (newState: boolean) => {
  isExpanded.value = newState;
});
watch(
  () => props.uniqueKey,
  () => {
    checkboxState.value = isExpanded.value;
  },
);

/* Either expand or collapse section, based on it's current state */
function toggle() {
  checkboxState.value = !checkboxState.value;
}
/* Check that row & column span is valid, and not over the max */
function checkSpanNum(span: string | number | undefined, classPrefix: string) {
  const maxSpan = 6;
  let numSpan = /^\d*$/.test(String(span)) ? parseInt(String(span), 10) : 1;
  numSpan = numSpan > maxSpan ? maxSpan : numSpan;
  return `${classPrefix}-${numSpan}`;
}
/* Removes all special characters, except those allowed in valid CSS */
function sanitizeCustomStyles(userCss: string | undefined) {
  return userCss ? userCss.replace(/[^a-zA-Z0-9- :;.]/g, "") : "";
}
/* Returns local storage collapse state data, and if not yet set then initialized is */
function locallyStoredCollapseStates() {
  // If not yet set, then call initialize
  if (!localStorage[localStorageKeys.COLLAPSE_STATE]) {
    localStorage.setItem(localStorageKeys.COLLAPSE_STATE, JSON.stringify({}));
    return {};
  }
  // Otherwise, return value of local storage
  return JSON.parse(localStorage[localStorageKeys.COLLAPSE_STATE]);
}
function openContextMenu(e: MouseEvent) {
  emit("openContextMenu", e);
}

defineExpose({ toggle });
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;

.collapsable {
  width: 100%;
  height: fit-content;
  margin: 10px;
  padding: var(--item-group-padding);
  border-radius: var(--curve-factor);
  box-shadow: var(--item-group-shadow);
  background: var(--item-group-outer-background);
  @include phone {
    margin: 4px;
    padding: 4px;
  }

  /* Options allowing sections to SPAN multiple rows or columns */
  grid-row-start: span 1;
  &.row-2 {
    grid-row-start: span 2;
  }
  &.row-3 {
    grid-row-start: span 3;
  }
  &.row-4 {
    grid-row-start: span 4;
  }
  &.row-5 {
    grid-row-start: span 5;
  }
  &.row-6 {
    grid-row-start: span 6;
  }
  grid-column-start: span 1;
  @include tablet-up {
    &.col-2,
    &.col-3,
    &.col-4,
    &.col-5,
    &.col-6 {
      grid-column-start: span 2;
    }
  }
  @include laptop-up {
    &.col-2 {
      grid-column-start: span 2;
    }
    &.col-3,
    &.col-4,
    &.col-5,
    &.col-6 {
      grid-column-start: span 3;
    }
  }
  @include monitor-up {
    &.col-2 {
      grid-column-start: span 2;
    }
    &.col-3 {
      grid-column-start: span 3;
    }
    &.col-4 {
      grid-column-start: span 4;
    }
    &.col-5 {
      grid-column-start: span 5;
    }
    &.col-6 {
      grid-column-start: span 6;
    }
  }

  input[type="checkbox"] {
    display: none;
  }

  label.lbl-toggle {
    outline: none;
    display: block;
    padding: 0.25rem;
    cursor: pointer;
    border-radius: var(--curve-factor);
    transition: all 0.25s ease-out;
    text-align: left;
    color: var(--item-group-heading-text-color);
    h3 {
      margin: 0;
      padding: 0;
      display: inline;
    }
    .section-icon {
      display: inline;
      margin-right: 0.5rem;
    }
    &:hover {
      color: var(--item-group-heading-text-color-hover);
    }
    &::before {
      content: " ";
      display: inline-block;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-left: 5px solid currentColor;
      vertical-align: middle;
      margin-right: 0.7rem;
      transform: translateY(-2px);
      opacity: 0.3;
      transition: all 0.4s ease-in-out;
    }
  }

  input.toggle:checked + .lbl-toggle::before {
    transform: rotate(90deg) translateX(-3px);
  }

  .collapsible-content {
    max-height: 0px;
    overflow: hidden;
    transition: max-height 0.25s ease-in-out;
    background: var(--item-group-background);
    border-radius: 0 0 var(--curve-factor) var(--curve-factor);
  }

  input.toggle:checked + .lbl-toggle + .collapsible-content {
    max-height: var(--section-max-height);
  }

  input.toggle:checked + .lbl-toggle {
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .collapsible-content .content-inner {
    padding: 0.5rem;
  }

  /* Section context menu trigger icon */
  .open-icon {
    width: 1rem;
    height: 1rem;
    float: right;
    right: 0.5rem;
    top: 0.5rem;
    margin-left: 0.2rem;
    margin-right: 0.2rem;
    opacity: 0.3;
    transition: all 0.4s ease-in-out;
  }

  /* On section hover, set interface icons to full visible */
  &:hover {
    .open-icon,
    label.lbl-toggle::before {
      opacity: 1;
      transition: all 0.2s ease-out;
    }
  }

  /* Makes sections fill available space */
  @include phone-up {
    &.is-open.full-height {
      height: auto;
      display: flex;
      align-items: normal;
      flex-direction: column;
      .collapsible-content {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
