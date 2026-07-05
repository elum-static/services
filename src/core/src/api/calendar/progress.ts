import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
}

async function calendarProgress(options: Options) {
  return network.send<Response>("calendar.progress", options)
}

export default calendarProgress
