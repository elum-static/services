import style from "./After.module.css"

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

interface After extends ButtonProps {
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

type ComponentAfter = Component<After> & {
  Content: typeof Content
}
/** кешируем */
const defaultFullActivated = clamp(window.innerWidth * 0.6, 0, 500)

const After: ComponentAfter = (props) => {
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
      "after",
      local.onExpand,
      local.onExpandComplete,
    )
    context?.setFullActivated("after", local.expandThreshold)
    context?.setRef("after", ref)
  })

  return (
    <Button
      ref={ref!}
      class={style.After}
      classList={{
        [style["After--hidden"]]: !context?.getVisible(),
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

After.Content = Content

export default After
