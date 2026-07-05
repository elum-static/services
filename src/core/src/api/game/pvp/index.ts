import pvpBet from "./bet"
import pvpJoin from "./join"
import pvpLeave from "./leave"
import pvpState from "./state"

class Pvp {
  public bet = pvpBet
  public join = pvpJoin
  public leave = pvpLeave
  public state = pvpState
}

export default Pvp
