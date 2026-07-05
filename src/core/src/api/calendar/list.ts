import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  locale?: string
}

async function calendarList(options: Options) {
  return network.send<Response>("calendar.list", options)
}

export default calendarList
