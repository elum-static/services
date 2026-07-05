import core from "src/core"
import Crush from "./crush"
import Mines from "./mines"
import Roulette from "./roulette"
import Pvp from "./pvp"

class Games {
  public roulette = new Roulette()

  public crush = new Crush()

  public mines = new Mines()

  public pvp = new Pvp()

  /**
   * Приводит коэффициент в нормальный вид
   */
  public getMultipliers(value: number) {
    return (value / core.config.balanceFactor).toFixed(2)
  }
  public getMultipliersNumber(value: number) {
    return Number((value / core.config.balanceFactor).toFixed(2))
  }
}

export default Games
