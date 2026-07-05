import { createContext } from "solid-js"

const ViewContext = createContext<{
  getActive: () => string
}>()

export default ViewContext
