import type { EventEmitter } from "@minsize/utils"
import type { VisibilityState } from "../types/Visibility"
import type { EventsData } from "@apiteam/twa-bridge/solid"
import { EventVisibilityChanged, listener } from "@apiteam/twa-bridge/solid"
import { onCleanup } from "solid-js"

class Visibility<
  T extends EventEmitter<{
    visibility: [state: VisibilityState]
  }>,
> {
  /**
   * Указывает видит ли пользователь страницу
   *
   * @example отключать анимации при "hidden"
   */
  public state: VisibilityState = !document.hidden || document.hasFocus() ? "visible" : "hidden"

  constructor(emitter: T) {
    const visibilityChangedWindow = () => {
      const visibleState = !document.hidden || document.hasFocus() ? "visible" : "hidden"
      if (this.state === visibleState) {
        return
      }
      this.state = visibleState

      emitter.emit("visibility", this.state)
    }

    const visibilityChanged = (params: EventsData[typeof EventVisibilityChanged]) => {
      const visibleState = params.is_visible ? "visible" : "hidden"
      if (this.state === visibleState) {
        return
      }
      this.state = visibleState
      emitter.emit("visibility", this.state)
    }

    listener.on(EventVisibilityChanged, visibilityChanged)

    document.addEventListener("visibilitychange", visibilityChangedWindow)
    document.addEventListener("blur", visibilityChangedWindow)
    document.addEventListener("focus", visibilityChangedWindow)

    onCleanup(() => {
      listener.off("visibility_changed", visibilityChanged)
      document.removeEventListener("visibilitychange", visibilityChangedWindow)
      document.removeEventListener("blur", visibilityChangedWindow)
      document.removeEventListener("focus", visibilityChangedWindow)
    })
  }
}

export default Visibility
