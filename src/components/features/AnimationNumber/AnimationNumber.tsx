import style from "./AnimationNumber.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"

import NumberFlow, { Format } from "solid-number-flow"

interface AnimationNumber extends JSX.HTMLAttributes<HTMLDivElement> {
  prefix?: string
  suffix?: string
  value?: number
  format?: Format
}

const AnimationNumber: Component<AnimationNumber> = (props) => {
  const merged = mergeProps(
    {
      format: {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "value",
    "prefix",
    "suffix",
    "format",
  ])

  return (
    <NumberFlow
      prefix={local.prefix}
      suffix={local.suffix}
      format={local.format}
      value={local.value || 0}
    />
  )
}

export default AnimationNumber
