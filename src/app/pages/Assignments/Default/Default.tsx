import core from "@core"
import { Button, Flex, Panel, Plug, Text } from "@ui/index"
import { type JSX, type Component, For, Show, createMemo, createSignal, onMount } from "solid-js"
import { Balances } from "src/components/layout"
import {
  IconAward,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconExclamationCircle,
  IconStars,
} from "src/source"
import type { TaskGroup, TaskItem, TaskReward, Response as TaskListResponse } from "src/core/src/api/tasks/list"
import Spinner from "src/components/ui/Blocks/Spinner/Spinner"
import style from "./Default.module.css"

interface Default extends JSX.HTMLAttributes<HTMLElement> {
  nav?: string
}

const EMOJI_STATUS_TASK_KEY = "daily.set_emoji_status"
const TOPUP_TASK_KEY = "daily.topup_100_stars"
const SOCKET_CHECK_TASK_KEYS = new Set(["daily.send_message", "daily.publish_story"])
const SOCKET_CUSTOM_CHECK_TASK_KEYS = new Set([EMOJI_STATUS_TASK_KEY])
const EMOJI_STATUS_CUSTOM_EMOJI_ID = "5242274946482213968"
const EMOJI_STATUS_SET_TIMEOUT = 15000
const PARTNER_GROUP_KEY = "daily"
const PARTNER_PLATFORM = "telegram"
const PARTNER_LIMIT = 10
const TASK_CARD_WIDTH_PERCENT = 86
const TASK_CARD_GAP_PX = 12

type LoadingSection = {
  key: string
  title: string
  description: string
}

type VerifyTaskResult = "completed" | "not_completed" | "error"
type TaskActionKind =
  | "app_action"
  | "amount_action"
  | "channel_subscribe"
  | "channel_boost"
  | "advertisement_view"
  | "external"
  | "composite"
  | ""

const PARTNER_SECTIONS = [
  {
    provider: "tgrass",
    title: "TGRASS",
    description: "Партнёрские задания от TGRASS.",
  },
  {
    provider: "getbonus",
    title: "GetBonus",
    description: "Партнёрские задания от GetBonus.",
  },
  {
    provider: "flyer",
    title: "Flyer",
    description: "Партнёрские задания от Flyer.",
  },
  {
    provider: "subgram",
    title: "SubGram",
    description: "Партнёрские задания от SubGram.",
  },
] as const

const DAILY_SECTION = {
  key: "daily",
  title: "Ежедневные задания",
  description: "Ежедневные одиночные задания, которые можно выполнять в любом порядке.",
} satisfies LoadingSection

const LOADING_SECTIONS: LoadingSection[] = [
  DAILY_SECTION,
  ...PARTNER_SECTIONS.map((section) => ({
    key: `partner.${section.provider}`,
    title: section.title,
    description: section.description,
  })),
]

type TelegramWebApp = {
  setEmojiStatus?: (
    customEmojiId: string,
    params?: Record<string, never>,
    callback?: (success: boolean) => void,
  ) => void
  openTelegramLink?: (url: string) => void
}

type TelegramWindow = Window & {
  NativeTelegramWebApp?: TelegramWebApp
  Telegram?: {
    WebApp?: TelegramWebApp
  }
}

function isTaskGroup(value: TaskGroup | TaskItem): value is TaskGroup {
  return Array.isArray((value as TaskGroup).tasks)
}

function getPayload(task: TaskItem): Record<string, unknown> {
  if (task.payload && typeof task.payload === "object" && !Array.isArray(task.payload)) {
    return task.payload as Record<string, unknown>
  }
  return {}
}

function getPayloadString(task: TaskItem, keys: string[]): string {
  const payload = getPayload(task)
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === "string" && value.trim()) {
      return value
    }
  }
  return ""
}

function normalizeGroups(payload: TaskListResponse | undefined): TaskGroup[] {
  const rawItems = Array.isArray(payload) ? payload : payload?.items
  if (!Array.isArray(rawItems)) {
    return []
  }
  if (rawItems.length === 0) {
    return []
  }
  if (isTaskGroup(rawItems[0])) {
    return rawItems as TaskGroup[]
  }

  return [
    {
      key: "daily",
      title: DAILY_SECTION.title,
      description: DAILY_SECTION.description,
      tasks: rawItems as TaskItem[],
    },
  ]
}

