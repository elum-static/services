import { type Component, createEffect, onCleanup, onMount, splitProps } from "solid-js"
import * as PIXI from "pixi.js"
import core from "src/core"

import { type RouletteDrawBet, type RouletteWheelProps } from "./types"
import { easeOutCubic, getBetsFrame, getBetsKey, getTargetRotation, getTotalBet } from "./utils/animation"
import drawBets from "./utils/drawBets"
import getWinnerAngle from "./utils/getWinnerAngle"

const stopDuration = 4_200
const betsAnimationDuration = 600
const waitingSpinSpeed = 0.32

const defaultSize = () => window.innerWidth * 0.9

/**
 * Получить размер canvas из props или ширины экрана
 */
function getCanvasSize(width?: string | number, height?: string | number) {
  const parsedWidth = Number(width)
  const parsedHeight = Number(height)

  return {
    width: Number.isFinite(parsedWidth) && parsedWidth > 0 ? parsedWidth : defaultSize(),
    height: Number.isFinite(parsedHeight) && parsedHeight > 0 ? parsedHeight : defaultSize(),
  }
}

/**
 * Подготовить ставки core для отрисовки на колесе
 */
function getDrawBets(): RouletteDrawBet[] {
  return core.games.roulette.bets.map((bet) => ({
    ...bet,
    label: String(bet.user_id),
  }))
}

