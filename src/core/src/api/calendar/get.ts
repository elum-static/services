import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
  locale?: string
}

async function calendarGet(options: Options) {
  return network.send<Response>("calendar.get", options)
}

export default calendarGet
