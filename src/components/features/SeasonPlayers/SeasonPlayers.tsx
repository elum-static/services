import style from "./SeasonPlayers.module.css"
import { Flex, FlexProps, Text } from "src/components/ui"
import { type Component, mergeProps, splitProps, For } from "solid-js"
import { SeasonItem } from "src/components/layout"
import core from "src/core"
import InfiniteScroll from "src/components/ui/InfiniteScroll/InfiniteScroll"
import InfiniteScrollCount from "src/components/ui/InfiniteScroll/InfiniteScrollCount"

interface SeasonPlayers extends FlexProps {}

// FIXME: Language
const SeasonPlayers: Component<SeasonPlayers> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["class", "classList", "children"])

  return (
    <Flex
      class={style.SeasonPlayers}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      gap={"10px"}
    >
      <Flex
        gap={"10px"}
        direction={"row"}
        style={{
          width: "100%",
        }}
        justify={"between"}
      >
        <Text overflow nowrap size={"small"}>
          <Text.Content full={false}>Список лидеров</Text.Content>
        </Text>
        <Text
          overflow
          nowrap
          style={{ width: "auto", "min-width": "76px" }}
          size={"small"}
          align={"center"}
        >
          <Text.Content>Награды</Text.Content>
        </Text>
      </Flex>
      <InfiniteScrollCount
        gap={"14px"}
        each={core.files.getNames().slice(0, 25)}
        // each={core.state.season_leaders.items}
        hasMore={false}
        count={5}
      >
        {(name, index) => (
          <SeasonItem
            data-index={index()}
            avatar={""}
            first_name={"Рома"}
            position={index() + 1}
            reward={core.files.getWEBP(name, "Original", "medium")}
          />
        )}
      </InfiniteScrollCount>
      {/* <For each={core.files.getNames().slice(0, 25)}>
        {(name, index) => (
          <SeasonItem
            data-index={index()}
            avatar={""}
            first_name={"Рома"}
            position={index() + 1}
            reward={core.files.getWEBP(name, "Original", "medium")}
          />
        )}
      </For> */}
    </Flex>
  )
}

export default SeasonPlayers
