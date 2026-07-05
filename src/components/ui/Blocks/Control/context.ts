import { createContext } from "solid-js"

type Context = {
  safeBottom?: boolean
}

const ControlContext = createContext<Context>()

export default ControlContext
