import { createStore, produce } from "solid-js/store"
import HeaderContext, { HeaderContextProps } from "../../Header.context"
import style from "./Group.module.css"
import { type JSX, type Component, mergeProps, splitProps, Show } from "solid-js"

interface Group extends JSX.HTMLAttributes<HTMLDivElement> {
  onlyContent?: boolean
}

type StoreContext = {
  elements: Array<Parameters<HeaderContextProps["init"]>["0"]>
  isBefore: boolean
  isAfter: boolean
}

const Group: Component<Group> = (props) => {
  const merged = mergeProps({ onlyContent: false }, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "onlyContent"])

  /* context */
  const [storeContext, setStoreContext] = createStore<StoreContext>({
    elements: [],
    isBefore: false,
    isAfter: false,
  })

  const init = (grid: Parameters<HeaderContextProps["init"]>["0"]) => {
    const position = storeContext.elements.length

    setStoreContext(
      produce((store) => {
        store.elements[position] = grid

        store.isBefore = !!store.elements.find((x) => x === "before")
        store.isAfter = !!store.elements.find((x) => x === "after")

        if (local.onlyContent) {
          store.isBefore = true
          store.isAfter = true
        }
        return store
      }),
    )

    const cleanup = () => {
      setStoreContext(
        produce((store) => {
          store.elements.splice(0, position)

          return store
        }),
      )
    }

    const autoIndex = storeContext.elements.indexOf("content")
    return {
      cleanup,
      isLast: autoIndex !== -1,
    }
  }

  return (
    <div
      class={style.Group}
      classList={{
        _Group: true,
        [style[`Group--onlyContent`]]: !!local.onlyContent,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <HeaderContext.Provider
        value={{
          init,
        }}
      >
        <Show when={!storeContext.isBefore}>
          <span />
        </Show>
        {local.children}
        <Show when={!storeContext.isAfter}>
          <span />
        </Show>
      </HeaderContext.Provider>
    </div>
  )
}

export default Group
