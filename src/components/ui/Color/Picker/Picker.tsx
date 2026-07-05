import style from "./Picker.module.css"
import { getPercentage, getPosition } from "./libs"

import { type Component, type JSX, createEffect, splitProps } from "solid-js"
import { createStore } from "solid-js/store"

import { clamp, HSVtoRGB } from "@minsize/utils"
import Events, { type GestureEvent } from "@ui/Template/Events/Events"

interface Picker
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "color"> {
  /** От 1 до 100 */
  opacity: number
  /** от 0 до 1 */
  accent: [number, number]
  onChange: (color: [number, number, number], x: number) => void
}

type StorePosition = {
  x: number
  y: number
}

type StoreColor = {
  accent: [number, number]
  position: StorePosition
}

const Picker: Component<Picker> = (props) => {
  const [local, others] = splitProps(props, ["opacity", "accent", "onChange"])

  const [color, setColor] = createStore<StoreColor>({
    accent: [0, 0],
    position: {
      y: 0,
      x: local.opacity,
    },
  })

  const [position, setPosition] = createStore<StorePosition>({
    y: 0,
    x: local.opacity,
  })

  const handlerChange = (x: number, y: number) => {
    setColor("position", { x, y })
    const rgb = HSVtoRGB(local.accent[0], 1 - local.accent[1], 1 - x / 100)
    local.onChange(rgb, x)
  }

  const Start = (event: GestureEvent) => {
    const container = event.originalEvent.currentTarget as HTMLDivElement
    if (!container) return

    const { width, height, x, y } = container.getBoundingClientRect()

    const currentX = (event.startX || 0) - x
    const currentY = (event.startY || 0) - y

    const { percentageX, percentageY } = getPercentage(
      clamp(currentX, 0, width),
      clamp(currentY, 0, height),
      width,
      height,
    )

    setPosition({ x: percentageX, y: percentageY })
    handlerChange(percentageX, percentageY)
  }

  const Move = (event: GestureEvent) => {
    const container = event.originalEvent.currentTarget as HTMLDivElement
    if (!container) return

    const { percentageX, percentageY } = getPercentage(
      event.shiftX || 0,
      event.shiftY || 0,
      container.clientWidth,
      container.clientHeight,
    )

    const clampedX = clamp(position.x + percentageX, 0, 100)
    const clampedY = clamp(position.y + percentageY, 0, 100)

    handlerChange(clampedX, clampedY)
  }

  createEffect(() => {
    if (
      local.accent[0] !== color.accent[0] ||
      local.accent[1] !== color.accent[1]
    ) {
      handlerChange(local.opacity, color.position.y)
    }
    setColor({
      accent: local.accent,
      position: {
        y: 0,
        x: local.opacity,
      },
    })
  })

  const getColor = () => {
    const [r, g, b] = HSVtoRGB(local.accent[0], 1 - local.accent[1], 1)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div class={style.Picker} {...others}>
      <Events class={style.Picker__inner} onStart={Start} onMove={Move}>
        <div
          class={style.Picker__hue}
          style={{ "background-color": getColor() }}
        />
        <div
          class={style.Picker__toddle}
          style={{
            left: `${color.position.x}%`,
          }}
        >
          <span class={style.Picker__circle} />
        </div>
      </Events>
    </div>
  )
}

export default Picker
