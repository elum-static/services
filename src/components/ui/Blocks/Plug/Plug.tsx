import { styles } from "./styles"

import { type HTMLAttributes } from "@ui/Types"
import useStyle from "@ui/utils/useStyle"

import { Action, Card, Container, Icon } from "./addons"

import { type Component, splitProps, mergeProps } from "solid-js"
import { type DynamicProps } from "solid-js/web"
import { Property } from "csstype"
import combineStyle from "@ui/utils/combineStyle"

interface Plug extends HTMLAttributes<HTMLDivElement> {
  /**
   * Определяет, должен ли элемент отображаться в полноэкранном режиме.
   */
  full?: boolean

  size?: "x-small" | "small" | "medium" | "large"

  safeTop?: boolean
  safeBottom?: boolean

  "max-width"?: Property.MaxWidth<(string & {}) | 0>
}

type ComponentPlug = Component<Plug> & {
  Container: typeof Container
  Action: typeof Action
  Icon: typeof Icon
  Card: typeof Card
}

const Plug: ComponentPlug = (props) => {
  const style = useStyle(styles)
  const merged = mergeProps({ size: "medium", "max-width": "480px" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "full",
    "size",
    "safeTop",
    "safeBottom",
    "max-width",
    "style",
  ])

  return (
    <div
      class={style.Plug}
      classList={{
        [style[`Plug__safe--top`]]: !!local.safeTop,
        [style[`Plug__safe--bottom`]]: !!local.safeBottom,
        [style[`Plug__size-${local.size}`]]: !!local.size,

        [`${local.class}`]: !!local.class,
        ...local.classList,

        [style[`Plug--full`]]: local.full,
      }}
      style={combineStyle(
        {
          "max-width": local["max-width"],
        },
        local.style,
      )}
      {...others}
    >
      {local.children}
    </div>
  )
}

Plug.Container = Container
Plug.Action = Action
Plug.Icon = Icon
Plug.Card = Card

export default Plug
