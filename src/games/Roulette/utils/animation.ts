import { type RouletteDrawBet } from "../types"

/**
 * Сгладить движение к финальному значению
 */
export function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

/**
 * Плавно изменить значение между старой и новой ставкой
 */
export function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

/**
 * Сложить суммы ставок для текущего кадра анимации
 */
export function getTotalBet(bets: RouletteDrawBet[]) {
  return bets.reduce((acc, bet) => acc + bet.amount, 0)
}

/**
 * Получить ключ ставок, чтобы не перезапускать анимацию без изменения сумм
 */
export function getBetsKey(bets: RouletteDrawBet[]) {
  return bets.map((bet) => `${bet.user_id}:${bet.amount}`).join("|")
}

/**
 * Рассчитать промежуточное состояние ставок между двумя обновлениями
 */
export function getBetsFrame(from: RouletteDrawBet[], to: RouletteDrawBet[], progress: number) {
  const users = new Set([...from.map((bet) => bet.user_id), ...to.map((bet) => bet.user_id)])

  return [...users]
    .map((userId) => {
      const fromBet = from.find((bet) => bet.user_id === userId)
      const toBet = to.find((bet) => bet.user_id === userId)

      return {
        user_id: userId,
        amount: lerp(fromBet?.amount ?? 0, toBet?.amount ?? 0, progress),
        label: toBet?.label ?? fromBet?.label ?? String(userId),
      }
    })
    .filter((bet) => bet.amount > 0.1)
}

/**
 * Рассчитать ближайший финальный поворот до выбранного сектора
 */
export function getTargetRotation(currentRotation: number, winnerAngle: number, speed: number, duration: number) {
  const pointerAngle = -Math.PI / 2
  const fullCircle = Math.PI * 2
  const baseRotation = pointerAngle - winnerAngle
  const normalizedDelta = ((baseRotation - currentRotation) % fullCircle + fullCircle) % fullCircle
  const frames = duration / (1_000 / 60)
  const desiredDistance = (speed * frames) / 3
  const circles = Math.max(3, Math.round((desiredDistance - normalizedDelta) / fullCircle))

  return currentRotation + normalizedDelta + fullCircle * circles
}
