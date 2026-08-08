<template>
  <div
    :class="`minimal-section-inner ${selected ? 'selected' : ''} ${showAll ? 'show-all' : ''}`"
  >
    <div class="section-items" v-if="items && (selected || showAll)">
      <template v-for="item in items" :key="item.id">
        <SubItemGroup
          v-if="item.subItems"
          :itemId="item.id"
          :title="item.title"
          :subItems="item.subItems"
          @triggerModal="triggerModal"
        />
        <Item
          v-else
          :item="item"
          :itemSize="itemSize"
          :parentSectionTitle="title"
          @itemClicked="emit('itemClicked')"
          @triggerModal="triggerModal"
          :isAddNew="false"
          :sectionDisplayData="displayData"
        />
      </template>
    </div>
    <div v-if="selected && !showAll && items.length < 1" class="empty-section">
      <p>{{ $t("home.no-items-section") }}</p>
    </div>
    <IframeModal
      :ref="setIframeModalRef"
      :name="`iframeModal-${groupId}`"
      @closed="emit('itemClicked')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, PropType } from "vue";
import Item from "@/components/LinkItems/Item.vue";
import SubItemGroup from "@/components/LinkItems/SubItemGroup.vue";
import IframeModal from "@/components/LinkItems/IframeModal.vue";
import { useAppStore } from "@/store/modules/appStore";
import { Item as ItemType } from "@/types/types";

const props = defineProps({
  groupId: String,
  title: String,
  icon: String,
  displayData: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  items: {
    type: Array as PropType<ItemType[]>,
    default: () => [],
  },
  itemSize: String,
  modalOpen: Boolean,
  index: Number,
  selected: Boolean,
  showAll: Boolean,
});

const emit = defineEmits(["sectionSelected", "itemClicked"]);

const appStore = useAppStore();
const appConfig = computed(() => appStore.appConfig);

const iframeModals = ref<Record<string, InstanceType<typeof IframeModal> | null>>({});

const setIframeModalRef = (el: unknown) => {
  iframeModals.value[`iframeModal-${props.groupId}`] = el as InstanceType<
    typeof IframeModal
  > | null;
};

function selectSection(index: number) {
  emit("sectionSelected", index);
}
/* Returns a unique lowercase string, based on name, for section ID */
function makeId(str: string) {
  if (!str) return "unnamed-item";
  return str
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z ]/g, "")
    .toLowerCase();
}
/* Opens the iframe modal */
function triggerModal(url: string) {
  iframeModals.value[`iframeModal-${props.groupId}`]?.show(url);
}
function shouldEnableStatusCheck(itemPreference: boolean | undefined) {
  const globalPreference = appConfig.value.statusCheck || false;
  return itemPreference !== undefined ? itemPreference : globalPreference;
}
function getStatusCheckInterval() {
  let interval = appConfig.value.statusCheckInterval;
  if (!interval) return 0;
  if (interval > 60) interval = 60;
  if (interval < 1) interval = 0;
  return interval;
}
</script>

<style scoped lang="scss">
@use "@/styles/media-queries" as *;
@use "@/styles/style-helpers" as *;

.minimal-section-inner {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  background: var(--minimal-view-group-background);
  border-radius: 0 0 var(--curve-factor) var(--curve-factor);
  .section-items {
    display: grid;
    @include phone {
      --minimal-col-count: 1;
    }
    @include tablet {
      --minimal-col-count: 2;
    }
    @include laptop {
      --minimal-col-count: 3;
    }
    @include monitor {
      --minimal-col-count: 4;
    }
    @include big-screen {
      --minimal-col-count: 5;
    }
    @include big-screen-up {
      --minimal-col-count: 6;
    }
    grid-template-columns: repeat(var(--minimal-col-count, 1), minmax(0, 1fr));
  }
  .empty-section {
    padding: 1rem;
    margin: 0.5rem auto;
    color: var(--minimal-view-group-color);
    font-size: 1rem;
    font-style: italic;
    opacity: var(--dimming-factor);
  }
  &.selected {
    border: 1px solid var(--minimal-view-group-color);
    grid-column-start: span var(--col-count, 3);
    &:not(.show-all) {
      min-height: 300px;
    }
  }
  &.show-all {
    border: none;
  }
}
</style>
