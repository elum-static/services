import {
  createSignal,
  onMount,
  onCleanup,
  createEffect,
  untrack,
} from "solid-js"

interface ConfettiPiece {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  rotation: number
  rotationSpeed: number
  color: string
  shape: "circle" | "square" | "rectangle" | "triangle"
  opacity: number
  gravity: number
}

interface ConfettiProps {
  isActive: boolean
  onComplete?: () => void
}

export default function Confetti(props: ConfettiProps) {
  let canvasRef: HTMLCanvasElement | undefined
  const [pieces, setPieces] = createSignal<ConfettiPiece[]>([])
  const [animationId, setAnimationId] = createSignal<number | null>(null)

  // Цвета для конфетти
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F3FF33",
    "#FF33F3",
    "#33FFF3",
    "#FF8333",
    "#33FF83",
    "#8333FF",
    "#FF3383",
    "#FF3367",
    "#67FF33",
    "#3367FF",
    "#FFC733",
    "#C733FF",
  ]

  // Создание частиц конфетти из центра экрана
  const createConfetti = () => {
    const newPieces: ConfettiPiece[] = []
    const count = 220 // Оптимальное количество для производительности
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = Math.random() * 10 + 4 // Увеличил скорость

      newPieces.push({
        x: centerX,
        y: centerY,
        size: Math.random() * 7 + 4,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 6, // Больше начальной скорости вверх
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 24, // Увеличил скорость вращения
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: ["circle", "square", "rectangle", "triangle"][
          Math.floor(Math.random() * 4)
        ] as any,
        opacity: 1,
        gravity: Math.random() * 0.25 + 0.2, // Увеличил гравитацию
      })
    }

    setPieces(newPieces)
  }

  // Отрисовка различных форм конфетти
  const drawShape = (
    ctx: CanvasRenderingContext2D,
    shape: string,
    size: number,
  ) => {
    switch (shape) {
      case "circle":
        ctx.beginPath()
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
        ctx.fill()
        break
      case "square":
        ctx.fillRect(-size / 2, -size / 2, size, size)
        break
      case "rectangle":
        ctx.fillRect(-size / 2, -size / 4, size, size / 2)
        break
      case "triangle":
        ctx.beginPath()
        ctx.moveTo(0, -size / 2)
        ctx.lineTo(size / 2, size / 2)
        ctx.lineTo(-size / 2, size / 2)
        ctx.closePath()
        ctx.fill()
        break
    }
  }

  // Анимация конфетти (оптимизированная)
  const animate = () => {
    if (!canvasRef) return

    const ctx = canvasRef.getContext("2d")
    if (!ctx) return

    // Полная очистка canvas (без затемнения)
    ctx.clearRect(0, 0, canvasRef.width, canvasRef.height)

    const currentPieces = pieces()
    const updatedPieces: ConfettiPiece[] = []

    for (const piece of currentPieces) {
      // Обновление позиции с учетом гравитации
      let newX = piece.x + piece.speedX
      let newY = piece.y + piece.speedY
      let newSpeedY = piece.speedY + piece.gravity
      let newRotation = piece.rotation + piece.rotationSpeed
      let newOpacity = piece.opacity - 0.008 // Увеличил скорость исчезновения

      // Сопротивление воздуха
      let newSpeedX = piece.speedX * 0.98

      // Если конфетти еще видимо
      if (newOpacity > 0.05) {
        updatedPieces.push({
          ...piece,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY,
          rotation: newRotation,
          opacity: newOpacity,
        })

        // Отрисовка конфетти
        ctx.save()
        ctx.globalAlpha = newOpacity
        ctx.fillStyle = piece.color
        ctx.translate(newX, newY)
        ctx.rotate((newRotation * Math.PI) / 180)

        drawShape(ctx, piece.shape, piece.size)

        ctx.restore()
      }
    }

    setPieces(updatedPieces)

    // Продолжаем анимацию, если есть активные частицы
    if (updatedPieces.length > 0 && props.isActive) {
      setAnimationId(requestAnimationFrame(animate))
    } else if (props.onComplete && updatedPieces.length === 0) {
      props.onComplete()
    }
  }

  // Эффект для запуска/остановки анимации
  createEffect(() => {
    const _animationId = untrack(animationId)
    if (props.isActive && canvasRef) {
      // Устанавливаем размер canvas
      canvasRef.width = window.innerWidth
      canvasRef.height = window.innerHeight

      createConfetti()
      if (_animationId !== null) {
        cancelAnimationFrame(_animationId!)
      }
      setAnimationId(requestAnimationFrame(animate))
    } else if (_animationId !== null) {
      cancelAnimationFrame(_animationId!)
      setAnimationId(null)
      setPieces([])
    }
  })

  // Очистка при размонтировании
  onCleanup(() => {
    if (animationId() !== null) {
      cancelAnimationFrame(animationId()!)
    }
  })

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        "pointer-events": "none",
        "z-index": 9999,
      }}
    />
  )
}
