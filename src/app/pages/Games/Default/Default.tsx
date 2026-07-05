import core from "@core"
import { Flex, Image, Lottie, Panel } from "@ui/index"
import { type JSX, type Component } from "solid-js"
import { Balances, GamesItem } from "src/components/layout"
import { generatePath } from "src/engine/utils"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const Default: Component<Default> = (props) => {
  const [lang] = core.locale.use()

  return (
    <Panel>
      <Panel.Container>
        <Balances />
        <Flex padding={"16px"} gap={"10px"}>
          <GamesItem
            onClick={core.route.game.crush}
            backgroundUrl={generatePath("/games/full/crush.webp").href}
            backgroundColor={"#f8893a"}
            title={lang("games.item.crush.title")}
            subtitle={lang("games.item.crush.subtitle")}
            type={lang("games.types.online-game")}
            icon={
              <Lottie
                style={{
                  position: "absolute",
                  right: "5px",
                  bottom: "-15px",
                }}
                loop
                size={128}
                placeholder={
                  <Image
                    backgroundColor={"transparent"}
                    srcStub={core.files.getWEBP("Stellar Rocket", "Original", "small").href}
                    src={core.files.getWEBP("Stellar Rocket", "Original", "original").href}
                  />
                }
                data={core.files.getTGS("Stellar Rocket", "Original")}
              />
            }
          />
          <Flex gap={"10px"} direction={"row"} style={{ width: "100%" }}>
            <GamesItem
              onClick={core.route.game.roulette}
              backgroundUrl={generatePath("/games/full/roulette.webp").href}
              backgroundColor={"#8748d7"}
              title={lang("games.item.roulette.title")}
              subtitle={lang("games.item.roulette.subtitle")}
              type={lang("games.types.free")}
              layout={2}
              icon={
                <Lottie
                  style={{
                    position: "absolute",
                    left: "3px",
                    bottom: "-25px",
                  }}
                  loop
                  size={144}
                  placeholder={
                    <Image
                      backgroundColor={"transparent"}
                      srcStub={core.files.getWEBP("Plush Pepe", "Original", "small").href}
                      src={core.files.getWEBP("Plush Pepe", "Original", "original").href}
                    />
                  }
                  data={core.files.getTGS("Plush Pepe", "Original")}
                />
              }
            />
            <GamesItem
              onClick={core.route.game.coin}
              backgroundUrl={generatePath("/games/full/coin.webp").href}
              backgroundColor={"#b52c36"}
              title={lang("games.item.coin.title")}
              subtitle={lang("games.item.coin.subtitle")}
              type={lang("games.types.hit")}
              layout={3}
            />
          </Flex>
          <GamesItem
            onClick={core.route.game.mines}
            backgroundUrl={generatePath("/games/full/mines.webp").href}
            backgroundColor={"#353784"}
            title={lang("games.item.mines.title")}
            subtitle={lang("games.item.mines.subtitle")}
            type={lang("games.types.popular")}
            backgroundPosition={"end"}
          />
          <Flex gap={"10px"} direction={"row"} style={{ width: "100%" }}>
            <GamesItem
              onClick={core.route.assignments.default}
              backgroundUrl={generatePath("/games/full/assignments.webp").href}
              backgroundColor={"#222f38"}
              title={lang("games.item.assignments.title")}
              subtitle={lang("games.item.assignments.subtitle")}
              layout={4}
              backgroundPosition={"start"}
            />
            <GamesItem
              onClick={core.route.game["mini-roulette"]}
              backgroundUrl={generatePath("/games/full/mini-roulette.webp").href}
              backgroundColor={"#2dae5e"}
              title={lang("games.item.mini-roulette.title")}
              subtitle={lang("games.item.mini-roulette.subtitle")}
              layout={5}
            />
          </Flex>
        </Flex>
      </Panel.Container>
    </Panel>
  )
}

export default Default
