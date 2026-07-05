import crushBet from "./bet"
import crushCashOut from "./cashOut"
import crushJoin from "./join"
import crushLeave from "./leave"
import crushState from "./state"

class Crush {
  public join = crushJoin
  public leave = crushLeave
  public state = crushState
  public bet = crushBet
  public cashOut = crushCashOut
}

export default Crush
