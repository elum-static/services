import { createContext } from "solid-js"

type TabbarRootProps = {
  getTabbarHeight: () => number
  getTabbarWidth: () => number
  setTabbarSize: (width: number, height: number) => void
}

const TabbarRootContext = createContext<TabbarRootProps>()

export default TabbarRootContext
