import style from "./Group.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Group extends JSX.HTMLAttributes<HTMLDivElement> {}

const Group: Component<Group> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <div
      class={style.Group}
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

export default Group
