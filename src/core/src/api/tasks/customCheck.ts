import network from "../module"
import type { Response } from "./check"

type Options = {
  key: string
}

async function taskCustomCheck(options: Options) {
  return network.send<Response>("task.customCheck", options)
}

export default taskCustomCheck
