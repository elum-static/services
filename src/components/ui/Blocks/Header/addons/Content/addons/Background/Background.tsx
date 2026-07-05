import style from "./Background.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Background extends JSX.HTMLAttributes<HTMLDivElement> {
  padding?: "small" | "text" | "text-right"

  background?: boolean | "primary"

  full?: boolean
}

const Background: Component<Background> = (props) => {
  const merged = mergeProps({ padding: "text", background: true }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "padding",
    "background",
    "full",
  ])

  return (
    <div
      class={style.Background}
      classList={{
        [style[`Background--full`]]: !!local.full,
        [style[`Background--background`]]: !!local.background,
        [style[`Background__padding--${local.padding}`]]: !!local.padding,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default Background
