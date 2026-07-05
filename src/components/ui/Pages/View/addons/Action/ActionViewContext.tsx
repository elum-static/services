import { createContext, JSX } from "solid-js"

const ActionViewContext = createContext<{
  getTabbarWidth: () => number
  getTabbarHeight: () => number
}>()

export default ActionViewContext
