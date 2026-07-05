import { type AtomProps, type SmartData } from "../types"

export type AtomValue<VALUE extends unknown, OPTIONS, KEY> = {
  name: string
  version: number

  /**
   * Функция, вызываемая при получении данных с indexedDB
   */
  onLoad?: (value: VALUE, key: KEY) => void
  /**
   * Функция, вызываемая для генерации ключа
   */
  onKey?: AtomProps<VALUE, OPTIONS, KEY>["onKey"]
  /**
   * Значение по умолчанию для данных в хранилище.
   */
  default: VALUE | (() => VALUE)
  /**
   * Интервал в миллисекундах, с которым данные считаются актуальными (по умолчанию: 5000 мс).  После этого интервала данные будут запрошены повторно.
   */
  updateIntervalMs: number
  /**
   * Функция, вызываемая при запросе новых данных. Используется для запуска процесса получения данных.
   */
  onRequested?: AtomProps<VALUE, OPTIONS, KEY>["onRequested"]
  /**
   * Функция, вызываемая при изменении сигнала. Используется для запуска отправки данных.
   */
  onUpdate?: AtomProps<VALUE, OPTIONS, KEY>["onUpdate"]
  /**
   * Кеш для хранения полученных данных.
   */
  cache: { [key in string]: SmartData<VALUE> }

  indexedDBSearch?: boolean
  /**
   * Кеш для обновления данных в onUpdate
   */
  cachePrev: { [key in string]: SmartData<VALUE> }
  /**
   * Объект, отслеживающий статус текущих запросов данных.
   * Значение `true` означает, что запрос в процессе обработки.
   *
   * `start` - Идёт запрос
   * `end` - Запрос обработан
   */
  requests: { [key in string]: "start" | "end" | "fetching" }

  /**
   * Функция, вызываемая при размонтировании
   */
  onCleanup?: (key: KEY) => void
  /**
   * Сохранение в indexedDB
   */
  saveIndexedDB?: boolean
}
