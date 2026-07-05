import core from "@core"
import { clamp } from "@minsize/utils"
import {
  Button,
  Cell,
  Checkbox,
  FixedLayout,
  Flex,
  Group,
  Hidden,
  Lottie,
  Panel,
  Separator,
  Text,
  Timer,
} from "@ui/index"
import { type JSX, type Component, onMount, onCleanup, For, Switch, Match } from "solid-js"
import { createStore } from "solid-js/store"
import {
  AnimationNumber,
  BetPlayers,
  InputBalance,
  InputMultiplier,
  Multipliers,
  PingInformer,
} from "src/components/features"
import { Balances } from "src/components/layout"
import { GameCrushPhase } from "src/core/src/api/game/crush/types"

interface Crush extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

type Store = {
  amount: number
  auto_cash_out: boolean
  auto_cash_out_bp: number
}

// FIXME: Language and lottie icons
const Crush: Component<Crush> = (props) => {
  const [lang] = core.locale.use()

  const [store, setStore] = createStore<Store>({
    amount: 100 * core.config.balanceFactor,
    auto_cash_out: false,
    auto_cash_out_bp: 2 * core.config.balanceFactor,
  })

  onMount(() => {
    core.games.crush.join()
  })

  onCleanup(() => {
    core.games.crush.leave()
  })

  const isBetPlayer = () => core.games.crush.info.bets.find((x) => x.user.id === core.state.user.id)

  return (
    <Panel>
      <Panel.Container bgColor={"background_game_crush"}>
        <Balances />
        <PingInformer />
        <div
          style={{
            color: "white",
            "text-align": "center",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            // "aspect-ratio": "1/0.6",
            "min-height": "156px",
            padding: "20px 0px",
          }}
        >
          <Switch>
            <Match when={core.games.crush.info.phase === GameCrushPhase.BETTING}>
              <Timer
                style={{
                  "font-size": "64px",
                  "font-weight": "bold",
                }}
                format={"S"}
                targetDate={core.games.crush.info.betting_ends_at}
              />
            </Match>
            <Match when={core.games.crush.info.phase === GameCrushPhase.FLYING}>
              <Lottie data={core.files.getTGS("crush")} loop size={156} />
            </Match>
            <Match when={core.games.crush.info.phase === GameCrushPhase.CRASHED}>
              <Lottie loop data={core.files.getTGS("boom")} size={156} />
            </Match>
          </Switch>
        </div>
        <Multipliers
          multiplierCurrent={core.games.crush.info.multiplier}
          phaseCurrent={core.games.crush.info.phase}
          multipliers={core.games.crush.info.previous_multipliers}
        />
        <div
          style={{
            margin: "10px",
            "box-sizing": "border-box",
            "background-color": "var(--background_game_crush_secondary)",
            "border-radius": "13px",
            overflow: "hidden",
            "box-shadow": "var(--glass-shadow)",
          }}
        >
          <Flex padding={"10px"}>
            <InputBalance
              size={32}
              minValue={10}
              maxValue={
                (core.state.balance.stars + core.state.balance.bonus_stars) /
                core.config.balanceFactor
              }
              value={store.amount / core.config.balanceFactor}
              onChangeValue={(value) => {
                setStore(
                  "amount",
                  clamp(
                    value * core.config.balanceFactor,
                    10 * core.config.balanceFactor,
                    100_000 * core.config.balanceFactor,
                  ),
                )
              }}
            />
          </Flex>
          {/* <Hidden when={core.games.crush.info.phase === GameCrushPhase.BETTING}> */}
          <Button.Group>
            <Button.Group.Container>
              <For each={[100, 500, 1000]}>
                {(amountFix) => (
                  <Button
                    size={"small"}
                    stretched
                    appearance={"secondary-crush"}
                    onClick={() => {
                      setStore("amount", (amount) =>
                        clamp(
                          amount + amountFix * core.config.balanceFactor,
                          10 * core.config.balanceFactor,
                          100_000 * core.config.balanceFactor,
                        ),
                      )
                    }}
                  >
                    <Button.Content>
                      <Text align={"center"}>
                        <Text.Content>
                          <AnimationNumber prefix={"+"} value={amountFix} format={{}} />
                        </Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                )}
              </For>
            </Button.Group.Container>
          </Button.Group>
          {/* </Hidden> */}
          <Cell
            tappable={false}
            before={
              <Checkbox
                onClick={() => {
                  setStore("auto_cash_out", (value) => !value)
                }}
                selected={store.auto_cash_out}
              />
            }
            separator={false}
            after={
              <InputMultiplier
                value={store.auto_cash_out_bp}
                onChangeValue={(value) => {
                  setStore("auto_cash_out_bp", value)
                  setStore("auto_cash_out", true)
                }}
              />
            }
          >
            <Text>
              {/** FIXME: Language */}
              <Text.Content>Авто-вывод</Text.Content>
            </Text>
          </Cell>
          <Button.Group>
            <Button.Group.Container>
              <Switch>
                <Match
                  keyed
                  when={
                    core.games.crush.info.phase === GameCrushPhase.FLYING &&
                    core.games.crush.info.bets.find(
                      (x) => x.user.id === core.state.user.id && x.status !== "PAID",
                    ) &&
                    core.games.crush.info.bets.map((x) => x.user.id === core.state.user.id)
                  }
                >
                  {(myBets) => (
                    <Button
                      stretched
                      onClick={() => {
                        for (const bet of core.games.crush.info.bets) {
                          if (bet.user.id === core.state.user.id && bet.status === "PLACED") {
                            core.api.game.crush.cashOut({
                              request_key: String(Math.random()),
                              entry_id: bet.entry_id,
                            })
                          }
                        }
                      }}
                    >
                      <Button.Content>
                        <Text color={"inherit"} align={"center"}>
                          {/** FIXME: Либо забрать либо забрать всё если моих ставок несколько */}
                          <Text.Content>
                            {myBets.length >= 2 ? "Забрать всё" : "Забрать"}
                          </Text.Content>
                        </Text>
                      </Button.Content>
                    </Button>
                  )}
                </Match>
                <Match
                  keyed
                  when={isBetPlayer() || core.games.crush.info.phase !== GameCrushPhase.BETTING}
                >
                  <Button
                    tappable={false}
                    classes={{
                      active: "",
                      hover: "",
                      disabled: "",
                    }}
                    stretched
                    mode={"ghost"}
                    appearance={"secondary"}
                  >
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        <Text.Content>Ожидание</Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                </Match>
                <Match when={true}>
                  <Button
                    stretched
                    onClick={() => {
                      core.api.game.crush.bet({
                        amount: store.amount,
                        auto_cash_out_bp: store.auto_cash_out ? store.auto_cash_out_bp : undefined,
                        request_key: Math.random().toString(),
                      })
                    }}
                  >
                    <Button.Content>
                      <Text color={"inherit"} align={"center"}>
                        <Text.Content>Поставить</Text.Content>
                      </Text>
                    </Button.Content>
                  </Button>
                </Match>
              </Switch>
            </Button.Group.Container>
          </Button.Group>
        </div>
        <BetPlayers
          players={core.games.crush.info.bets.map((x) => ({
            ...x.user,

            status: x.status,
            amount: x.amount,
            multiplier: x.cashed_out
              ? x.cash_out_multiplier || 0
              : core.games.crush.info.multiplier,
          }))}
        />
      </Panel.Container>
    </Panel>
  )
}

export default Crush
