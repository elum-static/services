const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xa29bfe, 0xff9ff3, 0xfd79a8, 0x00b894]

/**
 * Вернуть постоянный цвет сектора для пользователя
 */
function getColorForPlayer(userId: number) {
  return colors[Math.abs(userId) % colors.length]
}

export default getColorForPlayer
