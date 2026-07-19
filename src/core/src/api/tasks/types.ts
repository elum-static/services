import * as rtl from "@minsize/rtl"

export const schemaTaskReward = rtl.object({
  key: rtl.string(),
  type: rtl.enum(["quantity", "duration"] as const),
  quantity: rtl.integer(),
  scale: rtl.integer(),
  unit: rtl.optional(rtl.string()),
})

export const schemaTaskProgress = rtl.optional(
  rtl.object({
    progress: rtl.integer(),
    status: rtl.enum(["open", "ready", "claimed"] as const),
    period_start_at: rtl.optional(rtl.date()),
    period_end_at: rtl.optional(rtl.date()),
    ready_at: rtl.optional(rtl.date()),
    claimed_at: rtl.optional(rtl.date()),
  }),
)

export const schemaTask = rtl.object({
  id: rtl.integer(),
  key: rtl.string(),
  title: rtl.string(),
  description: rtl.string(),
  group_key: rtl.string(),
  task_kind: rtl.enum([
    "internal",
    "channel_subscribe",
    "channel_boost",
    "external_check",
    "external_confirming",
    "partner",
    "complex",
  ] as const),
  action_key: rtl.string(),
  action_kind: rtl.string(),
  claim_mode: rtl.enum(["manual", "auto"] as const),
  start_mode: rtl.enum(["none", "required"] as const),
  target_count: rtl.integer(),
  payload: rtl.record(rtl.string(), rtl.unknown()),
  image_url: rtl.optional(rtl.union(rtl.url(), rtl.literal(null))),
  rewards: rtl.array(schemaTaskReward),
  progress: schemaTaskProgress,
  conditions: rtl.optional(rtl.array(rtl.unknown())),
})

export type Task = rtl.InferOutput<typeof schemaTask>
