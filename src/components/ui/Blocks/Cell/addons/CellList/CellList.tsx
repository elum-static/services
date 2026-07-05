import style from "./CellList.module.css"

import { type JSX, type Component, splitProps } from "solid-js"

interface CellList extends JSX.HTMLAttributes<HTMLElement> {}

const CellList: Component<CellList> = (props) => {
  const [local, others] = splitProps(props, ["class", "classList", "children"])
  return (
    <section
      class={style.CellList}
      classList={{
        ...local.classList,
        [`${local.class}`]: !!local.class,
      }}
      {...others}
    >
      {local.children}
    </section>
  )
}

export default CellList
