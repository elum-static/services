import { bridgeGetInitData } from "@apiteam/twa-bridge/solid"
import { createMemo } from "solid-js"

export const HOST = "https://anon.elumapp.ru"
export const HOST_DEV = "https://dev.elumapp.ru"

export const getHost = () => {
  const hostValue = getHashParam()("host")

  if (hostValue === "dev") {
    return HOST_DEV
  }

  if (hostValue) {
    return hostValue
  }

  return HOST
}

export const VK_APP_ID = 7798122

export const TELEGRAM_APP_ID = 8745614678
export const TELEGRAM_BOT_PATH = "anonmsgr_bot"

export const VK_GROUP_ID = 204427314

export const OK_GROUP_ID = 70000043653098

// Получить значение параметра из hash
const getHashParam = createMemo(() => {
  const tgData = bridgeGetInitData()

  return (key: string) => {
    if (!key) return null

    let hash = window.location.hash

    if (tgData?.start_param) {
      hash = `#${tgData.start_param}`
    }

    // Ищем параметр в hash, например: #dev=123 или #some=value&dev=123
    const match = hash.match(new RegExp(`(?:&|#)${key}=([^&]*)`))

    return match ? decodeURIComponent(match[1]) : null
  }
})
