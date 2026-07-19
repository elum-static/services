import style from "./TaskGroup.module.css"
import { type JSX, type Component, mergeProps, splitProps, For } from "solid-js"

import { Response as ResponseTaskList } from "root/src/core/src/api/tasks/list"
import TaskItem from "../TaskItem/TaskItem"
import { Flex, FlexProps, Text } from "src/components/ui"

interface TaskGroup extends FlexProps {
  data: ResponseTaskList[number]
  onUpdated: () => void
}

const TaskGroup: Component<TaskGroup> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "data",
    "onUpdated",
  ])

  return (
    <Flex
      class={style.TaskGroup}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      gap={"10px"}
      align={"start"}
    >
      <Text class={style.TaskGroup__title} weight={"600"}>
        <Text.Content>{local.data.title}</Text.Content>
      </Text>
      <Flex direction={"row"} gap={"10px"} justify={"start"} class={style.TaskGroup__container}>
        <For each={local.data.tasks}>
          {(item) => <TaskItem item={item} onUpdated={local.onUpdated} />}
        </For>
      </Flex>
    </Flex>
  )
}

export default TaskGroup
