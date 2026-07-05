import { styles } from "./styles"

import Events from "@ui/Template/Events/Events"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { DynamicProps } from "solid-js/web"
import useStyle from "@ui/utils/useStyle"

interface Switch extends JSX.HTMLAttributes<DynamicProps<"button">> {
  selected?: boolean
}

const style = useStyle(styles)

const Switch: Component<Switch> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "selected",
  ])

  return (
    <Events
      class={style.Switch}
      classList={{
        [style["Switch--selected"]]: local.selected,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <span class={style.Switch__in} />
    </Events>
  )
}

export default Switch
