import Store from "../../utils/Store"
import core from "src/core"

type BalanceStore = {
  stars: number
  bonus_stars: number
  lightning: number
}

class Balance extends Store<BalanceStore> {
  constructor() {
    super(
      {
        bonus_stars: 0,
        stars: 0,
        lightning: 0,
      },
      () => core.api.balance.get(),
    )
  }

  get stars() {
    this.getData()
    return this.data.stars
  }

  get bonus_stars() {
    this.getData()
    return this.data.bonus_stars
  }

  get lightning() {
    this.getData()
    return this.data.lightning
  }
}

export default Balance
