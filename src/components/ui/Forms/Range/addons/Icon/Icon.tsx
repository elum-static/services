import style from "./Icon.module.css"

import { type JSX, type Component, splitProps } from "solid-js"

interface Icon extends JSX.HTMLAttributes<HTMLDivElement> {}

const Icon: Component<Icon> = (props) => {
  const [local, others] = splitProps(props, ["class", "classList", "children"])

  return (
    <div
      class={style.Icon}
      classList={{
        ...local.classList,
        [`${local.class}`]: !!local.class,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default Icon
