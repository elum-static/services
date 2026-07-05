import {
  type JSX,
  type Component,
  Show,
  createEffect,
  onMount,
  onCleanup,
  splitProps,
} from "solid-js"

import Flex, { type FlexProps } from "@ui/Template/Flex/Flex"

import style from "./AspectRation.module.css"
import { createStore } from "solid-js/store"
import { type DynamicProps } from "solid-js/web"

interface IAspectRation extends FlexProps {
  width: number
  height: number

  footer?: JSX.Element

  /**
   * Выключение aspect ration
   */
  disabled?: boolean
}

const AspectRation: Component<IAspectRation> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "classList",
    "children",
    "width",
    "height",
    "footer",
    "disabled",
  ])

  let container: HTMLDivElement

  const [store, setStore] = createStore({
    width: 0,
    height: 0,
  })

  const handlerResize = () => {
    if (container!) {
      var containerWidth = container.clientWidth
      const containerHeight = container.clientHeight

      if (!containerWidth) containerWidth = containerHeight

      const newHeight = (containerWidth * local.height) / local.width

      if (newHeight > containerHeight) {
        const newWidth = (containerHeight * local.width) / local.height
        setStore({
          width: newWidth,
          height: containerHeight,
        })
        return
      }

      setStore({
        width: containerWidth,
        height: newHeight,
      })
      return
    }
  }

  createEffect(() => handlerResize())

  onMount(() => {
    window.addEventListener("resize", handlerResize, { passive: true })

    onCleanup(() => {
      window.removeEventListener("resize", handlerResize)
    })
  })

  return (
    <Flex
      ref={container! as unknown as DynamicProps<"div">}
      class={style.AspectRation}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      {/* <div className={style.AspectRation__before}>{before}</div> */}
      <span
        class={style.AspectRation__in}
        style={
          local.disabled
            ? {}
            : {
                width: store.width + "px",
                height: store.height + "px",
              }
        }
      >
        <Show when={store.width && store.height}>{local.children}</Show>
      </span>
      {local.footer}
    </Flex>
  )
}

export default AspectRation
