import network from "../module"

type Response = {
  items: Array<{
    place: number
    user_id: number
    points: number
    games_count: number
    wins_count: number
    losses_count: number
    bet_total: number
    win_total: number
    profit_total: number
  }>
}

// FIXME: Ключи называются по другому
async function seasonLeaders() {
  return network.send<Response>("season.leaders", {})
}

export default seasonLeaders