function getGroupTitle(group: TaskGroup): string {
  const key = group.key || ""
  if (group.title) {
    return group.title
  }
  if (key.includes("partner")) {
    return "Партнёрские задания"
  }
  if (key.includes("bonus")) {
    return "Бонусные задания"
  }
  return "Ежедневные задания"
}

function getGroupDescription(group: TaskGroup): string {
  if (group.description) {
    return group.description
  }
  if ((group.key || "").includes("partner")) {
    return "Задания от партнёров и внешних сервисов."
  }
  if ((group.key || "").includes("bonus")) {
    return "Дополнительные задания для быстрых наград."
  }
  return "Ежедневные одиночные задания, которые можно выполнять в любом порядке."
}

function getTaskTitle(task: TaskItem): string {
  return (
    task.localization?.title ||
    task.title ||
    getPayloadString(task, ["title", "name", "resource_name", "button_text"]) ||
    task.key ||
    String(task.id || "Задание")
  )
}

function getTaskDescription(task: TaskItem): string {
  return (
    task.localization?.description ||
    task.description ||
    getPayloadString(task, ["description", "resource_name", "name"]) ||
    ""
  )
}

function getTaskStatus(task: TaskItem): string {
  return task.progress?.status || task.status || "available"
}

function isTaskReadyForClaim(task: TaskItem): boolean {
  const status = getTaskStatus(task)
  if (status === "ready" || status === "completed" || status === "claimable") {
    return true
  }

  const target = task.progress?.target_count || task.target_count
  const progress = task.progress?.progress ?? 0
  return !!target && target > 0 && progress >= target
}

function getTaskClaimID(task: TaskItem): string {
  return String(task.id || task.key || "")
}

function createOperationID(prefix: string): string {
  if (crypto.randomUUID) {
    return `${prefix}:${crypto.randomUUID()}`
  }
  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`
}

function getRewardAmount(reward: TaskReward): number {
  return reward.quantity ?? reward.amount ?? 0
}

function formatRewardAmount(value: number): string {
  if (Math.abs(value) >= core.config.balanceFactor) {
    return core.api.balance.getTransform(value).toLocaleString("ru-RU", {
      maximumFractionDigits: 2,
    })
  }
  return value.toLocaleString("ru-RU", {
    maximumFractionDigits: 2,
  })
}

function getRewardLabel(reward: TaskReward): string {
  const amount = formatRewardAmount(getRewardAmount(reward))
  const key = reward.key || "reward"

  if (key === "stars") {
    return `+ ${amount}`
  }
  if (key === "lightning") {
    return `+ ${amount} ⚡`
  }
  if (reward.type === "duration" && reward.unit) {
    return `+ ${amount} ${key} / ${reward.unit}`
  }
  return `+ ${amount} ${key}`
}

function getMainReward(task: TaskItem): TaskReward | undefined {
  return task.rewards?.[0]
}

function getTaskImageURL(task: TaskItem): string {
  return task.image_url || getPayloadString(task, ["resource_logo", "image_url", "icon_url", "photo_url"])
}

function getTaskLink(task: TaskItem): string {
  return normalizeTaskLink(
    getPayloadString(task, [
      "link",
      "url",
      "action_url",
      "button_url",
      "resource_url",
      "target_url",
      "channel_url",
      "boost_url",
      "invite_link",
      "chat_id",
      "channel_id",
      "channel",
    ]),
  )
}

function isPartnerTask(task: TaskItem): boolean {
  return task.task_kind === "partner" || (task.key || "").startsWith("partner_issue:")
}

function getTaskActionKind(task: TaskItem): TaskActionKind {
  const actionKind = String(task.action_kind || "") as TaskActionKind
  if (actionKind) {
    return actionKind
  }
  if (isPartnerTask(task)) {
    return "external"
  }
  if (task.key === TOPUP_TASK_KEY) {
    return "amount_action"
  }
  if (task.task_kind === "channel_subscribe" || task.task_kind === "channel_boost") {
    return task.task_kind
  }
  if (task.task_kind === "complex") {
    return "composite"
  }
  return ""
}

function normalizeTaskLink(value: string): string {
  const link = value.trim()
  if (!link) {
    return ""
  }
  if (link.startsWith("@")) {
    return `https://t.me/${link.slice(1)}`
  }
  if (/^t\.me\//i.test(link)) {
    return `https://${link}`
  }
  return link
}

