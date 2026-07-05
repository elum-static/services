import { EventEmitter } from "@minsize/utils"

class Emitter<T extends Record<string, unknown[]>> extends EventEmitter<T> {
  constructor() {
    super()
  }
  /**
   * Генерация для под класса
   */
  public safeEmitter<A extends keyof T>(events: A | A[]): EventEmitter<Pick<T, A>> {
    const allowedEvents = Array.isArray(events) ? events : [events]

    function verifyName(name: keyof T): asserts name is A {
      if (!allowedEvents.includes(name as A)) {
        throw new Error(
          `Event "${String(name)}" is not allowed. Allowed events: ${allowedEvents.join(", ")}`,
        )
      }
    }

    return {
      on: (event, callback) => {
        verifyName(event)
        return this.on(event, callback)
      },
      once: (event, callback) => {
        verifyName(event)
        return this.once(event, callback)
      },
      off: (event, callback) => {
        verifyName(event)
        return this.off(event, callback)
      },
      emit: (event, ...args) => {
        verifyName(event)
        return this.emit(event, ...args)
      },
      emitWithDefer: (event, ...args) => {
        verifyName(event)
        return this.emitWithDefer(event, ...args)
      },
      clear: (name) => {
        if (!name) {
          // Очищаем все разрешённые события
          for (const event of allowedEvents) {
            this.clear(event as any)
          }
        } else {
          verifyName(name)
          this.clear(name)
        }
      },
    } as EventEmitter<Pick<T, A>>
  }
}

export default Emitter
