import style from "./Button.module.css"
import { type Component, mergeProps, splitProps } from "solid-js"

import ElButton, { type ButtonProps } from "@ui/Blocks/Button/Button"

interface Button extends ButtonProps {
  selected?: boolean
}

const Button: Component<Button> = (props) => {
  const merged = mergeProps({ stretched: true, selected: false }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "selected",
  ])

  return (
    <ElButton
      class={style.Button}
      classList={{
        [style["Button--selected"]]: local.selected,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      size={"large"}
      mode={"ghost"}
      appearance={"secondary"}
      {...others}
    >
      {local.children}
    </ElButton>
  )
}

export default Button
