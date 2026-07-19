import network from "../module"

import * as rtl from "@minsize/rtl"
import { schemaTask } from "./types"

const schemaResponse = rtl.array(schemaTask)

export type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  /**
   * Передается партнеру и используется для публичного текста, если партнер его поддерживает.
   */
  locale?: string

  /**
   * Код партнера: tgrass, flyer, subgram, getbonus.
   *
   * Выбирает партнерский runtime/script.
   */
  provider: "tgrass" | "flyer" | "subgram" | "getbonus"

  /**
   * Группа партнерских заданий, например daily.
   *
   * Должна совпадать с настройкой task_partner_config.
   */
  group_key: "daily"

  /**
   * Платформа настройки, например telegram.
   *
   * Должна совпадать с настройкой партнера в workspace.
   */
  platform?: "telegram"

  /**
   * Максимум заданий от партнера.
   */
  limit?: number

  /**
   * Публичные переменные для партнера.
   *
   * Передавать только то, что не является секретом: username, lang, chat_id и подобные значения.
   */
  variables?: unknown
}

async function taskPartnerList(options: Options) {
  options.locale = "en"
  options.platform = "telegram"
  return network.send<Response>("task.partnerList", options, { schema: schemaResponse })
}

export default taskPartnerList
