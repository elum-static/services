export function open(
  name: string,
  maxRetries = 5,
  initialDelay = 200,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const dbName = "smart-data"
    let retryCount = 0

    const checkCurrentVersion = () => {
      const checkRequest = indexedDB.open(dbName)
      checkRequest.onsuccess = () => {
        const db = checkRequest.result
        const currentVersion = db.version
        db.close()
        doOpen(
          dbName,
          name,
          currentVersion + 1,
          resolve,
          reject,
          maxRetries,
          initialDelay,
          retryCount,
        )
      }
      checkRequest.onerror = () => reject(checkRequest.error)
    }

    checkCurrentVersion()
  })
}

function doOpen(
  dbName: string,
  storeName: string,
  version: number,
  resolve: (db: IDBDatabase) => void,
  reject: (reason: any) => void,
  maxRetries: number,
  initialDelay: number,
  retryCount: number,
) {
  const request = indexedDB.open(dbName, version)

  request.onerror = () => {
    reject(request.error)
  }

  request.onupgradeneeded = (event) => {
    const db = request.result

    if (!db.objectStoreNames.contains(storeName)) {
      try {
        db.createObjectStore(storeName, { keyPath: "atomId" })
        console.log(`Object store '${storeName}' created successfully`)
      } catch (error) {
        console.error(`Failed to create object store '${storeName}':`, error)
        reject(error)
      }
    }
  }

  request.onsuccess = () => {
    const db = request.result

    if (!db.objectStoreNames.contains(storeName)) {
      db.close()
      reject(new Error(`Object store '${storeName}' was not created`))
    } else {
      resolve(db)
    }
  }

  request.onblocked = () => {
    if (retryCount < maxRetries) {
      const delay = initialDelay * Math.pow(2, retryCount)
      console.warn(
        `Database upgrade blocked (attempt ${
          retryCount + 1
        }/${maxRetries}), retrying in ${delay}ms...`,
      )

      setTimeout(() => {
        doOpen(
          dbName,
          storeName,
          version,
          resolve,
          reject,
          maxRetries,
          initialDelay,
          retryCount + 1,
        )
      }, delay)
    } else {
      reject(
        new Error(
          "Database upgrade blocked after multiple attempts - please close all other connections to this database",
        ),
      )
    }
  }
}

export default open
