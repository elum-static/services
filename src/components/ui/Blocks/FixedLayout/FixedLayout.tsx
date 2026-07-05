import useComputedBlockStyles from "@ui/utils/useComputedBlockStyles"
import style from "./FixedLayout.module.css"

import {
  type Component,
  splitProps,
  mergeProps,
  JSX,
  Show,
  createSignal,
  createEffect,
  useContext,
} from "solid-js"
import ActionViewContext from "@ui/Pages/View/addons/Action/ActionViewContext"

interface FixedLayout extends JSX.HTMLAttributes<HTMLDivElement> {
  position: "top" | "bottom"
  background?: "none" | "background_primary" | "white" | "background_game_crush_secondary"
  safe?: boolean
  isMargin?: boolean
  fixed?: boolean
  safeTabbar?: boolean

  onSize?: (width: number, height: number) => void
}

const FixedLayout: Component<FixedLayout> = (props) => {
  const actionViewContext = useContext(ActionViewContext)
  const merged = mergeProps(
    {
      isMargin: true,
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "position",
    "background",
    "safe",
    "isMargin",
    "fixed",
    "safeTabbar",

    "onSize",
  ])

  const [height, setHeight] = createSignal(0)

  var ref: HTMLDivElement

  const styles = useComputedBlockStyles({
    ref: () => ref!,
    onUpdate: () => {},
  })

  createEffect(() => {
    const paddingBottom = parseInt(styles.paddingBottom || "0")

    setHeight((ref!?.clientHeight || 0) - paddingBottom)

    local.onSize?.(ref!?.clientWidth || 0, ref!?.clientHeight || 0)
  })

  return (
    <>
      <Show when={local.fixed}>
        <span
          style={{ height: height() + "px", "min-height": height() + "px" }}
          class={style.FixedLayout__fake}
        />
      </Show>
      <div
        ref={ref!}
        class={style.FixedLayout}
        classList={{
          [style[`FixedLayout__background--${local.background}`]]: !!local.background,
          [style[`FixedLayout__position--${local.position}`]]: !!local.position,
          [style[`FixedLayout--safe`]]: local.safe,
          [style[`FixedLayout--safeTabbar`]]: local.safeTabbar,
          [style[`FixedLayout--margin`]]: local.isMargin,
          [style[`FixedLayout--fixed`]]: local.fixed,

          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        style={{
          "--tabbar_height": `${actionViewContext?.getTabbarHeight() || 0}px`,
          "--tabbar_width": `${actionViewContext?.getTabbarWidth() || 0}px`,
        }}
        {...others}
      >
        <div class={style.FixedLayout__in}>{local.children}</div>
      </div>
    </>
  )
}

export default FixedLayout
