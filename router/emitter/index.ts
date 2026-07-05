import { EventEmitter } from "@minsize/utils"
import { Store } from "../types"

const router = new EventEmitter<{
  next: [
    {
      history: Store["history"]
      prev:
        | ({
            view: string
          } & Store["history"][0]["panels"][0])
        | undefined
      next: {
        view: string
      } & Store["history"][0]["panels"][0]
    },
  ]
  back: [
    {
      history: Store["history"]
      prev:
        | ({
            view: string
          } & Store["history"][0]["panels"][0])
        | undefined
      next: {
        view: string
      } & Store["history"][0]["panels"][0]
    },
  ]
}>()

export const _emitter = new EventEmitter<{
  freeze: []
}>()

export default router
