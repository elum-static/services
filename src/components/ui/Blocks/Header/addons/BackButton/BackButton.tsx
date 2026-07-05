import { IconArrowLeft, IconChevronLeft, IconCircleX, IconCircleXFilled, IconX } from "src/source"
import style from "./BackButton.module.css"
import {
  type Component,
  mergeProps,
  splitProps,
  Show,
  Switch,
  Match,
  createSignal,
  createEffect,
} from "solid-js"
import { DynamicProps } from "solid-js/web"
import Button, { ButtonProps } from "@ui/Blocks/Button/Button"
import useSafeHeader from "@ui/utils/useSafeHeader"
import combineStyle from "@ui/utils/combineStyle"
import usePlatform from "@ui/utils/usePlatform"
import createHandler from "@ui/utils/createHandler"
interface BackButton extends Omit<ButtonProps, "type"> {
  type?: "arrow" | "close"

  hiddenTelegram?: boolean
  /**
   * Скрытие кнопки с анимацией
   */
  hidden?: boolean
}

const BackButton: Component<BackButton> = (props) => {
  const merged = mergeProps(
    { type: "arrow", hiddenTelegram: false, appearance: "secondary", mode: "ghost" },
    props,
  ) as BackButton
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "type",
    "hiddenTelegram",
    "hidden",

    "onClick",
  ])

  const platform = usePlatform()
  const [width, setWidth] = createSignal(0)

  var ref: HTMLDivElement

  createEffect(() => {
    setWidth(ref!?.offsetWidth)
  })

  const safe = useSafeHeader()

  const onClick = createHandler(() => {
    if (local.hidden) return "stop"
  }, local.onClick)

  return (
    <Show when={safe.site === "tg" ? !local.hiddenTelegram : true}>
      <Button
        ref={ref! as unknown as DynamicProps<"button">}
        class={style.BackButton}
        classList={{
          [style["BackButton--hidden"]]: local.hidden,
          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        size={"small"}
        type={"icon"}
        border={"circle"}
        style={combineStyle(local.style, {
          "--back_button--width": width() + "px",
        })}
        onClick={onClick}
        {...others}
      >
        <Button.Content class={style.BackButton_content}>
          <Show
            keyed
            when={local.children}
            fallback={
              <Switch>
                <Match when={local.type === "close"}>
                  <IconX width={24} height={24} />
                </Match>
                <Match when={local.type === "arrow"}>
                  <Switch fallback={<IconArrowLeft width={24} height={24} />}>
                    <Match when={platform() === "iOS"}>
                      <IconChevronLeft
                        style={{ transform: "translateX(-1px)" }}
                        width={24}
                        height={24}
                      />
                    </Match>
                  </Switch>
                </Match>
              </Switch>
            }
          >
            {(children) => children}
          </Show>
        </Button.Content>
      </Button>
    </Show>
  )
}

export default BackButton
