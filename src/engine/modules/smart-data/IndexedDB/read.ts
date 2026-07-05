import { mutex } from "."
import open from "./open"

// Добавляем новые типы в types.ts
export type IDBQuery =
  | IDBValidKey
  | IDBKeyRange
  | { index: string; value: any }
  | null

// idb.ts
export async function read<T>(
  name: string,
  key: string,
): Promise<T | T[] | null> {
  const release = await mutex.wait()
  try {
    const db = await open(name)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(name, "readonly")
      const store = transaction.objectStore(name)

      let request = store.get(key)

      transaction.onerror = () => {
        reject(transaction.error)
        db.close()
        release()
      }

      request.onsuccess = () => {
        const result = request.result
        if (!result?.data) {
          reject("clear")
          db.close()
          release()
          return
        }
        resolve(JSON.parse(result.data))
        db.close()
        release()
      }

      request.onerror = () => {
        reject(request.error)
        db.close()
        release()
      }
    })
  } catch (error) {
    release()
    console.error("Database read error:", error)
    throw error
  }
}

export default read
