import style from "./Before.module.css"

import SwipeContext from "../../SwipeContext"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  useContext,
  createEffect,
  batch,
  Show,
} from "solid-js"
import { Content } from "./addons"
import { clamp } from "@minsize/utils"
import Button, { type ButtonProps } from "@ui/Blocks/Button/Button"

interface Before extends ButtonProps {
  /**
   * Порог ширины (в пикселях), при достижении которого элемент
   * автоматически растягивается на всю доступную ширину.
   *
   * @default clamp(window.innerWidth * 0.6, 0, 500)
   */
  expandThreshold?: number

  /**
   * Срабатывает, когда элемент был растянут до expandThreshold
   * и перешёл в "развёрнутое" состояние
   */
  onExpand?: (status: boolean) => void

  /**
   * Срабатывает, когда пользователь отпускает элемент
   * в развёрнутом состоянии (после достижения expandThreshold)
   */
  onExpandComplete?: () => void
}

type ComponentBefore = Component<Before> & {
  Content: typeof Content
}
/** кешируем */
const defaultFullActivated = clamp(window.innerWidth * 0.6, 0, 500)

const Before: ComponentBefore = (props) => {
  const context = useContext(SwipeContext)

  const merged = mergeProps({ expandThreshold: defaultFullActivated }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "expandThreshold",
    "onExpand",
    "onExpandComplete",
    "onClick",
  ])

  var ref: HTMLDivElement

  createEffect(() => {
    context?.setFullActivateCallback(
      "before",
      local.onExpand,
      local.onExpandComplete,
    )
    context?.setFullActivated("before", local.expandThreshold)
    context?.setRef("before", ref)
  })

  return (
    <Button
      ref={ref!}
      class={style.Before}
      classList={{
        [style["Before--hidden"]]: !context?.getVisible(),
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onClick={(event) => {
        context?.setClose?.()
        ;(local.onClick as any)?.(event)
      }}
      {...others}
    >
      <Show when={context?.getVisible()}>{local.children}</Show>
    </Button>
  )
}

Before.Content = Content

export default Before
