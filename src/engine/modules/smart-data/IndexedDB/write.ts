import { mutex } from "."
import open from "./open"

export async function write<T>(
  name: string,
  key: string,
  data: T | T[],
): Promise<void> {
  const release = await mutex.wait()
  try {
    const db = await open(name)

    // Добавить поддержку new Map
    return new Promise((resolve, reject) => {
      if (!db.objectStoreNames.contains(name)) {
        db.close()
        release()
        return
      }
      const transaction = db.transaction(name, "readwrite")
      const store = transaction.objectStore(name)

      // const items = Array.isArray(data) ? data : [data]

      transaction.oncomplete = () => {
        resolve()
        db.close()
        release()
      }
      transaction.onerror = () => {
        console.error("Failed to write item:", transaction.error)
        reject(transaction.error)
        db.close()
        release()
      }

      const request = store.put({
        atomId: key,
        data: JSON.stringify(data),
      })

      request.onerror = () => {
        console.error("Failed to write item:", data, request.error)
      }

      request.onsuccess = () => {}
    })
  } catch (error) {
    release()
    console.error("Database write error:", error)
    throw error
  }
}
