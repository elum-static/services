import { Flex, Lottie, type FlexProps } from "src/components/ui"
import style from "./Item.module.css"
import { type JSX, type Component, mergeProps, splitProps, Switch, Match } from "solid-js"
import { IconMine, IconStars } from "src/source"
import core from "src/core"

interface Item extends FlexProps {
  type: "idle" | "mine" | "success"
}

const Item: Component<Item> = (props) => {
  const merged = mergeProps({ type: "idle" }, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "type"])

  return (
    <Flex
      class={style.Item}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Switch>
        <Match when={local.type === "success"}>
          <Lottie data={core.files.getTGS("star")} size={"100%"} loop={false} />
        </Match>
        <Match when={local.type === "mine"}>
          <Lottie data={core.files.getTGS("mine")} size={"100%"} loop={false} />
        </Match>
        <Match when={local.type === "idle"}>
          <svg
            stroke="currentColor"
            fill="none"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="opacity-15 text-lg"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path>
          </svg>
        </Match>
      </Switch>
    </Flex>
  )
}

export default Item
