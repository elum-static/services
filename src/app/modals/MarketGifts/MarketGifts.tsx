import { type JSX, type Component, For } from "solid-js"
import { Button, Cell, Flex, Header, Icon, Image, Lottie, Modal, Text } from "src/components/ui"
import core from "src/core"
import { IconDice6 } from "src/source"

interface MarketGifts extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}
// FIXME: Language
const MarketGifts: Component<MarketGifts> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"panel"} partialHeight={100}>
      <Header type={"modal"}>
        <Header.Group>
          <Header.Content type={"content"}>
            <Header.Content.Background>
              <Text>
                <Text.Content>Как это работает?</Text.Content>
              </Text>
            </Header.Content.Background>
          </Header.Content>
          <Header.Content type={"after"}>
            <Header.BackButton type={"close"} onClick={() => core.route.goBack()} />
          </Header.Content>
        </Header.Group>
      </Header>

      <Flex
        style={{
          display: "grid",
          "grid-template-columns": "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        <For each={core.files.getNames()}>
          {(name) => (
            <Flex>
              <Lottie
                size={80}
                loop
                // placeholder={
                //   <Image
                //     style={{
                //       width: "68px",
                //       height: "68px",
                //     }}
                //     src={core.files.getWEBP(name, "Original", "small").href}
                //   />
                // }
                data={core.files.getTGS(name, "Original")}
              />
            </Flex>
          )}
        </For>
      </Flex>

      <Button.Group>
        <Button.Group.Container>
          <Button size={"large"} stretched>
            <Button.Content>
              <Text color={"inherit"} align={"center"}>
                <Text.Content>Закрыть</Text.Content>
              </Text>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Modal>
  )
}

export default MarketGifts
