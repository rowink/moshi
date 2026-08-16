/**
 * A Vue directive to trigger an event when the user
 * clicks anywhere other than the specified elements
 * Used to close context menus popup modals and tips
 * moshi: Licensed under MIT - (C) 2022
 */
import type { ObjectDirective } from "vue";

const instances: Array<{ index: number; click: (event: Event) => void }> = []; // List of click event instances

/* Trigger action when click anywhere, except target elem */
function onDocumentClick(
  event: Event,
  elem: HTMLElement,
  action: (e: Event) => void,
) {
  const { target } = event;
  if (elem !== target && !elem.contains(target as Node)) {
    action(event);
  }
}

const ClickOutside: ObjectDirective<HTMLElement> = {
  /* Add event listeners */
  mounted(element, binding) {
    const elem = element;
    const index = instances.length;
    elem.dataset.outsideClickIndex = String(index);

    const action = binding.value as (event: Event) => void;
    const click = (event: Event) => {
      onDocumentClick(event, elem, action);
    };

    document.addEventListener("click", click);
    document.addEventListener("touchstart", click);
    instances.push({ index, click });
  },
  /* Remove event listeners */
  unmounted(elem) {
    if (!elem.dataset) return;
    const index = Number(elem.dataset.outsideClickIndex);
    const handler = instances[index];
    if (handler) {
      document.removeEventListener("click", handler.click);
      document.removeEventListener("touchstart", handler.click);
      instances.splice(index, 1);
    }
  },
};

export default ClickOutside;
