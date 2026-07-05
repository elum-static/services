import style from "./Media.module.css"
import { Provider } from "./addons"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Media extends JSX.HTMLAttributes<HTMLDivElement> {}

type ComponentMedia = Component<Media> & {
  Provider: typeof Provider
}

const Media: ComponentMedia = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <div
      class={style.Test}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {local.children}
    </div>
  )
}

Media.Provider = Provider

export default Media
