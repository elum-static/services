import { onCleanup, onMount } from "solid-js"
import core from "src/core"
import { type RouletteBet } from "src/core/src/games/roulette"

const mockUpdates: RouletteBet[][] = [
  [{ user_id: 1, amount: 100 }],
  [
    { user_id: 1, amount: 100 },
    { user_id: 2, amount: 500 },
  ],
  [
    { user_id: 1, amount: 300 },
    { user_id: 2, amount: 5000 },
    { user_id: 3, amount: 1000 },
    { user_id: 4, amount: 50 },
    { user_id: 5, amount: 24 },
    { user_id: 6, amount: 2346 },
    { user_id: 7, amount: 124 },
    { user_id: 8, amount: 5450 },
  ],
]

/**
 * Имитировать серверные события join, getGame, update и end
 */
function useMockRoulette() {
  const timers: ReturnType<typeof setTimeout>[] = []

  onMount(() => {
    const endsAt = new Date(Date.now() + 8_000)

    core.games.roulette.join()
    core.games.roulette.getGame({
      bets: mockUpdates[0],
      ends_at: endsAt,
    })

    mockUpdates.slice(1).forEach((bets, index) => {
      timers.push(
        setTimeout(
          () => {
            core.games.roulette.updateGame({
              bets,
              ends_at: endsAt,
            })
          },
          (index + 1) * 1_500,
        ),
      )
    })

    timers.push(
      setTimeout(() => {
        core.games.roulette.endGame({
          winner_user_id: 2,
        })
      }, 8_200),
    )
  })

  onCleanup(() => {
    timers.forEach((timer) => clearTimeout(timer))
    core.games.roulette.leave()
  })
}

export default useMockRoulette
