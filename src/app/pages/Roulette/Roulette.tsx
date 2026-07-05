import { View } from "@ui/index"
import { type JSX, type Component } from "solid-js"

import Default from "./Default/Default"
import { useRoute } from "root/router"

interface Roulette extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Roulette: Component<Roulette> = (props) => {
  const activePanel = useRoute("panel")

  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Action>
        <View.Path nav={"default"} component={Default} />
      </View.Action>
    </View>
  )
}

export default Roulette
