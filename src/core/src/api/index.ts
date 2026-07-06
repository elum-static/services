import Emitter from "src/core/utils/emitter"
import Balance from "./balance"
import Calendar from "./calendar"
import Cpa from "./cpa"
import Referral from "./referral"
import Season from "./season"
import Task from "./tasks"
import Game from "./game"
import Payment from "./payment"

class API {
  public balance = new Balance()
  public season = new Season()
  public referral = new Referral()
  public calendar = new Calendar()
  public task = new Task()
  public cpa = new Cpa()
  public payment = new Payment()
  public game = new Game()
}

export default API
