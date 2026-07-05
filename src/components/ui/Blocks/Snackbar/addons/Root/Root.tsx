import style from "./Root.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Root extends JSX.HTMLAttributes<HTMLDivElement> {}

const Root: Component<Root> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <div
      class={style.Root}
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

export default Root
