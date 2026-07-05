import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
  locale?: string
}

async function calendarNext(options: Options) {
  return network.send<Response>("calendar.next", options)
}

export default calendarNext
