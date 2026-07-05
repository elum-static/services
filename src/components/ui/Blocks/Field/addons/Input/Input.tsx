import style from "./Input.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  /** Обработчик ввода */
  onInput?: JSX.InputEventHandler<HTMLInputElement, InputEvent>
  /** Подсказка в поле ввода */
  placeholder?: string
  /** Значение textarea */
  value: string
}

const Input: Component<InputProps> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <input
      class={style.Input}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    />
  )
}

export default Input
