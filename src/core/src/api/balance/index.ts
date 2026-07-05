import core from "src/core"
import balanceGet from "./get"

class Balance {
  public get = balanceGet

  public getTransform(value: number, reverse: boolean = false) {
    if (reverse) {
      return value * core.config.balanceFactor
    }
    return value / core.config.balanceFactor
  }
}

export default Balance
