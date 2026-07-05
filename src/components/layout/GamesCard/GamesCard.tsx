import style from "./GamesCard.module.css"

import { type JSX, type Component, mergeProps, splitProps, Show } from "solid-js"

import { Events, Group, Image } from "src/components/ui"
import { type EventsProps } from "src/components/ui/Template/Events/Events"
import combineStyle from "src/components/ui/utils/combineStyle"

interface GamesCard extends EventsProps<"button"> {
  backgroundUrlStub: string
  backgroundUrl: string
  backgroundColor?: string
  aspectRatio: string
}

const GamesCard: Component<GamesCard> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "backgroundUrlStub",
    "backgroundUrl",
    "backgroundColor",
    "aspectRatio",
  ])

  return (
    <Events
      class={style.GamesCard}
      classList={{
        [style[`GamesCard--glass`]]: !!local.backgroundColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      pressTransform
      {...others}
      style={{
        "background-color": local.backgroundColor,
        "aspect-ratio": local.aspectRatio,
      }}
    >
      {/* <img class={style.GamesCard__img} src={"local.backgroundUrl"} /> */}
      <Image
        backgroundColor={"transparent"}
        class={style.GamesCard__img}
        srcStub={local.backgroundUrlStub}
        src={local.backgroundUrl}
        fallbackColor={local.backgroundColor}
      />
    </Events>
  )
}

export default GamesCard
