import { type JSX, type Component } from "solid-js"
import { Button, Cell, Header, Icon, Modal, Text } from "src/components/ui"
import core from "src/core"
import { IconDice6 } from "src/source"

interface SeasonRules extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}
// FIXME: Language
const SeasonRules: Component<SeasonRules> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
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

      <Cell
        before={
          <Icon color={"white"} backgroundColor={"#f5a524"} padding={"6px"}>
            <IconDice6 />
          </Icon>
        }
        subTitle={
          <Text size={"small"} color={"secondary"}>
            <Text.Content>1 звезда = 1 молния в таблице лидеров</Text.Content>
          </Text>
        }
      >
        <Text>
          <Text.Content>Играйте в игры</Text.Content>
        </Text>
      </Cell>
      <Cell
        before={
          <Icon color={"white"} backgroundColor={"#f5a524"} padding={"6px"}>
            <IconDice6 />
          </Icon>
        }
        subTitle={
          <Text size={"small"} color={"secondary"}>
            <Text.Content>
              Начислим 20 молний за каждого приглашенного друга, который выполнит 1 задание
            </Text.Content>
          </Text>
        }
      >
        <Text>
          <Text.Content>Приглашайте друзей</Text.Content>
        </Text>
      </Cell>
      <Cell
        before={
          <Icon color={"white"} backgroundColor={"#f5a524"} padding={"6px"}>
            <IconDice6 />
          </Icon>
        }
        subTitle={
          <Text size={"small"} color={"secondary"}>
            <Text.Content>
              Начислим 10 молний за обычные задание, и 20 за просмотр рекламы
            </Text.Content>
          </Text>
        }
      >
        <Text>
          <Text.Content>Выполняйте задания</Text.Content>
        </Text>
      </Cell>
      <Cell
        before={
          <Icon color={"white"} backgroundColor={"#f5a524"} padding={"6px"}>
            <IconDice6 />
          </Icon>
        }
        separator={false}
        subTitle={
          <Text size={"small"} color={"secondary"}>
            <Text.Content>26 игроков получат гарантированные награды в понедельник</Text.Content>
          </Text>
        }
      >
        <Text>
          <Text.Content>Получайте награды</Text.Content>
        </Text>
      </Cell>

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

export default SeasonRules
