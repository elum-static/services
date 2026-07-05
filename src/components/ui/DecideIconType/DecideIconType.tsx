import { random } from "@minsize/utils"
import style from "./DecideIconType.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  Switch,
  JSXElement,
  Show,
} from "solid-js"

interface DecideIconType extends JSX.HTMLAttributes<HTMLDivElement> {
  before: () => JSXElement
  afters: Array<() => JSXElement>
}

const DecideIconType: Component<DecideIconType> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "before", "afters"])

  return (
    <Show
      when={random(0, 100) <= 50}
      fallback={local.afters?.[random(0, local.afters.length - 1)]?.()}
    >
      {local.before()}
    </Show>
  )
}

export default DecideIconType
