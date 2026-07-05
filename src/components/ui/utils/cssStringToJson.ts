import { JSX } from "solid-js"

const cssStringToJson = (
  cssString: string | JSX.CSSProperties | undefined,
): JSX.CSSProperties => {
  if (typeof cssString !== "string") {
    return cssString || {}
  }
  if (!cssString) {
    return {}
  }

  const trimmedCss = cssString.trim()
  if (!trimmedCss) {
    return {}
  }

  const styles: Record<string, string> = {}
  const declarations = trimmedCss.split(";")

  for (const declaration of declarations) {
    const trimmedDeclaration = declaration.trim()

    if (!trimmedDeclaration) {
      continue
    }

    const [property, value] = trimmedDeclaration
      .split(":")
      .map((part) => part.trim())

    if (!property || !value) {
      console.warn(`Неправильный формат декларации CSS: ${trimmedDeclaration}`)
      continue
    }

    styles[property] = value
  }

  return Object.keys(styles).length > 0 ? styles : {}
}

export default cssStringToJson
