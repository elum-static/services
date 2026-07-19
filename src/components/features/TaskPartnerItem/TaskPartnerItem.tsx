import style from "./TaskPartnerItem.module.css"
import { type JSX, type Component, mergeProps, splitProps, Show, Switch, Match } from "solid-js"

import { Response as ResponseTaskPartnerList } from "root/src/core/src/api/tasks/partnerList"

import { Avatar, Button, Flex, FlexProps, Text } from "src/components/ui"
import { IconStars } from "src/source"
import core from "src/core"
import useTaskAction from "../TaskItem/useTaskAction"

interface TaskPartnerItem extends FlexProps {
  item: ResponseTaskPartnerList[number]
  onUpdated: () => void
}

const TaskPartnerItem: Component<TaskPartnerItem> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "item",
    "onUpdated",
  ])

  const taskAction = useTaskAction({
    task: () => local.item,
    isPartner: true,
    onUpdated: local.onUpdated,
  })
  const payloadText = (...keys: string[]) => {
    for (const key of keys) {
      const value = local.item.payload[key]

      if (typeof value === "string") {
        return value
      }
    }

    return undefined
  }

  return (
    <Flex
      class={style.TaskPartnerItem}
      classList={{
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      padding={"10px"}
      gap={"10px"}
    >
      <Flex direction={"row"} gap={"10px"} align={"start"}>
        <Avatar
          src={payloadText("resource_logo", "image_url")}
          size={"36px"}
          name={payloadText("offer_title", "resource_name", "title") || local.item.title}
        />
        <Flex align={"start"} justify={"start"} style={{ width: "100%" }} gap={"2px"}>
          <Text nowrap overflow>
            <Text.Content>
              {payloadText("offer_title", "resource_name", "title") || local.item.title}
            </Text.Content>
          </Text>
          <Text size={"x-small"} color={"secondary"}>
            <Text.Content>
              {payloadText("description", "offer_description") || local.item.description}
            </Text.Content>
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
      </Flex>

      <Button.Group padding={false} class={style.TaskPartnerItem__buttons}>
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
                  <Text.Content full={false}>
                    {taskAction.status() === "open" &&
                    !taskAction.store.opened &&
                    !taskAction.store.started
                      ? payloadText("button_text") || taskAction.label()
                      : taskAction.label()}
                  </Text.Content>
                  <Text.Badge class={style.TaskPartnerItem__badge}>
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

export default TaskPartnerItem
