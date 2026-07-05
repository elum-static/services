import style from "./Events.module.css"
import { For, type JSX, type ValidComponent, mergeProps, onCleanup, splitProps } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { Dynamic, type DynamicProps } from "solid-js/web"
import createHandler from "@ui/utils/createHandler"
import combineStyle from "../../utils/combineStyle"

export interface EventsProps<T extends ValidComponent> extends Omit<
  JSX.HTMLAttributes<DynamicProps<T>>,
  "onContextMenu"
> {
  /**
   * Компонент или функция-рендер, к которому применяются интерактивные состояния.
   * @default button - При onClick
   * @default a - При href
   */
  component?: T

  /**
   * Отключает обработку hover, active и click.
   * @default false
   */
  disabled?: boolean

  /**
   * Если передан, компонент рендерится как `<a>`, и это значение становится `href`.
   */
  href?: string

  /**
   * Атрибут `target` для ссылки (актуально при наличии `href`).
   * @default "_blank"
   */
  target?: "_blank" | "_self" | "_parent" | "_top"

  /**
   * Будут ли работать active,hover,disabled
   */
  interactions?: boolean

  /**
   * Минимальное время (в мс), в течение которого сохраняется состояние `hover`
   * после ухода курсора. Помогает избежать "мерцания" при быстром движении.
   * @default 0
   */
  minHoverTime?: number

  /**
   * Минимальное время (в мс), в течение которого сохраняется состояние `active`
   * после отпускания кнопки. Улучшает UX для быстрых кликов.
   * @default 150
   */
  minActiveTime?: number

  /**
   * Если true, предотвращает всплытие события (bubbling) в DOM-дереве
   * Useful when you want to handle events only at the current level
   * without notifying parent components
   *
   * @example
   * // Click event won't reach parent elements
   * <Modal stopPropagation={true} onClick={handleClick}>
   */
  stopPropagation?: boolean

  /**
   * Если true, отменяет стандартное поведение браузера для события
   * Prevents the default browser action (like form submission, link navigation)
   * while still allowing custom event handling
   *
   * @example
   * // Prevents form submission and page reload
   * <Modal preventDefault={true} onSubmit={handleSubmit}>
   */
  preventDefault?: boolean

  /**
   * Если true, предотвращает потерю фокуса при клике на кнопку
   * Useful for toolbar buttons, formatting controls, or any actions
   * that should not interrupt user's text input flow
   *
   * @example
   * // Input stays focused when clicking formatting buttons
   * <Button restoreFocus={true} onClick={formatText}>
   */
  restoreFocus?: boolean

  classes?: {
    disabled: string
    active: string
    hover: string
  }

  onStart?(event: GestureEvent): void
  onStartX?(event: GestureEvent): void
  onStartY?(event: GestureEvent): void

  onMove?(event: GestureEvent): void
  onMoveX?(event: GestureEvent): void
  onMoveY?(event: GestureEvent): void

  onEnd?(event: GestureEvent): void
  onEndX?(event: GestureEvent): void
  onEndY?(event: GestureEvent): void

  onContextMenuStart?(event: GestureEvent): void
  onContextMenu?(event: GestureEvent): void
  onContextMenuEnd?(event: GestureEvent): void

  pressTransform?: boolean
  tappable?: boolean
}

type CustomEvent = MouseEvent | TouchEvent
type Store = {
  hover: boolean
  active: boolean

  clicks: Array<{ id: number | string; x: number; y: number }>
  press?: {
    rotateX: number // Наклон вверх/вниз
    rotateY: number // Наклон влево/вправо
    scale: number // Общее сжатие
    x: number
    y: number
  }
}

type Gesture = {
  isClickable: boolean
  isLongMenu: boolean

  startX?: number
  startY?: number
  startT?: Date
  isPressed?: boolean
  isY?: boolean
  isX?: boolean
  isSlideX?: boolean
  isSlideY?: boolean
  isSlide?: boolean
  shiftX?: number
  shiftY?: number
  shiftXAbs?: number
  shiftYAbs?: number
  cancel?: boolean

  isFast?: boolean
  _lastTouchEndTime?: number
  _lastEvent?: CustomEvent
}

