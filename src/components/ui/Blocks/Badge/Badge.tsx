import { styles } from "./styles"
import useStyle from "@ui/utils/useStyle"

import usePlatform from "@ui/utils/usePlatform"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface Badge extends JSX.HTMLAttributes<HTMLDivElement> {
  padding?: "default" | "large" | "compact"
  hidden?: boolean
  bgColor?:
    | "accent"
    | "sp-primary"
    | "pink" // FE2FAB
    | "skyblue" // 33A4DA
    | "sand" // A2845E
    | "mint" // 5CA19A
    | "orange" // FB9503
    | "blue" // 007CF5
    | "yellow" // FFD426
    | "purple" // B552D5
    | "gray" // 8F8F91
    | "red" // FF0000
    | "amber" // FEC319
    | "cyan" // 33C6DA
    | "green" // 28CA4C
    | "logo_gradient"
  noBackgroundOnAndroid?: boolean
}

const Badge: Component<Badge> = (props) => {
  const style = useStyle(styles)
  const platform = usePlatform()
  const merged = mergeProps({ padding: "default", noBackgroundOnAndroid: false }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "bgColor",
    "padding",
    "hidden",
    "noBackgroundOnAndroid",
  ])

  return (
    <div
      class={style.Badge}
      classList={{
        [style[`Badge--hidden`]]: !!local.hidden,
        [style[`Badge__padding--${local.padding}`]]: !!local.padding,
        [style[`Badge__bgColor--${local.bgColor}`]]:
          local.noBackgroundOnAndroid && platform() === "android" ? false : !!local.bgColor,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <span class={style.Badge__in}>{local.children}</span>
    </div>
  )
}

export default Badge
