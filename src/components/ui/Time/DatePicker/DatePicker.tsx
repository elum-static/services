import Flex from "@ui/Template/Flex/Flex"
import style from "./DatePicker.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  For,
  createSignal,
  createEffect,
  Show,
  on,
} from "solid-js"
import { clamp } from "@minsize/utils"
import { createStore, produce, reconcile } from "solid-js/store"
import Touch from "@ui/Template/Touch/Touch"
import { debounce } from "@solid-primitives/scheduled"
import { Picker } from "./helper"
import {
  Day,
  duplicateArray,
  generateDateRange,
  getDaysForMonth,
  getDaysInMonth,
  Month,
  Year,
} from "./helper/utils"
import useComputedBlockStyles from "@ui/utils/useComputedBlockStyles"
import { isTouchSupport } from "@ui/Template/Events/Events"

interface DatePicker
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  ISOFormat?: string

  from?: Date
  to?: Date
  value: Date
  onChange: (date: Date) => void
}

const DAYS_REPEAT = 5
const MONTH_REPEAT = 5
const YEAR_REPEAT = 1

const DatePicker: Component<DatePicker> = (props) => {
  const merged = mergeProps(
    {
      from: new Date(Date.now() - 86_400_000 * 365 * 25),
      to: new Date(Date.now() + 86_400_000 * 365 * 25),
      value: new Date(),
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "from",
    "to",
    "value",
    "onChange",
    "ISOFormat",
  ])

  // Шаг изменения значения
  const [step, setStep] = createSignal(
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font_height--large")
        .trim() || "20",
    ) - 4,
  )

  var ref: HTMLDivElement

  // Генерация базовых данных
  const { months, years } = generateDateRange(
    local.from,
    local.to,
    local.ISOFormat,
  )

  // Функция для получения корректного дня при смене месяца/года
  const getValidDay = (year: number, month: number, originalDay: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    return Math.min(originalDay, daysInMonth)
  }

  const [store, setStore] = createStore({
    time: new Date(local.value),
    // Сохраняем оригинальные индексы из дублированных массивов
    dayIndex:
      local.value.getDate() -
      1 +
      getDaysInMonth(local.value.getFullYear(), local.value.getMonth()) *
        clamp(Math.floor(DAYS_REPEAT / 2), 1, DAYS_REPEAT), // Начинаем с середины дублированного массива
    monthIndex:
      local.value.getMonth() +
      12 * clamp(Math.floor(MONTH_REPEAT / 2), 1, MONTH_REPEAT), // Начинаем с середины (12 * 2 из 12 * 5)
    yearIndex:
      years.findIndex((year) => year.year === local.value.getFullYear()) *
      clamp(Math.floor(YEAR_REPEAT / 2), 1, YEAR_REPEAT),
    days: duplicateArray(
      getDaysForMonth(local.value.getFullYear(), local.value.getMonth()),
      DAYS_REPEAT,
    ),
  })

  createEffect(() => {
    if (
      local.value.getDate() !== store.time.getDate() ||
      local.value.getMonth() !== store.time.getMonth() ||
      local.value.getFullYear() !== store.time.getFullYear()
    ) {
      setStore({
        time: new Date(local.value),
        dayIndex:
          local.value.getDate() -
          1 +
          getDaysInMonth(local.value.getFullYear(), local.value.getMonth()) *
            clamp(Math.floor(DAYS_REPEAT / 2), 1, DAYS_REPEAT),
        monthIndex:
          local.value.getMonth() +
          12 * clamp(Math.floor(MONTH_REPEAT / 2), 1, MONTH_REPEAT),
        yearIndex:
          years.findIndex((year) => year.year === local.value.getFullYear()) *
          clamp(Math.floor(YEAR_REPEAT / 2), 1, YEAR_REPEAT),
        days: duplicateArray(
          getDaysForMonth(local.value.getFullYear(), local.value.getMonth()),
          DAYS_REPEAT,
        ),
      })
    }
  })

  const onChange = (
    option:
      | (Day & { month?: undefined; year?: undefined })
      | (Month & { day?: undefined; year?: undefined })
      | (Year & { month?: undefined; day?: undefined }),
  ) => {
    const originalDay = store.time.getDate()
    setStore(
      produce((store) => {
        // Проверяем валидность дня для нового месяца
        const validDay = getValidDay(
          option.year !== undefined ? option.year : store.time.getFullYear(),
          option.month !== undefined ? option.month : store.time.getMonth(),
          originalDay,
        )

        if (option.day !== undefined) {
          store.time.setDate(option.day)
          store.dayIndex = option.id
        } else {
          store.time.setDate(validDay)
          // store.dayIndex = validDay - 1
        }

        if (option.month !== undefined) {
          store.time.setMonth(option.month)
          store.monthIndex = option.id
        }

        if (option.year !== undefined) {
          store.time.setFullYear(option.year)
          store.yearIndex = option.id
        }

        store.days = duplicateArray(
          getDaysForMonth(store.time.getFullYear(), store.time.getMonth()),
          DAYS_REPEAT,
        )

        if (
          originalDay !== validDay ||
          option.month !== undefined ||
          option.year !== undefined
        ) {
          const filtered = store.days.filter((item) => item.day === validDay)

          const newDay = filtered
            .map((item) => ({
              item,
              distance: Math.abs(item.id - store.dayIndex),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 1)
            .map(({ item }) => item)?.[0]

          if (newDay && store.days?.[store.dayIndex]?.day !== newDay.day) {
            store.dayIndex = newDay.id
          }
        }
        local.onChange(new Date(store.time))

        return store
      }),
    )
  }

  return (
    <div
      ref={ref!}
      class={style.DatePicker}
      classList={{
        [style["DatePicker--isTouch"]]: !!isTouchSupport,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Flex direction={"row"} class={style.DatePicker__in}>
        <Picker
          step={step()}
          options={store.days}
          defaultId={store.dayIndex}
          onChange={onChange}
        />
        <Picker
          step={step()}
          options={duplicateArray(months, MONTH_REPEAT)}
          defaultId={store.monthIndex}
          onChange={onChange}
        />
        <Picker
          step={step()}
          options={duplicateArray(years, YEAR_REPEAT)}
          defaultId={store.yearIndex}
          onChange={onChange}
        />
      </Flex>
    </div>
  )
}

export default DatePicker
