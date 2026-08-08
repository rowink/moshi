/**
 * A Vue directive to call event when element is long-pressed
 * Used to open context menus on touch-enabled devices
 * Inspired by: FeliciousX/vue-directive-long-press
 * moshi: Licensed under MIT - (C) 2022
 */
import type { ObjectDirective } from 'vue';

const LONG_PRESS_DEFAULT_DELAY = 750;
const longPressEvent = new CustomEvent('long-press');

let startTime: number | null = null;

const LongPress: ObjectDirective<HTMLElement> = {
  mounted(element) {
    const el = element;
    el.dataset.longPressTimeout = String(null);

    const swallowClick = (e: MouseEvent) => {
      el.removeEventListener('click', swallowClick);
      if (!el.dataset.elapsed) return true;
      const totalTime = Date.now() - (startTime ?? 0);
      // If was long press, then cancel original action
      if (totalTime > LONG_PRESS_DEFAULT_DELAY) {
        e.preventDefault();
        e.stopPropagation();
      }
      return false;
    };

    /* Emit event to element */
    const triggerEvent = () => {
      el.dispatchEvent(longPressEvent);
      el.dataset.elapsed = String(true);
    };

    const onPointerUp = () => {
      clearTimeout(parseInt(el.dataset.longPressTimeout || '', 10));
      document.removeEventListener('pointerup', onPointerUp);
    };

    const onPointerDown = (e: PointerEvent) => {
      // If event was right-click, then immediately trigger
      if (e.button === 2) return;
      startTime = Date.now();
      document.addEventListener('pointerup', onPointerUp);
      el.addEventListener('click', swallowClick);
      const timeoutDuration = LONG_PRESS_DEFAULT_DELAY;
      const timeout = setTimeout(triggerEvent, timeoutDuration);
      el.dataset.elapsed = String(false);
      el.dataset.longPressTimeout = String(timeout);
      e.preventDefault();
    };
    el.$longPressHandler = onPointerDown as EventListener;
    el.addEventListener('pointerdown', onPointerDown);
  },
  unmounted(el) {
    startTime = null;
    clearTimeout(parseInt(el.dataset.longPressTimeout || '', 10));
    el.removeEventListener('pointerdown', el.$longPressHandler!);
  },
};

export default LongPress;
