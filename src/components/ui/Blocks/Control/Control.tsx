import { styles } from "./styles"
import { Button } from "./addons"

import ControlContext from "./context"
import useStyle from "@ui/utils/useStyle"

import { type JSX, type Component, splitProps } from "solid-js"

interface Control extends JSX.HTMLAttributes<HTMLDivElement> {
  safeBottom?: boolean
}

type ComponentControl = Component<Control> & {
  Button: typeof Button
}

const Control: ComponentControl = (props) => {
  const style = useStyle(styles)
  const [local, others] = splitProps(props, ["children", "safeBottom"])
  return (
    <div {...others} class={style.Control}>
      <ControlContext.Provider value={{ safeBottom: local.safeBottom }}>
        {local.children}
      </ControlContext.Provider>
    </div>
  )
}

Control.Button = Button

export default Control
