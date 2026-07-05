import core from "src/core"
import style from "./InputMultiplier.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import { clamp } from "@minsize/utils"
import { IconMinus, IconPlus } from "src/source"
import { Button, Flex } from "src/components/ui"
import AnimationNumber from "../AnimationNumber/AnimationNumber"

interface InputMultiplier extends JSX.HTMLAttributes<HTMLDivElement> {
  value: number
  onChangeValue: (value: number) => void
}

const InputMultiplier: Component<InputMultiplier> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "value",
    "onChangeValue",
  ])

  const onChangeValue = (newValue: number) => {
    local.onChangeValue(
      Number(
        clamp(newValue, 1.1 * core.config.balanceFactor, 100 * core.config.balanceFactor).toFixed(
          0,
        ),
      ),
    )
  }

  return (
    <Flex
      class={style.InputMultiplier}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      direction={"row"}
      {...others}
    >
      <Button
        onClick={() => onChangeValue(local.value - 0.1 * core.config.balanceFactor)}
        class={style.InputMultiplier__button}
        mode={"soft"}
        type={"icon"}
        size={"x-small"}
      >
        <Button.Content>
          <IconMinus width={16} height={16} />
        </Button.Content>
      </Button>
      <Flex direction={"row"}>
        x<AnimationNumber value={core.games.getMultipliersNumber(local.value)} />
      </Flex>
      <Button
        onClick={() => onChangeValue(local.value + 0.1 * core.config.balanceFactor)}
        class={style.InputMultiplier__button}
        mode={"soft"}
        type={"icon"}
        size={"x-small"}
      >
        <Button.Content>
          <IconPlus width={16} height={16} />
        </Button.Content>
      </Button>
    </Flex>
  )
}

export default InputMultiplier
