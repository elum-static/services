import Button from "@ui/Blocks/Button/Button"
import style from "./Content.module.css"

import SwipeContext from "@ui/Template/Swipe/SwipeContext"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  createEffect,
  useContext,
} from "solid-js"

interface Content extends JSX.HTMLAttributes<HTMLDivElement> {}

const Content: Component<Content> = (props) => {
  const context = useContext(SwipeContext)
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  var ref: HTMLDivElement

  createEffect(() => {
    context?.setContentWidth?.("after", ref!?.clientWidth)
  })

  return (
    <Button.Content
      ref={ref!}
      class={style.Content}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </Button.Content>
  )
}

export default Content
