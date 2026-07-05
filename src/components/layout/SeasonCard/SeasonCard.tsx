import style from "./SeasonCard.module.css"

import { type Component, mergeProps, splitProps, Show } from "solid-js"

import { Events, Flex, Timer } from "src/components/ui"
import { type EventsProps } from "src/components/ui/Template/Events/Events"
import combineStyle from "src/components/ui/utils/combineStyle"

interface SeasonCard extends EventsProps<"button"> {
  title: string
  subtitle: string
  date: Date
  type?: string

  backgroundUrl: string
}

const SeasonCard: Component<SeasonCard> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "title",
    "subtitle",
    "type",
    "date",
    "backgroundUrl",
  ])

  return (
    <Events
      class={style.SeasonCard}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      style={combineStyle({ "background-image": `url(${local.backgroundUrl})` }, local.style)}
      pressTransform
      {...others}
    >
      <span class={style.SeasonCard__title}>{local.title}</span>
      <span class={style.SeasonCard__subtitle}>{local.subtitle}</span>
      <Flex class={style.SeasonCard__group} direction={"row"} justify={"start"} align={"center"}>
        <span class={style.SeasonCard__date}>
          <Timer targetDate={local.date} />
        </span>
        <span class={style.SeasonCard__type}>{local.type}</span>
      </Flex>
    </Events>
  )
}

export default SeasonCard
