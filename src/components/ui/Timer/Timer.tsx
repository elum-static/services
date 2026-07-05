import style from "./Timer.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js"

interface Timer extends JSX.HTMLAttributes<HTMLDivElement> {
  targetDate?: Date | string | number
  format?: string
  onFinish?: () => void
  onTick?: () => void // колбэк на каждый тик
  fallback?: JSX.Element
  direction?: "forward" | "backward" // новое свойство для направления
}

const Timer: Component<Timer> = (props) => {
  const merged = mergeProps(
    {
      format: "DD:HH:MM:SS",
      direction: "backward", // по умолчанию вперед
    },
    props,
  )
  const [timeLeft, setTimeLeft] = createSignal(calculateTimeLeft())

  function calculateTimeLeft() {
    const now = new Date()
    const target = new Date(merged.targetDate || "")
    let difference: number

    // Вычисляем разницу в зависимости от направления
    if (merged.direction === "forward") {
      difference = now.getTime() - target.getTime() // обратная логика
    } else {
      difference = target.getTime() - now.getTime() // оригинальная логика
    }

    if (!merged.targetDate) {
      return {
        end: true,
        years: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }
    }

    // Для forward направления не вызываем onFinish, так как время только увеличивается
    if (merged.direction !== "forward" && difference <= 0) {
      merged.onFinish?.()
      return {
        end: true,
        years: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      }
    }

    // Расчет временных единиц (используем абсолютное значение для forward направления)
    const absDifference = Math.abs(difference)
    const years = Math.floor(absDifference / (1000 * 60 * 60 * 24 * 365))
    const days = Math.floor((absDifference / (1000 * 60 * 60 * 24)) % 365)
    const hours = Math.floor((absDifference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((absDifference / (1000 * 60)) % 60)
    const seconds = Math.floor((absDifference / 1000) % 60)
    const milliseconds = Math.floor(absDifference % 1000)

    return {
      end: false,
      years,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    }
  }

  function formatTime() {
    const time = timeLeft()
    const formats = {
      YYYY: String(time.years).padStart(4, "0"),
      DD: String(time.days).padStart(2, "0"),
      HH: String(time.hours).padStart(2, "0"),
      MM: String(time.minutes).padStart(2, "0"),
      SS: String(time.seconds).padStart(2, "0"),
      S: String(time.seconds),
      MS: String(time.milliseconds).padStart(3, "0"),
    }

    let result = merged.format || "YYYY:HH:MM:SS"

    result = result.replace(/YYYY/g, formats.YYYY)
    result = result.replace(/DD/g, formats.DD)
    result = result.replace(/HH/g, formats.HH)
    result = result.replace(/MM/g, formats.MM)
    result = result.replace(/SS/g, formats.SS)
    result = result.replace(/S/g, formats.S)
    result = result.replace(/MS/g, formats.MS)

    return result
  }

  let timerId: number

  onMount(() => {
    timerId = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft())
      merged.onTick?.() // вызываем колбэк при каждом обновлении
    }, 1000)
  })

  onCleanup(() => {
    window.clearInterval(timerId)
  })

  return (
    <Show when={!timeLeft().end || merged.direction === "forward"} fallback={merged.fallback}>
      <span class={style.Timer} {...props}>
        {formatTime()}
      </span>
    </Show>
  )
}

export default Timer
