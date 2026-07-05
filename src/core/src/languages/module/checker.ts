function checker(...args: Record<string, any>[]) {
  // Получаем все уникальные пути из всех объектов
  const getAllPaths = (obj: any, prefix: string = ""): Set<string> => {
    const paths = new Set<string>()

    for (const key in obj) {
      const currentPath = prefix ? `${prefix}.${key}` : key

      if (obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        // Рекурсивно обходим вложенные объекты
        const childPaths = getAllPaths(obj[key], currentPath)
        childPaths.forEach((path) => paths.add(path))
      } else {
        paths.add(currentPath)
      }
    }

    return paths
  }

  // Получаем все пути из всех объектов
  const allPathsSet = new Set<string>()
  const languageData: { [lang: string]: Set<string> } = {}

  args.forEach((obj, index) => {
    const langKey = Object.keys(obj)[0] || `lang_${index}`
    const langObj = obj[langKey]

    if (langObj && typeof langObj === "object") {
      const paths = getAllPaths(langObj)
      languageData[langKey] = paths
      paths.forEach((path) => allPathsSet.add(path))
    }
  })

  // Проверяем наличие каждого пути в каждом языке
  const sortedPaths = Array.from(allPathsSet).sort()

  console.log("Результат проверки путей:\n")

  sortedPaths.forEach((path) => {
    const missingIn: string[] = []

    for (const [lang, paths] of Object.entries(languageData)) {
      if (!paths.has(path)) {
        missingIn.push(lang)
      }
    }

    if (missingIn.length > 0) {
      console.log(`Путь "${path}" - нет поля в: ${missingIn.join(", ")}`)
    }
  })

  // Если нужен возврат результата
  return {
    allPaths: sortedPaths,
    missingPaths: sortedPaths.filter((path) => {
      return Object.values(languageData).some((paths) => !paths.has(path))
    }),
  }
}

export default checker
