import {
  Touch,
  Image,
  Plug,
  Text,
  Video,
  AspectRation,
  Button,
  Progress,
  createHandler,
} from "@ui/index"
import style from "./Story.module.css"
import StoriesContext from "@ui/Stories/Stories.context"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  useContext,
  createEffect,
  For,
  Show,
  on,
  onCleanup,
  createSignal,
  createMemo,
  onMount,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import Spinner from "../Spinner/Spinner"
import { GestureEvent } from "@ui/Template/Touch/Touch"
import { clamp } from "@minsize/utils"
import { IconVolume, IconVolumeMuted } from "src/source"

// Типы и интерфейсы
interface StoryContentItem {
  type: "video" | "photo"
  preview?: string
  src: string
}

interface StoryProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Массив элементов контента (изображения, видео)
   */
  content: StoryContentItem[]

  /**
   * Автоматически переключать сторис по таймеру?
   * @default true
   */
  timer?: boolean

  /**
   * Дополнительный UI в нижней части сторис
   */
  footer?: JSX.Element

  /**
   * Подсказка о перемотке (например, текст "Для перемотки проведите влево/вправо")
   * Отображается при попытке пользователя перемотать сторис
   */
  rewind?: JSX.Element
}

// Константы
const PHOTO_TIME = 6 // Длительность показа фото в секундах

var [muted, setMuted] = createSignal(true)

