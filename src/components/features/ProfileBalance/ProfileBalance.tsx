import style from "./ProfileBalance.module.css"
import { Button, Flex, Plug, Text } from "src/components/ui"
import {
  type JSX,
  type Component,
  Show,
  createSignal,
  mergeProps,
  onMount,
  splitProps,
} from "solid-js"
import { IconArrowLeft, IconChevronRight, IconPlus, IconStars } from "src/source"
import core from "src/core"

interface ProfileBalance extends JSX.HTMLAttributes<HTMLDivElement> {}

// FIXME: Language
const ProfileBalance: Component<ProfileBalance> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])
  const [walletLoading, setWalletLoading] = createSignal(false)

  onMount(() => {
    core.tonConnect.restore()
  })

  const connectWallet = async () => {
    setWalletLoading(true)

    try {
      await core.tonConnect.connect()
    } finally {
      setWalletLoading(false)
    }
  }

  const disconnectWallet = async () => {
    setWalletLoading(true)

    try {
      await core.tonConnect.disconnect()
    } finally {
      setWalletLoading(false)
    }
  }

  return (
    <>
      <Flex class={style.ProfileBalance}>
        <span class={style.ProfileBalance__plug}>
          <Plug size={"small"}>
            <Plug.Container>
              <Flex gap={"6px"} justify={"center"} direction={"column"}>
                <Text class={style.ProfileBalance__balance}>
                  <Text.Badge
                    style={{
                      display: "flex",
                      "justify-content": "center",
                      "align-items": "center",
                    }}
                  >
                    <IconStars width={32} height={32} />
                  </Text.Badge>
                  <Text.Content full={false}>{core.state.balance.stars}</Text.Content>
                </Text>
                <Text color={"secondary"} align={"center"}>
                  <Text.Content>Ваш баланс</Text.Content>
                </Text>
                <Text size={"small"} color={"yellow"} align={"center"}>
                  <Text.Content>Бонусные звёзды: {core.state.balance.bonus_stars}</Text.Content>
                </Text>
              </Flex>
            </Plug.Container>
          </Plug>
          <Flex
            class={style.ProfileBalance__wallet}
            padding={"0px 12px 12px"}
            gap={"8px"}
            direction={"column"}
          >
            <Text color={"secondary"} size={"small"} align={"center"}>
              <Text.Content>
                {core.tonConnect.connected ? "TON кошелёк привязан" : "TON кошелёк не привязан"}
              </Text.Content>
            </Text>
            <Show when={core.tonConnect.connected}>
              <Text size={"small"} align={"center"}>
                <Text.Content>
                  {core.tonConnect.walletName ? `${core.tonConnect.walletName}: ` : ""}
                  {core.tonConnect.shortAddress}
                </Text.Content>
              </Text>
            </Show>
            <Button
              appearance={core.tonConnect.connected ? "secondary" : "accent"}
              stretched
              size={"small"}
              loading={walletLoading() || core.tonConnect.restoring || core.tonConnect.connecting}
              onClick={core.tonConnect.connected ? disconnectWallet : connectWallet}
            >
              <Button.Content>
                <Text color={"inherit"} align={"center"} size={"small"}>
                  <Text.Content>
                    {core.tonConnect.connected ? "Отвязать кошелёк" : "Привязать кошелёк"}
                  </Text.Content>
                </Text>
              </Button.Content>
            </Button>
          </Flex>
          <Button.Group>
            <Button.Group.Container>
              <Button
                appearance={"accent"}
                stretched
                size={"medium"}
                onClick={core.route.modal.replenishment}
              >
                <Button.Content>
                  <Flex style={{ width: "100%" }}>
                    <Text style={{ width: "auto" }} color={"inherit"} align={"center"}>
                      <Text.Badge>
                        <IconPlus width={20} height={20} />
                      </Text.Badge>
                      <Text.Content full={false}>Пополнить</Text.Content>
                    </Text>
                  </Flex>
                </Button.Content>
              </Button>
              <Button appearance={"secondary"} stretched size={"medium"}>
                <Button.Content>
                  <Flex style={{ width: "100%" }}>
                    <Text style={{ width: "auto" }} color={"inherit"} align={"center"}>
                      <Text.Badge>
                        <IconPlus width={20} height={20} />
                      </Text.Badge>
                      <Text.Content full={false}>Вывести</Text.Content>
                    </Text>
                  </Flex>
                </Button.Content>
              </Button>
            </Button.Group.Container>
            <Button.Group.Container>
              <Button mode={"ghost"} stretched size={"small"}>
                <Button.Content>
                  <Flex style={{ width: "100%" }}>
                    <Text
                      style={{ width: "auto" }}
                      color={"secondary"}
                      size={"small"}
                      align={"center"}
                    >
                      <Text.Content full={false}>Показывать баланс в TON</Text.Content>{" "}
                      <Text.Badge>
                        <IconChevronRight width={14} height={14} />
                      </Text.Badge>
                    </Text>
                  </Flex>
                </Button.Content>
              </Button>
            </Button.Group.Container>
          </Button.Group>
        </span>
      </Flex>
    </>
  )
}

export default ProfileBalance