export type GestureEvent = Gesture &
  (
    | {
        eventType: "mouse"
        originalEvent: MouseEvent
      }
    | {
        eventType: "touch"
        originalEvent: TouchEvent
      }
  )

export const isTouchSupport = typeof window !== "undefined" && "ontouchstart" in window

// Константы для лучшей читаемости
const SPEED_THRESHOLD = 1900 // px/s
const TIME_THRESHOLD = 150 // ms

const CONTEXT_MENU_START_DELAY = 100 // Задержка перед уведомлением о начале жеста
const CONTEXT_MENU_ACTIVATION_DELAY = 300 // Время для активации контекстного меню

const Events = <T extends ValidComponent>(props: EventsProps<T>): JSX.Element => {
  const mergedClasses = mergeProps(
    {
      disabled: "_disabled",
      hover: "_hover",
      active: "_active",
    },
    props.classes,
  )
  const merged = mergeProps(
    {
      component: "button",
      minHoverTime: 0,
      minActiveTime: 150,
      interactions: true,
      stopPropagation: true,
      preventDefault: false,
      classes: mergedClasses,
      pressTransform: false,
      tappable: true,
    },
    props,
  )

  const [local, others] = splitProps(merged, [
    "component",
    "class",
    "classList",
    "children",
    "href",
    "onClick",
    "disabled",
    "interactions",
    "minHoverTime",
    "minActiveTime",
    "stopPropagation",
    "preventDefault",
    "restoreFocus",
    "pressTransform",
    "tappable",

    /* Original Events */
    "onMouseDown",
    "onMouseMove",
    "onMouseUp",
    "onMouseLeave",
    "onTouchStart",
    "onTouchEnd",
    "onTouchMove",

    /* Custom Events (priority) */
    "onStart",
    "onStartX",
    "onStartY",

    "onMove",
    "onMoveX",
    "onMoveY",

    "onEnd",
    "onEndX",
    "onEndY",

    "onContextMenuStart",
    "onContextMenu",
    "onContextMenuEnd",

    "classes",

    "onTransitionEnd",
  ])

  const [store, setStore] = createStore<Store>({
    hover: false,
    active: false,
    clicks: [],
  })

  var activeElement = document.activeElement

  const gesture: Gesture = {
    isClickable: true,
    isLongMenu: false,
    get isFast() {
      if (this.startT && this.startX && this.startY && this._lastTouchEndTime) {
        const touchEndX = coordX(this._lastEvent)
        const touchEndY = coordY(this._lastEvent)
        //1. Проверяем время касания
        const touchDuration = this._lastTouchEndTime - this.startT.getTime()
        const isFastByTime = touchDuration < TIME_THRESHOLD

        //2. Проверяем скорость
        const distanceX = Math.abs(touchEndX - this.startX)
        const distanceY = Math.abs(touchEndY - this.startY)
        const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2)
        const speed = (distance / touchDuration) * 1000 // px/s

        const isFastBySpeed = speed > SPEED_THRESHOLD
        // Если оба условия выполнены — жест быстрый
        if (isFastByTime && isFastBySpeed) {
          return true
          // Действие (например, перемотка)
        }
      }
      return false
    },
  }

  /**
   * Создает обработчик состояния с минимальной длительностью (для active/hover эффектов)
   * @param stateKey - ключ состояния в хранилище ('active' | 'hover')
   * @param minDuration - минимальная длительность состояния в мс
   * @returns Функция для установки состояния
   */
  function createStateHandler(
    stateKey: "active" | "hover",
    minDuration: number = 0,
  ): (status: boolean) => void {
    var timer: NodeJS.Timeout
    const fn = (status: boolean) => {
      setStore(stateKey, status)
    }
    if (minDuration <= 0) {
      return (status: boolean) => fn(status)
    }

    return (status: boolean) => {
      clearTimeout(timer)
      if (status) {
        fn(status)
      } else {
        timer = setTimeout(() => fn(status), minDuration)
      }
    }
  }

  const setActive = createStateHandler("active", local.minActiveTime)
  const setHover = createStateHandler("hover", local.minHoverTime)

  var contextMenuStartTimer: NodeJS.Timeout
  var contextMenuStartEnd: NodeJS.Timeout

  onCleanup(() => {
    clearTimeout(contextMenuStartTimer)
    clearTimeout(contextMenuStartEnd)
  })

  const generateGestureEvent = (event: CustomEvent): GestureEvent => {
    return Object.assign(
      {
        eventType: !!("button" in event) ? "button" : "mouse",
        originalEvent: event,
      },
      gesture,
    ) as GestureEvent
  }

  /**
   * Обработчик начала жеста контекстного меню для тач-устройств
   * Запускает таймеры для отслеживания долгого нажатия:
   * - Быстрый таймер (100ms) для уведомления о начале жеста
   * - Основной таймер (300ms) для активации контекстного меню
   * Вызывается при начале touch-события (onTouchStart)
   */
  const onContextMenuStart = (event: CustomEvent) => {
    if (!isTouchSupport) {
      return
    }

    clearTimeout(contextMenuStartTimer)
    clearTimeout(contextMenuStartEnd)
    gesture.isLongMenu = false

    if (local.onContextMenuStart) {
      // Таймер начала жеста - быстрая реакция
      contextMenuStartTimer = setTimeout(() => {
        const startEvent = generateGestureEvent(event)
        local.onContextMenuStart?.(startEvent)
      }, CONTEXT_MENU_START_DELAY)
    }

    // Таймер активации меню - основное действие
    contextMenuStartEnd = setTimeout(() => {
      onContextMenuEnd(event)
      onContextMenu(event)
    }, CONTEXT_MENU_ACTIVATION_DELAY)
  }

  /**
   * Обработчик завершения/отмены жеста контекстного меню
   * Вызывается в двух сценариях:
   * 1. Жест ПРЕРВАН - пользователь сдвинул палец или отпустил до истечения времени
   * 2. Жест УСПЕШНО завершен - сработал таймер активации меню (300ms)
   *
   * Всегда очищает таймеры и сбрасывает состояние жеста
   */
  const onContextMenuEnd = (event: CustomEvent) => {
    clearTimeout(contextMenuStartTimer)
    clearTimeout(contextMenuStartEnd)
    gesture.isLongMenu = false

    const endEvent = generateGestureEvent(event)
    local.onContextMenuEnd && local.onContextMenuEnd(endEvent)
  }

  /**
   * Обработчик успешной активации контекстного меню
   * Вызывается когда жест долгого нажатия завершен УСПЕШНО:
   * - Пользователь удерживал палец достаточно долго (300ms)
   * - Контекстное меню должно быть показано
   *
   * Устанавливает флаг isLongMenu и предотвращает стандартное поведение
   */
  const onContextMenu = (event: CustomEvent) => {
    if (!local.onContextMenu) return

    gesture.isLongMenu = true
    event.stopPropagation()
    event.preventDefault()

    const endEvent = generateGestureEvent(event)
    local.onContextMenu && local.onContextMenu(endEvent)
  }

  /* on handlers */
  function onStart(event: CustomEvent): void {
    if (local.stopPropagation) event.stopPropagation()
    if (local.preventDefault) event.preventDefault()

    onContextMenuStart(event)

    // Если поставить то в Modal не будет работать Input
    // event.preventDefault()

    /* Обрабатывать только левую кнопку мыши */
    if ("button" in event && event.button !== 0) {
      return
    }

    setActive(true)

    gesture.startX = coordX(event)
    gesture.startY = coordY(event)
    gesture.startT = new Date()
    gesture.isPressed = true
    gesture.isClickable = true

    delete gesture.isY
    delete gesture.isX

    delete gesture.isSlideX
    delete gesture.isSlideY
    delete gesture.isSlide

    delete gesture.shiftX
    delete gesture.shiftY
    delete gesture.shiftXAbs
    delete gesture.shiftYAbs

    const startEvent = generateGestureEvent(event)

    local.onStart && local.onStart(startEvent)
    local.onStartX && local.onStartX(startEvent)
    local.onStartY && local.onStartY(startEvent)
  }

  function onMove(event: CustomEvent): void {
    if (local.stopPropagation) event.stopPropagation()
    // if (local.preventDefault) event.preventDefault()
    event.preventDefault()

    /** Если устройство не touch, то отображаем hover */
    if (!isTouchSupport) {
      setHover(true)
    }

    if (gesture.isLongMenu) {
      return
    }

    const shiftX = coordX(event) - (gesture.startX || 0)
    const shiftY = coordY(event) - (gesture.startY || 0)
    const shiftXAbs = Math.abs(shiftX)
    const shiftYAbs = Math.abs(shiftY)

    /**
     * Если курсор/палец сдвинулся на 5px по X или по Y, onClick не отработает
     */
    gesture.isClickable = !(shiftXAbs >= 5 || shiftYAbs >= 5)

    if (shiftXAbs >= 5 || shiftYAbs >= 5) {
      onContextMenuEnd(event)
    }

    /* Обрабатывать только левую кнопку мыши */
    if ("button" in event && event.button !== 0) {
      return
    }

    if (!gesture.isPressed) {
      return
    }

    if (!gesture.isX && !gesture.isY) {
      const willBeX = shiftXAbs >= 5 && shiftXAbs > shiftYAbs
      const willBeY = shiftYAbs >= 5 && shiftYAbs > shiftXAbs

      const willBeSlidedX = willBeX && (!!local.onMoveX || !!local.onMove)
      const willBeSlidedY = willBeY && (!!local.onMoveY || !!local.onMove)

      gesture.isX = willBeX
      gesture.isY = willBeY
      gesture.isSlideX = willBeSlidedX
      gesture.isSlideY = willBeSlidedY
      gesture.isSlide = willBeSlidedX || willBeSlidedY
    }

    if (gesture.isSlide) {
      gesture.shiftX = shiftX
      gesture.shiftY = shiftY
      gesture.shiftXAbs = shiftXAbs
      gesture.shiftYAbs = shiftYAbs

      const startEvent = generateGestureEvent(event)

      local.onMove && local.onMove(startEvent)
      gesture.isSlideX && local.onMoveX && local.onMoveX(startEvent)
      gesture.isSlideY && local.onMoveY && local.onMoveY(startEvent)
    }
  }

  function onEnd(event: CustomEvent) {
    activeElement = document.activeElement

    if (local.stopPropagation) event.stopPropagation()
    if (local.preventDefault) event.preventDefault()

    setHover(!!(!isTouchSupport && store.hover && store.active))
    setActive(false)

    if (gesture.isLongMenu) {
      return
    }

    onContextMenuEnd(event)

    /* Обрабатывать только левую кнопку мыши */
    if ("button" in event && event.button !== 0) {
      return
    }

    gesture._lastEvent = event
    gesture._lastTouchEndTime = Date.now()

    /* FIXME */
    // if (!gesture.isX && !gesture.isY) {
    //   // local.onClick && local.onClick(event as any)
    // } else {
    //   event.preventDefault()
    // }
    if (!(!gesture.isX && !gesture.isY)) {
      event.preventDefault()
    }

    gesture.cancel = gesture.isSlide
    delete gesture.isPressed

    const endEvent = generateGestureEvent(event)
    local.onEnd && local.onEnd(endEvent)
    local.onEndX && local.onEndX(endEvent)
    local.onEndY && local.onEndY(endEvent)
  }

  /* onClick Event */
  const onClick = createHandler((event) => {
    if (local.stopPropagation) event.stopPropagation()
    if (local.preventDefault) event.preventDefault()

    if (activeElement && local.restoreFocus) {
      const _element = activeElement as HTMLElement
      _element.focus()
    }

    if (!event.detail) {
      return "stop"
    }

    if (gesture.isLongMenu) {
      return "stop"
    }

    if (!gesture.isClickable) {
      return "stop"
    }

    if (local.disabled) {
      return "stop"
    }

    console.log({ event })

    const card = event.currentTarget
    const rect = card.getBoundingClientRect()

    // Нормализованные координаты клика (-1 до 1)
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1

    // Интенсивность сжатия
    const intensity = Math.sqrt(x * x + y * y)

    // Координаты клика ОТНОСИТЕЛЬНО карточки (0..width, 0..height)
    const relativeX = event.clientX - rect.left
    const relativeY = event.clientY - rect.top

    setStore(
      produce((store) => {
        store.press = {
          rotateX: y * -15, // Наклон вверх/вниз
          rotateY: x * 15, // Наклон влево/вправо
          scale: 1 - intensity * 0.003, // Общее сжатие
          x: x * 1,
          y: y * 1,
        }
        store.clicks.push({
          id: Math.random(),
          x: relativeX,
          y: relativeY,
        })

        return store
      }),
    )
  }, local.onClick)

  const onTransitionEnd = createHandler((event) => {
    if (event.currentTarget === event.target) {
      setStore("press", undefined)
    }
  }, local.onTransitionEnd)

  /* Mouse Events */
  const onMouseDown = createHandler(onStart, local.onMouseDown)
  const onMouseMove = createHandler(onMove, local.onMouseMove)
  const onMouseUp = createHandler(onEnd, local.onMouseUp)
  const onMouseLeave = createHandler((event) => {
    onEnd(event)
    setHover(false)
    setActive(false)
  }, local.onMouseLeave)

  /* Touch Events */
  const onTouchStart = createHandler(onStart, local.onTouchStart)
  const onTouchEnd = createHandler(onEnd, local.onTouchEnd)
  const onTouchMove = createHandler(onMove, local.onTouchMove)

  const mouseEvents = {
    onMouseDown: onMouseDown,
    onMouseMove: onMouseMove,
    onMouseUp: onMouseUp,
    onMouseLeave: onMouseLeave,
    onContextMenu: onContextMenu,
  }

  const touchEvents = {
    onTouchStart: onTouchStart,
    onTouchEnd: onTouchEnd,
    onTouchMove: onTouchMove,
  }

  return (
    <Dynamic
      component={local.href ? "a" : !!local.onClick ? "button" : local.component}
      class={style.Events}
      classList={{
        [style["Events--appearance"]]: true,
        [style["Events--pointer"]]: !local.disabled && (!!local.href || !!local.onClick),

        [local.classes.disabled]: local.interactions && local.disabled,
        [local.classes.hover]: local.interactions && !local.disabled && store.hover,
        [local.classes.active]: local.interactions && !local.disabled && store.active,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      href={local.href}
      onClick={onClick}
      // on:click={onClick}
      {...others}
      {...(isTouchSupport ? touchEvents : mouseEvents)}
      /**
       * Управление tabIndex с учетом:
       * - Состояния disabled (удаляет из таб-последовательности)
       * - Возможности переопределения через others.tabIndex
       */
      tabIndex={
        local.disabled
          ? "-1" // Отключаем таб-навигацию для disabled элементов
          : others.tabIndex !== undefined
            ? others.tabIndex // Используем явно переданное значение
            : undefined
      }
      onTransitionEnd={onTransitionEnd}
      style={combineStyle(
        local.pressTransform
          ? {
              transform: store.press
                ? `perspective(1000px)
                rotateX(${store.press?.rotateX}deg)
                rotateY(${store.press?.rotateY}deg)
                translate(${store.press?.x}px, ${store.press?.y}px)
                scale(${store.press?.scale})`
                : "",
              transition: "transform 0.2s ease-in-out",
              "transform-style": "preserve-3d",
            }
          : {},
        others.style,
      )}
    >
      <For each={local.tappable && store.clicks}>
        {(click) => (
          <span
            class={style.Events__tappable}
            style={{
              left: `${click.x}px`,
              top: `${click.y}px`,
            }}
            onAnimationEnd={() => {
              setStore(
                produce((store) => {
                  const index = store.clicks.findIndex((x) => x.id === click.id)

                  if (index !== -1) {
                    store.clicks.splice(index, 1)
                  }

                  return store
                }),
              )
            }}
          />
        )}
      </For>
      {local.children}
    </Dynamic>
  )
}

const coordX = (e: any): number => e?.clientX || e?.changedTouches?.[0]?.clientX || 0
const coordY = (e: any): number => e?.clientY || e?.changedTouches?.[0]?.clientY || 0

export default Events
