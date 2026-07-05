const classGenerator = () => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
  let currentLength = 1
  const usedKeys = new Set<string>()
  return () => {
    while (true) {
      if (usedKeys.size === Math.pow(characters.length, currentLength)) {
        currentLength++
        usedKeys.clear()
      }

      let key = ""
      while (true) {
        for (let i = 0; i < currentLength; i++) {
          const randomIndex = Math.floor(Math.random() * characters.length)
          key += characters[randomIndex]
        }

        if (!usedKeys.has(key)) {
          usedKeys.add(key)
          return key
        }

        key = ""
      }
    }
  }
}

export default classGenerator
