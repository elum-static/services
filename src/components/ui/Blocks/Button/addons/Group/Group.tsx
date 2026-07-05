import { styles } from "./styles"
import useStyle from "@ui/utils/useStyle"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { Container } from "./addons"

interface Group extends JSX.HTMLAttributes<HTMLDivElement> {
  gap?: boolean
  padding?: boolean
}

type ComponentGroup = Component<Group> & {
  Container: typeof Container
}

const Group: ComponentGroup = (props) => {
  const style = useStyle(styles)
  const merged = mergeProps({ gap: true, padding: true }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "gap",
    "padding",
  ])

  return (
    <div
      class={style.Group}
      classList={{
        [style["Group--gap"]]: !!local.gap,
        [style["Group--padding"]]: !!local.padding,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

Group.Container = Container

export default Group
