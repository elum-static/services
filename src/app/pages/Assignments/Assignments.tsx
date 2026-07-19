import { View } from "@ui/index"
import { type JSX, type Component, onMount, createSignal } from "solid-js"

import Default from "./Default/Default"
import { useRoute } from "root/router"
import { createStore, produce } from "solid-js/store"

interface Assignments extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Assignments: Component<Assignments> = (props) => {
  const activePanel = useRoute("panel")

  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Action>
        <View.Path nav={"default"} component={Default} />
      </View.Action>
    </View>
  )
}

export default Assignments
