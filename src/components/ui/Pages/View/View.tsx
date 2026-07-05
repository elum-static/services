import { styles } from "./styles"
import { Action, Path } from "./addons"

import { type HTMLAttributes } from "@ui/Types"
import useStyle from "@ui/utils/useStyle"
import LayoutManager from "@ui/Template/LayoutManager/LayoutManager"
import ActionContext from "../Root/addons/Action/ActionContext"

import { type Component, splitProps, useContext } from "solid-js"
import ViewContext from "./ViewContext"
import { createStore } from "solid-js/store"

export interface InterfaceView extends HTMLAttributes<HTMLDivElement> {
  nav: string
  activePanel: string
}

type ComponentView = Component<InterfaceView> & {
  Action: typeof Action
  Path: typeof Path
}

const View: ComponentView = (props) => {
  const context = useContext(ActionContext)

  const style = useStyle(styles)
  const [local, others] = splitProps(props, [
    "class",
    "classList",
    "platform",
    "children",
    "nav",
    "activePanel",
  ])

  const getActive = () => {
    return local.activePanel
  }

  return (
    <ViewContext.Provider value={{ getActive }}>
      <LayoutManager
        key={"view"}
        class={style.View}
        classList={{
          // [style.View__keyboard]: keyboard().touch,

          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        active={local.activePanel}
        elements={local.children}
        styles={{
          firstIndex: style[`View--index-1`],
          lastIndex: style[`View--index-2`],
          firstElement: style[`View--first`],
          lastElement: style[`View--last`],
          next: style[`View--to-next`],
          back: style[`View--to-back`],
        }}
        onAnimEnd={() => context?.onAnimEnd?.(local.nav)}
        {...others}
      >
        <LayoutManager.Last class={style.View__Container} />
        <LayoutManager.First class={style.View__Container} />
      </LayoutManager>
    </ViewContext.Provider>
  )
}

View.Path = Path
View.Action = Action

export default View
