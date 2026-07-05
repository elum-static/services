import minesCashOut from "./cashOut"
import minesCreate from "./create"
import minesHistory from "./history"
import minesOpen from "./open"
import minesState from "./state"

class Mines {
  public create = minesCreate
  public cashOut = minesCashOut
  public history = minesHistory
  public open = minesOpen
  public state = minesState
}

export default Mines
