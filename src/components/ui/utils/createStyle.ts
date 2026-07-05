import { type Platform } from "@ui/Types"

export const mergeObjectsWithSum = <T extends unknown>(styles: [T, T]): T => {
  const result: {
    [key: string]: string
  } = {}

  for (const style of styles) {
    for (const key in style) {
      if (result.hasOwnProperty(key)) {
        result[key] = `${result[key]} ${style[key]}`
      } else {
        result[key] = `${style[key]}`
      }
    }
  }

  return result as T
}

const createStyle = <T extends CSSModuleClasses>(
  standard: T,
  styles: Record<Platform, T>,
) => {
  let platformStyles: Partial<Record<Platform, T>> = {}

  for (const key in styles) {
    const platform = key as Platform
    platformStyles[platform] = mergeObjectsWithSum([standard, styles[platform]])
  }

  return platformStyles as NonNullable<Record<Platform, T>>
}

export default createStyle
