import Store from "../../utils/Store"
import core from "src/core"

import { Response as ResponseTaskList } from "root/src/core/src/api/tasks/list"

type TaskListStore = {
  list: ResponseTaskList
}

class TaskList extends Store<TaskListStore> {
  constructor() {
    super({ list: [] }, async () => {
      const { response, error } = await core.api.task.list({})

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

  get list() {
    this.getData()
    return this.data.list
  }
}

export default TaskList
