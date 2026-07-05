import { createContext } from "solid-js"

const PanelContainerContext = createContext<{
  setStatusScroll: (status: boolean) => void
  getStatusScroll: () => boolean
}>()

export default PanelContainerContext
