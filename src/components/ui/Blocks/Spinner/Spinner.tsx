import { clamp } from "@minsize/utils"
import { styles } from "./styles"

import { type HTMLAttributes } from "@ui/Types"
import useStyle from "@ui/utils/useStyle"

import { type Component, splitProps, mergeProps, JSX, Show } from "solid-js"

interface Spinner extends HTMLAttributes<HTMLDivElement> {
  size?: "small" | "regular" | "large" | "x-large" | "medium" | "auto"
  color?: "secondary" | "inherit" | "primary" | "icon_tertiary"

  progress?: number

  /**
   * @default true
   */
  visible?: boolean
}

const Spinner: Component<Spinner> = (props) => {
  const style = useStyle(styles)

  const merged = mergeProps(
    { size: "regular", color: "secondary", visible: true },
    props,
  ) as Spinner
  const [local, others] = splitProps(merged, [
    "platform",
    "size",
    "color",
    "class",
    "classList",
    "progress",
    "visible",
  ])

  // Рассчитываем stroke-dasharray и stroke-dashoffset на основе progress
  const getCircleStyle = () => {
    if (local.progress === undefined) return {}

    const radius = 20
    const circumference = 2 * Math.PI * radius
    const progressPercent = Math.max(
      0,
      Math.min(100, clamp(local.progress || 0, 5, 100)),
    )
    const dashoffset = circumference - (progressPercent / 100) * circumference

    return {
      "stroke-dasharray": `${circumference}px ${circumference}px`,
      "stroke-dashoffset": dashoffset,
      animation: "none", // Отключаем анимацию когда есть progress
      transition: "0.3s",
    } as JSX.CSSProperties
  }

  return (
    <div
      class={style.Spinner}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,

        [style[`Spinner__size--${local.size}`]]: !!local.size,
        [style[`Spinner__color--${local.color}`]]: !!local.color,
        [style[`Spinner--animBorder`]]: local.progress === undefined,
        [style[`Spinner--visible`]]: local.visible,
      }}
      {...others}
    >
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="5"
          style={getCircleStyle()}
        />
      </svg>
      <Show when={local.progress !== undefined}>
        <span class={style.Spinner__progress}>{local.progress}</span>
      </Show>
    </div>
  )
}

export default Spinner
