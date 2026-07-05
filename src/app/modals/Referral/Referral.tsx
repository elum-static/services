import style from "./Referral.module.css"
import { type JSX, type Component } from "solid-js"
import { Button, Cell, Flex, Header, Icon, Modal, Separator, Text } from "src/components/ui"
import core from "src/core"
import { IconClipboardTextFilled, IconDice6, IconStars } from "src/source"

interface Referral extends JSX.HTMLAttributes<HTMLDivElement> {
  nav?: string
}
// FIXME: Language
const Referral: Component<Referral> = (props) => {
  return (
    <Modal {...props} onClose={() => core.route.goBack()} type={"card"}>
      <Header type={"modal"}>
        <Header.Group>
          <Header.Content type={"content"}>
            <Header.Content.Background>
              <Text>
                <Text.Content>Пригласить друзей</Text.Content>
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
        separator={false}
      >
        <Text>
          <Text.Content>
            + {core.state.referral_reward.user_amount} Stars за каждого друга
          </Text.Content>
        </Text>
      </Cell>
      <Cell
        before={
          <Icon color={"white"} backgroundColor={"#f5a524"} padding={"6px"}>
            <IconDice6 />
          </Icon>
        }
        separator={false}
      >
        <Text>
          <Text.Content>10% от каждого пополнения</Text.Content>
        </Text>
      </Cell>

      <Flex gap={"16px"} direction={"row"} padding={"var(--global-padding)"}>
        <Flex class={style.Referral__block} gap={"4px"}>
          <Text size={"xx-large"} weight={"600"} align={"center"}>
            <Text.Content>{core.state.referral_count.count}</Text.Content>
          </Text>
          <Text size={"small"} color={"secondary"} align={"center"}>
            <Text.Content>Приглашено</Text.Content>
          </Text>
        </Flex>
        <Flex class={style.Referral__block} gap={"4px"}>
          <Text
            style={{
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
            }}
            size={"xx-large"}
            weight={"600"}
            align={"center"}
          >
            <Text.Badge>
              <IconStars width={24} height={24} />
            </Text.Badge>
            <Text.Content full={false}>{core.state.referral_earned.amount}</Text.Content>
          </Text>
          <Text size={"small"} color={"secondary"} align={"center"}>
            <Text.Content>Заработано</Text.Content>
          </Text>
        </Flex>
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
          <Button
            size={"large"}
            type={"icon"}
            style={{
              "min-width": "56px",
              "min-height": "56px",
            }}
            appearance={"secondary"}
          >
            <Button.Content>
              <Flex>
                <IconClipboardTextFilled />
              </Flex>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Modal>
  )
}

export default Referral
