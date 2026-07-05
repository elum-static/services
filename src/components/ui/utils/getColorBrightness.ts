/**
 * Определяет, является ли цвет светлым или тёмным с учётом прозрачности
 * @param hexColor - цвет в формате HEX (3, 4, 6 или 8 символов, с # или без)
 * @param background - цвет фона для смешивания ('white' | 'black' | hex), по умолчанию 'white'
 * @returns 'light' | 'dark'
 */
function getColorBrightness(
  hexColor: string,
  background: "white" | "black" | string = "white",
): "light" | "dark" {
  // Удаляем # если есть
  let hex = hexColor.replace("#", "")

  // Проверяем и нормализуем HEX-цвет
  if (/^[0-9A-F]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  } else if (/^[0-9A-F]{4}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("")
  } else if (!/^([0-9A-F]{6}|[0-9A-F]{8})$/i.test(hex)) {
    console.error("Invalid HEX color format")
    return "dark"
  }

  // Получаем альфа-канал (по умолчанию FF - непрозрачный)
  let alpha = 255
  if (hex.length === 8) {
    alpha = parseInt(hex.substring(6, 8), 16)
    hex = hex.substring(0, 6)
  }

  // Преобразуем HEX в RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  // Если цвет полностью прозрачный - считаем его как фон
  if (alpha <= 255 / 2) {
    return background === "white" ? "light" : "dark"
  }

  // Если цвет не полностью непрозрачный - смешиваем с фоном
  if (alpha < 255) {
    // Определяем цвет фона
    let bgR = 255,
      bgG = 255,
      bgB = 255 // по умолчанию белый
    if (background === "black") {
      bgR = bgG = bgB = 0
    } else if (background && background !== "white") {
      // Если фон задан HEX-цветом
      const bgHex = background.replace("#", "")
      if (/^[0-9A-F]{6}$/i.test(bgHex)) {
        bgR = parseInt(bgHex.substring(0, 2), 16)
        bgG = parseInt(bgHex.substring(2, 4), 16)
        bgB = parseInt(bgHex.substring(4, 6), 16)
      }
    }

    // Коэффициент смешивания (0-1)
    const alphaRatio = alpha / 255

    // Смешиваем цвета
    const mixedR = Math.round(r * alphaRatio + bgR * (1 - alphaRatio))
    const mixedG = Math.round(g * alphaRatio + bgG * (1 - alphaRatio))
    const mixedB = Math.round(b * alphaRatio + bgB * (1 - alphaRatio))

    // Рассчитываем яркость для смешанного цвета
    const luminance = (0.299 * mixedR + 0.587 * mixedG + 0.114 * mixedB) / 255
    return luminance > 0.5 ? "light" : "dark"
  }

  // Для полностью непрозрачных цветов
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? "light" : "dark"
}

export default getColorBrightness
