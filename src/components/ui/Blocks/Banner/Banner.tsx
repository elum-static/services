import Flex, { FlexProps } from "@ui/Template/Flex/Flex"
import style from "./Banner.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  Show,
} from "solid-js"

interface Banner extends JSX.HTMLAttributes<HTMLDivElement> {
  subTitle?: JSX.Element
  bottom?: JSX.Element
  after?: JSX.Element

  bgColor?: "gradient-1" | "gradient-2"

  align?: FlexProps["align"]
}

const Banner: Component<Banner> = (props) => {
  const merged = mergeProps({ align: "center" }, props) as Banner
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "subTitle",
    "bottom",
    "after",
    "bgColor",
    "align",
  ])

  return (
    <div
      class={style.Banner}
      classList={{
        [style[`Banner__bgColor--${local.bgColor}`]]: !!local.bgColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Flex class={style.Banner__in} direction={"row"} align={local.align}>
        <Flex class={style.Banner__content} align={"start"}>
          <Show keyed when={local.children}>
            {(children) => <span class={style.Banner__title}>{children}</span>}
          </Show>
          <Show keyed when={local.subTitle}>
            {(subTitle) => (
              <span class={style.Banner__subTitle}>{subTitle}</span>
            )}
          </Show>
          <Show keyed when={local.bottom}>
            {(bottom) => <span class={style.Banner__bottom}>{bottom}</span>}
          </Show>
        </Flex>
        <Show keyed when={local.after}>
          {(after) => <span class={style.Banner__after}>{after}</span>}
        </Show>
      </Flex>
    </div>
  )
}

export default Banner
