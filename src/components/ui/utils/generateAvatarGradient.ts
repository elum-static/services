/**
 * Генерирует градиент для аватарки на основе имени пользователя
 * @param userName - Имя пользователя (может быть строкой или null/undefined)
 * @returns CSS-строка с линейным градиентом
 */
function generateAvatarGradient(userName: string | null | undefined): number {
  // Дефолтные градиенты (как в Telegram)
  const defaultGradients = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ]

  // Если имя не передано, возвращаем случайный градиент
  if (!userName) {
    return defaultGradients[Math.floor(Math.random() * defaultGradients.length)]
  }

  // Создаем простой хеш из имени для детерминированного выбора
  let hash = 0
  for (let i = 0; i < userName.length; i++) {
    hash = userName.charCodeAt(i) + ((hash << 5) - hash)
  }

  // Выбираем градиент по хешу
  const gradientIndex = Math.abs(hash) % defaultGradients.length
  return defaultGradients[gradientIndex]
}

export default generateAvatarGradient
