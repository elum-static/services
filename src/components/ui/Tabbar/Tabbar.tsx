import style from "./Tabbar.module.css"

import { createStore } from "solid-js/store"
import Button from "./addons/Button/Button"

import Flex, { FlexProps } from "@ui/Template/Flex/Flex"

import { type Component, mergeProps, splitProps, useContext, createEffect } from "solid-js"
import Events from "@ui/Template/Events/Events"
import TabbarRootContext from "./TabbarRoot.context"
import Provider from "./addons/Provider/Provider"

interface InterfaceTabbar extends FlexProps {}

type ComponentTabbar = Component<InterfaceTabbar> & {
  Provider: typeof Provider
  Button: typeof Button
}

type Store = {
  widthBackground: number
  buttons: Record<
    string,
    {
      ref: HTMLButtonElement
      bounding: DOMRect
      triggerSelected: () => void
    }
  >
  left: number
  anim: boolean
  selected?: boolean
  transform: {
    animTouch: boolean
    anim: boolean
    x: number
    y: number

    maxLeft: number
  }
}

const Tabbar: ComponentTabbar = (props) => {
  const tabbarRootContext = useContext(TabbarRootContext)

  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "onTransitionEnd"])

  let ref: HTMLSpanElement
  let refIn: HTMLSpanElement

  createEffect(() => {
    tabbarRootContext?.setTabbarSize(refIn!?.clientWidth || 0, ref!?.clientHeight || 0)
  })

  return (
    <Events
      ref={ref! as unknown as any}
      class={style.Tabbar}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      tappable={false}
      style={{
        "--height": `${tabbarRootContext?.getTabbarHeight() || 0}px`,
      }}
      {...others}
    >
      <Flex ref={refIn! as unknown as any} class={style.Tabbar__in} direction={"row"}>
        {local.children}
      </Flex>
    </Events>
  )
}

Tabbar.Button = Button
Tabbar.Provider = Provider

export default Tabbar
