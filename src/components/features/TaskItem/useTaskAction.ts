import { createStore } from "solid-js/store"
import core from "src/core"
import { type Task } from "src/core/src/api/tasks/types"

type UseTaskActionOptions = {
  task: () => Task
  isPartner?: boolean
  onUpdated: () => void
}

type TaskActionStore = {
  loading: boolean
  error: boolean
  started: boolean
  opened: boolean
}

const getPayloadString = (task: Task, ...keys: string[]) => {
  for (const key of keys) {
    const value = task.payload[key]

    if (typeof value === "string") {
      return value
    }
  }

  return undefined
}

const openAction = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer")
}

const createOperationId = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const useTaskAction = (options: UseTaskActionOptions) => {
  const [store, setStore] = createStore<TaskActionStore>({
    loading: false,
    error: false,
    started: false,
    opened: false,
  })

  const status = () => options.task().progress?.status ?? "open"
  const actionUrl = () => getPayloadString(options.task(), "action_url", "url", "link")

  const label = () => {
    //FIXME: Language
    if (status() === "claimed") return "Получено"
    if (status() === "ready") return "Получить"
    if (store.started || store.opened) return "Проверить"

    return "Выполнить"
  }

  const run = async () => {
    const task = options.task()

    if (store.loading || status() === "claimed") {
      return
    }

    setStore("loading", true)
    setStore("error", false)

    try {
      if (status() === "ready") {
        const result = await core.api.task.claim({
          id: task.key,
          operation_id: createOperationId(),
        })

        if (!result.response) {
          setStore("error", true)
          return
        }

        core.state.balance.refresh()
        options.onUpdated()
        return
      }

      if (task.start_mode === "required" && !store.started) {
        const result = await core.api.task.start({ task_ref: task.key })

        if (!result.response) {
          setStore("error", true)
          return
        }

        setStore("started", true)

        if (result.response.action_url) {
          openAction(result.response.action_url)
          setStore("opened", true)
        }

        options.onUpdated()
        return
      }

      const url = actionUrl()
      if (url && !store.opened) {
        openAction(url)
        setStore("opened", true)
        return
      }

      const result = options.isPartner
        ? await core.api.task.partnerCheck({ issue_ref: task.key })
        : await core.api.task.check({ key: task.key })

      if (!result.response) {
        setStore("error", true)
        return
      }

      if (result.response.completed) {
        options.onUpdated()
      }
    } catch {
      setStore("error", true)
    } finally {
      setStore("loading", false)
    }
  }

  return { store, status, label, run }
}

export default useTaskAction
