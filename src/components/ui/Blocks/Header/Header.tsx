import style from "./Header.module.css"
import { BackButton, Content, Group } from "./addons"
import useSafeHeader from "@ui/utils/useSafeHeader"

import ModalContext from "../Modal/ModalContext"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  useContext,
  onMount,
  onCleanup,
  createSignal,
} from "solid-js"
import PanelContext from "@ui/Pages/Panel/Panel.context"
import { Status } from "@elum/ews"
import combineStyle from "@ui/utils/combineStyle"

interface Header extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: "panel" | "modal"
  fallbackConnection?: JSX.Element

  bgColor?: "auto" | "black" | "background_secondary" | "transparent"

  shadow?: boolean
}

type ComponentHeader = Component<Header> & {
  BackButton: typeof BackButton
  Content: typeof Content
  Group: typeof Group
}
/**
 * @example
 *
 *  <Header>
 *    <Header.Group>
 *      <Header.BackButton/>
 *      <Header.Content>
 *        <Header.Content.Background>
 *
 *        </Header.Content.Background>
 *      </Header.Content>
 *    </Header.Group>
 *  </Header>
 */
const Header: ComponentHeader = (props) => {
  const contextPanel = useContext(PanelContext)
  const context = useContext(ModalContext)
  const merged = mergeProps(
    {
      size: "default",
      type: "panel",
      bgColor: "auto",
      shadow: true,
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "size",
    "type",
    "fallbackConnection",
    "bgColor",
    "shadow",
    "style",
  ])

  let ref: HTMLDivElement

  const [height, setHeight] = createSignal(0)

  const safe = useSafeHeader()

  onMount(() => {
    if (local.type === "panel") {
      contextPanel?.setHeader(true)

      onCleanup(() => {
        contextPanel?.setHeader(false)
      })
    }
  })

  const updateSize = () => {
    setHeight(ref!?.clientHeight || 0)
    contextPanel?.setSize(ref!?.clientWidth || 0, ref!?.clientHeight || 0)
  }

  onMount(() => {
    updateSize()
    const resizeObserver = new ResizeObserver((entries) => {
      updateSize()
    })

    resizeObserver.observe(ref!)

    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  return (
    <div
      ref={ref!}
      class={style.Header}
      classList={{
        [style[`Header--shadow`]]: local.shadow,

        [style[`Header__bgColor--${local.bgColor}`]]: !!local.bgColor,
        [style[`Header__type--${local.type}`]]: !!local.type,
        [style[`Header__site--${safe.site}`]]: true,
        [style["Header__safe--top"]]: local.type === "modal" && context?.getIsFull(),
        [style["Header__safe--left"]]:
          local.type === "modal" ? context?.getIsFull() && safe.safeLeft : safe.safeLeft,
        [style["Header__safe--right"]]:
          local.type === "modal" ? context?.getIsFull() && safe.safeRight : safe.safeRight,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onTransitionEnd={() => updateSize()}
      style={combineStyle(
        {
          "--height": `${height()}px`,
        },
        local.style,
      )}
      {...others}
    >
      {local.children}

      {/* <Show keyed when={local.fallbackConnection}>
        {(fallbackConnection) => (
          <div
            class={style.Header__connection}
            classList={{
              [style["Header__connection--visible"]]: isFallback(),

              [style[`Header__type--${local.type}`]]: !!local.type,
              [style[`Header__site--${safe.site}`]]: true,
              [style["Header__safe--top"]]: local.type === "modal" && context?.getIsFull(),
              [style["Header__safe--left"]]:
                local.type === "modal" ? context?.getIsFull() && safe.safeLeft : safe.safeLeft,
              [style["Header__safe--right"]]:
                local.type === "modal" ? context?.getIsFull() && safe.safeRight : safe.safeRight,
            }}
          >
            {fallbackConnection}
          </div>
        )}
      </Show> */}
    </div>
  )
}
Header.Content = Content
Header.BackButton = BackButton
Header.Group = Group

export default Header
