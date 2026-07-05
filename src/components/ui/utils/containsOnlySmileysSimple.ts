function containsOnlySmileys(text: string, maxCount: number = 1) {
  if (text.length === 0) return true // пустая строка - валидна

  // Улучшенное регулярное выражение для эмодзи
  const emojiRegex =
    /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}\p{Emoji_Modifier})/gu

  // Находим все эмодзи
  const emojis = text.match(emojiRegex) || []

  // Проверяем, что весь текст состоит только из эмодзи
  // Удаляем все эмодзи из текста и смотрим, осталось ли что-то
  const textWithoutEmojis = text.replace(emojiRegex, "").trim()

  // Если после удаления эмодзи что-то осталось - есть другие символы
  const hasOnlyEmojis = textWithoutEmojis.length === 0

  // Проверяем количество
  const withinLimit = emojis.length <= maxCount

  return hasOnlyEmojis && withinLimit
}

export default containsOnlySmileys
