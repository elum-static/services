import { type Platform } from "@ui/Types"
import usePlatform from "@ui/utils/usePlatform"

import { createEffect, on } from "solid-js"
import { createStore } from "solid-js/store"

/**
 * Хук для получения и отслеживания вычисленных стилей.
 */
const useComputedBlockStyles = <T extends unknown>({
  ref,
  onUpdate,
}: {
  ref: () => T
  onUpdate: () => void
}) => {
  const platformValue = usePlatform()
  const [store, setStore] = createStore<Partial<CSSStyleDeclaration>>({})

  const _onUpdate = () => {
    if (ref()) {
      const computedStyle = window.getComputedStyle(ref() as HTMLElement)
      setStore(computedStyle)
    }
  }
  createEffect(on([platformValue, ref, onUpdate], _onUpdate))

  return store
}

export default useComputedBlockStyles
