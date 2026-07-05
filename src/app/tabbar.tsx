import { Flex, Tabbar, Text } from "@ui/index"
import { nextPage, useRoute } from "root/router"
import core from "src/core"
import { IconMessageCircleFilled, IconSettingsFilled, IconZoom } from "src/source"

export const ETabbar = () => {
  const activeView = useRoute("view")

  return (
    <>
      <Tabbar>
        <Tabbar.Button
          onClick={core.route.game.roulette}
          onChange={core.route.game.roulette}
          selected={activeView() === "roulette"}
        >
          {(selected) => (
            <Flex style={{ gap: "4px" }}>
              <IconMessageCircleFilled />
              <Text color={"inherit"} size={"xx-small"} weight={"600"}>
                <Text.Content>TEST</Text.Content>
              </Text>
            </Flex>
          )}
        </Tabbar.Button>
        <Tabbar.Button
          onClick={core.route.game.default}
          onChange={core.route.game.default}
          selected={activeView() === "games"}
        >
          <Flex style={{ gap: "4px" }}>
            <IconZoom />
            <Text color={"inherit"} size={"xx-small"} weight={"600"}>
              <Text.Content>games</Text.Content>
            </Text>
          </Flex>
        </Tabbar.Button>
        <Tabbar.Button
          onClick={core.route.assignments.default}
          onChange={core.route.assignments.default}
          selected={activeView() === "assignments"}
        >
          {(selected) => (
            <Flex style={{ gap: "4px" }}>
              <IconSettingsFilled />
              <Text color={"inherit"} size={"xx-small"} weight={"600"}>
                <Text.Content>assignments</Text.Content>
              </Text>
            </Flex>
          )}
        </Tabbar.Button>
        <Tabbar.Button
          onClick={core.route.goSeason.default}
          onChange={core.route.goSeason.default}
          selected={activeView() === "season"}
        >
          {(selected) => (
            <Flex style={{ gap: "4px" }}>
              <IconSettingsFilled />
              <Text color={"inherit"} size={"xx-small"} weight={"600"}>
                <Text.Content>season</Text.Content>
              </Text>
            </Flex>
          )}
        </Tabbar.Button>
        <Tabbar.Button
          onClick={core.route.goProfile.default}
          onChange={core.route.goProfile.default}
          selected={activeView() === "profile"}
        >
          {(selected) => (
            <Flex style={{ gap: "4px" }}>
              <IconSettingsFilled />
              <Text color={"inherit"} size={"xx-small"} weight={"600"}>
                <Text.Content>profile</Text.Content>
              </Text>
            </Flex>
          )}
        </Tabbar.Button>
      </Tabbar>
    </>
  )
}

export default ETabbar
