import { styles } from "./styles"
import useStyle from "@ui/utils/useStyle"

import Events, { type EventsProps } from "@ui/Template/Events/Events"

import { type JSX, type Component, splitProps, mergeProps, Show } from "solid-js"
import { IconChevronRight } from "src/source"

interface CellProps extends EventsProps<"article"> {
  /**
   * Основной контент ячейки.
   * Рендерится как заголовок в крупном шрифте.
   */
  children?: JSX.Element

  /**
   * Вторичный текст, поясняющий основной контент.
   * Отображается под заголовком меньшим шрифтом.
   */
  subTitle?: JSX.Element

  /**
   * Контент, отображаемый слева от основного.
   * Используется для иконок, аватаров, индикаторов статуса.
   */
  before?: JSX.Element

  /**
   * Контент, отображаемый справа от основного.
   * Используется для иконок действий, переключателей, счетчиков.
   */
  after?: JSX.Element

  /**
   * Фоновый слой, рендерится позади основного контента.
   * Используется для создания визуальных эффектов (градиенты, паттерны).
   */
  behind?: JSX.Element

  /**
   * Определяет видимость разделительной линии под ячейкой.
   * @default "auto"
   */
  separator?: boolean | "auto"

  /**
   * Отключает интерактивность и применяет полупрозрачный стиль.
   * @default false
   */
  disabled?: boolean

  /**
   * Визуально выделяет ячейку, указывая на активное/выбранное состояние.
   * @default false
   */
  selected?: boolean

  /**
   * Управляет отображением индикатора навигации (шеврона).
   * - `"auto"` - отображается только на iOS-платформах
   * - `"always"` - отображается на всех платформах
   * - `true` / `false` - явное управление видимостью
   * @default false (не отображается)
   */
  expandable?: "auto" | "always" | boolean

  /**
   * Цветовой вариант фона ячейки.
   * @default "transparent"
   */
  background?: "transparent" | "primary" | "secondary"

  /**
   * Размерная вариация ячейки, влияет на вертикальные отступы.
   * @default "default"
   */
  size?: "default" | "small" | "xxx-small" | "chat" | "xxx-small-chat" | "small-call"

  /**
   * Вертикальное выравнивание контента внутри ячейки.
   * @default "center"
   */
  alignItems?: "center" | "start"

  /**
   * URL для навигации при клике.
   * При наличии превращает ячейку в ссылку.
   */
  href?: EventsProps<"article">["href"]

  /**
   * Поведение ссылки (открытие в новой вкладке и т.д.).
   * Актуально только при наличии `href`.
   */
  target?: EventsProps<"article">["target"]

  /**
   * Выключает min-height
   */
  minHeightDisable?: boolean
}

const DEFAULT_PROPS = {
  separator: "auto",
  size: "default",
  background: "transparent",
  alignItems: "center",
  expandable: false,
} satisfies CellProps

const style = useStyle(styles)

const Cell: Component<CellProps> = (props) => {
  const merged = mergeProps(DEFAULT_PROPS, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "separator",
    "selected",
    "size",
    "background",
    "before",
    "after",
    "subTitle",
    "expandable",
    "alignItems",
    "behind",
    "minHeightDisable",
  ])

  return (
    <Events
      component={"article"}
      class={style.Cell}
      classList={{
        [style[`Cell__size--${local.size}`]]: !!local.size,
        [style[`Cell__background--${local.background}`]]: !!local.background,
        [style[`Cell__alignItems--${local.alignItems}`]]: !!local.alignItems,
        [style[`Cell--selected`]]: local.selected,
        [style[`Cell--separator`]]: !!local.separator,
        [style[`Cell--separator--auto`]]: local.separator === "auto",
        [style[`Cell--minHeightDisable`]]: !!local.minHeightDisable,

        ...local.classList,
        [`${local.class}`]: !!local.class,
      }}
      {...others}
    >
      <Show keyed when={local.before}>
        {(before) => <span class={style.Cell__before}>{before}</span>}
      </Show>
      <div class={style.Cell__container}>
        <div class={style.Cell__content}>
          <Show keyed when={local.children}>
            {(children) => <span class={style.Cell__title}>{children}</span>}
          </Show>
          <Show keyed when={local.subTitle}>
            {(subTitle) => <span class={style.Cell__subTitle}>{subTitle}</span>}
          </Show>
        </div>

        <Show keyed when={local.after}>
          {(after) => <span class={style.Cell__after}>{after}</span>}
        </Show>
        <Show when={!!local.expandable}>
          <span
            class={style.Cell__expandable}
            classList={{
              [style[`Cell__expandable--${local.expandable}`]]: local.expandable === "always",
            }}
          >
            <IconChevronRight />
          </span>
        </Show>
      </div>
      <Show keyed when={local.behind}>
        {(behind) => <span class={style.Cell__behind}>{behind}</span>}
      </Show>
    </Events>
  )
}

export default Cell
