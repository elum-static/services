import { createContext } from "solid-js"

const ListContext = createContext<{
  setBlock?: (id: number, height: number) => void
  getAnim?: () => boolean
  setHidden?: (id: number, height: number) => void
  setHiddenEnd?: (id: number) => void
  getTransformY?: (id: number) => boolean
}>()

export default ListContext
