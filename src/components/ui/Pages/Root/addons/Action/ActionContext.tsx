import { createContext, JSX } from "solid-js"

const ActionContext = createContext<{
  bar?: () => JSX.Element
  onAnimEnd?: (active: string) => void
  // setStatusBar?: (status: boolean, active: string) => void
  setBarSettings?: (activePanel: string, panels: string[]) => void

  getIsBar: () => boolean
}>()

export default ActionContext
