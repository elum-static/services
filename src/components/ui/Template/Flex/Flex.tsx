import style from "./Flex.module.css"
import { type JSX, mergeProps, splitProps, ValidComponent } from "solid-js"
import { Dynamic, DynamicProps } from "solid-js/web"
import combineStyle from "../../utils/combineStyle"

/**
 * Интерфейс для компонента Flex, расширяющий стандартные HTML атрибуты div элемента.
 * Позволяет гибко управлять layout с помощью CSS Flexbox.
 */
export interface FlexProps<T extends ValidComponent = "div"> extends JSX.HTMLAttributes<
  DynamicProps<T>
> {
  /**
   * @default "div"
   */
  component?: T

  /**
   * Направление расположения flex-элементов
   * @default "column"
   *
   * - "row" - элементы располагаются в строку (слева направо)
   * - "column" - элементы располагаются в колонку (сверху вниз)
   */
  direction?: "row" | "column" | "row-reverse" | "column-reverse"

  /**
   * Выравнивание элементов по поперечной оси (align-items в CSS)
   * @default "center"
   *
   * - "start" - выравнивание по началу оси (flex-start)
   * - "end" - выравнивание по концу оси (flex-end)
   * - "center" - выравнивание по центру
   * - "stretch" - растягивание на всю доступную длину
   * - "baseline" - выравнивание по базовой линии текста
   */
  align?: "start" | "end" | "center" | "stretch" | "baseline"

  /**
   * Распределение элементов по главной оси (justify-content в CSS)
   * @default "center"
   *
   * - "start" - элементы прижаты к началу (flex-start)
   * - "end" - элементы прижаты к концу (flex-end)
   * - "center" - элементы по центру
   * - "between" - равное расстояние между элементами (space-between)
   * - "around" - равное расстояние вокруг элементов (space-around)
   * - "evenly" - равное расстояние вокруг и между (space-evenly)
   */
  justify?: "start" | "end" | "center" | "between" | "around" | "evenly"

  /**
   * Перенос элементов на новую строку (flex-wrap в CSS)
   * @default "nowrap"
   *
   * - "nowrap" - запрет переноса (все в одну строку)
   * - "wrap" - разрешение переноса (сверху вниз)
   * - "wrap-reverse" - перенос в обратном порядке (снизу вверх)
   */
  wrap?: "nowrap" | "wrap" | "wrap-reverse"

  padding?: JSX.CSSProperties["padding"]
  gap?: JSX.CSSProperties["gap"]
}

const Flex = <T extends ValidComponent>(props: FlexProps<T>): JSX.Element => {
  const merged = mergeProps(
    {
      direction: "column",
      align: "center",
      justify: "center",
      wrap: "nowrap",
      component: "div",
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "direction",
    "align",
    "justify",
    "wrap",
    "padding",
    "gap",
  ])

  return (
    <Dynamic
      class={style.Flex}
      classList={{
        [style[`Flex__direction--${local.direction}`]]: local.direction,
        [style[`Flex__align--${local.align}`]]: local.align,
        [style[`Flex__justify--${local.justify}`]]: local.justify,
        [style[`Flex__wrap--${local.wrap}`]]: !!local.wrap,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      style={combineStyle({ padding: local.padding, gap: local.gap }, local.style)}
      {...others}
    >
      {local.children}
    </Dynamic>
  )
}

export default Flex
