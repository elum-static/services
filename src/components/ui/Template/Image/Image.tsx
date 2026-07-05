import style from "./Image.module.css"

import {
  type JSX,
  type Component,
  onCleanup,
  Show,
  createEffect,
  splitProps,
  mergeProps,
  Switch,
  Match,
  ErrorBoundary,
  createMemo,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import { clamp } from "@minsize/utils"
import combineStyle from "@ui/utils/combineStyle"
import createHandler from "@ui/utils/createHandler"

import calculateCoverDimensions from "@ui/utils/calculateCoverDimensions"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"

export interface ImageProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Fallback-контент, отображаемый при ошибке загрузки изображения */
  fallback?: JSX.Element
  fallbackColor?: JSX.CSSProperties["color"]
  /** URL источника изображения */
  src?: string

  srcStub?: string
  /** Цвет фона контейнера */
  backgroundColor?: "primary" | "secondary" | "transparent"
  /** Способ масштабирования изображения внутри контейнера */
  fit?: "contain" | "cover" | "fill"

  render?: "html" | "canvas"

  lazy?: boolean

  contentColor?: string
}

type Store = {
  error: boolean
  fallback: boolean
  loaded: boolean
  stubLoaded: boolean
  size: number

  anim: boolean
}

const cacheCanvas = new Map<string, ImageBitmap>()
const cacheImage = new Map<string, Store>()

