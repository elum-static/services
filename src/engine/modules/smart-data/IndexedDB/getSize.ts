import { mutex } from "."
import open from "./open"

async function getSize(name: string): Promise<number> {
  return new Promise(async (resolve) => {
    const release = await mutex.wait()
    const db = await open(name)

    let totalSize = 0

    const transaction = db.transaction(name, "readonly")

    const store = transaction.objectStore(name)
    const countRequest = store.count()

    countRequest.onsuccess = () => {
      const count = countRequest.result
      const getRequest = store.getAll()

      getRequest.onsuccess = () => {
        const items = getRequest.result
        items.forEach((item) => {
          // Приблизительный расчет размера
          totalSize += JSON.stringify(item).length
        })

        resolve(totalSize)
        db.close()
        release()
      }
    }
  })
}

export default getSize