function openTaskLink(link: string) {
  const telegramWindow = window as TelegramWindow
  const webApp = telegramWindow.NativeTelegramWebApp || telegramWindow.Telegram?.WebApp
  if (/^https:\/\/t\.me\//i.test(link) && webApp?.openTelegramLink) {
    webApp.openTelegramLink(link)
    return
  }
  window.open(link, "_blank", "noopener,noreferrer")
}

function getPartnerIssueRef(task: TaskItem): string {
  return task.issue_ref || task.key || String(task.id || "")
}

function getProgress(task: TaskItem): number | undefined {
  const target = task.progress?.target_count || task.target_count
  if (!target || target <= 0) {
    return undefined
  }
  const progress = task.progress?.progress ?? 0
  return Math.max(0, Math.min(100, (progress / target) * 100))
}

function setTelegramEmojiStatus(customEmojiID: string): Promise<void> {
  const telegramWindow = window as TelegramWindow
  const webApp = telegramWindow.NativeTelegramWebApp || telegramWindow.Telegram?.WebApp
  if (!webApp?.setEmojiStatus) {
    return Promise.reject(new Error("Telegram.WebApp.setEmojiStatus недоступен"))
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Telegram не ответил на установку эмодзи-статуса"))
    }, EMOJI_STATUS_SET_TIMEOUT)

    webApp.setEmojiStatus(customEmojiID, {}, (success) => {
      clearTimeout(timer)
      if (success) {
        resolve()
        return
      }
      reject(new Error("Telegram не установил эмодзи-статус"))
    })
  })
}

