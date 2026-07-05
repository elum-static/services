import { Accessor, createEffect, onCleanup } from "solid-js"

export interface Callback<T extends Event = Event> {
  (event: T): void
}

const useClickOutside = <T extends HTMLElement>(
  ref: Accessor<T | undefined>,
  callback: Callback,
) => {
  createEffect(() => {
    const listener = (event: Event) => {
      const element = ref()
      if (!element || element.contains(event.target as Node)) {
        return
      }

      callback(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    onCleanup(() => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    })
  })
}

export default useClickOutside
