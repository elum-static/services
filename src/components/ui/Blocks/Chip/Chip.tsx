import style from "./Chip.module.css"
import { Content, Group } from "./addons"

import Button, { type ButtonProps } from "../Button/Button"

import { type Component, mergeProps, splitProps } from "solid-js"

interface Chip extends ButtonProps {
  selected?: boolean
}

type ComponentChip = Component<Chip> & {
  Group: typeof Group
  Icon: typeof Button.Icon
  Content: typeof Content
}

const Chip: ComponentChip = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "selected",
  ])

  return (
    <Button
      class={style.Chip}
      appearance={local.selected ? "accent" : "secondary"}
      mode={local.selected ? "filled" : "soft"}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      type={"icon"}
      size={"medium"}
      border={"pill"}
      minActiveTime={100}
      {...others}
    >
      {local.children}
    </Button>
  )
}

Chip.Group = Group
Chip.Icon = Button.Icon
Chip.Content = Content

export default Chip