const RouletteWheel: Component<RouletteWheelProps> = (props) => {
  const [local, others] = splitProps(props, ["countdownSeconds", "onCountdownEnd", "width", "height"])
  const size = getCanvasSize(local.width, local.height)
  const radius = Math.min(size.width, size.height) * 0.5

  let canvas!: HTMLCanvasElement
  let app: PIXI.Application | undefined
  let wheel: PIXI.Container | undefined
  let sectors: PIXI.Container | undefined
  let progressBar: PIXI.Graphics | undefined
  let timerText: PIXI.Text | undefined
  let rotation = 0
  let stopStartedAt = 0
  let stopFromRotation = 0
  let stopToRotation = 0
  let spinSpeed = 0
  let displayedBets: RouletteDrawBet[] = []
  let lastBetsKey = ""
  let betsAnimation:
    | {
        from: RouletteDrawBet[]
        to: RouletteDrawBet[]
        startedAt: number
      }
    | undefined
  let countdownEnded = false
  let stopAnimationStarted = false

  const renderBets = (bets = displayedBets) => {
    if (!sectors) {
      return
    }

    drawBets({
      bets,
      totalBet: getTotalBet(bets),
      container: sectors,
      radius,
    })
  }

  /**
   * Запустить плавное изменение размеров секторов ставок
   */
  const animateBetsTo = (bets: RouletteDrawBet[]) => {
    const nextKey = getBetsKey(bets)

    if (nextKey === lastBetsKey) {
      return
    }

    lastBetsKey = nextKey

    if (!displayedBets.length) {
      displayedBets = bets
      renderBets()
      return
    }

    betsAnimation = {
      from: displayedBets,
      to: bets,
      startedAt: performance.now(),
    }
  }

  /**
   * Обновить кадр анимации изменения ставок
   */
  const updateBetsAnimation = () => {
    if (!betsAnimation) {
      return
    }

    const progress = Math.min(1, (performance.now() - betsAnimation.startedAt) / betsAnimationDuration)
    displayedBets = getBetsFrame(betsAnimation.from, betsAnimation.to, easeOutCubic(progress))
    renderBets()

    if (progress >= 1) {
      displayedBets = betsAnimation.to
      betsAnimation = undefined
      renderBets()
    }
  }

  /**
   * Запустить плавную остановку на секторе победителя
   */
  const startStopAnimation = () => {
    const winnerUserId = core.games.roulette.winner_user_id
    const totalBet = core.games.roulette.total_bet

    if (winnerUserId === null || !totalBet || stopAnimationStarted) {
      return
    }

    const winnerAngle = getWinnerAngle(getDrawBets(), totalBet, winnerUserId)
    if (winnerAngle === null) {
      return
    }

    stopAnimationStarted = true
    stopStartedAt = Date.now()
    stopFromRotation = rotation
    stopToRotation = getTargetRotation(rotation, winnerAngle, Math.max(spinSpeed, waitingSpinSpeed), stopDuration)
    timerText!.visible = false
    progressBar!.clear()
  }

  /**
   * Обновить таймер и прогресс до окончания приема ставок
   */
  const drawCountdown = () => {
    const endsAt = core.games.roulette.ends_at
    const progressRadius = radius * 0.4 - 4

    if (!endsAt || !progressBar || !timerText) {
      return false
    }

    const remaining = Math.max(0, endsAt.getTime() - Date.now())
    const duration = Math.max(1, endsAt.getTime() - (endsAt.getTime() - (local.countdownSeconds ?? 8) * 1_000))
    const progress = 1 - remaining / duration

    progressBar.clear()
    progressBar.arc(0, 0, progressRadius, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
    progressBar.stroke({ color: 0xff6b6b, width: 8 })
    timerText.visible = remaining > 0
    timerText.text = Math.ceil(remaining / 1_000).toString()

    if (remaining <= 0 && !countdownEnded) {
      countdownEnded = true
      local.onCountdownEnd?.()
    }

    return remaining > 0
  }

  onMount(async () => {
    app = new PIXI.Application()
    await app.init({
      canvas,
      width: size.width,
      height: size.height,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })

    wheel = new PIXI.Container()
    wheel.position.set(size.width / 2, size.height / 2)
    app.stage.addChild(wheel)

    sectors = new PIXI.Container()
    wheel.addChild(sectors)
    animateBetsTo(getDrawBets())
    renderBets()

    const progressBackground = new PIXI.Graphics()
    progressBar = new PIXI.Graphics()
    const progressRadius = radius * 0.4 - 4

    progressBackground
      .arc(0, 0, progressRadius, 0, Math.PI * 2)
      .stroke({ color: 0xff6b6b, width: 8, alpha: 0.25 })
    wheel.addChild(progressBackground)
    wheel.addChild(progressBar)

    timerText = new PIXI.Text({
      text: "",
      style: {
        fontSize: 48,
        fill: 0xff6b6b,
        fontWeight: "bold",
        align: "center",
      },
    })
    timerText.anchor.set(0.5)
    wheel.addChild(timerText)

    const pointer = new PIXI.Graphics()
    pointer
      .moveTo(size.width / 2, 8)
      .lineTo(size.width / 2 - 12, 36)
      .lineTo(size.width / 2 + 12, 36)
      .closePath()
      .fill({ color: 0xffffff })
      .stroke({ color: 0xff6b6b, width: 2 })
    app.stage.addChild(pointer)

    app.ticker.add((ticker) => {
      const status = core.games.roulette.status
      const hasCountdown = drawCountdown()

      updateBetsAnimation()

      if (status === "ended") {
        startStopAnimation()
      }

      if (stopAnimationStarted) {
        const progress = Math.min(1, (Date.now() - stopStartedAt) / stopDuration)
        rotation = stopFromRotation + (stopToRotation - stopFromRotation) * easeOutCubic(progress)
        wheel!.rotation = rotation
        return
      }

      if (!hasCountdown || status === "spinning") {
        spinSpeed = waitingSpinSpeed
        rotation += spinSpeed * ticker.deltaTime
        wheel!.rotation = rotation
        timerText!.visible = false
        progressBar!.clear()
      }
    })
  })

  createEffect(() => {
    const bets = getDrawBets()
    const status = core.games.roulette.status

    animateBetsTo(bets)

    if (status === "ended") {
      startStopAnimation()
    }
  })

  onCleanup(() => {
    app?.destroy(true, { children: true })
  })

  return (
    <canvas
      ref={canvas}
      width={size.width}
      height={size.height}
      style={{ width: `${size.width}px`, height: `${size.height}px` }}
      {...others}
    />
  )
}

export default RouletteWheel
