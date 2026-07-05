import style from "./GamesItem.module.css"

import { type JSX, type Component, mergeProps, splitProps, Show } from "solid-js"

import { Events, Image } from "src/components/ui"
import { type EventsProps } from "src/components/ui/Template/Events/Events"

interface GamesItem extends EventsProps<"button"> {
  title: string
  subtitle: string
  type?: string

  layout?: 1 | 2 | 3 | 4 | 5

  backgroundPosition?: "start" | "center" | "end"
  backgroundUrl: string
  backgroundColor: string

  icon?: JSX.Element
}

const GamesItem: Component<GamesItem> = (props) => {
  const merged = mergeProps({ layout: 1, backgroundPosition: "center" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "title",
    "subtitle",
    "type",
    "layout",
    "backgroundUrl",
    "backgroundPosition",
    "backgroundColor",
    "icon",
  ])

  return (
    <Events
      class={style.GamesItem}
      classList={{
        [style[`GamesItem__layout-${local.layout}`]]: !!local.layout,
        [style[`GamesItem__backgroundPosition-${local.backgroundPosition}`]]:
          !!local.backgroundPosition,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      pressTransform
      tappable
      {...others}
    >
      <Image
        class={style.GamesItem__image}
        src={local.backgroundUrl}
        fallbackColor={local.backgroundColor}
      />
      <Show keyed when={local.icon}>
        {(icon) => <span class={style.GamesItem__icon}>{icon}</span>}
      </Show>
      <span class={style.GamesItem__title}>{local.title}</span>
      <span class={style.GamesItem__subtitle}>{local.subtitle}</span>
      <Show when={local.type}>
        <span class={style.GamesItem__type}>{local.type}</span>
      </Show>
    </Events>
  )
}

export default GamesItem
