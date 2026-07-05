import style from "./BetPlayers.module.css"

import { Avatar, Cell, Flex, type FlexProps, Lottie, Plug, Text } from "src/components/ui"
import { type Component, mergeProps, splitProps, For, Show } from "solid-js"
import core from "src/core"
import { IconStars } from "src/source"
import AnimationNumber from "../AnimationNumber/AnimationNumber"

interface BetPlayers extends FlexProps {
  players: Array<{
    id: number
    is_premium: boolean
    photo_url?: string
    first_name: string
    last_name: string
    user_name?: string

    amount: number

    multiplier: number

    status: "ACTIVE" | "LOST" | "PAID" | "PLACED"
  }>
}

const BetPlayers: Component<BetPlayers> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children", "players"])

  return (
    <Flex
      class={style.BetPlayers}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <span class={style.BetPlayers__in}>
        <For
          each={local.players}
          fallback={
            <Plug>
              <Plug.Container>
                {/* <Plug.Icon>
                  <Lottie data={core.files.getTGS("Timeless Book", "Original")} />
                </Plug.Icon> */}
                <Text align={"center"}>
                  {/** FIXME: Language */}
                  <Text.Content>Ставок ещё нет</Text.Content>
                </Text>
              </Plug.Container>
            </Plug>
          }
        >
          {(player) => (
            <Cell
              before={
                <Avatar
                  gradientId={String(player.id || player.first_name || "Anonymous")}
                  name={player.first_name || "Anonymous"}
                  size={"40px"}
                />
              }
              subTitle={
                <Flex direction={"row"}>
                  <Text color={"yellow"} size={"small"} gap={"small"}>
                    <Text.Badge>
                      <IconStars width={14} height={14} />
                    </Text.Badge>
                    <Text.Content full={false}>
                      <AnimationNumber
                        value={
                          (player.amount / core.config.balanceFactor) *
                          core.games.getMultipliersNumber(player.multiplier)
                        }
                        format={{ maximumFractionDigits: 2 }}
                      />
                    </Text.Content>
                    <Text.Badge>
                      <Text
                        size={"small"}
                        color={
                          (
                            {
                              ACTIVE: "secondary",
                              LOST: "red",
                              PAID: "green",
                              PLACED: "secondary",
                            } as const
                          )[player.status] || "secondary"
                        }
                      >
                        <Text.Content>X{core.games.getMultipliers(player.multiplier)}</Text.Content>
                      </Text>
                    </Text.Badge>
                  </Text>
                </Flex>
              }
            >
              <Text>
                <Text.Content>
                  {/** FIXME: Language */}
                  <Show when={player.first_name || player.last_name} fallback={"Anonymous"}>
                    {player.first_name} {player.last_name}
                  </Show>
                </Text.Content>
              </Text>
            </Cell>
          )}
        </For>
      </span>
    </Flex>
  )
}

export default BetPlayers
