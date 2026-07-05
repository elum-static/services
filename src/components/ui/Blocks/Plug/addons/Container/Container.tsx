import style from "./Container.module.css"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Container extends JSX.HTMLAttributes<HTMLDivElement> {
  stretched?: boolean
}

const Container: Component<Container> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "stretched",
  ])

  return (
    <div
      class={style.Content}
      classList={{
        [style["Content--stretched"]]: !!local.stretched,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

export default Container
