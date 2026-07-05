import type { EventEmitter } from "@minsize/utils"
import type { AnimationState } from "../types/Animation"
import { createStore, SetStoreFunction } from "solid-js/store"
import { debounce, leadingAndTrailing, throttle } from "@solid-primitives/scheduled"

type Store = {
  /**
   * Указывает стоит ли использовать сложные анимации, которые нагружают систему
   *
   * `default` - стандартное поведение
   *
   * `minimal` - Указывает, что пользователь уведомил ОС, что он предпочитает интерфейс,
   *            который минимизирует количество движения или анимации,
   *            предпочтительно до точки, где удаляются все несущественные движения.
   *
   * `allow` -  разрешены все анимации
   */
  state: AnimationState
}

class Animation<
  T extends EventEmitter<{
    animation: [state: AnimationState]
  }>,
> {
  private store: Store
  private setStore: SetStoreFunction<Store>

  private emitter: T

  constructor(emitter: T) {
    this.emitter = emitter
    const [store, setStore] = createStore<Store>({
      state: "default",
    })

    this.store = store
    this.setStore = setStore

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const androidVersion = getAndroidVersion()

    this.update(
      prefersReducedMotion || !!(androidVersion && androidVersion <= 9) ? "minimal" : "default",
    )
  }

  /**
   * Функция для изменения разрешений
   */
  public update(state: AnimationState) {
    if (this.store.state === state) {
      return
    }

    this.setStore("state", state)
    this.emitter.emit("animation", this.store.state)
  }

  get state() {
    return this.store.state
  }
}

const getAndroidVersion = (): number | null => {
  const ua = navigator.userAgent.toLowerCase()
  const match = ua.match(/android\s(\d+(?:\.\d+)?)/)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  return null
}

export default Animation
