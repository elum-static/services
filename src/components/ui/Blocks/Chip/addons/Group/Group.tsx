import Flex, { FlexProps } from "@ui/Template/Flex/Flex"
import style from "./Group.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Group extends FlexProps {}

const Group: Component<Group> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <Flex
      class={style.Group}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      justify={"start"}
      direction={"row"}
      wrap={"wrap"}
      {...others}
    >
      {local.children}
    </Flex>
  )
}

export default Group
