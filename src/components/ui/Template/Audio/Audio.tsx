import style from "./Audio.module.css"
import { IconBugFilled, IconPlayerPausedFilled, IconPlayerPlay } from "src/source"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  createEffect,
  on,
  For,
  Switch,
  Match,
  onMount,
  useContext,
} from "solid-js"
import Flex, { type FlexProps } from "../Flex/Flex"
import Events from "../Events/Events"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"
import { clamp } from "@minsize/utils"
import Text from "../Text/Text"
import Spinner from "@ui/Blocks/Spinner/Spinner"
import useMedia from "../Media/hooks/useMedia"
import AudioController from "./AudioController"
import PanelContainerContext from "@ui/Pages/Panel/addons/Container/PanelContext"

interface Audio extends FlexProps {
  src: string
  srcInfo?: string
  preload?: "metadata" | "auto"

  timeMessage?: JSX.Element

  stopLoading?: boolean
  onTriggerRetry?: () => void

  position?: number

  color: "accent--text" | "text_primary"
}

const waveformError = Array.from({ length: 15 }).map((x) => 0)

const Audio: Component<Audio> = (props) => {
  const media = useMedia()
  const context = useContext(PanelContainerContext)

  const merged = mergeProps({ stopLoading: false, color: "text_primary" }, props) as Audio
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "src",
    "srcInfo",
    "preload",
    "timeMessage",
    "onTriggerRetry",
    "stopLoading",
    "position",
    "color",
  ])

  const audio = new AudioController()

  onMount(() => {
    if (local.position) {
      media?.register?.(audio.element, "audio", local.position)
    }
  })

  let ref: HTMLDivElement

  var startCurrentTarget: number = 0

  const load = () => {
    if (!local.stopLoading) {
      audio.setSrc(local.src)
      if (local.srcInfo) {
        audio.setSrcInfo(local.srcInfo)
      }
    }
  }

  createEffect(() => {
    load()
  })

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
  })
  const visibleObserver = local.preload === "auto" ? useVisibilityObserver(() => ref!) : () => false

  createEffect(
    on([() => visibleObserver(), () => local.stopLoading], ([visible]) => {
      if (local.stopLoading) return
      if (visible && audio.state !== "ready") {
        audio!?.load()
      }
    }),
  )

  createEffect(
    on(
      () => local.onTriggerRetry?.(),
      () => {
        load()
      },
      {
        defer: true,
      },
    ),
  )

  return (
    <Flex
      class={style.Audio}
      classList={{
        [style[`Audio__color--${local.color}`]]: !!local.color,
        [style[`Audio__state--${audio.state}`]]: !!audio.state,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      ref={ref! as any}
      direction={"column"}
      align={"end"}
      {...others}
    >
      <Flex direction={"row"} class={style.Audio__content}>
        <div
          class={style.Audio__controls}
          classList={{
            _Audio__controls: true,
          }}
        >
          <Switch>
            <Match when={audio.state === "errored"}>
              <Events onClick={() => audio.load()} class={style[`Audio__controls--error`]}>
                <IconBugFilled width={32} height={32} />
              </Events>
            </Match>
            <Match when={audio.state === "loading" || local.stopLoading}>
              <Spinner class={style[`Audio__controls--spinner`]} />
            </Match>

            <Match when={audio.paused}>
              <Events onClick={() => audio.play()} class={style[`Audio__controls--play`]}>
                <IconPlayerPlay width={32} height={32} />
              </Events>
            </Match>

            <Match when={!audio.paused}>
              <Events onClick={() => audio.pause()} class={style[`Audio__controls--pause`]}>
                <IconPlayerPausedFilled width={32} height={32} />
              </Events>
            </Match>
          </Switch>
        </div>
        <Events
          class={style.Audio__in}
          onPointerMove={(event) => {
            event.target.setPointerCapture(event.pointerId)
          }}
          onStartX={(event) => {
            startCurrentTarget = audio.currentTime
          }}
          onMoveX={(event) => {
            context?.setStatusScroll?.(false)
            // Получаем ширину полосы прогресса
            const progressBarWidth =
              (event.originalEvent?.currentTarget as HTMLDivElement)?.offsetWidth || 1

            // shiftX - это уже смещение от начальной точки!
            // Положительное - вправо, отрицательное - влево
            const deltaPercent = ((event.shiftX || 0) / progressBarWidth) * 100

            // Вычисляем, сколько процентов составляет начальное время
            const startPercent = (startCurrentTarget / audio.duration) * 100

            // Вычисляем новый процент (начальный + смещение)
            const newPercent = startPercent + deltaPercent

            // Ограничиваем проценты от 0 до 100
            const clampedPercent = clamp(newPercent, 0, 100)

            // Вычисляем новое время
            const newTime = (clampedPercent / 100) * audio.duration

            const time = clamp(newTime, 0, audio.duration)

            // Устанавливаем новое время
            // setStore("currentTime", time)
            audio.currentTime = time
          }}
          onEndX={() => {
            context?.setStatusScroll?.(true)
          }}
        >
          <div class={style.Audio__waveform}>
            <For
              each={
                audio.state === "errored"
                  ? waveformError
                  : audio.waveform.length
                    ? audio.waveform
                    : waveformError
              }
            >
              {(bar, index) => (
                <div
                  class={style.Audio__waveform_item}
                  classList={{
                    [style[`Audio__waveform_item--selected`]]:
                      audio.currentTime >= (index() / audio.waveform.length) * audio.duration,
                  }}
                  style={{
                    height: `${bar}%`,
                  }}
                />
              )}
            </For>
          </div>
          <Text size={"inherit"} color={"inherit"} class={style.Audio__time}>
            <Text.Content>
              {new Intl.DateTimeFormat("RU-ru", {
                minute: "2-digit",
                second: "2-digit",
              })
                .format(new Date().setHours(0, 0, audio.duration - audio.currentTime))
                .replace(".", "")
                .replace(".,", ",")}
            </Text.Content>
          </Text>
        </Events>
      </Flex>
      {local.timeMessage}
    </Flex>
  )
}

export default Audio
