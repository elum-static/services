import network from "../module"

type Response = {}

// FIXME: Ключи называются по другому
async function seasonInfo() {
  return network.send<Response>("season.info", {})
}

export default seasonInfo
