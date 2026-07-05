import { styles } from "./styles"
import { Container, Icon, IconFile, Modal, Textarea } from "./addons"

import useStyle from "@ui/utils/useStyle"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import WritebarContext from "./WritebarContext"
import { createStore } from "solid-js/store"

interface WriteBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
  onBlur?: () => void
}

type ComponentWritebar = Component<WriteBarProps> & {
  Modal: typeof Modal
  Container: typeof Container
  Textarea: typeof Textarea
  Icon: typeof Icon
  IconFile: typeof IconFile
}

type Store = {
  focus: boolean
}

const Writebar: ComponentWritebar = (props) => {
  const style = useStyle(styles)
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "onBlur"])

  const [store, setStore] = createStore<Store>({
    focus: false,
  })

  /* Context */
  const setFocus = (status: boolean) => {
    setStore("focus", status)
    if (!status) {
      local.onBlur?.()
    }
  }

  return (
    <div
      class={style.WriteBar}
      classList={{
        [style["focus"]]: store.focus,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <WritebarContext.Provider
        value={{
          setFocus,
        }}
      >
        {local.children}
      </WritebarContext.Provider>
    </div>
  )
}

Writebar.Modal = Modal
Writebar.Container = Container
Writebar.Textarea = Textarea
Writebar.Icon = Icon
Writebar.IconFile = IconFile

export default Writebar
