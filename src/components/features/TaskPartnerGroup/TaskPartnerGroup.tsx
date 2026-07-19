import style from "./TaskPartnerGroup.module.css"
import { type JSX, type Component, mergeProps, splitProps, onMount } from "solid-js"

import { Response as ResponseTaskPartnerList } from "root/src/core/src/api/tasks/partnerList"

import { Flex, FlexProps, Text } from "src/components/ui"
import TaskPartnerItem from "../TaskPartnerItem/TaskPartnerItem"

interface TaskPartnerGroup extends FlexProps {
  data: ResponseTaskPartnerList[number]
  onUpdated: () => void
}

const TaskPartnerGroup: Component<TaskPartnerGroup> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "data",
    "onUpdated",
  ])

  onMount(() => {
    console.log("AWG")
  })

  return (
    <Flex
      class={style.TaskPartnerGroup}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      gap={"10px"}
      align={"start"}
    >
      {/* <Text class={style.TaskPartnerGroup__title} weight={"600"}>
        <Text.Content>{local.data.title}</Text.Content>
      </Text> */}
      <Flex
        direction={"row"}
        gap={"10px"}
        justify={"start"}
        class={style.TaskPartnerGroup__container}
      >
        {/* <For each={local.data}>{(item) => <TaskPartnerItem item={item} />}</For> */}
        <TaskPartnerItem item={local.data} onUpdated={local.onUpdated} />
      </Flex>
    </Flex>
  )
}

export default TaskPartnerGroup
