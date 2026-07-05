import * as PIXI from "pixi.js"

/**
 * Создать текстуру аватара для пользователя без загрузки картинки
 */
function generateAvatarTexture(label: string, size: number) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d")!
  const hue = (label.charCodeAt(0) * 37) % 360
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)

  gradient.addColorStop(0, `hsl(${hue}, 80%, 65%)`)
  gradient.addColorStop(1, `hsl(${hue}, 80%, 40%)`)

  context.fillStyle = gradient
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  context.fill()

  context.fillStyle = "#ffffff"
  context.font = `bold ${size * 0.45}px Arial`
  context.textAlign = "center"
  context.textBaseline = "middle"
  context.shadowColor = "rgba(0,0,0,0.3)"
  context.shadowBlur = 8
  context.fillText(label[0].toUpperCase(), size / 2, size / 2 + 1)

  context.shadowBlur = 0
  context.strokeStyle = "#ffffff"
  context.lineWidth = 2
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2)
  context.stroke()

  return PIXI.Texture.from(canvas)
}

export default generateAvatarTexture
