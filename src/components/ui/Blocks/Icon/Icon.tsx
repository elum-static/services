import { styles } from "./styles"

import useStyle from "@ui/utils/useStyle"
import { type JSX, type Component, mergeProps, splitProps, Show } from "solid-js"
import combineStyle from "../../utils/combineStyle"

interface Icon extends JSX.HTMLAttributes<HTMLSpanElement> {
  size?: "medium" | "large" | "xx-large"
  color?: "white" | "gray" | "inherit" | "red" | "accent" | "green" | "unset" | "primary"
  badge?: JSX.Element

  padding?: JSX.CSSProperties["padding"]
  backgroundColor?: JSX.CSSProperties["background-color"]
}

const style = useStyle(styles)

const Icon: Component<Icon> = (props) => {
  const merged = mergeProps({ size: "medium", color: "inherit" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "size",
    "color",
    "badge",
    "backgroundColor",
    "padding",
  ])

  return (
    <span
      class={style.Icon}
      classList={{
        [style[`Icon__color--${local.color}`]]: !!local.color,
        [style[`Icon__size--${local.size}`]]: !!local.size,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      style={combineStyle(
        {
          "background-color": local.backgroundColor,
          padding: local.padding,
        },
        local.style,
      )}
    >
      {local.children}
      <Show keyed when={local.badge}>
        {(badge) => <span class={style.Icon__badge}>{badge}</span>}
      </Show>
    </span>
  )
}

export default Icon
