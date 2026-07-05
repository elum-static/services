import type { JSX, ValidComponent } from "solid-js"
import { DynamicProps } from "solid-js/web"

type Args<T, E> = E & { currentTarget: T; target: T }

type Args2<E extends (...args: any[]) => any> = Parameters<E>

type Args3<T, E> = E

// Основная перегрузка для обычных событий
function callHandler<T extends unknown, E extends Event>(
  originalHandler:
    | JSX.EventHandler<T, E>
    | JSX.BoundEventHandler<T, E>
    | undefined,
  event: Args<T, E>,
): void

// Перегрузка для фокусных событий
function callHandler<T extends unknown, E extends FocusEvent>(
  originalHandler: JSX.FocusEventHandlerUnion<T, E> | undefined,
  event: Args<T, E>,
): void

// Перегрузка для фокусных событий
function callHandler<
  V extends ValidComponent,
  T extends DynamicProps<V>,
  E extends Event,
>(
  originalHandler:
    | JSX.EventHandlerUnion<T, E, JSX.EventHandler<T, E>>
    | undefined,
  event: Args3<T, E>,
): void

// FIXME comment
function callHandler<E extends (...args: any[]) => any>(
  originalHandler: E | undefined,
  event: Args2<E>,
): void

/**
 * Создает составной обработчик событий, который сначала вызывает ваш колбэк,
 * а затем оригинальный обработчик (если он предоставлен)
 *
 * @template T - Тип элемента (например, HTMLButtonElement)
 * @template E - Тип события (например, MouseEvent)
 * @param callback - Ваш пользовательский обработчик событий
 * @param originalHandler - Оригинальный обработчик из пропсов
 * @returns Составной обработчик, который можно передавать в JSX-элементы
 */
function callHandler<T extends Element, E extends Event>(
  originalHandler:
    | JSX.EventHandler<T, E>
    | JSX.BoundEventHandler<T, E>
    | undefined,
  event: Args<T, E>,
) {
  if (typeof originalHandler === "function") {
    // Затем безопасно вызываем оригинальный обработчик, если он существует
    try {
      originalHandler(event)
    } catch (error) {
      console.error("[createHandler] Ошибка в оригинальном обработчике:", error)
    }
  } else if (Array.isArray(originalHandler)) {
    // Обрабатываем привязанные обработчики событий [callback, ...args]
    try {
      const [handler, args] = originalHandler
      handler(event, args)
    } catch (error) {
      console.error("[createHandler] Ошибка в привязанном обработчике:", error)
    }
  }
}

export default callHandler
