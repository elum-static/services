function getEmojiId(emoji: string): string {
  const codes: string[] = []

  for (const char of emoji) {
    const code = char.codePointAt(0)
    if (code) {
      codes.push(code.toString(16).padStart(4, "0"))
    }
  }

  return codes.join("-")
}

export default getEmojiId
