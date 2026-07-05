import style from "./Swipe.module.css"
import { After, Before, Content, List } from "./addons"

import ListContext from "./addons/List/ListContext"

import Events, {
  type EventsProps,
  type GestureEvent,
  isTouchSupport,
} from "@ui/Template/Events/Events"
import useClickOutside from "@ui/utils/useClickOutside"
import PanelContainerContext from "@ui/Pages/Panel/addons/Container/PanelContext"
import { clamp } from "@minsize/utils"

import {
  type JSX,
  type Component,
  createEffect,
  mergeProps,
  splitProps,
  useContext,
  on,
  createMemo,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import SwipeContext from "./SwipeContext"
import { DynamicProps } from "solid-js/web"

export interface SwipeProps extends EventsProps<"span"> {
  /**
   * Расстояние от края в пикселях, при котором начинается активация свайпа
   * @default 100
   */
  activated?: number

  /**
   * Расстояние в пикселях, при котором элемент фиксируется в открытом состоянии
   * @default 15
   */
  fixed?: number

  /**
   * Расстояние в пикселях от края, при котором элемент закрывается
   * @default 30
   */
  closed?: number

  /**
   * Флаг, указывающий нужно ли скрывать элемент через анимацию height
   * Полезно для плавного удаления элементов из списка
   */
  hidden?: boolean

  /**
   * Callback, вызываемый по завершении анимации скрытия
   * Используется для удаления элемента из DOM после анимации
   */
  onHiddenEnd?: () => void

  "list-index": number
}

type Store = {
  anim: boolean
  swipeX: number
  fixedX: number
  interactions: boolean
}

type StoreContext = {
  before: {
    contentWidth: number
    fullActivated: number
  }
  after: {
    contentWidth: number
    fullActivated: number
  }
  visible: boolean
}

type ComponentSwipe = Component<SwipeProps> & {
  Content: typeof Content
  After: typeof After
  Before: typeof Before
  List: typeof List
}

const Swipe: ComponentSwipe = (props) => {
  const contextPanel = useContext(PanelContainerContext)
  const context = useContext(ListContext)
  const merged = mergeProps({ activated: 100, fixed: 15, closed: 30 }, props)

  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "activated",
    "fixed",
    "closed",
    "onClick",
    "hidden",
    "onHiddenEnd",
    "list-index",
  ])

  var swipeRef: HTMLDivElement

  var callback: {
    beforeStop?: boolean
    before?: (status: boolean) => void
    beforeEnd?: () => void
    afterStop?: boolean
    after?: (status: boolean) => void
    afterEnd?: () => void
  } = {}

  const refs: { after?: HTMLDivElement; before?: HTMLDivElement } = {}

  const [storeContext, setStoreContext] = createStore<StoreContext>({
    before: {
      contentWidth: 0,
      fullActivated: 0,
    },
    after: {
      contentWidth: 0,
      fullActivated: 0,
    },
    visible: false,
  })

  const [state, setState] = createStore<Store>({
    anim: false,
    swipeX: 0,
    fixedX: 0,
    interactions: true,
  })

  createEffect(
    on(
      () => local.hidden,
      (hidden) => {
        if (hidden) {
          context?.setHidden?.(local["list-index"], swipeRef!?.clientHeight || 0)
        }
      },
    ),
  )

  createEffect(() => {
    context?.setBlock?.(local["list-index"], 0)
  })

  /**
   * Обработчик движения при свайпе
   * @param event - Событие жеста
   */
  const handleMove = (event: GestureEvent) => {
    if (!isTouchSupport) {
      return
    }

    setStoreContext("visible", true)

    const elem = event.originalEvent.target as HTMLDivElement
    const startX = event.startX || 0

    // Игнорируем свайп, если начинаем не с края
    if (
      state.swipeX === 0 &&
      startX >= local.activated &&
      !(startX >= elem.clientWidth - local.activated)
    ) {
      return
    }

    contextPanel?.setStatusScroll(false)

    const shiftX = (event.shiftX || 0) + state.fixedX
    const direction = shiftX > 0 ? "left" : "right"

    setState("interactions", false)
    setState(
      produce((state) => {
        // Сбрасываем анимацию перед проверками
        state.anim = false

        // Обработка свайпа влево (открытие before-элемента)
        if (direction === "left") {
          const { fullActivated: fullThreshold } = storeContext.before
          const maxWidth = refs.before?.clientWidth || 0

          // Проверяем, достигли ли мы порога полного открытия
          const isFullyOpened = shiftX >= fullThreshold

          if (isFullyOpened) {
            // Анимируем до полного открытия
            state.anim = true
            state.swipeX = maxWidth
            if (!callback.beforeStop) {
              callback?.before?.(true)
              callback.beforeStop = true
            }
          } else {
            // Ограничиваем позицию в пределах ширины элемента
            state.swipeX = clamp(shiftX, 0, maxWidth)

            if (!!callback.beforeStop) {
              callback?.before?.(false)
              callback.beforeStop = false
            }
          }
        }
        // Обработка свайпа вправо (открытие after-элемента)
        else {
          const { fullActivated: fullThreshold } = storeContext.after

          const maxWidth = refs.after?.clientWidth || 0

          // Проверяем, достигли ли мы порога полного открытия
          const isFullyOpened = shiftX <= -fullThreshold

          if (isFullyOpened) {
            // Анимируем до полного открытия
            state.anim = true
            state.swipeX = -maxWidth
            if (!callback.afterStop) {
              callback?.after?.(true)
              callback.afterStop = true
            }
          } else {
            // Ограничиваем позицию в пределах ширины элемента
            state.swipeX = clamp(shiftX, -maxWidth, 0)

            if (!!callback.afterStop) {
              callback?.after?.(false)
              callback.afterStop = false
            }
          }
        }
      }),
    )
  }

  /**
   * Обработчик окончания свайпа
   * Определяет финальное положение элемента после завершения жеста:
   * - Оставить открытым (зафиксировать)
   * - Закрыть
   * - Обработать полное раскрытие (fullActivated)
   */
  const handleEnd = () => {
    contextPanel?.setStatusScroll(true)

    setState(
      produce((s) => {
        s.anim = true // Активируем анимацию
        const swipeXAbs = Math.abs(s.swipeX) // Абсолютное значение смещения
        const direction = s.swipeX > 0 ? "left" : "right" // Направление свайпа

        // Проверяем, достигли ли мы порога фиксации
        const shouldFix = swipeXAbs >= local.fixed

        // Проверяем, нужно ли закрыть элемент (если не дотянули до фиксации)
        const shouldClose =
          state.fixedX !== 0 && // Уже был зафиксирован
          (direction === "left"
            ? storeContext.before.contentWidth - local.closed >= swipeXAbs // Для левого направления
            : storeContext.after.contentWidth - local.closed >= swipeXAbs) // Для правого

        // Логика установки финального положения
        if (!shouldClose && shouldFix) {
          if (direction === "left") {
            // Before Проверяем полное раскрытие (растянули на весь экран)
            const fullActivatedBefore = storeContext.before.fullActivated
              ? swipeXAbs >=
                clamp(
                  clamp(
                    storeContext.before.fullActivated,
                    storeContext.before.contentWidth * 1.1,
                    window.innerWidth,
                  ),
                  0,
                  window.innerWidth,
                )
              : false
            // Свайп влево (открываем before)
            if (fullActivatedBefore) {
              s.swipeX = 0 // Сброс при полном раскрытии
              callback.beforeEnd?.()
            } else {
              s.swipeX = storeContext.before.contentWidth // Фиксируем открытым
            }
          } else {
            // After Проверяем полное раскрытие (растянули на весь экран)
            const fullActivatedAfter = storeContext.after.fullActivated
              ? swipeXAbs >=
                clamp(
                  clamp(
                    storeContext.after.fullActivated,
                    storeContext.after.contentWidth * 1.1,
                    window.innerWidth,
                  ),
                  0,
                  window.innerWidth,
                )
              : false
            // Свайп вправо (открываем after)
            if (fullActivatedAfter) {
              s.swipeX = 0 // Сброс при полном раскрытии
              callback.afterEnd?.()
            } else {
              s.swipeX = -storeContext.after.contentWidth // Фиксируем открытым
            }
          }
        } else {
          // Закрываем элемент (возвращаем в исходное положение)
          s.swipeX = 0
        }

        s.fixedX = s.swipeX // Сохраняем текущее положение как фиксированное
      }),
    )
  }

  /**
   * Закрывает свайп-элемент
   */
  const closeSwipe = () => {
    setState(
      produce((s) => {
        s.anim = true
        s.swipeX = 0
        s.fixedX = 0
      }),
    )
  }

  // Закрываем свайп при клике вне элемента
  useClickOutside(() => swipeRef, closeSwipe)

  /**
   * Обработчик клика по основному элементу
   */
  const handleClick: JSX.EventHandlerUnion<DynamicProps<"span">, MouseEvent> = (event) => {
    if (state.fixedX !== 0) {
      closeSwipe()
      event.stopPropagation()
      return
    }
    local.onClick && (local.onClick as any)(event)
  }

  const onTransitionEnd: JSX.EventHandlerUnion<
    DynamicProps<"span">,
    TransitionEvent,
    JSX.EventHandler<DynamicProps<"span">, TransitionEvent>
  > = (event) => {
    /* Если анимация не на родителе, отклоняем */
    if (event.target !== event.currentTarget) return
    setState("anim", false)

    if (state.swipeX === 0) {
      setState("interactions", true)
    }

    if (state.swipeX === 0) {
      setStoreContext("visible", false)
    }

    if (local.hidden) {
      context?.setHiddenEnd?.(local["list-index"])
      local?.onHiddenEnd?.()
    }
  }

  /* Context */

  // const setWidth = (type: "before" | "after", width: number) => {
  //   setStoreContext(type, "width", width)
  // }
  const setRef = (type: "before" | "after", ref: HTMLDivElement) => {
    refs[type] = ref
  }

  const setContentWidth = (type: "before" | "after", width: number) => {
    setStoreContext(type, "contentWidth", width)
  }
  const setFullActivated = (type: "before" | "after", width: number) => {
    setStoreContext(type, "fullActivated", width)
  }
  const setFullActivateCallback = (
    type: "before" | "after",
    cb?: (status: boolean) => void,
    cbEnd?: () => void,
  ) => {
    if (type === "before") {
      callback.before = cb
      callback.beforeEnd = cbEnd
    } else if (type === "after") {
      callback.after = cb
      callback.afterEnd = cbEnd
    }
  }
  const setClose = () => {
    setState(
      produce((state) => {
        state.anim = true
        state.swipeX = 0
        state.fixedX = state.swipeX
        return state
      }),
    )
  }
  const getVisible = createMemo(() => {
    return storeContext.visible
  })

  return (
    <Events
      ref={swipeRef! as any}
      class={style.Swipe}
      classList={{
        [style["Swipe--anim"]]: context?.getAnim?.() || state.anim,
        [style["Swipe--hidden"]]: !!context?.getTransformY?.(local["list-index"]),
        ...local.classList,
      }}
      onClick={handleClick}
      onMoveX={handleMove}
      onEndX={handleEnd}
      style={{
        transform: state.swipeX
          ? `translateX(${(state.swipeX / swipeRef!?.clientWidth) * 100}%)`
          : "",
        "--swipe--activated": local.activated + "px",
      }}
      onTransitionEnd={onTransitionEnd}
      interactions={state.interactions}
      classes={{
        disabled: "_swipeDisabled",
        hover: "_swipeHover",
        active: "_swipeActive",
      }}
      {...others}
    >
      {/* <Events
        stopPropagation={false}
        class={style.Swipe__in}
        onClick={handleClick as any}
        enableActive={!storeContext.visible}
        // activeDelay={80}
        classes={{
          disabled: "_swipeDisabled",
          hover: "_swipeHover",
          active: "_swipeActive",
        }}
      > */}
      <SwipeContext.Provider
        value={{
          getVisible,
          setClose,
          setFullActivateCallback,
          setRef,
          setContentWidth,
          setFullActivated,
        }}
      >
        {local.children}
      </SwipeContext.Provider>
      {/* </Events> */}
    </Events>
  )
}

Swipe.Content = Content
Swipe.Before = Before
Swipe.After = After
Swipe.List = List

export default Swipe
