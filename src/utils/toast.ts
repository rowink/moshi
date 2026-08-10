/**
 * Lightweight toast notification provider.
 * Replaces vue-toasted, which is not compatible with Vue 3.
 */
import { toastedOptions } from "@/config/defaults";

const toastDuration = toastedOptions.duration || 2500;

export const showToast = (
  message: string,
  options?: { className?: string },
) => {
  const toast = document.createElement("div");
  toast.className = options?.className || toastedOptions.className || "toast-message";
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "1.5rem";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.zIndex = "9999";
  toast.style.padding = "0.75rem 1.25rem";
  document.body.appendChild(toast);
  window.setTimeout(() => {
    toast.remove();
  }, toastDuration);
};

export default showToast;
