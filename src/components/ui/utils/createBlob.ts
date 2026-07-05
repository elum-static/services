const cacheBlob = new Map<Blob, string>()
const createBlob = (blob: Blob) => {
  const cache = cacheBlob.get(blob)

  if (!!cache) return cache

  const MASK = URL.createObjectURL(blob)

  cacheBlob.set(blob, MASK)

  return MASK
}

export default createBlob
