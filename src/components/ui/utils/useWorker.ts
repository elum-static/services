import { createUniqueId, onCleanup, onMount } from "solid-js"

// Типы для сообщений
export interface WorkerMessage<T = unknown> {
  id: string
  data: T
}

export interface WorkerResponse<T = unknown> {
  id: string
  result?: T
  error?: string
}

export type WorkerCallback<T = unknown> = (
  result: T | undefined,
  error?: string,
) => void

const useWorker = <TData = unknown, TResult = unknown>(
  WorkerFactory: new () => Worker,
  options?: {
    onMessage?: (data: TResult) => void
    onError?: (error: ErrorEvent) => void
  },
) => {
  const worker = new WorkerFactory()
  const callbacks = new Map<string, WorkerCallback<TResult>>()

  onMount(() => {
    worker.onmessage = (event: MessageEvent<WorkerResponse<TResult>>) => {
      const { id, result, error } = event.data

      const callback = callbacks.get(id)
      if (callback) {
        callback(result, error)
        callbacks.delete(id)
      }

      // Глобальный обработчик сообщений
      if (result && options?.onMessage) {
        options.onMessage(result)
      }
    }

    worker.onerror = (error: ErrorEvent) => {
      console.error("Worker error:", error)
      options?.onError?.(error)
    }

    worker.onmessageerror = (error: MessageEvent) => {
      console.error("Worker message error:", error)
    }
  })

  const postMessage = (data: TData): Promise<TResult | undefined> => {
    return new Promise((resolve, reject) => {
      const id = createUniqueId() // Более надежный ID

      callbacks.set(id, (result, error) => {
        if (error) {
          reject(new Error(error))
        } else {
          resolve(result)
        }
      })

      worker.postMessage({ id, data })
    })
  }

  // Метод для завершения worker
  const terminate = (): void => {
    worker.terminate()
    callbacks.clear()
  }

  onCleanup(() => {
    terminate()
  })

  return {
    postMessage,
    terminate,
  }
}

export default useWorker
