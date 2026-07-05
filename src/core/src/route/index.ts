import { backPage, nextPage } from "root/router"

class Route {
  constructor() {}

  public goBack = (options?: Parameters<typeof backPage>[0]) => backPage(options)

  public game = {
    default: () => nextPage({ view: "games", panel: "default" }),
    crush: () => nextPage({ view: "games", panel: "crush" }),
    roulette: () => nextPage({ view: "roulette", panel: "default" }),
    "mini-roulette": () => nextPage({ view: "games", panel: "mini-roulette" }),
    coin: () => nextPage({ view: "games", panel: "coin" }),
    mines: () => nextPage({ view: "games", panel: "mines" }),
  }

  public modal = {
    seasonRules: () => nextPage({ modal: "season_rules" }),
    bonusStars: () => nextPage({ modal: "bonus_stars" }),
    marketGifts: () => nextPage({ modal: "market_gifts" }),
    referral: () => nextPage({ modal: "referral" }),
    replenishment: () => nextPage({ modal: "replenishment" }),
    minesStart: () => nextPage({ modal: "mines_start" }),
  }

  public goSeason = {
    default: () => nextPage({ view: "season", panel: "default" }),
  }

  public goProfile = {
    default: () => nextPage({ view: "profile", panel: "default" }),
  }

  public assignments = {
    default: () => nextPage({ view: "assignments", panel: "default" }),
  }
}

export default Route
