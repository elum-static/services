import style from "./Canvas.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  createEffect,
  onMount,
  onCleanup,
  createSignal,
} from "solid-js"

type Render = (options: {
  width: number
  height: number
  quality: number
  context: CanvasRenderingContext2D
  next: () => void
}) => void

export interface CanvasProps extends JSX.HTMLAttributes<HTMLDivElement> {
  quality?: number

  limitFrames?: number | "auto"

  onRender: Render
  onInitial?: Render

  render?: (handler: () => void) => void
}

var limitFrames: number | undefined

const Canvas: Component<CanvasProps> = (props) => {
  const merged = mergeProps(
    {
      quality: 1,
      limitFrames: "auto",
      render: (handler: () => unknown) => requestAnimationFrame(handler),
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "quality",
    "limitFrames",
    "onRender",
    "onInitial",
    "render",
  ])

  const [frameTime, setFrameTime] = createSignal(
    1000 /
      (local.limitFrames === "auto"
        ? limitFrames ?? 75
        : Number(local.limitFrames)),
  )

  // Определяем частоту экрана
  onMount(() => {
    if (limitFrames !== undefined || local.limitFrames !== "auto") return

    function measureRefreshRate(
      callback: (fps: number) => void,
      duration = 1000,
    ) {
      let frames = 0
      let startTime = performance.now()

      function loop() {
        frames++
        const currentTime = performance.now()
        const elapsed = currentTime - startTime

        if (elapsed >= duration) {
          const fps = Math.round((frames * 1000) / elapsed)
          callback(fps)
        } else {
          requestAnimationFrame(loop)
        }
      }

      requestAnimationFrame(loop)
    }

    measureRefreshRate((fps) => {
      setFrameTime(1_000 / fps)
      limitFrames = fps
      console.log(`Ваша частота обновления: ${fps} Гц`)
    })
  })

  var lastFrameTime = performance.now()

  var containerRef: HTMLDivElement
  var canvasRef: HTMLCanvasElement

  const getSize = (): { width: number; height: number } => {
    if (!containerRef || !canvasRef) {
      return { width: 0, height: 0 }
    }

    return {
      get width() {
        return containerRef.clientWidth * local.quality
      },
      get height() {
        return containerRef.clientHeight * local.quality
      },
    }
  }

  const handlerResize = () => {
    if (containerRef && canvasRef) {
      const { width, height } = getSize()
      canvasRef.width = width
      canvasRef.height = height
    }
  }

  createEffect(handlerResize)

  onMount(() => {
    var unmount: boolean = false
    if (containerRef! && canvasRef!) {
      const context = canvasRef.getContext("2d")
      if (!context) {
        return
      }
      const sizes = getSize()

      handlerResize()
      // context.scale(devicePixelRatio, devicePixelRatio)

      const next = () => {
        if (unmount) {
          return
        }

        local.render(() => {
          if (local.limitFrames !== 0) {
            const now = performance.now()
            const delta = now - lastFrameTime

            lastFrameTime = now - (delta % frameTime())

            if (delta <= frameTime()) {
              return next()
            }
          }

          try {
            if (!context) {
              return
            }

            local.onRender({
              ...sizes,
              quality: local.quality,
              context,
              next,
            })
          } catch (error) {
            console.error("[Canvas] Render error:", error)
          }
        })
      }

      const render = local.onInitial || local.onRender
      render({ ...sizes, quality: local.quality, context, next })
    }

    window.addEventListener("resize", handlerResize)
    onCleanup(() => {
      unmount = true
      window.removeEventListener("resize", handlerResize)
    })
  })

  return (
    <div
      ref={containerRef!}
      class={style.Canvas}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <canvas ref={canvasRef!} class={style.Canvas__element}>
        {local.children}
      </canvas>
    </div>
  )
}

export default Canvas
