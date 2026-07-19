import StoreKey from "../../utils/StoreKey"
import core from "src/core"

import { Response as ResponseTaskList } from "root/src/core/src/api/tasks/partnerList"

type TaskPartnerListStore = {
  list: ResponseTaskList
}

type TaskPartnerListOptions = {
  provider: Parameters<typeof core.api.task.partnerList>["0"]["provider"]
  group_key: Parameters<typeof core.api.task.partnerList>["0"]["group_key"]
}

class TaskPartnerList extends StoreKey<TaskPartnerListStore, TaskPartnerListOptions> {
  constructor() {
    super({ list: [] }, async (options) => {
      const { response, error } = await core.api.task.partnerList({
        // provider: "subgram",
        // group_key: "daily",
        locale: "ru",
        ...options,
      })

      if (response) {
        return {
          response: {
            list: response,
          },
          error,
        }
      }
      return { response, error }
    })
  }
  public get(...options: Parameters<typeof this.data>) {
    this.getData(...options)
    return this.data(...options)
  }
}

export default TaskPartnerList
