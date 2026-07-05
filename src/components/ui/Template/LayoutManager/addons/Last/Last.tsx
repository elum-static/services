import style from "./Last.module.css"

import { type JSX, type Component } from "solid-js"
import { CreateElement } from ".."

interface Last extends JSX.HTMLAttributes<HTMLDivElement> {}

const Last: Component<Last> = (props) => {
  return <CreateElement type={"last"} {...props} />
}

export default Last
