import { View } from "@ui/index"
import { type JSX, type Component } from "solid-js"

import { useRoute } from "root/router"

import Default from "./Default/Default"
import Crush from "./Crush/Crush"
import Mines from "./Mines/Mines"

interface Startup extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Startup: Component<Startup> = (props) => {
  const activePanel = useRoute("panel")

  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Action>
        <View.Path nav={"default"} component={Default} />
      </View.Action>

      <View.Path nav={"crush"} component={Crush} />
      <View.Path nav={"roulette"} component={Default} />
      <View.Path nav={"mini-roulette"} component={Default} />
      <View.Path nav={"coin"} component={Default} />
      <View.Path nav={"mines"} component={Mines} />
    </View>
  )
}

export default Startup