const Story: Component<StoryProps> = (props) => {
  // Контекст и пропсы
  const context = useContext(StoriesContext)
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "content",
    "onClick",
    "onTransitionEnd",
    "timer",
    "footer",
  ])

  // Рефы и переменные
  let ref: HTMLVideoElement
  let startTouchTime = Date.now()
  let startTime = Date.now()
  let timeoutId: NodeJS.Timeout

  // Состояние компонента
  const [store, setStore] = createStore({
    selected: 0,
    selectedType: local.content[0].type ?? "photo",
    play: false,
    play_time: PHOTO_TIME,
    separatorX: 0,
    duration: 0,

    rewindSeparatorX: 0,
    rewind: false,
  })

  // Если полностью закрывается Story, сбрасываем звук на видео
  onCleanup(() => {
    if (context?.getAccent()) {
      setMuted(true)
    }
  })

  // Вспомогательные функции
  const getCurrentTime = () => {
    if (local.content[store.selected].type === "photo") {
      return (Date.now() - startTime) / 1_000
    }
    return ref!?.currentTime
  }

  // Ставит на паузу/запускает - видео/фото
  const onPlay = (type: "play" | "pause") => {
    const isPlay = type === "play"
    setStore("play", isPlay)
    if (isPlay) {
      ref!?.play()
    } else {
      ref!?.pause()
    }
  }

  // начинаем воспроизведение при появлении
  onMount(() => {
    if (context?.getAccent()) {
      const currentContent = local.content[store.selected]

      setStore(
        produce((store) => {
          if (currentContent.type === "photo") {
            store.play_time = PHOTO_TIME
            store.duration = store.play_time
          }

          store.play = false
          store.separatorX = 0
          store.rewindSeparatorX = 0
          return store
        }),
      )
    }
  })

  const handlerGo = (direction: "next" | "back") => {
    if (ref!) {
      ref.pause()
      ref.src = ""
      ref.load()
    }

    clearTimeout(timeoutId)
    setStore(
      produce((store) => {
        store.play = false
        store.separatorX = 0
        store.rewindSeparatorX = 0
        store.duration = ref!?.duration ?? PHOTO_TIME
        store.play_time = store.duration
        store.rewind = false

        if (direction === "next") {
          store.selected += 1
          if (store.selected > local.content.length - 1) {
            store.selected = local.content.length - 1
            context?.goNext()
          }
        } else {
          store.selected -= 1
          if (store.selected < 0) {
            store.selected = 0
            context?.goBack()
          }
        }

        store.selectedType = local.content[store.selected].type

        return store
      }),
    )
  }

  const handlerClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    ;(local.onClick as any)?.(event)

    if (store.rewind) {
      onPlay("play") // ref!?.play()
      setStore("rewind", false)
      return
    }
    if (startTouchTime - 300 > Date.now()) return

    const isRightSide = event.target.clientWidth / 2 <= event.clientX
    handlerGo(isRightSide ? "next" : "back")
  }

  const onProgressEnd: JSX.EventHandlerUnion<HTMLSpanElement, TransitionEvent> = (event) => {
    if (!context?.getAccent() || !local.timer) return

    if (event.target !== event.currentTarget) return

    handlerGo("next")
  }

  const getElement = () => local.content[store.selected]

  const onStart = (event: GestureEvent) => {
    if (store.selectedType === "video") {
      if (store.rewind) {
        return
      }

      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setStore(
          produce((store) => {
            store.rewindSeparatorX = store.separatorX
            store.rewind = true

            return store
          }),
        )
      }, 600)
    }

    if (!store.duration || !context?.getAccent()) return

    startTouchTime = Date.now()
    setStore(
      produce((store) => {
        store.play = false
        store.play_time = store.duration - getCurrentTime()
        store.separatorX = 100 - (store.play_time / store.duration) * 100
      }),
    )

    ref!?.pause()
  }

  const onMove = (event: GestureEvent) => {
    if (store.selectedType !== "video") return
    const shiftXAbs = event.shiftXAbs || 0
    if (!store.rewind && (shiftXAbs >= 5 || (event.shiftYAbs || 0) >= 5)) {
      clearTimeout(timeoutId)
      setStore("rewind", false)
      return
    }
    if (!store.rewind) return

    event.originalEvent.stopPropagation()
    event.originalEvent.preventDefault()

    const target = event.originalEvent.target as HTMLDivElement

    const percent = (((event.shiftX || 0) * 2.0) / target.clientWidth) * 100

    setStore(
      produce((store) => {
        store.rewindSeparatorX = clamp(store.separatorX + percent, 0, 100)
        store.play_time = store.duration - ((store.separatorX + percent) / 100) * store.duration

        ref!.currentTime = store.duration - store.play_time

        return store
      }),
    )
  }

  const onEnd = async (event: GestureEvent) => {
    clearTimeout(timeoutId)
    if (!store.duration || !context?.getAccent()) return

    startTime = Date.now() - (startTouchTime - startTime)
    onPlay("play")

    setStore(
      produce((store) => {
        store.play_time = store.duration - getCurrentTime()
        store.separatorX = 100 - (store.play_time / store.duration) * 100

        return store
      }),
    )

    if (store.play_time <= 0) {
      handlerGo("next")
    }
  }

  // Событие которое вызывается при успешном загрузке фотографии или при успешном запуске Video
  const onLoadEnd = () => {
    if (store.selectedType === "photo") {
      setStore("play", true)
      startTime = Date.now()
    } else {
      const callback = () => {
        setStore(
          produce((store) => {
            store.rewind = false

            store.play = true

            return store
          }),
        )
      }
      if ("requestVideoFrameCallback" in HTMLVideoElement.prototype) {
        const id = ref!?.requestVideoFrameCallback(() => {
          callback()
          ref!?.cancelVideoFrameCallback(id)
        })
      } else {
        callback()
      }
    }
  }

  const onMuted: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    event.stopPropagation()
    event.preventDefault()

    setMuted((e) => !e)
  }

  // Рендер
  return (
    <div
      class={style.Story}
      classList={{
        [style[`Story--rewind`]]: store.rewind,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <AspectRation
        justify={"start"}
        width={9}
        height={16}
        footer={
          <Show keyed when={local.footer}>
            {(footer) => <div class={style.Story__footer}>{footer}</div>}
          </Show>
        }
      >
        <Touch
          class={style.Story__in}
          classList={{
            [style[`Story--rewind`]]: store.rewind,
            [`${local.class}`]: !!local.class,
            ...local.classList,
          }}
          onClick={handlerClick as any}
          onStart={onStart}
          onMove={onMove}
          onEnd={onEnd}
          {...others}
        >
          <div class={style.Story__header}>
            <Progress.Group padding={"none"} class={style.Story__separator}>
              <For each={local.content}>
                {(_, index) => (
                  <Progress
                    onProgressEnd={onProgressEnd}
                    animation={context?.getAccent() && store.play && store.selected === index()}
                    animationDuration={store.play_time}
                    value={
                      context?.getAccent() && store.play && store.selected === index()
                        ? 100
                        : store.selected > index()
                          ? 100
                          : store.selected === index()
                            ? store.rewind
                              ? store.rewindSeparatorX
                              : store.separatorX
                            : 0
                    }
                  />
                )}
              </For>
            </Progress.Group>
            {/** Скрываем если не акцентный элемент, для оптимизации */}
            <Show when={context?.getAccent()}>
              <div class={style.Story__rewind}>
                <Text size={"small"} weight={"500"} color={"inherit"}>
                  <Text.Content>Для перемотки проведите влево или вправо</Text.Content>
                </Text>
              </div>
            </Show>
          </div>

          <Show keyed when={getElement()}>
            {(elem) => (
              <Show
                when={elem.type === "video"}
                fallback={
                  <Image
                    fallback={
                      <Plug full>
                        <Plug.Container>
                          <Plug.Icon>
                            <Spinner size={"medium"} color={"inherit"} />
                          </Plug.Icon>
                        </Plug.Container>
                      </Plug>
                    }
                    render={"html"}
                    onLoad={onLoadEnd}
                    src={elem.src}
                    backgroundColor={"transparent"}
                  />
                }
              >
                <Video
                  onLoadedData={(event) => {
                    const videoDuration = event.currentTarget.duration
                    setStore(
                      produce((store) => {
                        store.duration = videoDuration
                        store.play_time = videoDuration
                        return store
                      }),
                    )
                  }}
                  muted={muted()}
                  onPlaying={onLoadEnd}
                  ref={ref!}
                  src={elem.src}
                  width="100%"
                  height="100%"
                  playsinline
                  fallback={
                    <Plug full>
                      <Plug.Container>
                        <Text>не удалось загрузить видео</Text>
                      </Plug.Container>
                    </Plug>
                  }
                  preview={
                    <Image
                      style={{
                        filter: "blur(10px)",
                      }}
                      fit={"cover"}
                      render={"html"}
                      src={elem.preview}
                      backgroundColor={"transparent"}
                    />
                  }
                />
              </Show>
            )}
          </Show>
        </Touch>

        <Show when={getElement().type === "video"}>
          <div
            onClick={onMuted}
            class={style.Story__mute}
            classList={{
              [style["Story--muted"]]: muted(),
            }}
          >
            <Button
              class={style.Story__mute_button}
              disabled={false}
              appearance={"neutral"}
              mode={"soft"}
              size={"medium"}
              type={"icon"}
            >
              <Button.Content>
                <div class={style["Story__mute_button--icon1"]}>
                  <IconVolume width={28} height={28} />
                </div>
                <div class={style["Story__mute_button--icon2"]}>
                  <IconVolumeMuted width={28} height={28} />
                </div>
              </Button.Content>
            </Button>
          </div>
        </Show>
      </AspectRation>
    </div>
  )
}

export default Story
