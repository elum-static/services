import style from "./Icon.module.css"
import Events from "@ui/Template/Events/Events"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { DynamicProps } from "solid-js/web"

interface Icon extends JSX.HTMLAttributes<DynamicProps<"button">> {
  hidden?: boolean
  hiddenMode?: "left-scale" | "right" | "left-scale-no_gap"
}

const Icon: Component<Icon> = (props) => {
  const merged = mergeProps({ disabled: false }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "disabled",
    "hidden",
    "hiddenMode",
  ])

  return (
    <Events
      restoreFocus
      minActiveTime={200}
      class={style.Icon}
      disabled={local.disabled}
      classList={{
        [style[`Icon--hidden`]]: !!local.hidden,
        [style[`Icon__hiddenMode--${local.hiddenMode}`]]: !!local.hiddenMode,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Events>
  )
}

export default Icon
