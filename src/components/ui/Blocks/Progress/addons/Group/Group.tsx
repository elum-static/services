import style from "./Group.module.css"

import Flex, { type FlexProps } from "@ui/Template/Flex/Flex"

import { type Component, mergeProps, splitProps } from "solid-js"

interface Group extends FlexProps {
  padding?: "default" | "none"
}

const Group: Component<Group> = (props) => {
  const merged = mergeProps(
    {
      direction: "row",
    },
    props,
  ) as Group
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "padding",
  ])

  return (
    <Flex
      class={style.Group}
      classList={{
        [style[`Group__padding--${local.padding}`]]: !!local.padding,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Flex>
  )
}

export default Group
