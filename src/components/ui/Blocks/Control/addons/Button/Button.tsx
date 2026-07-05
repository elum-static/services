import style from "./Button.module.css"

import ElButton, { type ButtonProps } from "@ui/Blocks/Button/Button"

import { type Component, mergeProps, splitProps, useContext } from "solid-js"
import ControlContext from "../../context"

interface Button extends ButtonProps {}

const Button: Component<Button> = (props) => {
  const context = useContext(ControlContext)

  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <ElButton
      class={style.Button}
      classList={{
        [style.Button__safeBottom]: context?.safeBottom,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </ElButton>
  )
}

export default Button
