import { styles } from "./styles"

import { type Platform } from "@ui/Types"
import Events, { type EventsProps } from "@ui/Template/Events/Events"
import useStyle from "@ui/utils/useStyle"

import { type JSX, mergeProps, splitProps, ValidComponent } from "solid-js"

interface Link<T extends ValidComponent> extends EventsProps<T> {
  /**
   * Компонент, который будет использоваться для рендеринга Flexbox.
   * По умолчанию используется `a` при href или `button`.
   */
  component?: T

  color?: "accentColor" | "accent" | "primary"

  nowrap?: boolean

  overflow?: boolean
}

const Link = <T extends ValidComponent>(props: Link<T>): JSX.Element => {
  const style = useStyle(styles)
  const merged = mergeProps(
    { component: props.href ? "a" : "button", color: "accentColor" },
    props,
  ) as Link<T>
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "color",
    "nowrap",
    "overflow",
  ])

  return (
    <Events
      class={style.Link}
      classList={{
        [style[`Link--nowrap`]]: !!local.nowrap,
        [style[`Link--overflow`]]: !!local.overflow,
        [style[`Link__color--${local.color}`]]: !!local.color,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Events>
  )
}

export default Link
