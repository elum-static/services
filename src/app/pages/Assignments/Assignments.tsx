import { View } from "@ui/index"
import { type JSX, type Component } from "solid-js"

import { useRoute } from "root/router"

import Default from "./Default/Default"

interface Assignments extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Assignments: Component<Assignments> = (props) => {
  const activePanel = useRoute("panel")

  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Path nav={"default"} component={Default} />
    </View>
  )
}

export default Assignments
