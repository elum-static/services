import { styles } from "./styles"
import Button from "./addons/Button/Button"
import {
  type JSX,
  mergeProps,
  splitProps,
  For,
  Show,
  createEffect,
  onCleanup,
  onMount,
} from "solid-js"

import ElButton from "@ui/Blocks/Button/Button"
import Separator from "../Separator/Separator"
import { createStore } from "solid-js/store"
import useStyle from "@ui/utils/useStyle"
import Text from "@ui/Template/Text/Text"
import Flex from "@ui/Template/Flex/Flex"

type Elements = {
  title: string
  selected?: boolean
}
interface SegmentedControl<T extends Elements> extends JSX.HTMLAttributes<HTMLDivElement> {
  elements: Array<T>
  onElement: (element: T) => void
}

// type ComponentSegmentedControl = Component<SegmentedControl<Elements>> & {
//   Button: typeof Button
// }

const SegmentedControl = <T extends Elements>(props: SegmentedControl<T>) => {
  const style = useStyle(styles)
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "elements",
    "onElement",
  ])

  var ref: HTMLDivElement

  const [store, setStore] = createStore({
    selectedIndex: local.elements.findLastIndex((x) => !!x.selected) || 0,
    width: 0,
    anim: false,
  })

  const onResize = () => {
    setStore("width", ref!?.clientWidth || 0)
  }

  onMount(() => {
    onResize()
    window.addEventListener("resize", onResize)
    onCleanup(() => {
      window.removeEventListener("resize", onResize)
    })
  })

  const setSelected = (index: number) => {
    local.onElement(local.elements[index])
    setStore("selectedIndex", index)
  }

  return (
    <ElButton.Group
      class={style.SegmentedControl}
      classList={{
        [style["SegmentedControl--anim"]]: store.anim,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <ElButton.Group.Container ref={ref!} class={style.SegmentedControl__in}>
        <For each={local.elements}>
          {(element, index) => (
            <>
              <Button
                onClick={() => {
                  setStore("anim", true)
                  setSelected(index())
                }}
              >
                <Text align={"center"} color={"inherit"} nowrap overflow>
                  <Text.Content>{element.title}</Text.Content>
                </Text>
              </Button>
              <Show when={index() + 1 < local.elements.length}>
                <Separator class={style.SegmentedControl__separator} type={"vertical"} />
              </Show>
            </>
          )}
        </For>
        <span
          class={style.SegmentedControl__background}
          style={{
            width: `${100 / local.elements.length}%`,
            left: `${store.selectedIndex * (100 / local.elements.length)}%`,
          }}
        >
          <Flex
            style={{
              left: `${
                -store.width *
                ((local.elements.length - 1) / local.elements.length) *
                (store.selectedIndex / (local.elements.length - 1))
              }px`,
              right: `${
                -store.width *
                ((local.elements.length - 1) / local.elements.length) *
                (1 - store.selectedIndex / (local.elements.length - 1))
              }px`,
              "min-width": store.width + "px",
            }}
            class={style.SegmentedControl__background_in}
            direction={"row"}
          >
            <For each={local.elements}>
              {(element) => (
                <Button disabled={false} selected={true}>
                  <Text align={"center"} color={"inherit"} nowrap overflow>
                    <Text.Content>{element.title}</Text.Content>
                  </Text>
                </Button>
              )}
            </For>
          </Flex>
        </span>
      </ElButton.Group.Container>
    </ElButton.Group>
  )
}

SegmentedControl.Button = Button

export default SegmentedControl
