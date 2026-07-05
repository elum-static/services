import type { JSX } from "solid-js"
import type { DOMElement } from "solid-js/jsx-runtime"
import callHandler from "./callHandler"

type Callback<T, E> = (
  event: E & { currentTarget: T; target: T },
) => void | "stop" | Promise<void | "stop">

type Callback2<E extends (...args: any[]) => any> = (
  ...event: Parameters<E>
) => void | "stop" | Promise<void | "stop">

// Основная перегрузка для обычных событий
function createHandler<T extends unknown, E extends Event>(
  callback: Callback<T, E>,
  originalHandler?: JSX.EventHandler<T, E> | JSX.BoundEventHandler<T, E>,
): JSX.EventHandler<T, E>

// Перегрузка для фокусных событий
function createHandler<T extends unknown, E extends FocusEvent>(
  callback: Callback<T, E>,
  originalHandler?: JSX.FocusEventHandlerUnion<T, E>,
): JSX.FocusEventHandler<T, E>
// Основная перегрузка для обычных событий
function createHandler<E extends (...args: any[]) => any>(
  callback: Callback2<E>,
  originalHandler?: E,
): E

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
function createHandler<T extends Element, E extends Event>(
  callback: Callback<T, E>,
  originalHandler?: JSX.EventHandler<T, E> | JSX.BoundEventHandler<T, E>,
): JSX.EventHandler<T, E> {
  return async (event: E & { currentTarget: T; target: DOMElement }) => {
    // Сначала вызываем новый колбэк
    const status = await callback(event as any)
    /**
     * Если пользовательский обработчик возвращает false, не продолжать выполнение
     */
    if (status === "stop") return

    callHandler<T, E>(
      originalHandler,
      event as E & { currentTarget: T; target: T },
    )
  }
}

export default createHandler
