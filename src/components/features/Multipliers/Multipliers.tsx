import style from "./Multipliers.module.css"
import { type JSX, type Component, mergeProps, splitProps, For, Show } from "solid-js"

import { Flex, Text, type FlexProps } from "src/components/ui"
import core from "src/core"
import { GameCrushPhase } from "src/core/src/api/game/crush/types"

interface Multipliers extends FlexProps {
  phaseCurrent: GameCrushPhase
  multiplierCurrent: number
  multipliers: Array<number>
}

const Multipliers: Component<Multipliers> = (props) => {
  const merged = mergeProps({ multipliers: [] }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "multipliers",
    "multiplierCurrent",
    "phaseCurrent",
  ])

  return (
    <Flex
      class={style.Multipliers}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      justify={"start"}
      direction={"row"}
      gap={"10px"}
      {...others}
    >
      <Show when={local.phaseCurrent !== GameCrushPhase.CRASHED}>
        <Flex
          direction={"column"}
          class={style.Multipliers__item}
          classList={{
            [style[`Multipliers__item--large`]]:
              local.multiplierCurrent >= 5 * core.config.balanceFactor,
            [style[`Multipliers__item--medium`]]:
              local.multiplierCurrent >= 2 * core.config.balanceFactor,
            [style[`Multipliers__item--default`]]: true,
            [style[`Multipliers__item--expectation`]]: local.phaseCurrent !== GameCrushPhase.FLYING,
          }}
        >
          {/** FIXME: Language */}
          <Show
            when={local.phaseCurrent === GameCrushPhase.FLYING}
            fallback={
              <Text color={"inherit"} weight={"600"}>
                <Text.Content>Ожидание</Text.Content>
              </Text>
            }
          >
            <Text color={"inherit"} weight={"600"}>
              <Text.Content>x{core.games.getMultipliers(local.multiplierCurrent)}</Text.Content>
            </Text>
          </Show>
        </Flex>
      </Show>
      <For each={local.multipliers}>
        {(multipliers) => (
          <Flex
            direction={"column"}
            class={style.Multipliers__item}
            classList={{
              [style[`Multipliers__item--large`]]: multipliers >= 5 * core.config.balanceFactor,
              [style[`Multipliers__item--medium`]]: multipliers >= 2 * core.config.balanceFactor,
              [style[`Multipliers__item--default`]]: true,
            }}
          >
            <Text color={"inherit"} weight={"600"}>
              <Text.Content>x{core.games.getMultipliers(multipliers)}</Text.Content>
            </Text>
          </Flex>
        )}
      </For>
    </Flex>
  )
}

export default Multipliers
