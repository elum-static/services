import { type JSX, type Component } from "solid-js"
import { Button, Cell, Flex, Group, Header, Icon, Modal, Plug, Text } from "src/components/ui"
import core from "src/core"
import { IconBonusStar, IconDice6 } from "src/source"

interface BonusStars extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}
// FIXME: Language
const BonusStars: Component<BonusStars> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
      <Header type={"modal"} shadow={false}>
        <Header.Group>
          <Header.Content type={"content"}>
            {/* <Header.Content.Background>
              <Text>
                <Text.Content>Как это работает?</Text.Content>
              </Text>
            </Header.Content.Background> */}
          </Header.Content>
          <Header.Content type={"after"}>
            <Header.BackButton type={"close"} onClick={() => core.route.goBack()} />
          </Header.Content>
        </Header.Group>
      </Header>

      <Plug>
        <Plug.Icon
          style={{
            "margin-top": "-33px",
          }}
        >
          <IconBonusStar width={64} height={64} />
        </Plug.Icon>
        <Plug.Container>
          <Text>
            <Text.Content>Бонусные звёзды</Text.Content>
          </Text>
          <Text size={"small"} color={"secondary"} align={"center"}>
            <Text.Content>Сейчас у вас: {core.state.balance.bonus_stars} БЗ</Text.Content>
          </Text>
        </Plug.Container>
      </Plug>

      <Flex padding={"10px"}>
        <Cell size={"small"}>
          <Text size={"small"} color={"secondary"}>
            <Text.Content>
              Дополнительные звёзды, которые начисляются при пополнении (например, до +20% бонуса от
              суммы от 50 Stars, не более 100 бонусных звёзд за одно пополнение).
            </Text.Content>
          </Text>
        </Cell>
        <Cell size={"small"}>
          <Text size={"small"} color={"secondary"}>
            <Text.Content>
              Ими можно платить там же, где и обычными звёздами — в играх и других возможностях
              приложения.
            </Text.Content>
          </Text>
        </Cell>
        <Cell size={"small"} separator={false}>
          <Text size={"small"} color={"secondary"}>
            <Text.Content>
              При выводе средств и при операциях с подарками все бонусные звёзды полностью
              списываются.
            </Text.Content>
          </Text>
        </Cell>
      </Flex>
      <Button.Group>
        <Button.Group.Container>
          <Button size={"large"} stretched onClick={() => core.route.goBack()}>
            <Button.Content>
              <Text color={"inherit"} align={"center"}>
                <Text.Content>Понятно</Text.Content>
              </Text>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Modal>
  )
}

export default BonusStars
