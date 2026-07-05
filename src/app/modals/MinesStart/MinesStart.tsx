import { clamp } from "@minsize/utils"
import { createStore } from "solid-js/store"
import { type JSX, type Component, For } from "solid-js"
import { Button, Flex, Header, Modal, Text } from "src/components/ui"
import { InputBalance } from "src/components/features"
import core from "src/core"
import style from "./MinesStart.module.css"
import { IconMinus, IconPlus } from "src/source"
import { backPage } from "root/router"

interface MinesStart extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}

type Store = {
  amount: number
  mines: number
}

const MinesStart: Component<MinesStart> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
      <Header type={"modal"}>
        <Header.Group>
          <Header.Content type={"content"}>
            <Header.Content.Background>
              <Text>
                <Text.Content>Новая ставка</Text.Content>
              </Text>
            </Header.Content.Background>
          </Header.Content>
          <Header.Content type={"after"}>
            <Header.BackButton type={"close"} onClick={() => core.route.goBack()} />
          </Header.Content>
        </Header.Group>
      </Header>

      <Flex
        padding={"10px"}
        gap={"12px"}
        direction={"column"}
        style={{
          width: "100%",
          "box-sizing": "border-box",
        }}
      >
        <div class={style.MinesStart__inputGroup}>
          <InputBalance
            size={32}
            minValue={10}
            maxValue={core.state.balance.stars + core.state.balance.bonus_stars}
            value={core.api.balance.getTransform(core.games.mines.amount)}
            onChangeValue={(value) => {
              core.games.mines.updateAmount(value * core.config.balanceFactor)
            }}
          />
          <Button.Group padding={false}>
            <Button.Group.Container>
              <For each={[100, 500, 1000]}>
                {(count) => (
                  <Button
                    size={"medium"}
                    stretched
                    appearance={"secondary"}
                    onClick={() => {
                      core.games.mines.updateAmount(
                        core.games.mines.amount + count * core.config.balanceFactor,
                      )
                    }}
                  >
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        <Text.Content>+ {count}</Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                )}
              </For>
            </Button.Group.Container>
          </Button.Group>
        </div>

        <Flex class={style.MinesStart__minesCard} direction={"row"}>
          <Button
            class={style.MinesStart__button}
            type={"icon"}
            appearance={"secondary"}
            onClick={() => {
              core.games.mines.updateMines(core.games.mines.mines - 1)
            }}
          >
            <Button.Content>
              <Flex>
                <IconMinus width={24} height={24} />
              </Flex>
            </Button.Content>
          </Button>
          <Flex gap={"4px"}>
            <Flex direction={"row"} gap={"14px"}>
              <Text
                style={{
                  width: "auto",
                }}
                size={"large"}
                weight={"700"}
                align={"center"}
              >
                <Text.Content>{core.games.mines.mines}</Text.Content>
              </Text>
            </Flex>

            <Text color={"secondary"} size={"small"} align={"center"}>
              <Text.Content>Количество мин</Text.Content>
            </Text>
          </Flex>
          <Button
            class={style.MinesStart__button}
            type={"icon"}
            appearance={"secondary"}
            onClick={() => {
              core.games.mines.updateMines(core.games.mines.mines + 1)
            }}
          >
            <Button.Content>
              <Flex>
                <IconPlus width={24} height={24} />
              </Flex>
            </Button.Content>
          </Button>
        </Flex>
      </Flex>

      <Button.Group>
        <Button.Group.Container>
          <Button
            size={"large"}
            stretched
            onClick={() =>
              core.games.mines
                .start(core.games.mines.amount, core.games.mines.mines)
                .then(({ response }) => {
                  if (response) {
                    backPage()
                  }
                })
            }
          >
            <Button.Content>
              <Text color={"inherit"} align={"center"}>
                <Text.Content>Играть</Text.Content>
              </Text>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Modal>
  )
}

export default MinesStart
