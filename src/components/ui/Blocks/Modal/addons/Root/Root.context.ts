import { createContext } from "solid-js"

const RootContext = createContext<{
  onClose: (nav: string) => boolean
}>()

export default RootContext
