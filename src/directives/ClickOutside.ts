/**
 * A Vue directive to trigger an event when the user
 * clicks anywhere other than the specified elements
 * Used to close context menus popup modals and tips
 * Dashy: Licensed under MIT - (C) Alicia Sykes 2022
 */
import { DirectiveOptions, VNodeDirective } from 'vue';

const instances: Array<(event: Event) => void> = []; // List of click event instances

/* Trigger action when click anywhere, except target elem */
function onDocumentClick(event: Event, elem: HTMLElement, action: (event: Event) => void) {
  const { target } = event;
  if (elem !== target && !elem.contains(target as Node)) {
    action(event);
  }
}

const ClickOutside: DirectiveOptions = {
  /* Add event listeners */
  bind(element: HTMLElement, binding: VNodeDirective) {
    const elem = element;
    elem.dataset.outsideClickIndex = String(instances.length);

    const action = binding.value as (event: Event) => void;
    const click = (event: Event) => {
      onDocumentClick(event, elem, action);
    };

    document.addEventListener('click', click);
    document.addEventListener('touchstart', click);
    instances.push(click);
  },
  /* Remove event listeners */
  unbind(elem: HTMLElement) {
    if (!elem.dataset) return;
    const index = Number(elem.dataset.outsideClickIndex);
    const handler = instances[index];
    document.removeEventListener('click', handler!);
    instances.splice(index, 1);
  },
};

export default ClickOutside;
