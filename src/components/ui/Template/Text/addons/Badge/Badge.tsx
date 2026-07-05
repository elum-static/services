import style from "./Badge.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Badge extends JSX.HTMLAttributes<HTMLDivElement> {}

const Badge: Component<Badge> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <div
      class={style.Badge}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default Badge
