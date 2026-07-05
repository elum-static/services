import { type Params, type Store } from "root/router/types"
import RouterContext from "./RouterContext"

import { type JSX, type Component, onMount } from "solid-js"
import nextPage from "root/router/actions/nextPage"
import { isType } from "@minsize/utils"
interface RouterProps {
  view: string
  panel?: string
  children: JSX.Element
}

const Router: Component<RouterProps> = (props) => {
  onMount(() => {
    nextPage({ view: props.view, panel: props.panel })
  })

  return (
    <RouterContext.Provider value={{}}>{props.children}</RouterContext.Provider>
  )
}

export default Router
