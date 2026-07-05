import style from "./Avatar.module.css"

import combineStyle from "@ui/utils/combineStyle"
import generateAvatarGradient from "@ui/utils/generateAvatarGradient"
import Image, { type ImageProps } from "@ui/Template/Image/Image"

import { type Component, splitProps, mergeProps, JSXElement, Show } from "solid-js"

interface Avatar extends ImageProps {
  size?: string
  mode?: "default" | "app" | "inherit"

  bgGradient?: "auto"

  gradientId?: string
  name: string

  after?: JSXElement
}

const Avatar: Component<Avatar> = (props) => {
  const merged = mergeProps({ mode: "default", bgGradient: "auto" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "size",
    "style",
    "mode",
    "bgGradient",
    "name",
    "fallback",
    "after",
    "gradientId",
  ])

  return (
    <Image
      class={style.Avatar}
      classList={{
        [style[`background_gradient`]]: !!local.bgGradient,
        [style[
          `background_gradient--${
            local.bgGradient === "auto" ? generateAvatarGradient(local.name) : local.bgGradient
          }`
        ]]: !!local.bgGradient,

        [style[`Avatar__mode--${local.mode}`]]: !!local.mode,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      fallback={local.fallback || (local.name || "").slice(0, 1)}
      style={combineStyle(
        {
          width: local.size,
          height: local.size,
          "min-width": local.size,
          "min-height": local.size,
          background: local.bgGradient === "auto" ? getGradientByName(local.gradientId || "") : "",
        },
        local.style,
      )}
      {...others}
    >
      <Show keyed when={local.after}>
        {(after) => <div class={style.Avatar__after}>{after}</div>}
      </Show>
    </Image>
  )
}
export default Avatar

interface GradientOptions {
  angle?: number
  colorsCount?: number
  saturation?: number
  lightness?: number
}

function getGradientByName(name: string, options: GradientOptions = {}): string {
  const { angle = 135, colorsCount = 3, saturation = 80, lightness = 55 } = options

  // Создаем детерминированный хеш из строки
  function hashCode(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Преобразуем в 32-битное целое
    }
    return Math.abs(hash)
  }

  // Генерируем детерминированные числа из хеша
  function seededRandom(seed: number, index: number): number {
    const x = Math.sin(seed + index * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
  }

  const hash = hashCode(name)

  // Основной оттенок из хеша
  const baseHue = hash % 360

  // Генерируем colorsCount цветов
  const colors: string[] = []
  for (let i = 0; i < colorsCount; i++) {
    const seed = hash + i * 1000
    const hueShift = seededRandom(seed, i) * 60 - 30 // -30 до +30 градусов
    const hue = (baseHue + hueShift + 360) % 360

    const sat = saturation + (seededRandom(seed + 1, i) * 20 - 10)
    const light = lightness + (seededRandom(seed + 2, i) * 20 - 10)

    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`)
  }

  return `linear-gradient(${angle}deg, ${colors.join(", ")})`
}
