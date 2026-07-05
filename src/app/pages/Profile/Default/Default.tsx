import { Flex, Lottie, Panel, Plug, Text } from "@ui/index"
import { type JSX, type Component } from "solid-js"
import { ProfileBalance, ReferralCard } from "src/components/features"
import core from "src/core"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const Default: Component<Default> = (props) => {
  return (
    <Panel>
      <Panel.Container>
        <Flex padding={"16px"} gap={"16px"}>
          <ProfileBalance />
          <ReferralCard />
        </Flex>
      </Panel.Container>
    </Panel>
  )
}

export default Default
