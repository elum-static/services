function generatePath(path: string) {
  return new URL(path, import.meta.url)
}

export default generatePath
