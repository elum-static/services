import { GamesCardAnimation } from "src/components/layout"
import style from "./ReferralCard.module.css"
import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
import core from "src/core"
import { Button, Flex, Text } from "src/components/ui"
import { IconStars } from "src/source"

interface ReferralCard extends JSX.HTMLAttributes<HTMLDivElement> {}

const ReferralCard: Component<ReferralCard> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <Flex
      class={style.ReferralCard}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      gap={"16px"}
    >
      <GamesCardAnimation
        aspectRation={"1 / 1"}
        each={core.files
          .getNames()
          .slice(10, 25)
          .map((item) => ({
            backgroundUrlStub: core.files.getWEBP(item, "Original", "small").href,
            backgroundUrl: core.files.getWEBP(item, "Original", "original").href,
          }))}
      />

      <Text size={"xx-large"} align={"center"} weight={"600"}>
        <Text.Content>Звёзды за друзей</Text.Content>
      </Text>
      <Text size={"small"} color={"secondary"} align={"center"}>
        <Text.Content>
          Начислим {core.state.referral_reward.user_amount} Stars на ваш аккаунт за каждого
          приглашённого друга
        </Text.Content>
      </Text>
      <Button.Group padding={false}>
        <Button.Group.Container>
          <Button stretched onClick={core.route.modal.referral} appearance={"white"}>
            <Button.Content>
              <Flex style={{ width: "100%" }}>
                <Text style={{ width: "auto" }} color={"inherit"} align={"center"}>
                  <Text.Content full={false}>Получить</Text.Content>
                  <Text.Badge class={style.ReferralCard__badge}>
                    <Text size={"x-small"} color={"inherit"}>
                      <Text.Content>
                        <Flex direction={"row"} gap={"4px"}>
                          +{core.state.referral_reward.user_amount}{" "}
                          <IconStars width={12} height={12} />
                        </Flex>
                      </Text.Content>
                    </Text>
                  </Text.Badge>
                </Text>
              </Flex>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Flex>
  )
}

export default ReferralCard
