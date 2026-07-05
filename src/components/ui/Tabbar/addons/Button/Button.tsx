import style from "./Button.module.css"

import Events, { EventsProps } from "../../../Template/Events/Events"

import { type JSX, type Component, mergeProps, splitProps, createUniqueId } from "solid-js"

interface Button extends Omit<EventsProps<"button">, "children"> {
  children?: JSX.Element | ((selected: boolean) => JSX.Element)
  selected?: boolean
}

const Button: Component<Button> = (props) => {
  const merged = mergeProps({ selected: false }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "selected",
    "onClick",
    "onChange",
  ])

  let ref: HTMLButtonElement

  return (
    <Events
      ref={ref! as unknown as any}
      component={"button"}
      class={style.Button}
      classList={{
        [style["Button--selected"]]: local.selected,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onClick={local.onClick}
      tappable={false}
      {...others}
    >
      {typeof local.children === "function" ? local.children(local.selected) : local.children}
    </Events>
  )
}

export default Button
