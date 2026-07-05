import { createStore, produce } from "solid-js/store"
import style from "./List.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import ListContext from "./ListContext"

interface List extends JSX.HTMLAttributes<HTMLDivElement> {}

type Store = {
  hidden: number[]
  anim: boolean
  blocks: { id: number; height: number }[]
}

const List: Component<List> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  const [store, setStore] = createStore<Store>({
    hidden: [],
    anim: false,
    blocks: [],
  })

  const setHidden = (index: number, height: number) => {
    setStore(
      produce((store) => {
        store.hidden.push(index)
        store.anim = true
        return store
      }),
    )
  }

  const getTransformY = (id: number): boolean => {
    if (store.hidden.length === 0) return false

    const index = store.blocks.findIndex((x) => x.id === id)
    if (index === -1) {
      return false
    }

    var indexTwo = -1

    for (const id of store.hidden) {
      const index = store.blocks.findIndex((x) => x.id === id)
      if (index !== -1) {
        if (index > indexTwo) {
          indexTwo = index
        }
      }
    }
    if (indexTwo === -1) {
      return false
    }

    return index >= indexTwo
  }

  const getAnim = () => {
    return store.anim
  }

  const setBlock = (index: number, height: number) => {
    setStore(
      produce((store) => {
        store.blocks.push({ id: index, height })

        return store
      }),
    )
  }

  const setHiddenEnd = (id: number) => {
    setStore(
      produce((store) => {
        store.hidden = []
        store.anim = false
        return store
      }),
    )
  }

  return (
    <div
      class={style.List}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <ListContext.Provider
        value={{ setBlock, getAnim, setHidden, setHiddenEnd, getTransformY }}
      >
        {local.children}
        {/* <span
          class={style.List__block}
          style={{
            height: store.blockHeight + "px",
          }}
        /> */}
      </ListContext.Provider>
    </div>
  )
}

export default List
