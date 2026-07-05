import { Flex, Panel } from "@ui/index"
import { type JSX, type Component, onMount, onCleanup } from "solid-js"
import { Balances } from "src/components/layout"
import core from "src/core"
import { RouletteWheel } from "src/games"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const Default: Component<Default> = (props) => {
  onMount(() => {
    core.games.pvp.join()

    onCleanup(() => {
      core.games.pvp.leave()
    })
  })

  return (
    <Panel>
      <Panel.Container>
        <Balances />
        <Flex padding={"16px"} gap={"10px"}>
          <RouletteWheel
            width={window.innerWidth * 0.8}
            height={window.innerWidth * 0.8}
            onCountdownEnd={() => {
              console.log("END")
            }}
          />
        </Flex>
      </Panel.Container>
    </Panel>
  )
}

export default Default
