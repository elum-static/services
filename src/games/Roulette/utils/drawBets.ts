import * as PIXI from "pixi.js"

import { type RouletteDrawBet } from "../types"
import generateAvatarTexture from "./generateAvatarTexture"
import getColorForPlayer from "./getColorForPlayer"

type DrawBetsOptions = {
  bets: RouletteDrawBet[]
  totalBet: number
  container: PIXI.Container
  radius: number
}

/**
 * Перерисовать сектора ставок на колесе
 */
function drawBets(options: DrawBetsOptions) {
  const { bets, totalBet, container, radius } = options

  container.removeChildren().forEach((child) => child.destroy({ children: true }))

  if (!bets.length || totalBet <= 0) {
    return
  }

  let startAngle = -Math.PI / 2
  const innerRadius = radius * 0.4
  const avatarDistance = innerRadius + (radius - innerRadius) * 0.5
  const avatarSize = 36

  for (const bet of bets) {
    const slice = (bet.amount / totalBet) * Math.PI * 2
    const endAngle = startAngle + slice
    const color = getColorForPlayer(bet.user_id)

    const graphics = new PIXI.Graphics()
    graphics.moveTo(Math.cos(startAngle) * innerRadius, Math.sin(startAngle) * innerRadius)
    graphics.lineTo(Math.cos(startAngle) * radius, Math.sin(startAngle) * radius)
    graphics.arc(0, 0, radius, startAngle, endAngle)
    graphics.lineTo(Math.cos(endAngle) * innerRadius, Math.sin(endAngle) * innerRadius)
    graphics.arc(0, 0, innerRadius, endAngle, startAngle, true)
    graphics.closePath()
    graphics.fill({ color, alpha: 0.85 })
    graphics.stroke({ color: 0xffffff, width: 2, alpha: 0.3 })
    container.addChild(graphics)

    const midAngle = startAngle + slice / 2
    const texture = generateAvatarTexture(bet.label, avatarSize)
    const sprite = new PIXI.Sprite(texture)

    sprite.anchor.set(0.5)
    sprite.position.set(Math.cos(midAngle) * avatarDistance, Math.sin(midAngle) * avatarDistance)
    sprite.width = avatarSize
    sprite.height = avatarSize
    container.addChild(sprite)

    startAngle = endAngle
  }
}

export default drawBets
