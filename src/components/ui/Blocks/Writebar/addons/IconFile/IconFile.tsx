import style from "./IconFile.module.css"
import Events from "@ui/Template/Events/Events"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { DynamicProps } from "solid-js/web"

interface Icon extends Omit<JSX.HTMLAttributes<DynamicProps<"button">>, "onChange"> {
  hidden?: boolean
  hiddenMode?: "left-scale" | "right" | "left-scale-no_gap"

  onChange: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>
  multiple?: boolean
  accept?: "image/*" | "image/*,video/*"
}

const Icon: Component<Icon> = (props) => {
  const merged = mergeProps({ disabled: false, multiple: false, accept: "image/*" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "disabled",
    "hidden",
    "hiddenMode",
    "onClick",

    "onChange",
    "multiple",
    "accept",
  ])

  let refInput: HTMLInputElement

  const onAddedAttachment: JSX.EventHandlerUnion<
    DynamicProps<"button">,
    MouseEvent,
    JSX.EventHandler<DynamicProps<"button">, MouseEvent>
  > = (event) => {
    event.stopPropagation()
    event.preventDefault()

    if (!refInput!) {
      console.error("[Attachment] refInput undefined")
      return
    }

    refInput.click()
  }

  return (
    <>
      <input
        ref={refInput!}
        class={style.IconFile__input}
        type={"file"}
        multiple={local.multiple}
        accept={local.accept}
        onChange={local.onChange}
      />
      <Events
        restoreFocus
        minActiveTime={200}
        class={style.IconFile}
        disabled={local.disabled}
        classList={{
          [style[`Icon--hidden`]]: !!local.hidden,
          [style[`Icon__hiddenMode--${local.hiddenMode}`]]: !!local.hiddenMode,

          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        onClick={onAddedAttachment}
        {...others}
      >
        {local.children}
      </Events>
    </>
  )
}

export default Icon
