import network from "../module"

export type TaskLocalization = {
  title?: string
  description?: string
}

export type TaskReward = {
  key?: string
  type?: string
  quantity?: number
  amount?: number
  unit?: string
}

export type TaskProgress = {
  progress?: number
  target_count?: number
  status?: string
}

export type TaskItem = {
  id?: string | number
  key?: string
  provider?: string
  issue_ref?: string
  group_key?: string
  task_kind?: string
  action_key?: string
  action_kind?: string
  claim_mode?: string
  start_mode?: string
  target_count?: number
  payload?: unknown
  image_url?: string
  title?: string
  description?: string
  localization?: TaskLocalization
  progress?: TaskProgress
  rewards?: TaskReward[]
  status?: string
  is_active?: boolean
  is_visible?: boolean
}

export type TaskGroup = {
  key?: string
  title?: string
  description?: string
  tasks?: TaskItem[]
}

export type Response =
  | TaskItem[]
  | TaskGroup[]
  | {
      items?: TaskItem[] | TaskGroup[]
    }

type Options = {
  locale?: string
}

async function taskList(options: Options) {
  return network.send<Response>("task.list", options)
}

export default taskList
