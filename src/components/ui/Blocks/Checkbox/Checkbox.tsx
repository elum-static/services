import style from "./Checkbox.module.css"

import Events from "@ui/Template/Events/Events"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { DynamicProps } from "solid-js/web"
import { IconCheck } from "src/source"

interface Checkbox extends JSX.HTMLAttributes<DynamicProps<"button">> {
  selected?: boolean
}

const Checkbox: Component<Checkbox> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "selected"])

  return (
    <Events
      tappable={false}
      class={style.Checkbox}
      classList={{
        [style["Checkbox--selected"]]: local.selected,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <span class={style.Checkbox__check}>
        <IconCheck />
      </span>
    </Events>
  )
}

export default Checkbox
