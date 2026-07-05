import { styles } from "./styles"

import useStyle from "@ui/utils/useStyle"
import Flex, { FlexProps } from "@ui/Template/Flex/Flex"

import { type Component, mergeProps, splitProps } from "solid-js"

interface Card extends FlexProps {}

const Card: Component<Card> = (props) => {
  const style = useStyle(styles)

  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <Flex
      class={style.Card}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Flex>
  )
}

export default Card
