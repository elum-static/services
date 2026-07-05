import { type JSX, type Component, splitProps } from "solid-js"
import Events, { isTouchSupport, type EventsProps } from "../Events/Events"
import { type DOMElement } from "solid-js/jsx-runtime"

interface Gesture {
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
  _lastEvent?: TouchEvent & {
    currentTarget: HTMLDivElement
    target: DOMElement
  }
}

type CustomEvent = (MouseEvent | TouchEvent) & {
  currentTarget: HTMLDivElement
  target: Element
}

export interface GestureEvent extends Gesture {
  originalEvent: MouseEvent | TouchEvent
}

const SPEED_THRESHOLD = 1900 // px/s
const TIME_THRESHOLD = 150 // ms

const coordX = (e: any): number => e?.clientX || e?.changedTouches?.[0]?.clientX || 0
const coordY = (e: any): number => e?.clientY || e?.changedTouches?.[0]?.clientY || 0

export interface TouchProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onClick"> {
  onClick?(event: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>): void

  onStart?(event: GestureEvent): void
  onStartX?(event: GestureEvent): void
  onStartY?(event: GestureEvent): void

  onMove?(event: GestureEvent): void
  onMoveX?(event: GestureEvent): void
  onMoveY?(event: GestureEvent): void

  onEnd?(event: GestureEvent): void
  onEndX?(event: GestureEvent): void
  onEndY?(event: GestureEvent): void

  classes?: EventsProps<"div">["classes"]
}

const Touch: Component<TouchProps> = (props) => {
  const gesture: Gesture = {
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

  const [local, others] = splitProps(props, [
    "children",

    "onClick",

    "onStart",
    "onStartX",
    "onStartY",

    "onMove",
    "onMoveX",
    "onMoveY",

    "onEnd",
    "onEndX",
    "onEndY",
  ])

  const Start: JSX.EventHandlerUnion<
    HTMLDivElement,
    TouchEvent,
    JSX.EventHandler<HTMLDivElement, TouchEvent>
  > = (event) => {
    /* Правая кнопка мыши */
    if ((event as unknown as MouseEvent).button === 2) {
      return
    }

    // Если поставить то в Modal не будет работать Input
    // event.preventDefault()

    gesture.startX = coordX(event)
    gesture.startY = coordY(event)
    gesture.startT = new Date()
    gesture.isPressed = true

    delete gesture.isY
    delete gesture.isX

    delete gesture.isSlideX
    delete gesture.isSlideY
    delete gesture.isSlide

    delete gesture.shiftX
    delete gesture.shiftY
    delete gesture.shiftXAbs
    delete gesture.shiftYAbs

    const startEvent = Object.assign(
      {
        originalEvent: event,
      },
      gesture,
    ) as GestureEvent

    local.onStart && local.onStart(startEvent)
    local.onStartX && local.onStartX(startEvent)
    local.onStartY && local.onStartY(startEvent)
  }

  const Move: JSX.EventHandlerUnion<
    HTMLDivElement,
    TouchEvent,
    JSX.EventHandler<HTMLDivElement, TouchEvent>
  > = (event) => {
    /* Правая кнопка мыши */
    if ((event as unknown as MouseEvent).button === 2) {
      return
    }
    event.preventDefault()

    if (!gesture.isPressed) {
      return
    }

    if (event instanceof TouchEvent && event.touches && event.touches.length > 1) {
      return (End as any)(event)
    }

    const shiftX = coordX(event) - (gesture.startX || 0)
    const shiftY = coordY(event) - (gesture.startY || 0)
    const shiftXAbs = Math.abs(shiftX)
    const shiftYAbs = Math.abs(shiftY)

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

      const startEvent = Object.assign(
        {
          originalEvent: event,
        },
        gesture,
      ) as GestureEvent

      local.onMove && local.onMove(startEvent)
      gesture.isSlideX && local.onMoveX && local.onMoveX(startEvent)
      gesture.isSlideY && local.onMoveY && local.onMoveY(startEvent)
    }
  }

  const End: JSX.EventHandlerUnion<
    HTMLDivElement,
    TouchEvent,
    JSX.EventHandler<HTMLDivElement, TouchEvent>
  > = (event) => {
    /* Правая кнопка мыши */
    if ((event as unknown as MouseEvent).button === 2) {
      return
    }
    gesture._lastEvent = event
    gesture._lastTouchEndTime = Date.now()

    if (!gesture.isX && !gesture.isY) {
      // local.onClick && local.onClick(event as any)
    } else {
      event.preventDefault()
    }

    // if (!gesture.isPressed) {
    //   return
    // }

    gesture.cancel = gesture.isSlide

    // delete gesture.startX
    // delete gesture.startY
    // delete gesture.startT

    delete gesture.isPressed
    // delete gesture.isY
    // delete gesture.isX

    // delete gesture.isSlideX
    // delete gesture.isSlideY
    // delete gesture.isSlide
    // delete gesture.shiftX
    // delete gesture.shiftY
    // delete gesture.shiftXAbs
    // delete gesture.shiftYAbs

    const endEvent = Object.assign(
      {
        originalEvent: event,
      },
      gesture,
    ) as GestureEvent

    local.onEnd && local.onEnd(endEvent)
    local.onEndX && local.onEndX(endEvent)
    local.onEndY && local.onEndY(endEvent)
  }

  const Click: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    /* Правая кнопка мыши */
    if ((event as unknown as MouseEvent).button === 2) {
      return
    }
    if (!gesture.cancel) {
      local.onClick && local.onClick(event as any)
      // event.preventDefault();
    }
    // local.onClick && local.onClick(event as any);

    gesture.cancel = false
  }

  const Drag = () => {}

  const mouseEvent = {
    onMouseDown: Start as unknown as JSX.EventHandlerUnion<
      HTMLDivElement,
      MouseEvent,
      JSX.EventHandler<HTMLDivElement, MouseEvent>
    >,
    onMouseMove: Move as unknown as JSX.EventHandlerUnion<
      HTMLDivElement,
      MouseEvent,
      JSX.EventHandler<HTMLDivElement, MouseEvent>
    >,
    onMouseUp: End as unknown as JSX.EventHandlerUnion<
      HTMLDivElement,
      MouseEvent,
      JSX.EventHandler<HTMLDivElement, MouseEvent>
    >,
    onMouseLeave: End as unknown as JSX.EventHandlerUnion<
      HTMLDivElement,
      MouseEvent,
      JSX.EventHandler<HTMLDivElement, MouseEvent>
    >,
  }

  const touchEvent = {
    onTouchStart: Start,
    onTouchMove: Move,
    onTouchEnd: End,
    onTouchCancel: End,
  }

  return (
    <div
      {...others}
      onClick={Click}
      // onDragStart={Drag}
      {...(isTouchSupport ? touchEvent : mouseEvent)}
    >
      {local.children}
    </div>
  )
}

export default Touch
