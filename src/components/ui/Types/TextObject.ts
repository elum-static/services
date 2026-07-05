export type TextObject = {
  /**
   * Цвет текста.
   */
  color?: "accent" | "primary" | "secondary" | "inherit" | "red"
  /**
   * Размер текста.
   */
  size?: "x-small" | "small" | "medium" | "large" | "x-large" | "xx-large"
  /**
   * Жирность шрифта.
   */
  weight?: "400" | "500" | "600" | "700"
  /**
   * Выравнивание текста.
   */
  align?: "start" | "center" | "end"
}
