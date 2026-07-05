import { createContext } from "solid-js"

const RootContext = createContext<{
  setTransitionRatio: (value: number, anim: boolean) => void
  getActive: () => string
  getSkipAnimation: () => boolean
}>()

export default RootContext
