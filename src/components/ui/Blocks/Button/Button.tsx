import { styles } from "./styles"
import Events, { type EventsProps } from "@ui/Template/Events/Events"
import useStyle from "@ui/utils/useStyle"

import { type Component, mergeProps, Show, splitProps } from "solid-js"
import { Content, Group, Icon } from "./addons"
import createHandler from "@ui/utils/createHandler"
import Spinner from "../Spinner/Spinner"
import Flex from "@ui/Template/Flex/Flex"
import { IconExclamationCircle } from "src/source"

/**
 * При изменении padding нужно изменить и в Control.Button
 */
export interface ButtonProps extends EventsProps<"button"> {
  /**
   * Цветовая схема кнопки
   * @default "accent"
   *
   * Варианты:
   * - **accent** - основной цвет акцента (по умолчанию)
   * - **success** - цвет успешного действия
   * - **warning** - цвет предупреждения
   * - **danger** - цвет опасного действия
   * - **neutral** - нейтральный серый цвет
   */
  appearance?:
    | "accent"
    | "neutral"
    | "danger"
    | "secondary"
    | "positive"
    | "white"
    | "secondary-crush"

  /**
   * Размер кнопки
   * @default "medium"
   *
   * Варианты:
   * - **small** - компактная кнопка (для плотных интерфейсов)
   * - **medium** - стандартный размер (по умолчанию)
   * - **large** - крупная кнопка (для главных действий)
   */
  size?: "x-small" | "small" | "medium" | "large"

  /**
   * Стиль границы кнопки
   * @default "rounded"
   *
   * Варианты:
   * - **circle** - полностью скругленные углы (круглая кнопка)
   * - **pill** - скругленные углы в форме "таблетки"
   * - **rounded** - умеренно скругленные углы
   * - **square** - прямые углы без скруглений
   */
  border?: "circle" | "pill" | "rounded" | "x-rounded" | "square"

  /**
   * Визуальный стиль кнопки
   * @default "filled"
   *
   * Варианты:
   * - **filled** - сплошная заливка (по умолчанию)
   * - **outline** - контур с прозрачным фоном
   * - **ghost** - только текст/иконка без видимого контейнера
   * - **soft** - полупрозрачный фон без границы
   */
  mode?: "filled" | "outline" | "ghost" | "soft"

  /**
   * Состояние загрузки (показывает лоадер)
   * @default false
   *
   * Примечания:
   * - В режиме загрузки кнопка автоматически становится disabled
   */
  loading?: boolean

  /**
   * Состояние ошибки (показывает иконку ошибки)
   * @default false
   *
   * Примечания:
   * - В режиме ошибки кнопка автоматически становится disabled
   */
  error?: boolean

  /**
   * Неактивное состояние
   * @default false
   *
   * Примечания:
   * - Отключает обработчики событий
   * - Применяет стили disabled состояния
   */
  disabled?: boolean

  /**
   * Растягивание на всю ширину контейнера
   * @default false
   *
   * Примечания:
   * - Кнопка займет 100% ширины родительского контейнера
   * - Полезно для мобильных интерфейсов и форм
   */
  stretched?: boolean

  type?: "button" | "icon"
}

type ComponentButton = Component<ButtonProps> & {
  Content: typeof Content
  Icon: typeof Icon
  Group: typeof Group
}

const DEFAULT_PROPS = {
  appearance: "accent",
  mode: "filled",
  size: "medium",
  border: "rounded",
  type: "button",
} satisfies ButtonProps

const style = useStyle(styles)

const Button: ComponentButton = (props) => {
  const merged = mergeProps(DEFAULT_PROPS, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "appearance",
    "size",
    "mode",
    "border",
    "stretched",
    "type",
    "loading",
    "error",
    "onClick",
    "disabled",
  ])

  const onClick = createHandler((event) => {
    if (local.loading) {
      return "stop"
    }
  }, local.onClick)

  return (
    <Events
      component={"button"}
      class={style.Button}
      classList={{
        // appearance
        [style["Button__appearance--secondary-crush"]]: local.appearance === "secondary-crush",
        [style["Button__appearance--accent"]]: local.appearance === "accent",
        [style["Button__appearance--neutral"]]: local.appearance === "neutral",
        [style["Button__appearance--danger"]]: local.appearance === "danger",
        [style["Button__appearance--secondary"]]: local.appearance === "secondary",
        [style["Button__appearance--positive"]]: local.appearance === "positive",
        [style["Button__appearance--white"]]: local.appearance === "white",

        // size
        [style["Button__size--x-small"]]: local.size === "x-small",
        [style["Button__size--small"]]: local.size === "small",
        [style["Button__size--medium"]]: local.size === "medium",
        [style["Button__size--large"]]: local.size === "large",

        // type
        [style["Button__type--button"]]: local.type === "button",
        [style["Button__type--icon"]]: local.type === "icon",

        // border
        [style["Button__border--circle"]]: local.border === "circle",
        [style["Button__border--pill"]]: local.border === "pill",
        [style["Button__border--rounded"]]: local.border === "rounded",
        [style["Button__border--x-rounded"]]: local.border === "x-rounded",
        [style["Button__border--square"]]: local.border === "square",

        // mode
        [style["Button__mode--filled"]]: local.mode === "filled",
        [style["Button__mode--outline"]]: local.mode === "outline",
        [style["Button__mode--ghost"]]: local.mode === "ghost",
        [style["Button__mode--soft"]]: local.mode === "soft",

        [style["Button--stretched"]]: !!local.stretched,

        [style["Button--loading"]]: !!local.loading,
        [style["Button--error"]]: !!local.error,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      disabled={local.disabled || local.loading}
      onClick={onClick}
      {...others}
    >
      {local.children}
      <Show when={local.loading}>
        <Flex class={style.Button__loader}>
          <Spinner class={style.Button__loader_Spinner} color={"inherit"} size={"auto"} />
        </Flex>
      </Show>
      <Show when={local.error}>
        <Flex class={style.Button__error}>
          <IconExclamationCircle width={"100%"} height={"100%"} />
        </Flex>
      </Show>
    </Events>
  )
}

Button.Content = Content
Button.Group = Group
Button.Icon = Icon

export default Button
