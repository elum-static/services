import { onCleanup, onMount } from "solid-js"

/**
 *
 * @example
 *
 * useEventListener(ref, "click", () => console.log("click"))
 */
export function useEventListener(
  target: HTMLElement | (() => HTMLElement),
  eventName: keyof HTMLElementEventMap,
  handler: () => unknown,
  options?: boolean | AddEventListenerOptions,
) {
  onMount(() => {
    const element = typeof target === "function" ? target() : target

    if (!element) return

    element.addEventListener(eventName, handler, options)

    onCleanup(() => {
      element.removeEventListener(eventName, handler, options)
    })
  })
}
