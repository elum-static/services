import style from "./CreateElement.module.css"
import { LayoutManagerStore } from "../../context"

import {
  type JSX,
  type Component,
  splitProps,
  useContext,
  Show,
  createMemo,
  createEffect,
  createReaction,
} from "solid-js"
interface CreateElement extends JSX.HTMLAttributes<HTMLDivElement> {
  type: "first" | "last"
}

const cacheAnimation = new Map<string, boolean>()

const animationRegex = /none/i

const CreateElement: Component<CreateElement> = (props) => {
  const context = useContext(LayoutManagerStore)

  // const merged = mergeProps({}, props)
  const [local, others] = splitProps(props, [
    "class",
    "classList",
    "children",
    "type",
  ])

  const onAnimationEnd: JSX.EventHandlerUnion<
    HTMLDivElement,
    AnimationEvent
  > = (event) => {
    // Проверяем, что событие произошло на корневом элементе
    if (event.target !== event.currentTarget) return

    context?.onAnimationEnd?.(local.type)
  }

  return (
    <Show keyed when={context?.child?.[local.type]?.()}>
      {(child) => {
        var ref: HTMLDivElement

        createEffect(() => {
          if (context?.getAnim?.()) {
            const KEY =
              context.key +
              child.nav +
              (context.getDirection?.(local.type) || "")
            var status = cacheAnimation.get(KEY) ?? false
            if (!status) {
              const styles = window.getComputedStyle(ref)

              if (styles && animationRegex.test(styles.animation || "none")) {
                status = true
              }
              cacheAnimation.set(KEY, status)
              status = cacheAnimation.get(KEY) ?? false
            }
            if (status) {
              context?.onAnimationEnd?.(local.type)
            }
          }
        })

        return (
          <div
            ref={ref!}
            classList={{
              [`${local.class}`]: !!local.class,
              ...local.classList,

              ...context?.styleIndex?.(local.type),
            }}
            {...others}
            onAnimationEnd={onAnimationEnd}
          >
            {child.component({ nav: child.nav })}
          </div>
        )
      }}
    </Show>
  )
}

export default CreateElement
