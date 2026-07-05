import { type Key } from "../types"

export interface AtomProps<VALUE, OPTIONS, KEY> {
  readonly name: string
  readonly version: number
  readonly default: VALUE | (() => VALUE)

  /**
   * Функция, вызываемая при получении данных с indexedDB
   */
  onLoad?: (value: VALUE, key: KEY) => void
  /**
   * Функция, вызываемая для генерации ключа
   */
  onKey?: (options: OPTIONS) => string | undefined
  /**
   * Функция, вызываемая при запросе новых данных. Используется для запуска процесса получения данных.
   */
  onRequested?: (options: OPTIONS, key: KEY) => void
  /**
   * Функция, вызываемая при изменении сигнала. Используется для запуска отправки данных.
   */
  onUpdate?: (
    value: { prev: VALUE; next: VALUE },
    key: KEY,
  ) => Promise<boolean> | void
  /**
   * Функция, вызываемая при размонтировании
   */
  onCleanup?: (key: KEY) => void
  /**
   * Сохранение в indexedDB
   */
  saveIndexedDB?: boolean

  readonly updateIntervalMs?: number
}
