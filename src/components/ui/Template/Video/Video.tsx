import style from "./Video.module.css"
import { createStore, produce } from "solid-js/store"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  Show,
  createEffect,
  onCleanup,
  createMemo,
  useContext,
  onMount,
  on,
  untrack,
  Switch,
  Match,
  For,
  lazy,
} from "solid-js"
import calculateCoverDimensions from "@ui/utils/calculateCoverDimensions"
import Canvas, { CanvasProps } from "../Canvas/Canvas"
import createHandler from "@ui/utils/createHandler"
import { IconBugFilled, IconPlayerPausedFilled, IconPlayerPlay } from "src/source"
import Events from "../Events/Events"
import Flex from "../Flex/Flex"
import Spinner from "@ui/Blocks/Spinner/Spinner"
import PanelContainerContext from "@ui/Pages/Panel/addons/Container/PanelContext"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"
import { clamp } from "@minsize/utils"
import { leading, throttle } from "@solid-primitives/scheduled"
import useMedia from "../Media/hooks/useMedia"

export type VideoSrc =
  | string
  | Array<{
      type:
        | "video/mp4"
        | "video/webm"
        | "video/ogg"
        | "application/x-mpegURL"
        | "application/vnd.apple.mpegurl"
      src: string
    }>

export interface InterfaceVideo extends JSX.HTMLAttributes<HTMLVideoElement> {
  /**
   * preview - указывается здесь и отдельным пропсом `preview``
   */
  controls?: Array<"play" | "pause" | "progress" | "preview">
  progressLoader?: number

  src: VideoSrc
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  playsinline?: boolean
  width?: string
  height?: string

  preload?: "metadata" | "auto" | "none"

  fallback: JSX.Element
  preview: JSX.Element

  blur?: boolean

  /** Способ масштабирования изображения внутри контейнера */
  fit?: "contain" | "cover" | "fill"

  type?: "default" | "circle"

  onTriggerRetry?: () => void

  onProgressMove?: (store: Store["video"]) => void
  onProgressEnd?: (store: Store["video"]) => void

  position?: number
}

type Store = {
  error: boolean
  dragOffset: {
    y: number
    x: number
  }
  video: {
    playedOnce: boolean
    played: boolean
    paused: boolean
    currentTime: number
    duration: number
    readyState: HTMLMediaElement["readyState"]
    errorCode: NonNullable<HTMLMediaElement["error"]>["code"]
    progress: number // 0 - 1
  }
}

// Коэффициент уменьшения (чем больше, тем хуже качество)
const DOWNSCALE_FACTOR = 5 // Уменьшаем в 5 раза

let currentVideo: HTMLVideoElement | undefined

