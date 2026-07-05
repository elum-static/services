import { type RouletteDrawBet } from "../types"

const minEdgeOffset = Math.PI / 180

/**
 * Найти случайный угол внутри сектора победителя
 */
function getWinnerAngle(bets: RouletteDrawBet[], totalBet: number, winnerUserId: number) {
  let startAngle = -Math.PI / 2

  for (const bet of bets) {
    const slice = (bet.amount / totalBet) * Math.PI * 2
    const endAngle = startAngle + slice

    if (bet.user_id === winnerUserId) {
      const offset = Math.min(slice * 0.2, minEdgeOffset)
      const from = startAngle + offset
      const to = endAngle - offset

      return from + Math.random() * Math.max(0, to - from)
    }

    startAngle = endAngle
  }

  return null
}

export default getWinnerAngle
