import style from "./Hue.module.css"

import Events, { type GestureEvent, isTouchSupport } from "@ui/Template/Events/Events"

import { type JSX, type Component, createEffect, mergeProps, splitProps, Show } from "solid-js"

import { createStore } from "solid-js/store"
import { clamp, HSVtoRGB } from "@minsize/utils"

interface Hue extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "color" | "onChange"> {
  accent: [number, number]
  onChange: (color: [number, number]) => void
  mode?: "default" | "telegram"
}

const Hue: Component<Hue> = (props) => {
  const merged = mergeProps({ mode: "default" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "mode",
    "onChange",
    "accent",
    "children",
  ])
  const [color, setColor] = createStore({
    startX: 0,
    x: 0,
    startY: 0,
    y: 0,
  })

  const Start = (event: GestureEvent) => {
    const container = event.originalEvent.currentTarget as HTMLDivElement
    if (!container) {
      return
    }

    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const currentX = (event.startX || 0) - rect.x
    const currentY = (event.startY || 0) - rect.y

    const x = clamp(currentX, 0, width)
    const y = clamp(currentY, 0, height)

    const positionX = (x * 100) / width
    const positionY = (y * 100) / height

    setColor({ startX: positionX, startY: positionY })

    local.onChange([positionX / 100, positionY / 100])
  }

  const Move = (event: GestureEvent) => {
    event.originalEvent.stopPropagation()
    event.originalEvent.preventDefault()
    const container = event.originalEvent.currentTarget as HTMLDivElement
    if (!container) {
      return
    }

    const currentX = event.shiftX || 0
    const currentY = event.shiftY || 0

    const xPercentage = (currentX * 100) / container.clientWidth
    const yPercentage = (currentY * 100) / container.clientHeight

    const clampedX = clamp(color.startX + xPercentage, 0, 100)
    const clampedY = clamp(color.startY + yPercentage, 0, 100)

    local.onChange([clampedX / 100, clampedY / 100])
  }

  createEffect(() => {
    setColor({ x: local.accent[0] * 100, y: local.accent[1] * 100 })
  })

  const rgb = (color: [number, number]) => {
    const [r, g, b] = HSVtoRGB(color[0], 1 - color[1], 1)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div
      class={style.Hue}
      classList={{
        [style[`Hue__mode--${local.mode}`]]: !!local.mode,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Events class={style.Hue__inner} onStart={Start} onMove={Move}>
        <div class={style.Hue__background} />
        <div class={style.Hue__toodle} style={{ left: `${color.x}%`, top: `${color.y}%` }}>
          <span style={{ background: rgb(local.accent) }} />
        </div>
      </Events>
      <Show keyed when={local.children}>
        {(children) => <div class={style.Hue__content}>{children}</div>}
      </Show>
    </div>
  )
}

export default Hue
