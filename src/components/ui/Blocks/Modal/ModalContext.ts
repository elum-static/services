import { createContext } from "solid-js"

const ModalContext = createContext<{
  getIsFull: () => boolean
}>()

export default ModalContext
