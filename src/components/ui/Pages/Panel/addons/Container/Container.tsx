import style from "./Container.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  onMount,
  useContext,
  createMemo,
  Show,
} from "solid-js"
import PanelContainerContext from "./PanelContext"
import { createStore } from "solid-js/store"
import ActionViewContext from "@ui/Pages/View/addons/Action/ActionViewContext"
import PanelContext from "../../Panel.context"
import combineStyle from "@ui/utils/combineStyle"

interface Container extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Включает вертикальный скролл внутри панели */
  scroll?: boolean

  /** Уникальный ключ для сохранения позиции скролла */
  scrollKey?: string

  bgColor?: "background_game_crush" | "background_secondary" | "background_game_mines"
}

type Store = {
  scrollDisabled: boolean
}

// Хранилище позиций скролла
const scrollPositions = new Map<string, number>()

const Container: Component<Container> = (props) => {
  const actionViewContext = useContext(ActionViewContext)
  const contextPanel = useContext(PanelContext)

  const merged = mergeProps({ scroll: true, bgColor: "background_secondary" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "scroll",
    "scrollKey",
    "bgColor",
    "style",
  ])

  const [store, setStore] = createStore<Store>({
    scrollDisabled: !local.scroll,
  })

  let ref: HTMLDivElement

  // Восстановление позиции скролла при монтировании
  onMount(() => {
    if (local.scrollKey && ref!) {
      const savedPosition = scrollPositions.get(local.scrollKey)
      if (savedPosition !== undefined) {
        ref.scrollTop = savedPosition
      }
    }
  })

  // Сохранение позиции скролла
  const handleScroll = () => {
    if (local.scrollKey && ref!) {
      const currentPosition = ref.scrollTop
      scrollPositions.set(local.scrollKey, currentPosition)
    }
  }

  /* Context */
  const setStatusScroll = (status: boolean) => {
    if (local.scroll) {
      setStore("scrollDisabled", !status)
    }
  }

  const paddingTop = createMemo(() => {
    const height = contextPanel?.getHeaderSize()?.height

    return height ? `${height}px` : undefined
  })

  const paddingBottom = createMemo(() => {
    const height = actionViewContext?.getTabbarHeight()

    return height ? `${height}px` : undefined
  })

  return (
    <div
      ref={ref!}
      class={style.Container}
      classList={{
        ["_panel_container"]: true,
        ["_visibleScroll"]: true,
        [style["Container--scroll-disabled"]]: store.scrollDisabled,
        [style["Container--scroll"]]: local.scroll,
        [style[`Container__bgColor--${local.bgColor}`]]: local.bgColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      style={combineStyle(
        {
          "padding-top": paddingTop(),
          // "padding-bottom": paddingBottom(),
        },
        local.style,
      )}
      onScroll={handleScroll}
      {...others}
    >
      {/* <Show when={contextPanel?.getSafeZone().top}>
        <span
          class={style.Container__safe}
          style={{ height: paddingTop(), "min-height": paddingTop() }}
        />
      </Show> */}
      <PanelContainerContext.Provider
        value={{
          setStatusScroll,
          getStatusScroll: () => store.scrollDisabled,
        }}
      >
        {local.children}
      </PanelContainerContext.Provider>
      <span
        class={style.Container__safe}
        style={{ height: paddingBottom(), "min-height": paddingBottom() }}
      />
    </div>
  )
}

export default Container
