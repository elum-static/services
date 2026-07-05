import Store from "../../utils/Store"
import core from "src/core"

type SeasonLeadersStore = {
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

class SeasonLeaders extends Store<SeasonLeadersStore> {
  constructor() {
    super({ items: [] }, () => core.api.season.leaders())
  }

  get items() {
    this.getData()
    return this.data.items
  }
}

export default SeasonLeaders
