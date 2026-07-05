import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
  operation_id: string
}

async function calendarRecord(options: Options) {
  return network.send<Response>("calendar.record", options)
}

export default calendarRecord
