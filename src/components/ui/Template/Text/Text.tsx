import { styles } from "./styles"
import { Badge, Content } from "./addons"

import useStyle from "@ui/utils/useStyle"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import combineStyle from "@ui/utils/combineStyle"

export interface Text extends JSX.HTMLAttributes<HTMLSpanElement> {
  /**
   * Цвет текста.
   */
  color?:
    | "accent"
    | "accent--light"
    | "primary"
    | "secondary"
    | "inherit"
    | "red"
    | "green"
    | "yellow"
  /**
   * Размер текста.
   */
  size?: "xx-small" | "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large" | "inherit"
  /**
   * Жирность шрифта.
   */
  weight?: "400" | "500" | "600" | "700"
  /**
   * Выравнивание текста.
   */
  align?: "start" | "center" | "end" | "inherit"
  justify?: "start" | "center" | "end"

  nowrap?: boolean
  breakSpaces?: boolean
  overflow?: boolean
  inline?: boolean

  gap?: "medium" | "small"

  lineClamp?: number
}

type ComponentText = Component<Text> & {
  Content: typeof Content
  Badge: typeof Badge
}

const Text: ComponentText = (props) => {
  const style = useStyle(styles)

  const merged = mergeProps(
    {
      color: "primary",
      size: "medium",
      weight: 400,
      align: "start",
      justify: "center",
      gap: "medium",
      inline: false,
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "nowrap",
    "overflow",
    "align",
    "color",
    "size",
    "weight",
    "breakSpaces",
    "gap",
    "inline",
    "lineClamp",
    "style",
    "justify",
  ])

  return (
    <span
      class={style.Text}
      classList={{
        [style[`Text__color--${local.color}`]]: !!local.color,
        [style[`Text__size--${local.size}`]]: !!local.size,
        [style[`Text__weight--${local.weight}`]]: !!local.weight,
        [style[`Text__align--${local.align}`]]: !!local.align,
        [style[`Text__justify--${local.justify}`]]: !!local.justify,
        [style[`Text__gap--${local.gap}`]]: !!local.gap,
        [style[`Text--lineClamp`]]: !!local.lineClamp,

        [style[`Text--inline`]]: local.inline,
        [style[`Text__whiteSpace--nowrap`]]: local.nowrap,
        [style[`Text__whiteSpace--breakSpaces`]]: local.breakSpaces,
        [style[`Text--overflow`]]: local.overflow,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      style={combineStyle(local.style, {
        "-webkit-line-clamp": local.lineClamp,
      })}
    >
      {local.children}
    </span>
  )
}

Text.Content = Content
Text.Badge = Badge

export default Text
