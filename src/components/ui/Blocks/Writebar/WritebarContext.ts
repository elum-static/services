import { createContext } from "solid-js"

const WritebarContext = createContext<{
  setFocus: (status: boolean) => void
}>()

export default WritebarContext
