import {
  Touch,
  Image,
  Plug,
  Text,
  Video,
  AspectRation,
  Button,
  Progress,
  ImageProps,
  Flex,
  VideoSrc,
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
  onMount,
  Switch,
  Match,
} from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import Spinner from "../Spinner/Spinner"
import { clamp } from "@minsize/utils"
import { IconVolume, IconVolumeMuted } from "src/source"
import loc from "src/core/src/languages"

import Events, { type GestureEvent, isTouchSupport } from "@ui/Template/Events/Events"

// Типы и интерфейсы
export type StoryContentItem =
  | {
      type: "image" | "element"
      preview?: string
      src: string
    }
  | {
      type: "video"
      preview?: string
      src: VideoSrc
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
   * Отображение количество контента
   * @default false
   */
  counter?: boolean

  /**
   * loop video
   * @default false
   */
  loop?: boolean

  /**
   * Дополнительный UI в нижней части сторис
   */
  footer?: JSX.Element

  /**
   * Подсказка о перемотке (например, текст "Для перемотки проведите влево/вправо")
   * Отображается при попытке пользователя перемотать сторис
   */
  rewind?: JSX.Element

  /**
   * Кнопка мута
   * @default true
   */
  mutedButton?: boolean

  blur?: boolean

  selected?: number

  fit?: ImageProps["fit"]

  aspectRation?: {
    width: number
    height: number
  }
  "aspect-ration"?: string

  customContent?: JSX.Element
}

// Константы
const PHOTO_TIME = 5 // Длительность показа фото в секундах

var [muted, setMuted] = createSignal(true)

