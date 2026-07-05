import style from "./Content.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Content extends JSX.HTMLAttributes<HTMLSpanElement> {
  full?: boolean
}

const Content: Component<Content> = (props) => {
  const merged = mergeProps({ full: true }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "full",
  ])

  return (
    <span
      class={style.Context}
      classList={{
        ["_TextContent"]: true,
        [style["Context--full"]]: local.full,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </span>
  )
}

export default Content
