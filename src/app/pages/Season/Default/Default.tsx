import core from "@core"
import { Button, Flex, Header, Panel } from "@ui/index"
import { type JSX, type Component, For } from "solid-js"
import { SeasonPlayers } from "src/components/features"
import { Balances, GamesCardAnimation, SeasonCard, SeasonItem } from "src/components/layout"
import { generatePath } from "src/engine/utils"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

/** FIXME: Language */
const Default: Component<Default> = (props) => {
  const [lang] = core.locale.use()

  const date = new Date(Date.now() + 86_400_000)

  return (
    <Panel>
      <Panel.Container>
        <Balances />
        <Flex padding={"16px"} gap={"16px"}>
          {/** FIXME: Language Images */}
          <GamesCardAnimation
            aspectRation={"109 / 66"}
            each={[
              {
                onClick: core.route.game.crush,
                backgroundUrl: generatePath("/games/mini/crush.webp").href,
                backgroundColor: "#f79d31",
              },
              {
                onClick: core.route.game.roulette,
                backgroundUrl: generatePath("/games/mini/roulette.webp").href,
                backgroundColor: "#9344d5",
              },
              {
                onClick: core.route.game.coin,
                backgroundUrl: generatePath("/games/mini/coin.webp").href,
                backgroundColor: "#a32a37",
              },
              {
                onClick: core.route.game.mines,
                backgroundUrl: generatePath("/games/mini/mines.webp").href,
                backgroundColor: "#353682",
              },
              {
                onClick: core.route.assignments.default,
                backgroundUrl: generatePath("/games/mini/assignments.webp").href,
                backgroundColor: "#1b2632",
              },
              {
                onClick: core.route.game["mini-roulette"],
                backgroundUrl: generatePath("/games/mini/mini-roulette.webp").href,
                backgroundColor: "#2eaf60",
              },
            ]}
          />
          <Flex gap={"10px"} style={{ width: "100%" }}>
            <SeasonCard
              title={lang("season.card.title")}
              subtitle={lang("season.card.subtitle")}
              type={lang("season.card.button")}
              date={date}
              backgroundUrl={generatePath("/season.webp").href}
              onClick={core.route.modal.seasonRules}
            />

            <SeasonPlayers />
          </Flex>
        </Flex>
        <Button.Group>
          <Button.Group.Container>
            <Button stopPropagation onClick={core.route.modal.marketGifts}>
              <Button.Content>TEST</Button.Content>
            </Button>
          </Button.Group.Container>
        </Button.Group>
      </Panel.Container>
    </Panel>
  )
}

export default Default
