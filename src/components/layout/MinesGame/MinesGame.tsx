import { AnimationNumber, MinesItem } from "src/components/features"
import style from "./MinesGame.module.css"
import { type JSX, type Component, mergeProps, splitProps, For, createEffect, on } from "solid-js"
import { Flex, Text } from "src/components/ui"
import { IconMine, IconStars } from "src/source"
import core from "src/core"
import { clamp } from "@minsize/utils"

interface MinesGame extends JSX.HTMLAttributes<HTMLDivElement> {}

const MinesGame: Component<MinesGame> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  createEffect(
    on(
      () => core.games.mines.info.opened,
      () => {
        if (core.games.mines.info.status !== "ACTIVE") {
          return
        }

        const cell_id = clamp(core.games.mines.info.opened.length - 1, 0, 25)

        const element = document.querySelector(`[data-cell_id="${cell_id}"]`)

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "center",
          })
        }
      },
      {
        defer: true,
      },
    ),
  )

  return (
    <div
      class={style.MinesGame}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Text class={style.MinesGame__label}>
        {/** FIXME: Language */}
        <Text.Content>Игровое поле</Text.Content>
        <span class={style.MinesGame__badge}>
          <Text size={"small"}>
            <Text.Badge>
              <IconMine width={12} height={12} />
            </Text.Badge>
            <Text.Content>{core.games.mines.mines}</Text.Content>
          </Text>
        </span>
      </Text>
      <Flex class={style.MinesGame__field}>
        <For each={Array.from({ length: 25 })}>
          {(item, index) => (
            <MinesItem
              onClick={() => {
                core.games.mines.open(index())
              }}
              type={
                core.games.mines.info.map?.includes(index())
                  ? "mine"
                  : core.games.mines.info.opened?.includes(index())
                    ? "success"
                    : "idle"
              }
            />
          )}
        </For>
      </Flex>
      <Text class={style.MinesGame__label}>
        <Text.Content>Шаги</Text.Content>
      </Text>
      <Flex direction={"row"} class={style.MinesGame__blocks} justify={"start"}>
        <For each={getMinesX(core.games.mines.mines)}>
          {(item, index) => (
            <Flex
              data-cell_id={index()}
              class={style.MinesGame__block}
              classList={{
                [style[`MinesGame__block--inactive`]]:
                  core.games.mines.info.status !== "IDLE" &&
                  index() !== core.games.mines.info.opened.length - 1,
              }}
            >
              <Flex direction={"row"} gap={"6px"}>
                <Text size={"small"} gap={"small"}>
                  <Text.Content>
                    <IconStars width={14} height={14} />
                  </Text.Content>
                  <Text.Badge>
                    <AnimationNumber
                      value={core.api.balance.getTransform(core.games.mines.amount * item)}
                    />
                  </Text.Badge>
                </Text>
              </Flex>
              <Text size={"xx-small"} nowrap class={style.MinesGame__block__subtitle}>
                <Text.Content>
                  {/** FIXME: Language */}
                  Шаг {index() + 1} • X{core.games.getMultipliers(item * core.config.balanceFactor)}
                </Text.Content>
              </Text>
            </Flex>
          )}
        </For>
      </Flex>
    </div>
  )
}

export default MinesGame

function getMinesX(mines: number, rtp = 0.97) {
  if (!Number.isInteger(mines) || mines < 1 || mines > 24) {
    throw new Error("mines must be an integer between 1 and 24")
  }

  const combination = (n: number, k: number) => {
    if (k < 0 || k > n) return 0
    if (k === 0 || k === n) return 1

    k = Math.min(k, n - k)

    let result = 1
    for (let i = 1; i <= k; i++) {
      result = (result * (n - k + i)) / i
    }

    return result
  }

  return Array.from({ length: 25 - mines }, (_, index) => {
    const safe = index + 1
    return Number(((rtp * combination(25, safe)) / combination(25 - mines, safe)).toFixed(6))
  })
}
