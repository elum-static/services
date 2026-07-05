import style from "./Progress.module.css"
import { Group } from "./addons"

import { type JSX, type Component, mergeProps, splitProps, createSignal, onMount } from "solid-js"

interface Progress extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * Включить ли анимацию заполнения прогресс-бара?
   * @default false
   */
  animation?: boolean

  /**
   * Длительность анимации заполнения (в секундах)
   * Если не указано, анимация отключается (даже при animation=true)
   */
  animationDuration?: number

  /**
   * Событие, вызываемое при начале анимации прогресса
   */
  onProgressStart?: JSX.HTMLAttributes<HTMLSpanElement>["onTransitionStart"]

  /**
   * Событие, вызываемое при завершении анимации прогресса
   */
  onProgressEnd?: JSX.HTMLAttributes<HTMLSpanElement>["onTransitionEnd"]

  /**
   * Текущий прогресс (в процентах от 0 до 100)
   * 0 - пустой, 100 - полностью заполненный
   * @default 0
   */
  value?: number

  /**
   * Цвет заполненной части прогресс-бара
   * @default 'black'
   */
  backgroundColor?: "black" | "primary" | "transparent"

  border?: boolean

  size?: "default" | "small"
}

type ComponentProgress = Component<Progress> & {
  Group: typeof Group
}

const Progress: ComponentProgress = (props) => {
  const merged = mergeProps(
    {
      value: 0,
      animation: false,
      backgroundColor: "black",
      padding: "default",
      border: true,

      size: "default",
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "value",
    "animation",
    "animationDuration",
    "backgroundColor",
    "onProgressEnd",
    "onProgressStart",
    "border",
    "size",
  ])

  return (
    <div
      class={style.Progress}
      classList={{
        [style[`Progress__size--${local.size}`]]: !!local.size,

        [style[`Progress--border`]]: !!local.border,
        [style[`Progress--animation`]]: local.animation,
        [style[`Progress__backgroundColor--${local.backgroundColor}`]]: !!local.backgroundColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <span
        class={style.Progress__in}
        style={{
          "--progress-value": `${local.value - 100}%`,
          "--progress-duration": `${local.animationDuration}s`,
        }}
        onTransitionStart={local.onProgressStart}
        onTransitionEnd={local.onProgressEnd}
      >
        {local.children}
      </span>
    </div>
  )
}

Progress.Group = Group

export default Progress
