import core from "@core"
import { Button, FixedLayout, Flex, Panel, Text } from "@ui/index"
import { type JSX, type Component, Switch, Match, onCleanup } from "solid-js"
import { AnimationNumber } from "src/components/features"
import { Balances, MinesGame } from "src/components/layout"
import { IconStars } from "src/source"

interface Mines extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const Mines: Component<Mines> = (props) => {
  const [lang] = core.locale.use()

  onCleanup(() => {
    if (core.games.mines.info.status !== "ACTIVE") {
      core.games.mines.reset()
    }
  })

  return (
    <Panel>
      <Panel.Container bgColor={"background_game_mines"}>
        <Balances />
        <MinesGame />

        <FixedLayout position={"bottom"}>
          <Button.Group>
            <Button.Group.Container>
              <Switch>
                <Match when={core.games.mines.info.status === "ACTIVE"}>
                  <Button
                    stretched
                    size={"large"}
                    onClick={() => core.games.mines.cashOut()}
                    appearance={"positive"}
                    disabled={!!!core.games.mines.info.potential_payout}
                  >
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        {/** FIXME: Language */}
                        <Text.Content>
                          <Flex direction={"row"} gap={"6px"}>
                            Забрать
                            <IconStars width={16} height={16} />
                            <AnimationNumber
                              value={core.api.balance.getTransform(
                                core.games.mines.info.potential_payout,
                              )}
                            />
                          </Flex>
                        </Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                </Match>
                <Match
                  when={
                    core.games.mines.info.status === "LOST" ||
                    core.games.mines.info.status === "CASHED_OUT"
                  }
                >
                  <Button stretched size={"large"} onClick={() => core.games.mines.reset()}>
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        {/** FIXME: Language */}
                        <Text.Content>Закрыть</Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                </Match>
                <Match when={true}>
                  <Button stretched size={"large"} onClick={() => core.route.modal.minesStart()}>
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        {/** FIXME: Language */}
                        <Text.Content>Играть</Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                </Match>
              </Switch>
            </Button.Group.Container>
          </Button.Group>
        </FixedLayout>
      </Panel.Container>
    </Panel>
  )
}

export default Mines
