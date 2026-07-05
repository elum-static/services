import { View } from "@ui/index"
import { type JSX, type Component } from "solid-js"

import Default from "./Default/Default"
import { useRoute } from "root/router"

interface Startup extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Startup: Component<Startup> = (props) => {
  const activePanel = useRoute("panel")
  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Path nav={"default"} component={Default} />
    </View>
  )
}

export default Startup
