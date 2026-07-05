import network from "@network"
import { Lottie, Panel, Plug } from "@ui/index"
import { nextPage } from "root/router"
import { type JSX, type Component, onMount } from "solid-js"
import core from "src/core"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const Default: Component<Default> = (props) => {
  onMount(() => {
    network.once("auth", () => {
      nextPage({ view: "games" })
    })
  })

  return (
    <Panel>
      <Panel.Container>
        <Plug full safeBottom>
          <Plug.Container>
            <Plug.Icon>
              <Lottie
                loop
                size={144}
                // data={new URL("/models/Jolly Chimp/Early Adopter.tgs", import.meta.url)}
                data={core.files.getTGS("Jolly Chimp", "Early Adopter")}
              />
            </Plug.Icon>
          </Plug.Container>
        </Plug>
      </Panel.Container>
    </Panel>
  )
}

export default Default
