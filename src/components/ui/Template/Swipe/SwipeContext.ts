import { createContext } from "solid-js"

const SwipeContext = createContext<{
  getVisible: () => boolean
  setClose: () => void
  setFullActivateCallback: (
    type: "before" | "after",
    cb?: (status: boolean) => void,
    cbEnd?: () => void,
  ) => void
  setFullActivated: (type: "before" | "after", width: number) => void
  setRef: (type: "before" | "after", ref: HTMLDivElement) => void
  setContentWidth: (type: "before" | "after", width: number) => void
}>()

export default SwipeContext