const EImage: Component<ImageProps> = (props) => {
  const merged = mergeProps({ backgroundColor: "secondary", fit: "cover", render: "html" }, props)

  const [local, others] = splitProps(merged, [
    "fallback",
    "classList",
    "class",
    "style",
    "onError",
    "onLoad",
    "src",
    "srcStub",
    "backgroundColor",
    "fit",
    "render",
    "lazy",
    "contentColor",
    "children",
    "fallbackColor",
  ])

  let refContainer: HTMLDivElement
  let canvas: HTMLCanvasElement
  let ref: HTMLImageElement

  const ImageKEY = createMemo(() => `${local.src || ""}_${refContainer!?.clientHeight ?? 0}`)

  const [store, setStore] = createStore<Store>({
    error: false,
    fallback: true,
    loaded: false,
    stubLoaded: !local.srcStub,
    size: 0,

    anim: false,
  })

  const mountTime = performance.now()

  createEffect(() => {
    cacheImage.set(ImageKEY(), store)
  })

  createEffect(() => {
    setStore(
      produce((store) => {
        store.size = refContainer!?.clientHeight ?? 0
        store.fallback = !!!ref!?.complete

        return store
      }),
    )
  })

  // Обработчик успешной загрузки
  const onLoad = createHandler((event) => {
    setStore({
      error: false,
      fallback: false,
      loaded: true,
      stubLoaded: true,
      anim: performance.now() - mountTime >= 10,
    })
  }, local.onLoad)

  // Обработчик ошибки загрузки
  const onError = createHandler((event) => {
    setStore("error", true)
  }, local.onError)

  const renderTemp = (
    width: number,
    height: number,
  ): Promise<{ error: boolean; data?: ImageBitmap }> => {
    const key =
      (local.src || "") +
      (typeof local.fallback === "string" ? (local.fallback as string) : "") +
      `${width}-${height}=${local.fit}`

    return new Promise(async (resolve) => {
      if (cacheCanvas.has(key)) {
        const cached = cacheCanvas.get(key) as ImageBitmap
        resolve({ error: false, data: cached })
        return
      }
      if (!canvas!) {
        resolve({ error: true })
        return
      }
      if (!local.src) {
        resolve({ error: true })
        return
      }

      const img = new Image()
      img.crossOrigin = "Anonymous" // Для работы с CORS
      img.onload = async () => {
        try {
          const containerWidth = clamp(canvas.clientWidth * 3, canvas.clientWidth, img.naturalWidth)
          const containerHeight = clamp(
            canvas.clientHeight * 3,
            canvas.clientHeight,
            img.naturalWidth,
          )

          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = containerWidth
          tempCanvas.height = containerHeight
          const tempCtx = tempCanvas.getContext("2d")!

          if (local.fit === "cover") {
            const { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight } =
              calculateCoverDimensions(
                img.naturalWidth,
                img.naturalHeight,
                containerWidth,
                containerHeight,
              )

            tempCtx.drawImage(img, srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight)
          } else if (local.fit === "contain") {
            // ... аналогичная логика для contain ...
          } else {
            // Режимы fill/none
            tempCtx.drawImage(img, 0, 0, containerWidth, containerHeight)
          }

          const bitmap = await createImageBitmap(tempCanvas)
          cacheCanvas.set(key, bitmap)
          resolve({ error: false, data: bitmap })
        } finally {
          resolve({ error: true })
        }
      }

      img.onerror = () => {
        resolve({ error: true })
      }

      img.src = local.src
    })
  }

  const renderCanvas = () => {
    if (!canvas!) return
    if (!local.src) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    renderTemp(canvas.width, canvas.height)
      .then((temp) => {
        if (temp?.data) {
          const width = canvas.width
          const height = canvas.height
          ctx.clearRect(0, 0, width, height)
          canvas.width = width
          canvas.height = height
          var color = local.contentColor || ""

          if (color.includes("var(--")) {
            color = getComputedStyle(document.documentElement)
              .getPropertyValue(color.slice(4, -1))
              .trim()
          }

          if (color) {
            ctx.fillStyle = color
            ctx.fillRect(0, 0, width, height)
            ctx.globalCompositeOperation = "destination-in"
          }
          ctx.drawImage(temp.data, 0, 0, width, height)
        }

        setStore({ error: !temp?.data, fallback: !temp?.data })
      })
      .catch(() => {
        setStore({ error: true, fallback: true })
      })
  }

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
  })
  const visibleObserver = useVisibilityObserver(() => refContainer!)

  // Эффект для IntersectionObserver (ленивая загрузка)
  createEffect(() => {
    if (!local.src) {
      setStore(
        produce((store) => {
          store.error = true
          store.fallback = true
          return store
        }),
      )
    }

    if (local.src) {
      // Запускаем проверку
      const frameId = requestAnimationFrame(renderCanvas)

      // Очистка
      onCleanup(() => cancelAnimationFrame(frameId))
    }
  })

  return (
    <div
      ref={refContainer!}
      class={style.Image}
      classList={{
        [style[`Image__fit--${local.fit}`]]: !!local.fit,
        [style[`Image__background--${local.backgroundColor}`]]: !!local.backgroundColor,
        [style["Image--error"]]: store.error || store.fallback,
        [style["Image--loaded"]]: store.loaded,
        [style["Image--stubLoaded"]]: store.stubLoaded,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      style={combineStyle(local.style, {
        "--image_size": store.size + "px",
        "background-color": local.fallbackColor,
      })}
      {...others}
    >
      {/* Основное изображение */}
      <Show when={local.lazy ? visibleObserver() || !!store.stubLoaded : true}>
        <Switch>
          <Match when={local.render === "canvas"}>
            <canvas ref={canvas!} class={style.Image__element} width={"100%"} height={"100%"} />
          </Match>
          <Match when={true}>
            <Show when={store.stubLoaded}>
              <img
                ref={ref!}
                class={style.Image__element}
                classList={{
                  [style[`Image__element--animation`]]: store.anim,
                }}
                src={local.src}
                loading={local.lazy ? "lazy" : "eager"}
                onLoad={onLoad}
                onError={onError}
              />
            </Show>
            <Show when={!store.loaded && local.srcStub}>
              <img
                class={style.Image__element__stub}
                src={local.srcStub}
                loading={local.lazy ? "lazy" : "eager"}
                onLoad={() =>
                  setStore({
                    stubLoaded: true,
                  })
                }
                onError={() =>
                  setStore({
                    stubLoaded: true,
                  })
                }
              />
            </Show>
          </Match>
        </Switch>
        <Show keyed when={local.children}>
          {(children) => children}
        </Show>

        {/* Fallback при ошибке */}
        <Show keyed when={store.fallback && local.fallback}>
          {(fallback) => <div class={style.Image__fallback}>{fallback}</div>}
        </Show>
      </Show>
    </div>
  )
}

export default EImage
