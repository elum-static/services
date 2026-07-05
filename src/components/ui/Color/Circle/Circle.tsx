import style from "./Circle.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import getColorBrightness from "@ui/utils/getColorBrightness"
import Events, { type EventsProps } from "@ui/Template/Events/Events"

interface Circle extends EventsProps<"button"> {
  selected?: boolean

  color: string
}

const Circle: Component<Circle> = (props) => {
  const merged = mergeProps({ size: "auto" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "selected",
    "color",
  ])

  const backgroundColor =
    getColorBrightness(
      getComputedStyle(document.documentElement).getPropertyValue("--background_primary").trim(),
    ) === "dark"
      ? "black"
      : "white"

  return (
    <Events
      component={"button"}
      class={style.Circle}
      classList={{
        [style["Circle--selected"]]: !!local.selected,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      style={{
        "background-color": local.color,

        "--color_negative":
          getColorBrightness(local.color, backgroundColor) === "dark"
            ? "var(--fixed_color_white)"
            : "var(--fixed_color_black)",
      }}
      {...others}
    >
      <div class={style.Circle__in}>{local.children}</div>
    </Events>
  )
}

export default Circle
