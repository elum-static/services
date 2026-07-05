import { createContext } from "solid-js"

const PanelContext = createContext<{
  setHeader: (status: boolean) => void
  setSize: (width: number, height: number) => void
  getHeaderSize: () => {
    width: number
    height: number
  }
  getSafeZone: () => {
    top?: boolean
    bottom?: boolean
  }
}>()

export default PanelContext
