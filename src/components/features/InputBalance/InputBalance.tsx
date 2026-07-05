import { Flex } from "src/components/ui"
import style from "./InputBalance.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { IconStars } from "src/source"
import { clamp } from "@minsize/utils"

interface InputBalance extends JSX.HTMLAttributes<HTMLDivElement> {
  value: number
  onChangeValue: (value: number) => void

  minValue?: number
  maxValue?: number

  size?: number
}

const InputBalance: Component<InputBalance> = (props) => {
  const merged = mergeProps({ minValue: 1, maxValue: 100_000, size: 64 }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "value",
    "onChangeValue",
    "maxValue",
    "minValue",
    "size",
  ])

  return (
    <Flex class={style.InputBalance__group} gap={"16px"} direction={"row"}>
      <IconStars width={local.size} height={local.size} />
      <input
        class={style.InputBalance}
        value={local.value}
        onInput={(event) => {
          let rawValue = event.target.value

          // Убираем всё кроме цифр
          let numericValue = rawValue.replace(/\D/g, "")

          // Преобразуем в число
          let numberValue = numericValue === "" ? 0 : parseInt(numericValue, 10)

          numberValue = clamp(numberValue, 0, local.maxValue)

          event.target.value = String(numberValue || "")
          local.onChangeValue(numberValue)
        }}
        onChange={(event) => {
          let rawValue = event.target.value
          // Убираем всё кроме цифр
          let numericValue = rawValue.replace(/\D/g, "")

          // Преобразуем в число
          let numberValue = numericValue === "" ? 0 : parseInt(numericValue, 10)

          event.target.value = String(clamp(numberValue, local.minValue, local.maxValue) || "")
        }}
        placeholder={"100"}
        type={"number"}
        step={"1"}
        style={{
          "font-size": `${local.size}px`,
          height: `${local.size}px`,
        }}
      />
    </Flex>
  )
}

export default InputBalance
