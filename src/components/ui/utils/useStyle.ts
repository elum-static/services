import { type Platform } from "@ui/Types"
import usePlatform from "@ui/utils/usePlatform"

import { createEffect, createUniqueId, on } from "solid-js"
import { createStore, reconcile } from "solid-js/store"

/**
 * Хук для выбора стилей в зависимости от платформы.
 */
const useStyle = <T extends CSSModuleClasses>(styles: Record<Platform, T>) => {
  const platform = usePlatform()
  const [store, setStore] = createStore(styles[platform()])

  createEffect(() => {
    setStore(reconcile(styles[platform()]))
  })

  return store
}

export default useStyle
