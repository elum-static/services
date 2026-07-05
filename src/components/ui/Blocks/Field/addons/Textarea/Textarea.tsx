import createHandler from "@ui/utils/createHandler"
import { styles } from "./styles"
import { type HTMLAttributes } from "@ui/Types"
import useComputedBlockStyles from "@ui/utils/useComputedBlockStyles"
import useStyle from "@ui/utils/useStyle"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  onMount,
  createEffect,
  on,
} from "solid-js"

export interface TextareaProps
  extends Omit<HTMLAttributes<HTMLTextAreaElement>, "onResize"> {
  /** Автоматическое увеличение высоты при вводе текста */
  grow?: boolean
  /** Максимальная высота поля в пикселях */
  maxHeight?: string
  /** Разрешить ручное изменение размера */
  resize?: boolean
  /** Callback при изменении размера textarea */
  onResize?: (el: HTMLTextAreaElement) => void
  /** Обработчик ввода */
  onInput?: JSX.InputEventHandler<HTMLTextAreaElement, InputEvent>
  /** Подсказка в поле ввода */
  placeholder?: string
  /** Значение textarea */
  value: string
}

const style = useStyle(styles)

const Textarea: Component<TextareaProps> = (props) => {
  const merged = mergeProps(
    {
      grow: true,
      resize: false,
      maxHeight: "150px",
    },
    props,
  )

  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "grow",
    "maxHeight",
    "onResize",
    "onInput",
    "resize",
    "value",
    "onFocus",
    "onBlur",
  ])

  let ref: HTMLTextAreaElement
  const styles = useComputedBlockStyles({
    ref: () => ref!,
    onUpdate: () => adjustTextareaHeight(),
  })

  /**
   * Автоматическая регулировка высоты textarea
   */
  const adjustTextareaHeight = () => {
    if (!local.grow || !ref!) return

    // Сброс высоты для корректного расчета scrollHeight
    ref.style.height = "0px"

    const newHeight = Math.min(
      ref.scrollHeight,
      parseInt(local.maxHeight) || Infinity,
    )
    ref.style.height = `${newHeight}px`

    const lineHeight = parseInt(styles.lineHeight || "0")
    if (ref.scrollTop + ref.clientHeight + lineHeight >= ref.scrollHeight) {
      ref.scrollTop = ref.scrollHeight
    }

    local.onResize?.(ref)
  }

  onMount(adjustTextareaHeight)

  createEffect(on(() => local.value, adjustTextareaHeight))

  /**
   * Обработчик ввода текста
   */
  const handleInput: JSX.InputEventHandlerUnion<
    HTMLTextAreaElement,
    InputEvent
  > = (event) => {
    adjustTextareaHeight()
    local.onInput?.(event)
  }

  const htmlTouchEnd = (e: TouchEvent) => {
    document.documentElement.scrollIntoView({
      block: "end",
      behavior: "smooth",
    })
  }

  const onFocus = createHandler((event) => {
    document.addEventListener("touchend", htmlTouchEnd, { passive: true })
  }, local.onFocus)

  const onBlur = createHandler((event) => {
    document.removeEventListener("touchend", htmlTouchEnd)
  }, local.onBlur)

  return (
    <textarea
      ref={ref!}
      class={style.Textarea}
      classList={{
        [style["Textarea--resize"]]: local.resize,
        [local.class || ""]: !!local.class,
        ...local.classList,
      }}
      value={local.value}
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{
        "max-height": local.maxHeight,
      }}
      {...others}
    />
  )
}

export default Textarea
