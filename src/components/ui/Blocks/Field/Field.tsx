import { styles } from "./styles"
import { Input, Textarea } from "./addons"

import { type HTMLAttributes } from "@ui/Types"
import useStyle from "@ui/utils/useStyle"

import { type Component, JSX, mergeProps, Show, splitProps } from "solid-js"
import Flex, { FlexProps } from "@ui/Template/Flex/Flex"

interface Field extends FlexProps {
  bgColor?: "background_secondary" | "transparent"

  header?: JSX.Element

  inDirection?: "column" | "row"
}

type ComponentField = Component<Field> & {
  Textarea: typeof Textarea
  Input: typeof Input
}

const Field: ComponentField = (props) => {
  const style = useStyle(styles)
  const merged = mergeProps({ bgColor: "background_secondary", inDirection: "row" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "bgColor",
    "header",

    "inDirection",
  ])

  return (
    <Flex
      class={style.Field}
      classList={{
        [style[`Field__backgroundColor--${local.bgColor}`]]: !!local.bgColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Show keyed when={local.header}>
        {(header) => <span class={style.Field__header}>{header}</span>}
      </Show>
      <Flex
        justify={"center"}
        align={"center"}
        direction={local.inDirection}
        class={style.Field__in}
        classList={{
          _Field__in: true,
        }}
      >
        {local.children}
      </Flex>
    </Flex>
  )
}

Field.Textarea = Textarea
Field.Input = Input

export default Field
