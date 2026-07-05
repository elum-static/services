import style from "./Content.module.css"
import { Background } from "./addons"

import HeaderContext from "../../Header.context"

import {
  type Component,
  mergeProps,
  splitProps,
  useContext,
  onMount,
  onCleanup,
  createSignal,
  For,
} from "solid-js"

import Flex, { type FlexProps } from "@ui/Template/Flex/Flex"
import useSafeHeader from "@ui/utils/useSafeHeader"

interface Content extends FlexProps {
  type?: "before" | "after" | "content"
}

type ComponentContent = Component<Content> & {
  Background: typeof Background
}

const Content: ComponentContent = (props) => {
  const contextHeader = useContext(HeaderContext)

  const merged = mergeProps({ direction: "column", type: "center" }, props) as Content
  const [local, others] = splitProps(merged, ["class", "classList", "children", "type"])

  onMount(() => {
    const init = contextHeader?.init(local.type)

    onCleanup(() => {
      init?.cleanup()
    })
  })

  return (
    <Flex
      class={style.Content}
      classList={{
        [style[`Content__type--${local.type}`]]: !!local.type,
        [`_Content__direction--${others.direction}`]: !!others.direction,
        _HeaderContent: true,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      justify={
        others.direction === "row" ? (local.type === "before" ? "start" : "end") : others.justify
      }
      align={
        others.direction === "column" ? (local.type === "before" ? "start" : "end") : others.align
      }
      {...others}
    >
      {local.children}
    </Flex>
  )
}

Content.Background = Background

export default Content
