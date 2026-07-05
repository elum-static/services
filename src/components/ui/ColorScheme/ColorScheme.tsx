import { Settings } from "@atom/state"
import style from "./ColorScheme.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface ColorScheme extends JSX.HTMLAttributes<HTMLDivElement> {
  type: Settings["theme"]
}

const ColorScheme: Component<ColorScheme> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "type",
  ])

  return (
    <div
      class={style.ColorScheme}
      classList={{
        [style[`ColorScheme__type--${local.type}`]]: !!local.type,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default ColorScheme
