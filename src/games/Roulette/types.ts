import { type JSX } from "solid-js"
import { type RouletteBet } from "src/core/src/games/roulette"

export type RouletteWheelProps = JSX.HTMLAttributes<HTMLCanvasElement> & {
  countdownSeconds?: number
  onCountdownEnd?: () => void
}

export type RouletteDrawBet = RouletteBet & {
  label: string
}
