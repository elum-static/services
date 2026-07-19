import style from "./TaskItem.module.css"
import { type JSX, type Component, mergeProps, splitProps, Show, Switch, Match } from "solid-js"

import { Response as ResponseTaskList } from "root/src/core/src/api/tasks/list"
import { Button, Flex, FlexProps, Text } from "src/components/ui"
import { IconStars } from "src/source"
import core from "src/core"
import useTaskAction from "./useTaskAction"

interface TaskItem extends FlexProps {
  item: ResponseTaskList[number]["tasks"][number]
  onUpdated: () => void
}

const TaskItem: Component<TaskItem> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "item",
    "onUpdated",
  ])

  const taskAction = useTaskAction({ task: () => local.item, onUpdated: local.onUpdated })

  return (
    <Flex
      class={style.TaskItem}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      padding={"10px"}
      gap={"10px"}
    >
      <Flex align={"start"} justify={"start"} style={{ width: "100%" }} gap={"2px"}>
        <Text nowrap overflow>
          <Text.Content>{local.item.title}</Text.Content>
        </Text>
        <Text size={"small"} color={"secondary"}>
          <Text.Content>{local.item.description}</Text.Content>
        </Text>
        {/* <Show when={local.item.progress}>
          <Text size={"x-small"} color={"secondary"}>
            <Text.Content>
              {Math.min(local.item.progress?.progress ?? 0, local.item.target_count)} /{" "}
              {local.item.target_count}
            </Text.Content>
          </Text>
        </Show> */}
      </Flex>

      <Button.Group padding={false} class={style.TaskItem__buttons}>
        <Button.Group.Container>
          <Button
            stretched
            size={"small"}
            appearance={taskAction.status() === "claimed" ? "secondary" : "accent"}
            disabled={taskAction.status() === "claimed"}
            loading={taskAction.store.loading}
            error={taskAction.store.error}
            onClick={taskAction.run}
          >
            <Button.Content>
              <Flex style={{ width: "100%" }}>
                <Text style={{ width: "auto" }} color={"inherit"} align={"center"}>
                  {/** FIXME: Language */}
                  <Text.Content full={false}>{taskAction.label()}</Text.Content>
                  <Text.Badge class={style.TaskItem__badge}>
                    <Text size={"x-small"} color={"inherit"}>
                      <Text.Content>
                        <Switch
                          fallback={
                            <Flex direction={"row"} gap={"4px"}>
                              unknown
                            </Flex>
                          }
                        >
                          <Match keyed when={local.item.rewards.find((x) => x.key === "stars")}>
                            {(reward) => (
                              <Flex direction={"row"} gap={"4px"}>
                                +{core.api.balance.getTransformScale(reward.quantity, reward.scale)}{" "}
                                <IconStars width={12} height={12} />
                              </Flex>
                            )}
                          </Match>
                        </Switch>
                      </Text.Content>
                    </Text>
                  </Text.Badge>
                </Text>
              </Flex>
            </Button.Content>
          </Button>
        </Button.Group.Container>
      </Button.Group>
    </Flex>
  )
}

export default TaskItem