const Default: Component<Default> = () => {
  const [groups, setGroups] = createSignal<TaskGroup[]>([])
  const [loading, setLoading] = createSignal(false)
  const [pendingSections, setPendingSections] = createSignal<Record<string, LoadingSection>>({})
  const [checkingKey, setCheckingKey] = createSignal("")
  const [pendingEmojiCheckKeys, setPendingEmojiCheckKeys] = createSignal<Record<string, boolean>>({})
  const [openedActionKeys, setOpenedActionKeys] = createSignal<Record<string, boolean>>({})
  const [activeTaskIndexes, setActiveTaskIndexes] = createSignal<Record<string, number>>({})
  const [error, setError] = createSignal("")
  const [taskError, setTaskError] = createSignal("")

  const hasTasks = createMemo(() => groups().some((group) => (group.tasks || []).length > 0))
  const hasPendingSections = createMemo(() => Object.keys(pendingSections()).length > 0)
  const initialLoading = createMemo(() => loading() && !hasTasks() && hasPendingSections())
  const visibleSkeletonSections = createMemo(() => {
    if (!hasTasks()) {
      return []
    }
    const pending = pendingSections()
    return LOADING_SECTIONS.filter((section) => pending[section.key])
  })

  async function loadTasks() {
    const locale = "ru"

    setLoading(true)
    setError("")
    setTaskError("")
    setGroups([])
    setPendingSections(
      Object.fromEntries(LOADING_SECTIONS.map((section) => [section.key, section])),
    )

    const loaders = [
      loadDailyGroup(locale),
      ...PARTNER_SECTIONS.map((section) => loadPartnerGroup(section, locale)),
    ]

    await Promise.all(loaders)
    setLoading(false)
  }

  function resolveSection(key: string) {
    setPendingSections((value) => {
      const next = { ...value }
      delete next[key]
      return next
    })
  }

  function upsertGroup(group: TaskGroup) {
    if ((group.tasks || []).length === 0) {
      return
    }

    setGroups((value) => {
      const next = value.filter((item) => item.key !== group.key)
      next.push(group)
      return next.sort((left, right) => getSectionOrder(left.key) - getSectionOrder(right.key))
    })
  }

  function getSectionOrder(key: string): number {
    const index = LOADING_SECTIONS.findIndex((section) => section.key === key)
    return index === -1 ? LOADING_SECTIONS.length : index
  }

  async function loadDailyGroup(locale: string) {
    const { response, error } = await core.api.task.list({ locale })
    if (error) {
      setError(error.code || "UNKNOWN_ERROR")
      resolveSection(DAILY_SECTION.key)
      return
    }

    for (const group of normalizeGroups(response)) {
      upsertGroup(group)
    }
    resolveSection(DAILY_SECTION.key)
  }

  async function loadPartnerGroup(section: (typeof PARTNER_SECTIONS)[number], locale: string) {
    const key = `partner.${section.provider}`
    const { response, error } = await core.api.task.partnerList({
      provider: section.provider,
      group_key: PARTNER_GROUP_KEY,
      platform: PARTNER_PLATFORM,
      locale,
      limit: PARTNER_LIMIT,
    })

    if (error) {
      console.warn(`[task.partnerList] ${section.provider}: ${error.code}`)
      resolveSection(key)
      return
    }

    const tasks = Array.isArray(response)
      ? response.map((task) => ({ ...task, provider: section.provider }))
      : []
    if (tasks.length > 0) {
      upsertGroup({
        key,
        title: section.title,
        description: section.description,
        tasks,
      })
    }

    resolveSection(key)
  }

  async function setupEmojiStatus() {
    await setTelegramEmojiStatus(EMOJI_STATUS_CUSTOM_EMOJI_ID)
  }

  async function verifyTask(key: string, force = false): Promise<VerifyTaskResult> {
    const useCustomCheck = SOCKET_CUSTOM_CHECK_TASK_KEYS.has(key)
    if (!force && !useCustomCheck && !SOCKET_CHECK_TASK_KEYS.has(key)) {
      return "not_completed"
    }

    const { response, error } = useCustomCheck
      ? await core.api.task.customCheck({ key })
      : await core.api.task.check({ key })
    if (error) {
      setTaskError(error.code || "UNKNOWN_ERROR")
      return "error"
    }
    if (response && !response.completed) {
      return "not_completed"
    }

    await loadTasks()
    return "completed"
  }

  async function verifyPartnerTask(task: TaskItem, silentNotCompleted = false): Promise<boolean> {
    const issueRef = getPartnerIssueRef(task)
    if (!issueRef) {
      setTaskError("INVALID_PARTNER_TASK")
      return false
    }

    const { response, error } = await core.api.task.partnerCheck({ issue_ref: issueRef })
    if (error) {
      setTaskError(error.code || "UNKNOWN_ERROR")
      return false
    }

    if (!response?.completed) {
      if (!silentNotCompleted) {
        setTaskError(response?.status || "TASK_NOT_COMPLETED")
      }
      return false
    }

    await loadTasks()
    return true
  }

  async function claimTask(task: TaskItem): Promise<boolean> {
    const id = getTaskClaimID(task)
    if (!id) {
      setTaskError("INVALID_TASK")
      return false
    }

    const { error } = await core.api.task.claim({
      id,
      operation_id: createOperationID(`task:claim:${id}`),
    })
    if (error) {
      setTaskError(error.code || "TASK_CLAIM_FAILED")
      return false
    }

    await loadTasks()
    return true
  }

  async function checkEmojiStatusTask(key: string) {
    if ((await verifyTask(key)) === "completed") {
      return
    }

    await setupEmojiStatus()
    setPendingEmojiCheckKeys((value) => ({ ...value, [key]: true }))
  }

  async function runAppActionTask(task: TaskItem, key: string) {
    if (key === EMOJI_STATUS_TASK_KEY) {
      await checkEmojiStatusTask(key)
      return
    }

    const result = await verifyTask(key)
    if (result === "completed" || result === "error") {
      return
    }

    const link = getTaskLink(task)
    if (link) {
      openTaskLink(link)
      setOpenedActionKeys((value) => ({ ...value, [key]: true }))
      return
    }

    setTaskError("TASK_NOT_COMPLETED")
  }

  function runAmountActionTask() {
    core.route.modal.replenishmentCurrency()
  }

  async function runChannelTask(task: TaskItem, key: string) {
    const result = await verifyTask(key, true)
    if (result === "completed" || result === "error") {
      return
    }
    if (openedActionKeys()[key]) {
      setTaskError("TASK_NOT_COMPLETED")
      return
    }

    const link = getTaskLink(task)
    if (link) {
      openTaskLink(link)
      setOpenedActionKeys((value) => ({ ...value, [key]: true }))
      return
    }

    setTaskError("TASK_NOT_COMPLETED")
  }

  async function runAdvertisementTask(task: TaskItem, key: string) {
    const link = getTaskLink(task)
    if (link && !openedActionKeys()[key]) {
      openTaskLink(link)
      setOpenedActionKeys((value) => ({ ...value, [key]: true }))
      return
    }

    const result = await verifyTask(key, true)
    if (result !== "completed" && result !== "error") {
      setTaskError("TASK_NOT_COMPLETED")
    }
  }

  async function runExternalTask(task: TaskItem, key: string) {
    if (await verifyPartnerTask(task, true)) {
      return
    }
    if (openedActionKeys()[key]) {
      await verifyPartnerTask(task)
      return
    }

    const link = getTaskLink(task)
    if (link) {
      openTaskLink(link)
      setOpenedActionKeys((value) => ({ ...value, [key]: true }))
      return
    }

    await verifyPartnerTask(task)
  }

  async function runCompositeTask(task: TaskItem) {
    if (!(await claimTask(task))) {
      setTaskError("TASK_NOT_COMPLETED")
    }
  }

  async function runTaskByActionKind(task: TaskItem, key: string) {
    switch (getTaskActionKind(task)) {
      case "app_action":
        await runAppActionTask(task, key)
        return
      case "amount_action":
        runAmountActionTask()
        return
      case "channel_subscribe":
      case "channel_boost":
        await runChannelTask(task, key)
        return
      case "advertisement_view":
        await runAdvertisementTask(task, key)
        return
      case "external":
        await runExternalTask(task, key)
        return
      case "composite":
        await runCompositeTask(task)
        return
      default:
        await runAppActionTask(task, key)
        return
    }
  }

  async function checkTask(task: TaskItem) {
    const key = task.key || ""
    if (!key || checkingKey()) {
      return
    }

    setCheckingKey(key)
    setTaskError("")

    try {
      if (isTaskReadyForClaim(task)) {
        await claimTask(task)
        return
      }

      await runTaskByActionKind(task, key)
    } catch (reason) {
      setTaskError(reason instanceof Error ? reason.message : "TASK_CHECK_FAILED")
    } finally {
      setCheckingKey("")
    }
  }

  function getActiveTaskIndex(group: TaskGroup): number {
    const tasks = group.tasks || []
    const index = activeTaskIndexes()[group.key] || 0
    if (tasks.length === 0) {
      return 0
    }
    return Math.max(0, Math.min(index, tasks.length - 1))
  }

  function switchTask(group: TaskGroup, direction: -1 | 1) {
    const tasks = group.tasks || []
    if (tasks.length < 2) {
      return
    }

    const current = getActiveTaskIndex(group)
    const next = (current + direction + tasks.length) % tasks.length
    setActiveTaskIndexes((value) => ({ ...value, [group.key]: next }))
  }

  onMount(() => {
    loadTasks()
  })

  return (
    <Panel>
      <Panel.Container scrollKey={"assignments"}>
        <Balances />
        <Flex class={style.Assignments} padding={"16px"} gap={"18px"} align={"stretch"}>
          <Flex class={style.Assignments__header} direction={"row"} justify={"between"} align={"end"}>
            <Flex align={"start"} gap={"4px"}>
              <Text size={"large"} weight={"700"}>
                <Text.Content>Задания</Text.Content>
              </Text>
              <Text color={"secondary"} size={"small"} lineClamp={2}>
                <Text.Content>Выполняйте задания и забирайте награды</Text.Content>
              </Text>
            </Flex>
            <Button size={"small"} mode={"soft"} loading={loading()} onClick={loadTasks}>
              <Button.Content>Обновить</Button.Content>
            </Button>
          </Flex>

          <Show when={initialLoading()}>
            <Plug size={"small"}>
              <Plug.Container>
                <Flex gap={"10px"}>
                  <Spinner />
                  <Text color={"secondary"} align={"center"}>
                    <Text.Content>Загружаем задания...</Text.Content>
                  </Text>
                </Flex>
              </Plug.Container>
            </Plug>
          </Show>

          <Show when={error() && !hasTasks()}>
            <Plug size={"small"}>
              <Plug.Container>
                <Flex gap={"10px"}>
                  <IconExclamationCircle width={30} height={30} />
                  <Text weight={"600"} align={"center"}>
                    <Text.Content>Не удалось загрузить задания</Text.Content>
                  </Text>
                  <Text color={"secondary"} size={"small"} align={"center"}>
                    <Text.Content>{error()}</Text.Content>
                  </Text>
                </Flex>
              </Plug.Container>
            </Plug>
          </Show>

          <Show when={taskError()}>
            <Plug size={"small"}>
              <Plug.Container>
                <Flex gap={"10px"}>
                  <IconExclamationCircle width={30} height={30} />
                  <Text weight={"600"} align={"center"}>
                    <Text.Content>Не удалось выполнить задание</Text.Content>
                  </Text>
                  <Text color={"secondary"} size={"small"} align={"center"}>
                    <Text.Content>{taskError()}</Text.Content>
                  </Text>
                </Flex>
              </Plug.Container>
            </Plug>
          </Show>

          <Show when={!loading() && !error() && !hasTasks() && !hasPendingSections()}>
            <Plug size={"small"}>
              <Plug.Container>
                <Flex gap={"10px"}>
                  <IconAward width={30} height={30} />
                  <Text weight={"600"} align={"center"}>
                    <Text.Content>Заданий пока нет</Text.Content>
                  </Text>
                  <Text color={"secondary"} size={"small"} align={"center"}>
                    <Text.Content>Загляните позже, список обновится автоматически после настройки</Text.Content>
                  </Text>
                </Flex>
              </Plug.Container>
            </Plug>
          </Show>

          <For each={groups()}>
            {(group) => (
              <Show when={(group.tasks || []).length > 0}>
                <section class={style.Assignments__section}>
                  <Flex class={style.Assignments__sectionHeader} align={"start"} gap={"4px"}>
                    <Text weight={"700"}>
                      <Text.Content>{getGroupTitle(group)}</Text.Content>
                    </Text>
                    <Text color={"secondary"} size={"small"} lineClamp={2}>
                      <Text.Content>{getGroupDescription(group)}</Text.Content>
                    </Text>
                  </Flex>

                  <div class={style.Assignments__carousel}>
                    <Show when={(group.tasks || []).length > 1}>
                      <button
                        class={`${style.Assignments__nav} ${style["Assignments__nav--left"]}`}
                        type="button"
                        aria-label="Предыдущее задание"
                        onClick={() => switchTask(group, -1)}
                      >
                        <IconChevronLeft width={22} height={22} />
                      </button>
                    </Show>

                    <div class={style.Assignments__viewport}>
                      <div
                        class={style.Assignments__track}
                        style={{
                          "--task-index": String(getActiveTaskIndex(group)),
                          "--task-card-width": `${TASK_CARD_WIDTH_PERCENT}%`,
                          "--task-card-gap": `${TASK_CARD_GAP_PX}px`,
                        }}
                      >
                        <For each={group.tasks}>
                          {(task, index) => {
                            const progress = () => getProgress(task)
                            const status = () => getTaskStatus(task)
                            const reward = () => getMainReward(task)
                            const imageURL = () => getTaskImageURL(task)
                            const isActive = () => index() === getActiveTaskIndex(group)
                            const buttonLabel = () => {
                              if (status() === "claimed") {
                                return "Получено"
                              }
                              if (isTaskReadyForClaim(task)) {
                                return "Получить"
                              }
                              const actionKind = getTaskActionKind(task)
                              if (
                                task.key === EMOJI_STATUS_TASK_KEY &&
                                pendingEmojiCheckKeys()[task.key]
                              ) {
                                return "Проверить"
                              }
                              if (actionKind === "amount_action") {
                                return "Пополнить"
                              }
                              if (
                                openedActionKeys()[task.key || ""] ||
                                actionKind === "channel_subscribe" ||
                                actionKind === "channel_boost" ||
                                actionKind === "advertisement_view"
                              ) {
                                return "Проверить"
                              }
                              if (actionKind === "external") {
                                return openedActionKeys()[task.key || ""] ? "Проверить" : "Выполнить"
                              }
                              return "Выполнить"
                            }

                            return (
                              <article
                                class={style.Assignments__card}
                                classList={{
                                  [style["Assignments__card--active"]]: isActive(),
                                }}
                              >
                                <div class={style.Assignments__decor}>
                                  <span />
                                  <div class={style.Assignments__dots}>
                                    <For each={group.tasks}>
                                      {(_, dotIndex) => (
                                        <i
                                          classList={{
                                            [style["Assignments__dot--active"]]:
                                              dotIndex() === getActiveTaskIndex(group),
                                          }}
                                        />
                                      )}
                                    </For>
                                  </div>
                                  <span />
                                </div>

                                <div class={style.Assignments__body}>
                                  <div class={style.Assignments__icon}>
                                    <Show
                                      when={imageURL()}
                                      fallback={<IconAward width={30} height={30} />}
                                    >
                                      {(image) => <img src={image()} alt="" />}
                                    </Show>
                                  </div>

                                  <Flex class={style.Assignments__content} align={"stretch"} gap={"12px"}>
                                    <Flex align={"start"} gap={"5px"}>
                                      <Text weight={"700"} lineClamp={2}>
                                        <Text.Content>{getTaskTitle(task)}</Text.Content>
                                      </Text>
                                      <Text color={"secondary"} size={"small"} lineClamp={3}>
                                        <Text.Content>{getTaskDescription(task)}</Text.Content>
                                      </Text>
                                    </Flex>

                                    <Show when={progress() !== undefined}>
                                      <div class={style.Assignments__progress}>
                                        <div
                                          class={style.Assignments__progressIn}
                                          style={{ width: `${progress() || 0}%` }}
                                        />
                                      </div>
                                    </Show>

                                    <Button
                                      appearance={"accent"}
                                      stretched
                                      size={"small"}
                                      disabled={status() === "claimed" || !isActive()}
                                      loading={checkingKey() === task.key}
                                      onClick={() => checkTask(task)}
                                    >
                                      <Button.Content>
                                        <Flex
                                          class={style.Assignments__buttonContent}
                                          direction={"row"}
                                          gap={"8px"}
                                        >
                                          <Text color={"inherit"} weight={"700"} size={"small"}>
                                            <Text.Content>{buttonLabel()}</Text.Content>
                                          </Text>
                                          <Show when={reward()}>
                                            {(value) => (
                                              <span class={style.Assignments__reward}>
                                                {getRewardLabel(value())}
                                                <Show when={value().key === "stars"}>
                                                  <IconStars width={14} height={14} />
                                                </Show>
                                              </span>
                                            )}
                                          </Show>
                                        </Flex>
                                      </Button.Content>
                                    </Button>
                                  </Flex>
                                </div>

                                <Show when={status() === "completed" || status() === "claimed"}>
                                  <span class={style.Assignments__done}>
                                    <IconCheck width={16} height={16} />
                                  </span>
                                </Show>
                              </article>
                            )
                          }}
                        </For>
                      </div>
                    </div>

                    <Show when={(group.tasks || []).length > 1}>
                      <button
                        class={`${style.Assignments__nav} ${style["Assignments__nav--right"]}`}
                        type="button"
                        aria-label="Следующее задание"
                        onClick={() => switchTask(group, 1)}
                      >
                        <IconChevronRight width={22} height={22} />
                      </button>
                    </Show>
                  </div>
                </section>
              </Show>
            )}
          </For>

          <For each={visibleSkeletonSections()}>
            {(section) => (
              <section class={style.Assignments__section}>
                <Flex class={style.Assignments__sectionHeader} align={"start"} gap={"4px"}>
                  <Text weight={"700"}>
                    <Text.Content>{section.title}</Text.Content>
                  </Text>
                  <Text color={"secondary"} size={"small"} lineClamp={2}>
                    <Text.Content>{section.description}</Text.Content>
                  </Text>
                </Flex>

                <div class={style.Assignments__carousel}>
                  <div class={style.Assignments__viewport}>
                    <div class={style.Assignments__skeletonCard}>
                      <span class={style.Assignments__skeletonDecor} />
                      <div class={style.Assignments__skeletonBody}>
                        <span class={style.Assignments__skeletonIcon} />
                        <div class={style.Assignments__skeletonContent}>
                          <span />
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </For>
        </Flex>
      </Panel.Container>
    </Panel>
  )
}

export default Default