const Story: Component<StoryProps> = (props) => {
  const [lang] = loc()
  // Контекст и пропсы
  const context = useContext(StoriesContext)
  const merged = mergeProps(
    {
      timer: true,
      counter: false,
      selected: 0,
      mutedButton: true,
      loop: false,
      blur: false,
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "content",
    "onClick",
    "onTransitionEnd",
    "timer",
    "footer",
    "rewind",
    "counter",
    "selected",
    "fit",
    "aspectRation",
    "mutedButton",
    "loop",
    "aspect-ration",
    "customContent",
    "blur",
  ])

  // Рефы и переменные
  let ref: HTMLVideoElement
  let startTouchTime = Date.now()
  let startTime = Date.now()
  let timeoutId: NodeJS.Timeout

  // Состояние компонента
  const [store, setStore] = createStore({
    play: false,
    play_time: PHOTO_TIME,
    separatorX: 0,
    duration: 0,

    rewindSeparatorX: 0,
    rewind: false,

    get selectedType() {
      return local.content[context?.getStorySelect() || 0].type
    },
  })

  // Если полностью закрывается Story, сбрасываем звук на видео
  onCleanup(() => {
    if (context?.getAccent()) {
      setMuted(true)
    }
  })

  // Вспомогательные функции
  const getCurrentTime = () => {
    if (store.selectedType === "image") {
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
      setStore(
        produce((store) => {
          if (store.selectedType === "image") {
            store.play_time = PHOTO_TIME
            store.duration = store.play_time
          }

          store.play = false
          store.separatorX = 0
          store.rewindSeparatorX = 0
          return store
        }),
      )
      if (store.selectedType === "video") {
        onPlay("play")
      }
    }
  })

  createEffect(
    on(
      () => context?.getAccent(),
      (next, prev) => {
        if (store.selectedType === "video") {
          onPlay(next ? "play" : "pause")
        }
        onReset()
      },
      {
        defer: true,
      },
    ),
  )

  const onReset = () => {
    startTime = Date.now()
    setStore(
      produce((store) => {
        if (store.selectedType === "image") {
          store.play_time = PHOTO_TIME
          store.duration = store.play_time
        }

        if (store.selectedType === "video") {
          const videoDuration = ref!?.duration || 0

          store.duration = videoDuration
          store.play_time = videoDuration

          ref!.currentTime = 0
        }

        store.separatorX = 0
        store.rewindSeparatorX = 0
        store.rewind = false

        return store
      }),
    )
  }

  const handlerGo = (direction: "next" | "back") => {
    clearTimeout(timeoutId)
    setStore(
      produce((store) => {
        if (store.selectedType === "image") {
          store.play_time = PHOTO_TIME
          store.duration = store.play_time
        }

        if (store.selectedType === "video") {
          const videoDuration = ref!?.duration || 0

          store.duration = videoDuration
          store.play_time = videoDuration

          ref!.currentTime = 0
        }

        store.play = false
        store.separatorX = 0
        store.rewindSeparatorX = 0
        store.rewind = false

        context?.goStory(direction)

        // if (direction === "next") {
        //   store.selected += 1
        //   if (store.selected > local.content.length - 1) {
        //     store.selected = local.content.length - 1
        //     context?.goNext()
        //   }
        // } else {
        //   store.selected -= 1
        //   if (store.selected < 0) {
        //     store.selected = 0
        //     context?.goBack()
        //   }
        // }

        return store
      }),
    )

    // if (ref!) {
    //   ref.pause()
    //   ref.src = ""
    //   ref.load()
    // }

    // clearTimeout(timeoutId)
    // setStore(
    //   produce((store) => {
    //     if (store.selectedType === "image") {
    //       store.play_time = PHOTO_TIME
    //       store.duration = store.play_time
    //     }

    //     if (store.selectedType === "video") {
    //       const videoDuration = ref!?.duration || 0

    //       store.duration = videoDuration
    //       store.play_time = videoDuration

    //       ref!.currentTime = 0
    //     }

    //     store.play = false
    //     store.separatorX = 0
    //     store.rewindSeparatorX = 0
    //     store.rewind = false

    //     context?.goStory(direction)

    //     // if (direction === "next") {
    //     //   store.selected += 1
    //     //   if (store.selected > local.content.length - 1) {
    //     //     store.selected = local.content.length - 1
    //     //     context?.goNext()
    //     //   }
    //     // } else {
    //     //   store.selected -= 1
    //     //   if (store.selected < 0) {
    //     //     store.selected = 0
    //     //     context?.goBack()
    //     //   }
    //     // }

    //     return store
    //   }),
    // )
  }

  const handlerClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    event.stopPropagation()
    event.preventDefault()
    ;(local.onClick as any)?.(event)

    if (store.rewind) {
      onPlay("play") // ref!?.play()
      setStore("rewind", false)
      return
    }
    if (startTouchTime - 300 > Date.now()) return

    const isRightSide = event.currentTarget.clientWidth / 2 <= event.clientX
    handlerGo(isRightSide ? "next" : "back")
  }

  const onStart = (event: GestureEvent) => {
    if (store.selectedType === "video" && local.rewind) {
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

  const onLoadEndImage = () => {
    onReset()
    setStore("play", true)
  }

  const onLoadEndVideo = () => {
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
        ref!?.cancelVideoFrameCallback(id)
        callback()
      })
    } else {
      callback()
    }
  }

  // Событие которое вызывается при успешном загрузке фотографии или при успешном запуске Video
  const onLoadEnd = () => {
    switch (store.selectedType) {
      case "image": {
        onLoadEndImage()
        return
      }
      case "video": {
        onLoadEndVideo()
        return
      }
    }
  }

  const onMuted: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    event.stopPropagation()
    event.preventDefault()

    setMuted((e) => !e)
  }

  const onProgressEnd: JSX.EventHandlerUnion<HTMLSpanElement, TransitionEvent> = (event) => {
    if (!context?.getAccent() || !local.timer) return

    if (event.target !== event.currentTarget) return

    handlerGo("next")
  }

  function getProgressValue(index: number) {
    const selected = context?.getStorySelect() || 0

    if (context?.getAccent() && store.play && selected === index) {
      return 100
    }

    if (selected > index) {
      return 100
    }

    if (selected === index) {
      return store.rewind ? store.rewindSeparatorX : store.separatorX
    }

    return 0
  }

  const isAnimation = (index: number) => {
    const selected = context?.getStorySelect() || 0
    return selected === index && context?.getAccent() && store.play
  }

  const Items = () => {
    return (
      <>
        <Events
          class={style.Story__in}
          classList={{
            [style[`Story--rewind`]]: store.rewind,
            [`${local.class}`]: !!local.class,
            ...local.classList,
          }}
          stopPropagation={false}
          preventDefault={false}
          onClick={handlerClick}
          {...(isTouchSupport ? { onStart, onMove, onEnd } : {})}
          {...others}
        >
          <div class={style.Story__header}>
            <Show when={local.timer}>
              <Progress.Group padding={"none"} class={style.Story__separator}>
                <For each={local.content}>
                  {(_, index) => (
                    <Progress
                      onProgressEnd={onProgressEnd}
                      animation={isAnimation(index())}
                      animationDuration={store.play_time}
                      value={getProgressValue(index())}
                    />
                  )}
                </For>
              </Progress.Group>
            </Show>
            {/** Скрываем если не акцентный элемент, для оптимизации */}
            <Show keyed when={context?.getAccent() && local.rewind}>
              {(rewind) => (
                <div class={style.Story__rewind}>
                  {rewind}
                  {/* <Text size={"small"} weight={"500"} color={"inherit"}>
                  <Text.Content>
                    Для перемотки проведите влево или вправо
                  </Text.Content>
                </Text> */}
                </div>
              )}
            </Show>
          </div>
          <Show keyed when={local.content[context?.getStorySelect() || 0]}>
            {(content) => (
              <Switch>
                <Match keyed when={content.type === "element"}>
                  <div
                    style={{
                      "aspect-ratio": local["aspect-ration"],
                    }}
                  >
                    {local.customContent}
                  </div>
                </Match>
                {/* Фото */}
                <Match keyed when={content.type === "image" && content}>
                  {(content) => (
                    <Image
                      style={{
                        "aspect-ratio": local["aspect-ration"],
                      }}
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
                      src={content.src}
                      srcStub={content.preview}
                      backgroundColor={"transparent"}
                      fit={local.fit}
                    />
                  )}
                </Match>
                {/* Видео */}
                <Match when={content.type === "video"}>
                  <Video
                    style={{
                      "aspect-ratio": local["aspect-ration"],
                      height: "auto",
                    }}
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
                    autoplay={!!context?.getAccent()}
                    muted={muted()}
                    onPlaying={onLoadEnd}
                    ref={ref!}
                    src={content.src}
                    loop={local.loop}
                    fit={local.fit}
                    blur={local.blur}
                    width="100%"
                    height="100%"
                    playsinline={true}
                    fallback={
                      <Plug full>
                        <Plug.Container>
                          <Text>Error video download</Text>
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
                        src={content.preview}
                        backgroundColor={"transparent"}
                      />
                    }
                  />
                </Match>
              </Switch>
            )}
          </Show>
          <Show when={local.counter || context?.getCounter()}>
            <div class={style.Story__counter}>
              <Text size={"medium"} color={"primary"} class={style.Story__counter_in}>
                <Text.Content>
                  {(context?.getIndex() || 0) + 1 + (context?.getStorySelect() || 0)}{" "}
                  {lang("attach_of") || "/"} {context?.getContentLength()}
                </Text.Content>
              </Text>
            </div>
          </Show>
        </Events>
        <Show when={store.selectedType === "video" && local.mutedButton}>
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
      </>
    )
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
      <Switch>
        <Match when={!local.aspectRation}>
          <Flex justify={"center"} class={style.Story__FlexRation}>
            <Items />
            <Show keyed when={local.footer}>
              {(footer) => <div class={style.Story__footer}>{footer}</div>}
            </Show>
          </Flex>
        </Match>
        <Match when={!!local.aspectRation}>
          <AspectRation
            justify={"start"}
            disabled={!local.aspectRation}
            width={local.aspectRation?.width || 9}
            height={local.aspectRation?.height || 16}
            footer={
              <Show keyed when={local.footer}>
                {(footer) => <div class={style.Story__footer}>{footer}</div>}
              </Show>
            }
          >
            <Items />
          </AspectRation>
        </Match>
      </Switch>
    </div>
  )
}

export default Story
