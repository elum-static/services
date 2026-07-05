import style from "./Textarea.module.css"
import WritebarContext from "../../WritebarContext"

import Field from "@ui/Blocks/Field/Field"
import { type TextareaProps } from "@ui/Blocks/Field/addons/Textarea/Textarea"

import { type Component, mergeProps, splitProps, useContext } from "solid-js"
import createHandler from "@ui/utils/createHandler"
interface Textarea extends TextareaProps {}

const Textarea: Component<Textarea> = (props) => {
  const context = useContext(WritebarContext)

  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "onFocus",
    "onBlur",
  ])

  var ref: HTMLTextAreaElement

  const onFocus = createHandler(() => {
    context?.setFocus(true)
  }, local.onFocus)

  const onBlur = createHandler(() => {
    context?.setFocus(false)
  }, local.onBlur)

  return (
    <Field class={style.Field} inDirection={"column"}>
      {local.children}
      <Field.Textarea
        inputMode={"text"}
        enterkeyhint={"enter"}
        id={"writebar__textarea"}
        ref={ref!}
        class={style.Textarea}
        classList={{
          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        {...others}
      />
    </Field>
  )
}

export default Textarea
