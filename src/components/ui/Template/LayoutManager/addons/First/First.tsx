import style from "./First.module.css"

import { type JSX, type Component } from "solid-js"
import { CreateElement } from ".."

interface First extends JSX.HTMLAttributes<HTMLDivElement> {}

const First: Component<First> = (props) => {
  return <CreateElement type={"first"} {...props} />
}

export default First
