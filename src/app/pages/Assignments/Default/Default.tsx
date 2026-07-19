import core from "@core"
import { Button, Flex, Panel, Separator, Text } from "@ui/index"
import { type JSX, type Component, onMount, For, Show } from "solid-js"
import { TaskGroup, TaskPartnerGroup } from "src/components/features"
import { Balances } from "src/components/layout"
import Spinner from "src/components/ui/Blocks/Spinner/Spinner"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

/** FIXME: Language */
const Default: Component<Default> = () => {
  const partnerOptions = { group_key: "daily", provider: "getbonus" } as const
  const tasks = () => core.state.task_list.list
  const partnerTasks = () => core.state.task_partner_list.get(partnerOptions).list
  const isLoading = () =>
    core.state.task_list.state === "loading" ||
    core.state.task_partner_list.state(partnerOptions) === "loading"
  const isErrored = () =>
    core.state.task_list.state === "errored" ||
    core.state.task_partner_list.state(partnerOptions) === "errored"
  const hasTasks = () =>
    tasks().some((group) => group.tasks.length > 0) || partnerTasks().length > 0

  const refreshTasks = () => {
    core.state.task_list.refresh()
    core.state.task_partner_list.refresh(partnerOptions)
  }

  onMount(refreshTasks)

  return (
    <Panel>
      <Panel.Container>
        <Balances />

        <Show when={isLoading() && !hasTasks()}>
          <Flex padding={"32px 16px"} gap={"12px"}>
            <Spinner color={"secondary"} />
            <Text color={"secondary"}>
              <Text.Content>Загружаем задания…</Text.Content>
            </Text>
          </Flex>
        </Show>

        <Show when={isErrored() && !hasTasks()}>
          <Flex padding={"32px 16px"} gap={"12px"}>
            <Text color={"secondary"} align={"center"}>
              <Text.Content>Не удалось загрузить задания</Text.Content>
            </Text>
            <Button size={"small"} appearance={"secondary"} onClick={refreshTasks}>
              <Button.Content>
                <Text color={"inherit"}>
                  <Text.Content>Повторить</Text.Content>
                </Text>
              </Button.Content>
            </Button>
          </Flex>
        </Show>

        <Show when={hasTasks()}>
          <For each={tasks().filter((group) => group.tasks.length > 0)}>
            {(item) => <TaskGroup data={item} onUpdated={refreshTasks} />}
          </For>

          {/* <Show when={tasks().some((group) => group.tasks.length > 0) && partnerTasks().length > 0}>
            <Separator />
          </Show> */}

          <For each={partnerTasks()}>
            {(item) => <TaskPartnerGroup data={item} onUpdated={refreshTasks} />}
          </For>
        </Show>

        <Show when={!isLoading() && !isErrored() && !hasTasks()}>
          <Flex padding={"32px 16px"}>
            <Text color={"secondary"} align={"center"}>
              <Text.Content>Сейчас нет доступных заданий</Text.Content>
            </Text>
          </Flex>
        </Show>
      </Panel.Container>
    </Panel>
  )
}

export default Default
