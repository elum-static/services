import { View } from "@ui/index"
import { type JSX, type Component } from "solid-js"

import Default from "./Default/Default"
import { useRoute } from "root/router"

interface Profile extends JSX.HTMLAttributes<HTMLElement> {
  nav: string
}

const Profile: Component<Profile> = (props) => {
  const activePanel = useRoute("panel")

  return (
    <View nav={props.nav} activePanel={activePanel() || ""}>
      <View.Path nav={"default"} component={Default} />
    </View>
  )
}

export default Profile
