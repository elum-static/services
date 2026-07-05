import { bridgeGetInitData, getPlatform } from "@apiteam/twa-bridge/solid"
import { onMount } from "solid-js"
import { createStore } from "solid-js/store"

type Store = {
  safeLeft: boolean
  safeRight: boolean
  site: "vk" | "tg" | "other"
}

const [store, setStore] = createStore<Store>({
  safeLeft: false,
  safeRight: false,
  site: "other",
})

const useSafeHeader = () => {
  onMount(() => {
    var safeLeft = false
    var safeRight = false
    var site: Store["site"] = "other"

    const urlParams = new URLSearchParams(window.location.search.slice(1))
    const vkPlatform = urlParams.get("vk_platform")

    if (vkPlatform) {
      safeLeft = false

      switch (vkPlatform) {
        case "desktop_web":
        case "desktop_app_messenger":
        case "desktop_web_messenger":
        case "web_external": {
          break
        }
        default: {
          safeRight = true
          site = "vk"
        }
      }
    }

    const tgData = bridgeGetInitData()
    if (tgData?.user?.id) {
      site = "tg"

      const tgPlatform = getPlatform()
      if (tgPlatform === "phone") {
        safeLeft = true
        safeRight = true
      }
    }

    setStore({ safeLeft, safeRight, site })
  })

  return store
}

export default useSafeHeader
