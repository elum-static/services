import style from "./Action.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Action extends JSX.HTMLAttributes<HTMLDivElement> {
  stretched?: boolean
}

const Action: Component<Action> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "stretched",
  ])

  return (
    <div
      class={style.Action}
      classList={{
        [style[`Action--stretched`]]: local.stretched,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default Action
