import style from "./Replenishment.module.css"

import { type JSX, type Component, For } from "solid-js"
import { Button, Flex, Header, Modal, Text } from "src/components/ui"
import core from "src/core"
import { REPLENISHMENT_ASSETS } from "./assets"

interface ReplenishmentCurrency extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}

const ReplenishmentCurrency: Component<ReplenishmentCurrency> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
      <Header type={"modal"}>
        <Header.Group>
          <Header.Content type={"content"}>
            <Header.Content.Background>
              <Text>
                <Text.Content>Валюта пополнения</Text.Content>
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
        gap={"10px"}
        direction={"column"}
        style={{
          width: "100%",
          "box-sizing": "border-box",
        }}
      >
        <div class={style.Replenishment__assets}>
          <For each={REPLENISHMENT_ASSETS}>
            {(asset) => (
              <Button
                class={style.Replenishment__asset}
                size={"large"}
                appearance={"secondary"}
                onClick={() => core.route.modal.replenishment(asset.code)}
              >
                <Button.Content>
                  <Text color={"inherit"} align={"center"}>
                    <Text.Content>{asset.label}</Text.Content>
                  </Text>
                </Button.Content>
              </Button>
            )}
          </For>
        </div>
      </Flex>
    </Modal>
  )
}

export default ReplenishmentCurrency
