import { type JSX } from "solid-js"

import cssStringToJson from "@ui/utils/cssStringToJson"

const combineStyle = (
  style: string | JSX.CSSProperties | undefined,
  others: string | JSX.CSSProperties | undefined,
) => {
  return { ...cssStringToJson(style), ...cssStringToJson(others) }
}

export default combineStyle
