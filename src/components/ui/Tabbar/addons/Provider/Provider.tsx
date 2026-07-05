import style from "./Provider.module.css"

import TabbarRootContext from "@ui/Tabbar/TabbarRoot.context"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { createStore } from "solid-js/store"

interface Provider extends JSX.HTMLAttributes<HTMLDivElement> {}

const Provider: Component<Provider> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  const [store, setStore] = createStore({
    width: 0,
    height: 0,
  })

  const setTabbarSize = (width: number, height: number) => {
    setStore({ width, height })
  }

  const getTabbarHeight = () => {
    return store.height
  }
  const getTabbarWidth = () => {
    return store.width
  }

  return (
    <TabbarRootContext.Provider value={{ setTabbarSize, getTabbarWidth, getTabbarHeight }}>
      {local.children}
    </TabbarRootContext.Provider>
  )
}

export default Provider
