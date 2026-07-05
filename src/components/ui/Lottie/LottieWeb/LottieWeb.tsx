import style from "./LottieWeb.module.css"
import {
  type JSX,
  type Component,
  onCleanup,
  onMount,
  createEffect,
  splitProps,
  on,
  createSignal,
  startTransition,
  Show,
} from "solid-js"

import { Mutex } from "@minsize/mutex"

import { inflate } from "pako"

import workerUrl from "@tamtam-chat/lottie-player/dist/worker?url"
import { createPlayer, updateConfig, disposePlayer, Player } from "@tamtam-chat/lottie-player"
import { createStore, produce } from "solid-js/store"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"
import { EventEmitter } from "@minsize/utils"
import core from "src/core"

// Указываем, откуда грузить воркер
updateConfig({
  workerUrl,
  maxWorkers: 20,
  cacheFrames: false,
})

const mutex = Mutex({ globalLimit: 2 })

interface LottieWeb extends JSX.HTMLAttributes<HTMLDivElement> {
  animationData: URL
  loop?: boolean
  autoplay?: boolean
  size?: number | string
  onEndLoad: () => void

  fill?: string
}

type Store = {
  error: boolean
}

const LottieWeb: Component<LottieWeb> = (props) => {
  const emitter = new EventEmitter<{
    play: [reset: boolean]
    pause: []
    auto: [(paused: boolean) => "play" | "pause"]
  }>()
  let container: HTMLDivElement | undefined
  let canvasRef: HTMLCanvasElement

  const [local, others] = splitProps(props, [
    "animationData",
    "loop",
    "autoplay",
    "size",
    "onEndLoad",
    "fill",
  ])

  const useVisibilityObserver = createVisibilityObserver({
    root: window.document,
    initialValue: false,
    threshold: 0.8,
  })

  const visible = useVisibilityObserver(() => container)

  const [currentPlayer, setCurrentPlayer] = createSignal<Player>()
  const [store, setStore] = createStore<Store>({
    error: false,
  })

  const fetchAndDecodeLottie = async (url: URL) => {
    const release = await mutex.wait()
    try {
      return await new Promise(async (resolve) => {
        const response = await fetch(url)
        const compressedData = new Uint8Array(await response.arrayBuffer())

        const jsonString = inflate(compressedData, { to: "string" })

        resolve(JSON.parse(jsonString))
      })
    } finally {
      release()
    }
  }

  const getLoop = (loop?: boolean) => {
    if (!loop) {
      const userAgent = navigator.userAgent
      const androidVersionMatch = userAgent.match(/Android\s*([0-9\.]+)/)

      if (androidVersionMatch) {
        const androidVersion = Number(androidVersionMatch[1]?.replace(/.0/gi, ""))
        if (androidVersion) {
          if (androidVersion <= 10) return false
        }
      }
    }

    return loop
  }

  createEffect(
    on([() => local.animationData, () => local.fill], (next, prev) => {
      const animationData = next[0]
      const oldAnimationData = prev?.[0]
      if (oldAnimationData?.href) {
        disposePlayer(oldAnimationData.href)
      }
      if (!animationData || !container) return

      startTransition(() => {
        fetchAndDecodeLottie(animationData).then((animation) => {
          setStore("error", !animation)
          if (!animation) {
            return
          }

          var color = local.fill || ""

          if (color.includes("var(--")) {
            color = getComputedStyle(document.documentElement)
              .getPropertyValue(color.slice(4, -1))
              .trim()
          }

          const player = createPlayer({
            id: animationData.href,
            // Элемент, в котором отрисовывать анимацию
            canvas: canvasRef!,
            // fps: 24,

            // Lottie-анимация. Это может быть как URL на анимацию, так и сам
            // JSON-файл анимации в виде объекта или строки
            movie: animation,

            dpr: window.devicePixelRatio || 3,
            // Воспроизводить анимацию в цикле
            loop: getLoop(local.loop),
            width: container.clientWidth,
            height: container.clientHeight,
            fill: color,
          })
          setCurrentPlayer(player)

          player.on("mount", () => {
            local.onEndLoad()
          })

          if (player.mounted) {
            local.onEndLoad()
          }

          if (visible() && local.autoplay) {
            emitter.emitWithDefer("play", true)
          } else {
            emitter.emitWithDefer("pause")
          }

          const offPlay = emitter.on("play", (reset) => {
            if (!player) return
            if (reset) {
              player.frame = 0
            }
            player.play?.()
          })

          const offPause = emitter.on("pause", () => {
            if (!player) return
            player.pause()
          })

          onCleanup(() => {
            offPlay()
            offPause()
          })

          // if (!local.autoplay) {
          //   player.pause()
          // }
        })
      })
    }),
  )

  onMount(() => {
    let paused = false

    const offVisibility = core.system.on("visibility", (state) => {
      if (state === "hidden") {
        paused = !!currentPlayer()?.paused
        emitter.emitWithDefer("pause")
      } else if (!paused) {
        emitter.emitWithDefer("play", false)
      }
    })

    onCleanup(() => {
      offVisibility()
    })
  })

  const onClick = () => {
    const player = currentPlayer()
    if (!player) return

    if (player.paused) {
      emitter.emitWithDefer("play", false)
    } else {
      emitter.emitWithDefer("pause")
    }
    // if (!player.paused) {
    //   // Пауза если вкладка неактивна или браузер не в фокусе
    //   player.pause?.()
    // } else {
    //   player.frame = 0
    //   // Воспроизведение если вкладка активна и браузер в фокусе
    //   player.play?.()
    // }
  }

  createEffect(
    on(
      [visible],
      ([visible]) => {
        if (!currentPlayer()) {
          return
        }
        // if (!ready) return
        if (visible) {
          emitter.emitWithDefer("play", false)
        } else {
          emitter.emitWithDefer("pause")
        }
      },
      { defer: true },
    ),
  )

  onCleanup(() => {
    const player = currentPlayer()
    if (player) {
      player.dispose()
    }
  })

  return (
    <Show when={!store.error}>
      <div
        onClick={onClick}
        ref={container}
        class={style.LottieWeb}
        style={{
          width: `${typeof local.size === "string" ? local.size : `${local.size}px`}`,
          height: `${typeof local.size === "string" ? local.size : `${local.size}px`}`,
        }}
      >
        <canvas width={"100%"} height={"100%"} ref={canvasRef!} />
      </div>
    </Show>
  )
}

export default LottieWeb
