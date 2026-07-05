import { createStore, produce } from "solid-js/store"
import style from "./Lottie.module.css"
import {
  type JSX,
  type Component,
  Show,
  Suspense,
  createSignal,
  lazy,
  mergeProps,
  splitProps,
  createMemo,
  onMount,
  onCleanup,
} from "solid-js"
import { clamp } from "@minsize/utils"
import combineStyle from "@ui/utils/combineStyle"

import LottieWeb from "./LottieWeb/LottieWeb"
import core from "src/core"

// const LottieWeb = lazy(() => import("./LottieWeb/LottieWeb"))

interface Lottie extends JSX.HTMLAttributes<HTMLSpanElement> {
  /** Ссылка на tgs файл */
  data: URL

  /** Placeholder элемент */
  placeholder?: JSX.Element

  /** Зацикливать ли анимацию */
  loop?: boolean

  /** Автоматически запускать анимацию */
  autoplay?: boolean

  /** Размер элемента в пикселях */
  size?: number | string

  fill?: string
}

const animationCache = new Map<string, boolean>()

const Lottie: Component<Lottie> = (props) => {
  const merged = mergeProps(
    {
      loop: false,
      autoplay: true,
    },
    props,
  )

  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "size",
    "autoplay",
    "loop",
    "fill",
    "style",
    "data",
    "placeholder",
  ])

  const [store, setStore] = createStore({
    endAnimation: animationCache.get(local.data.href) || false,
    loading: true,
    fallback: true,
  })

  /**
   * Обработчик завершения загрузки анимации
   */
  const handleLoadComplete = () => {
    setStore("loading", false)
    animationCache.set(local.data.href, true)
    setStore("endAnimation", true)
  }

  const fill = createMemo(() => local.fill, local.fill, {
    equals: (next, prev) => prev === next,
  })

  return (
    <span
      class={style.Lottie}
      classList={{
        [style["Lottie__animation--end"]]:
          core.system.animation.state === "minimal" ? false : !store.endAnimation && !store.loading,
        [style["Lottie__hidden"]]: core.system.animation.state === "minimal" ? true : store.loading,
        [style["Lottie--visible"]]:
          core.system.animation.state === "minimal" ? false : !store.loading,
        [local.class || ""]: !!local.class,
        ...local.classList,
      }}
      style={combineStyle(
        {
          width: `${typeof local.size === "string" ? local.size : `${local.size}px`}`,
          height: `${typeof local.size === "string" ? local.size : `${local.size}px`}`,
        },
        local.style,
      )}
      {...others}
    >
      <Show when={store.fallback || core.system.animation.state === "minimal"}>
        <div onTransitionEnd={() => setStore("fallback", false)} class={style.Lottie__fallback}>
          {local.placeholder}
        </div>
      </Show>

      <span class={style.Lottie__element}>
        <Suspense fallback={null}>
          <LottieWeb
            size={local.size}
            autoplay={local.autoplay}
            loop={local.loop}
            animationData={local.data}
            onEndLoad={handleLoadComplete}
            onStopAnimation={() => {
              setStore("loading", true)
            }}
            fill={fill()}
          />
        </Suspense>
      </span>
    </span>
  )
}

export default Lottie
