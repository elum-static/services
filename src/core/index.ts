import API from "./src/api"
import State from "./src/state"
import Files from "./src/files"
import Locale from "./src/languages"
import Route from "./src/route"
import System from "./src/system"
import Games from "./src/games"
import TonConnect from "./src/tonConnect"

class Core {
  public config = {
    balanceFactor: 100,
  }

  public api = new API()

  public state = new State()

  public locale = new Locale()

  public route = new Route()

  public files = new Files()

  public system = new System()

  public games = new Games()

  public tonConnect = new TonConnect()

  constructor() {}
}

const core = new Core()

export default core
