import { createContext } from "solid-js"

type TabbarContext = {
  updateButton: (key: string, ref: HTMLButtonElement, triggerSelected: () => void) => void
  updateSelect: (key: string, anim: boolean) => void
  updateTransform: (key: string, x: number, y: number, end: boolean) => void
}

const TabbarContext = createContext<TabbarContext>()

export default TabbarContext
