import style from "./ProgressiveRenderer.module.css"
import {
  batch,
  For,
  type JSX,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js"

import { createStore } from "solid-js/store"

interface ProgressiveRenderer<T extends unknown>
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> {
  each: T[]
  children: (item: T, index: () => number) => JSX.Element
  chunkSize?: number
  delay?: number
  useAnimationFrame?: boolean
}

type Store<T> = {
  visibleItems: T[]
  complete: boolean
}

const ProgressiveRenderer = <T extends unknown>(
  props: ProgressiveRenderer<T>,
): JSX.Element => {
  const merged = mergeProps({ chunkSize: 1 }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "each",
    "chunkSize",
    "useAnimationFrame",
    "delay",
  ])

  const [store, setStore] = createStore<Store<T>>({
    visibleItems: [],
    complete: false,
  })

  var animationFrameId: number
  var timeoutId: NodeJS.Timeout

  const renderNextChunk = () => {
    batch(() => {
      const currentItems = store.visibleItems
      const nextChunk = local.each.slice(
        currentItems.length,
        currentItems.length + local.chunkSize,
      )

      setStore("visibleItems", (visibleItems) => [
        ...visibleItems,
        ...nextChunk,
      ])

      if (store.visibleItems.length >= local.each.length) {
        setStore("complete", true)
      }
    })
  }

  const startRendering = () => {
    if (store.complete) return

    const renderStep = () => {
      renderNextChunk()

      if (!store.complete) {
        if (local.useAnimationFrame) {
          animationFrameId = requestAnimationFrame(renderStep)
        } else if (local.delay) {
          timeoutId = setTimeout(renderStep, local.delay)
        } else {
          renderStep()
        }
      }
    }

    renderStep()
  }

  onMount(() => {
    startRendering()
  })

  onCleanup(() => {
    cancelAnimationFrame(animationFrameId)
    clearTimeout(timeoutId)
  })

  return (
    <For each={store.visibleItems}>
      {(item, index) => local.children(item, index)}
    </For>
  )
}

export default ProgressiveRenderer
