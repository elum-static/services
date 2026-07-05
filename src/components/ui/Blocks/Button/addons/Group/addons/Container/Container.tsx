import Flex, { FlexProps } from "@ui/Template/Flex/Flex"
import { styles } from "./styles"

import { type Platform } from "@ui/Types"
import useStyle from "@ui/utils/useStyle"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Container extends FlexProps {
  overflow?: boolean
}

const Container: Component<Container> = (props) => {
  const style = useStyle(styles)
  const merged = mergeProps({ direction: "row", overflow: true }, props) as Container
  const [local, others] = splitProps(merged, ["class", "classList", "children", "overflow"])

  return (
    <Flex
      class={style.Container}
      classList={{
        [style[`Container--overflow`]]: !!local.overflow,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Flex>
  )
}

export default Container
