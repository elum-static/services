import { Accessor } from "solid-js"
import { store } from "../store/store"
import { untrack } from "solid-js/web"

function useRoute(type: "view"): Accessor<string | undefined>
function useRoute(type: "modal"): Accessor<string>
function useRoute(type: "panel"): Accessor<string>

function useRoute(type: "view" | "panel" | "modal") {
  switch (type) {
    case "view": {
      return () => store.active?.view
    }
    case "modal": {
      return () => store.active?.modal || ""
    }
    case "panel": {
      const view = untrack(() => store.active?.view)

      //findLast нужен, так как чаще всего этот `view` находится последней
      return () =>
        store.history.findLast((x) => x.view === view)?.panels.at(-1)?.panel ||
        "default"
    }
  }
}

export default useRoute
