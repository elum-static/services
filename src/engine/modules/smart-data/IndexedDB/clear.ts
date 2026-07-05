import { mutex } from "."
import open from "./open"

const clear = async (name: string): Promise<boolean> => {
  const release = await mutex.wait()
  const db = await open(name)

  const tx = db.transaction(name, "readwrite")
  const store = tx.objectStore(name)

  return new Promise((resolve, reject) => {
    const clearReq = store.clear()
    clearReq.onsuccess = () => {
      resolve(true)
      db.close()
      release()
    }
    clearReq.onerror = () => {
      resolve(true)
      db.close()
      release()
    }
    // В некоторых браузерах есть события прогресса
  })
}

export default clear
