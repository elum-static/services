import style from "./Range.module.css"
import { Input, Icon } from "./addons"

import { type JSX, type Component, splitProps } from "solid-js"

interface Range extends JSX.HTMLAttributes<HTMLDivElement> {}

type ComponentRange = Component<Range> & {
  Input: typeof Input
  Icon: typeof Icon
}

const Range: ComponentRange = (props) => {
  const [local, others] = splitProps(props, ["class", "classList", "children"])

  return (
    <div
      class={style.Range}
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

Range.Input = Input
Range.Icon = Icon

export default Range
