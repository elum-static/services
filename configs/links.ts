import { getter } from "@atom/index"
import { SUPPORT_ATOM } from "@atom/state"
import { AuthPlatform } from "src/engine/utils"

export const getBugLink = () => {
  const support = getter(SUPPORT_ATOM)

  if (support.platform === AuthPlatform.OKMA) {
    return "https://ok.ru/group/70000043653098/topic/158608435376362"
  }
  if (support.platform === AuthPlatform.VKMA) {
    return "https://vk.ru/im?sel=-218849456"
  }
}

export const SOCIAL_TELEGRAM = "https://t.me/anonmsgr"
export const SOCIAL_VKONTAKTE = "https://vk.ru/anonim_messenger"
export const SOCIAL_ODNOKLASSNIKI = "https://ok.ru/group/70000043653098"

export const APP_TELEGRAM = "https://t.me/anonmsgr_bot/app"
export const APP_VKONTAKTE = "https://vk.ru/app7798122"
export const APP_ODNOKLASSNIKI = "https://ok.ru/app/anonim"
