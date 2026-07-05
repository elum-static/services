import { Root, Tabbar } from "@ui/index"
import { onCleanup, onMount, type Component } from "solid-js"

import Startup from "./pages/Startup/Startup"
import Games from "./pages/Games/Games"
import Season from "./pages/Season/Season"
import Profile from "./pages/Profile/Profile"
import Roulette from "./pages/Roulette/Roulette"
import Assignments from "./pages/Assignments/Assignments"

import Modals from "./modals"

import {
  bridgeRequestContentSafeAreaInset,
  bridgeRequestSafeAreaInset,
  bridgeSetupBackButton,
  bridgeSetupFullScreen,
  bridgeSetupOrientation,
  bridgeSetupSwipeBehavior,
  EventBackButtonPressed,
  EventContentSafeAreaChanged,
  EventSafeAreaChanged,
  EventsData,
  EventViewportChanged,
  getPlatform,
  listener,
} from "@apiteam/twa-bridge/solid"
import native from "@elum/bridge"

import { backPage, router, useRoute } from "root/router"
import { SNACKBAR_ATOM } from "@atom/state"
import { useAtom } from "@atom/index"
import ETabbar from "./tabbar"

const App: Component = () => {
  const activeView = useRoute("view")

  const [snackbars] = useAtom(SNACKBAR_ATOM)

  onMount(() => {
    if (native.is()) {
      native.send("app.start", {})
    }

    const cleanupNext = router.on("next", (data) => {
      if (window.location.protocol !== "file:") {
        window.history.pushState(null, "")
      }

      const panels = data.history[data.history.length - 1]?.panels || []
      var is_visible = panels.length >= 2 || !!panels[panels.length - 1]?.lastView

      // if (data.next.panel === "chat") {
      //   is_visible = true
      // }

      bridgeSetupBackButton({
        is_visible: is_visible,
      })
    })

    const cleanupBack = router.on("back", (data) => {
      if (window.location.protocol !== "file:") {
        window.history.pushState(null, "")
      }

      var is_visible = data.history[data.history.length - 1]?.panels.length !== 1

      if (data.next.view === "startup") {
        is_visible = false
      }

      bridgeSetupBackButton({
        is_visible: is_visible,
      })
    })

    const onBackButton = () => {
      backPage({})
    }

    window.addEventListener("popstate", onBackButton)

    listener.on(EventBackButtonPressed, onBackButton)

    const onContentSafe = (data: EventsData[typeof EventContentSafeAreaChanged]) => {
      var root = document.documentElement
      if (root && root.style && root.style.setProperty) {
        root.style.setProperty("--content-safe-area-inset-top", data.top + "px")
        root.style.setProperty("--content-safe-area-inset-bottom", data.bottom + "px")
      }
    }

    const onSafe = (data: EventsData[typeof EventSafeAreaChanged]) => {
      var root = document.documentElement
      if (root && root.style && root.style.setProperty) {
        root.style.setProperty("--safe-area-inset-top", data.top + "px")
        root.style.setProperty("--safe-area-inset-bottom", data.bottom + "px")
        root.style.setProperty("--safe-area-inset-left", data.left + "px")
        root.style.setProperty("--safe-area-inset-right", data.right + "px")
      }
    }

    const onViewportChanged = (data: EventsData[typeof EventViewportChanged]) => {
      var root = document.documentElement
      if (root && root.style && root.style.setProperty) {
        root.style.setProperty("--app-height", data.height + "px")
      }
    }

    listener.on(EventViewportChanged, onViewportChanged)
    listener.on(EventContentSafeAreaChanged, onContentSafe)
    listener.on(EventSafeAreaChanged, onSafe)

    bridgeRequestContentSafeAreaInset()
    bridgeRequestSafeAreaInset()

    onCleanup(() => {
      cleanupNext()
      cleanupBack()
      listener.off(EventContentSafeAreaChanged, onContentSafe)
      listener.off(EventContentSafeAreaChanged, onSafe)
      listener.off(EventBackButtonPressed, onBackButton)
      window.removeEventListener("popstate", onBackButton)
    })
  })

  onMount(() => {
    const tgPlatform = getPlatform()
    bridgeSetupFullScreen({ is_full: tgPlatform === "phone" })
    bridgeSetupSwipeBehavior({ allow_vertical_swipe: false })

    /**
     * Блокируем ориентацию, только если она вертикальная
     */
    bridgeSetupOrientation({ locked: window.innerHeight > window.innerWidth })
  })

  return (
    // <ErrorBoundary
    //   fallback={(error, reset) => {
    //     console.error("ErrorBoundary", { error: error.toString() })
    //     nextPage({
    //       view: "errors",
    //       panel: "default",
    //       params: { error: error.toString() },
    //     })
    //     reset()
    //     return <></>
    //   }}
    // >
    <Tabbar.Provider>
      <Root
        // skipAnimations={!settings.animation}
        // skipAnimations={true}
        modal={<Modals />}
        activeView={activeView() || ""}
        snackbar={snackbars.data?.map((x) => x.element)}
      >
        <Root.Action bar={<ETabbar />}>
          <Root.Path nav={"games"} component={Games} />
          <Root.Path nav={"assignments"} component={Assignments} />
          <Root.Path nav={"season"} component={Season} />
          <Root.Path nav={"profile"} component={Profile} />
          <Root.Path nav={"roulette"} component={Roulette} />
        </Root.Action>

        <Root.Path nav={"startup"} component={Startup} />
      </Root>
    </Tabbar.Provider>
    // </ErrorBoundary>
  )
}

export default App