const Video: Component<InterfaceVideo> = (props) => {
  const media = useMedia()

  const merged = mergeProps({ fit: "cover", blur: false, type: "default" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "fallback",
    "preview",
    "onLoadStart",
    "onLoadedData",
    "onError",
    "onLoadedMetadata",
    "onPlaying",
    "onEnded",
    "onPlay",
    "onCanPlay",
    "onPause",
    "onAbort",
    "fit",
    "src",
    "blur",
    "type",
    "controls",
    "onProgressMove",
    "onProgressEnd",
    "type",
    "onClick",
    "preload",
    "onTriggerRetry",
    "progressLoader",
    "position",
  ])

  const context = useContext(PanelContainerContext)

  let hlsInstance: any = null
  let ref: HTMLVideoElement

  function needsHLS() {
    if (!ref! || !local.src) return false

    // Safari на iOS/macOS умеет HLS нативно
    if (ref.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("Используем нативный HLS плеер")
      return false
    }

    if (typeof local.src === "string") {
      // Firefox, Chrome, Edge — используем hls.js
      return local.src?.includes(".m3u8") || local.src?.includes("m3u8")
    } else {
      for (const item of local.src) {
        if (item.src?.includes(".m3u8") || item.src?.includes("m3u8")) {
          return true
        }
      }
    }
  }
  const initHLS = async () => {
    if (!needsHLS() || !ref! || !local.src) return

    try {
      // Динамически загружаем hls.js только когда нужен
      const HlsModule = await import("hls.js")
      const Hls = HlsModule.default

      if (!Hls.isSupported()) {
        console.error("HLS не поддерживается в этом браузере")
        return
      }

      // Создаем экземпляр
      hlsInstance = new Hls({
        debug: false,
        enableWorker: true,
        // Дополнительные параметры для стабильности в Firefox
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
      })

      // Обработчики событий
      hlsInstance.on(Hls.Events.ERROR, (event: any, data: any) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Сетевая ошибка HLS, пробуем восстановить...")
              hlsInstance.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Медиа-ошибка HLS, восстанавливаем...")
              hlsInstance.recoverMediaError()
              break
            default:
              console.error("Фатальная ошибка HLS:", data)
              break
          }
        }
      })

      if (typeof local.src === "string") {
        // Firefox, Chrome, Edge — используем hls.js
        hlsInstance.loadSource(local.src)
      } else {
        for (const item of local.src) {
          if (item.src?.includes(".m3u8") || item.src?.includes("m3u8")) {
            hlsInstance.loadSource(item.src)
            break
          }
        }
      }

      hlsInstance.attachMedia(ref)

      console.log("HLS плеер инициализирован")
    } catch (error) {
      console.error("Ошибка загрузки hls.js:", error)
    }
  }

  onMount(() => {
    if (local.position && ref!) {
      ref.getDuration = () => {
        return ref.duration || 0
      }
      media?.register?.(ref, "video", local.position)
    }
  })

  const [store, setStore] = createStore<Store>({
    error: false,
    dragOffset: {
      y: 0,
      x: 0,
    },
    video: {
      playedOnce: false,
      played: false,
      paused: false,
      currentTime: 0,
      duration: 0,
      readyState: 0,
      errorCode: 0,
      progress: 0,
    },
  })

  const handlerPlay = () => {
    ref!?.play()
  }
  const handlerPause = () => {
    ref!?.pause()
  }

  const setCurrentTime = leading(
    throttle,
    (time: number) => {
      if (ref!) {
        ref.currentTime = time
      }
    },
    300,
  )

  const updateVideoState = () => {
    if (!ref!) return

    setStore(
      produce((store) => {
        store.video.paused = ref.paused
        store.video.played = !ref.paused
        store.video.duration = ref.duration
        store.video.currentTime = ref.currentTime
        store.video.readyState = ref.readyState
        store.video.errorCode = ref.error?.code || 0

        store.video.progress = store.video.currentTime / store.video.duration

        return store
      }),
    )
  }

  const onLoadStart = createHandler((event) => {
    updateVideoState()
  }, local.onLoadStart)

  const onLoadedData = createHandler((event) => {
    updateVideoState()
  }, local.onLoadedData)

  const onCanPlay = createHandler((event) => {
    updateVideoState()
  }, local.onCanPlay)

  const onPlaying = createHandler((event) => {
    updateVideoState()
  }, local.onPlaying)
  const onLoadedMetadata = createHandler((event) => {
    updateVideoState()
  }, local.onLoadedMetadata)

  const onPlay = createHandler((event) => {
    if (currentVideo && currentVideo !== ref!) {
      currentVideo.pause()
    }
    currentVideo = ref!
    setStore("video", "playedOnce", true)
    startFrameCallback()
    updateVideoState()
  }, local.onPlay)

  const onPause = createHandler((event) => {
    updateVideoState()
    endFrameCallback()
  }, local.onPause)

  const onEnded = createHandler((event) => {
    if (local.type === "circle") {
      event.currentTarget.currentTime = 0
      setStore("video", "playedOnce", false)
    }

    updateVideoState()
    endFrameCallback()
  }, local.onEnded)

  const onError = createHandler((event) => {
    updateVideoState()
  }, local.onError)

  const onAbort = createHandler((event) => {
    updateVideoState()
  }, local.onAbort)

  const onClick = createHandler((event) => {
    if (!isLoading() && !store.video.errorCode) {
      if (local.controls?.includes("play") || local.controls?.includes("pause")) {
        if (store.video.paused) {
          handlerPlay()
        } else if (store.video.played) {
          handlerPause()
        }
      }
    }
  }, local.onClick)

  const onRender = ({ width, height, context, next }: Parameters<CanvasProps["onRender"]>[0]) => {
    if (ref! && ref.readyState >= 2) {
      const { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight } =
        calculateCoverDimensions(ref.videoWidth, ref.videoHeight, width, height)

      context.drawImage(ref, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight)
    }
    next()
  }

  let frameId: number | undefined

  const startFrameCallback = () => {
    if (ref!) {
      if (frameId) {
        ref.cancelVideoFrameCallback(frameId)
      }

      const updateTime = () => {
        frameId = ref.requestVideoFrameCallback(() => {
          updateVideoState()
          updateTime()
        })
      }

      updateTime()
    }
  }

  const endFrameCallback = () => {
    if (ref!) {
      if (frameId) {
        ref.cancelVideoFrameCallback(frameId)
      }
    }
  }

  onMount(() => {
    updateVideoState()
  })

  onCleanup(() => {
    endFrameCallback()
  })

  const isLoading = createMemo(() => {
    // Информация об этом медиаресурсе отсутствует.
    if (store.video.readyState === 0) {
      return true
    }

    /**
     * Получено достаточное количество медиаресурсов, чтобы инициализировать атрибуты метаданных.
     * Поиск больше не будет вызывать исключение.
     */
    if (store.video.readyState === 1) {
      return true
    }

    /**
     * Данные для текущей позиции воспроизведения доступны, но их недостаточно для воспроизведения более одного кадра.
     */
    if (store.video.readyState === 2) {
      return true
    }

    /**
     * Доступны данные о текущей позиции воспроизведения, а также, по крайней мере,
     * на некоторое время вперед (другими словами, как минимум два кадра видео, например).
     */
    if (store.video.readyState === 3) {
      return false
    }

    /**
     * Доступно достаточно данных, и скорость загрузки достаточно высока,
     * чтобы воспроизведение медиафайлов можно было завершить без перерыва.
     */
    if (store.video.readyState === 4) {
      return false
    }

    return false
  })

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
  })
  const visibleObserver = local.preload === "auto" ? useVisibilityObserver(() => ref!) : () => false

  createEffect(
    on(visibleObserver, (visible) => {
      if (visible && isLoading()) {
        if (needsHLS()) {
          initHLS()
        } else {
          ref!?.load()
        }
      }
    }),
  )

  createEffect(
    on(
      () => local.onTriggerRetry?.(),
      () => {
        console.log("TRIGGGER", isLoading(), needsHLS())
        if (isLoading()) {
          if (needsHLS()) {
            initHLS()
          } else {
            ref!?.load()
          }
        }
      },
      {
        defer: true,
      },
    ),
  )

  const destroyHLS = () => {
    if (hlsInstance) {
      hlsInstance.destroy()
      hlsInstance = null
      console.log("HLS плеер уничтожен")
    }
  }

  onCleanup(() => {
    destroyHLS()
  })

  return (
    <Events
      stopPropagation={
        local.controls?.includes("play") || local.controls?.includes("pause")
          ? store.video.played
          : false
      }
      class={style.Video}
      classList={{
        ["_video-played"]: store.video.played,
        ["_video-pause"]: store.video.paused,
        ["_video-playedOnce"]: store.video.playedOnce,
        ["_video-error"]: store.video.errorCode !== 0,
        ["_video-loading"]: isLoading(),
        [style["Video__controlsInit--progress"]]: !!local.controls?.includes("progress"),
        [style[`Video__fit--${local.fit}`]]: !!local.fit,
        [style[`Video__type--${local.type}`]]: !!local.type,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onClick={onClick as any}
    >
      <video
        class={style.Video__element}
        {...others}
        ref={ref!}
        onCanPlay={onCanPlay}
        onPlaying={onPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onError={onError}
        onAbort={onAbort}
        onLoadStart={onLoadStart}
        onLoadedData={onLoadedData}
        onEnded={onEnded}
        onLoadedMetadata={onLoadedMetadata}
        preload={local.preload === "auto" ? "none" : local.preload}
      >
        <Switch>
          <Match keyed when={typeof local.src === "string" && local.src}>
            {(src) => (
              <>
                <source src={src} type="video/mp4" />
                <source src={src} type="video/webp" />
                <source src={src} type="application/x-mpegURL" />
                <source src={src} type="application/vnd.apple.mpegurl" />
                <source src={src} type="application/x-mpegurl" />
                <source src={src} type="application/mpegurl" />
              </>
            )}
          </Match>

          <Match keyed when={Array.isArray(local.src) && local.src}>
            {(src) => <For each={src}>{(item) => <source src={item.src} type={item.type} />}</For>}
          </Match>
        </Switch>
        Your browser does not support HTML5 video.
      </video>
      <Show keyed when={[...(local.controls || []), "loader", "error"]}>
        {(controls) => (
          <Flex class={style["Video__controls"]}>
            <Show keyed when={controls.includes("preview") && isLoading() && local.preview}>
              {(preview) => <span class={style["Video__controls--preview"]}>{preview}</span>}
            </Show>
            <Show when={controls.includes("error")}>
              <span class={style["Video__controls--error"]}>
                <IconBugFilled
                  class={style["Video__controls--error-icon"]}
                  width={36}
                  height={36}
                />
              </span>
            </Show>
            <Show when={controls.includes("loader")}>
              <span class={style["Video__controls--loader"]}>
                <Spinner size={"medium"} color={"inherit"} progress={local.progressLoader} />
              </span>
            </Show>
            <Show when={controls.includes("play")}>
              <span class={style["Video__controls--play"]}>
                <IconPlayerPlay
                  class={style["Video__controls--play-icon"]}
                  width={36}
                  height={36}
                />
              </span>
            </Show>
            <Show when={controls.includes("pause")}>
              <span class={style["Video__controls--pause"]}>
                <IconPlayerPausedFilled width={36} height={36} />
              </span>
            </Show>
            <Show when={controls.includes("progress")}>
              <svg
                class={style["Video__controls--progress"]}
                style={{
                  "--progress": store.video.progress, //store.videoProgress,
                }}
              >
                <circle
                  class={style["Video__controls--progress--circle1"]}
                  stroke={"transparent"}
                  fill="none"
                />

                <circle
                  class={style["Video__controls--progress--circle2"]}
                  fill="none"
                  stroke-linecap="round"
                />
                <Events
                  stopPropagation={true}
                  component={"circle"}
                  class={style["Video__controls--progress--circle3"]}
                  onPointerMove={(event) => {
                    event.target.setPointerCapture(event.pointerId)
                  }}
                  onStart={(event) => {
                    // if (store.video.paused && store.videoFull) {
                    if (store.video.paused) {
                      context?.setStatusScroll?.(false)
                      endFrameCallback()
                      const circle = event.originalEvent.currentTarget as SVGCircleElement

                      const circleRect = circle.getBoundingClientRect()
                      const svg = circle.ownerSVGElement
                      if (svg) {
                        // const svgRect = svg.getBoundingClientRect()

                        // Смещение пальца от центра кружка
                        const circleCenterX = circleRect.left + circleRect.width / 2
                        const circleCenterY = circleRect.top + circleRect.height / 2

                        setStore("dragOffset", {
                          x: (event.shiftX || 0) - circleCenterX,
                          y: (event.shiftY || 0) - circleCenterY,
                        })
                      }
                    }
                  }}
                  onMove={(event) => {
                    if (store.video.paused) {
                      const circle = event.originalEvent.currentTarget as SVGCircleElement
                      const svg = circle.ownerSVGElement
                      if (svg) {
                        const svgRect = svg.getBoundingClientRect()

                        const centerX = svgRect.left + svgRect.width / 2
                        const centerY = svgRect.top + svgRect.height / 2

                        // Вычитаем смещение от центра кружка
                        const touchX = (event.shiftX || 0) - (store.dragOffset?.x || 0) - centerX
                        const touchY = (event.shiftY || 0) - (store.dragOffset?.y || 0) - centerY

                        let angle = Math.atan2(touchY, touchX)
                        angle += Math.PI / 2
                        if (angle < 0) angle += 2 * Math.PI

                        const newProgress = clamp(angle / (2 * Math.PI), 0, 1)

                        // setStore("videoProgress", angle / (2 * Math.PI))
                        // Устанавливаем время на видео
                        if (ref!) {
                          setCurrentTime(clamp(newProgress * ref.duration, 0, ref.duration))
                          setStore("video", "progress", newProgress)
                        }
                      }
                    }
                    local.onProgressMove?.(store.video)
                  }}
                  onEnd={() => {
                    context?.setStatusScroll?.(true)
                    local.onProgressEnd?.(store.video)
                  }}
                />
              </svg>
            </Show>
          </Flex>
        )}
      </Show>
      <Show when={local.blur}>
        <Canvas
          class={style.Video__prev}
          quality={1 / DOWNSCALE_FACTOR}
          limitFrames={0}
          render={(handler) => {
            if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
              ref!?.requestVideoFrameCallback(handler)
            } else {
              requestAnimationFrame(handler)
            }
          }}
          onRender={onRender}
        />
      </Show>
    </Events>
  )
}

export default Video
