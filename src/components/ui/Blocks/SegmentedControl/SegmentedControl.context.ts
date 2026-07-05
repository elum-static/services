import { createContext } from "solid-js"

const SegmentedControlContext = createContext<{
  setSelected: (index: number) => void
}>()

export default SegmentedControlContext
