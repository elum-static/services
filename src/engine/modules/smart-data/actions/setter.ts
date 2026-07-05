import { type Key, type AtomReturn } from "../types"

import { comparison, unlink } from "@minsize/utils"

import setterStatus from "../actions/setterStatus"
import getDefault from "../utils/getDefault"

import { batch } from "solid-js"
import { createStore, produce } from "solid-js/store"
import { indexeddb } from "@atom/IndexedDB"

type KeyOf<T> = keyof T
type W<T> = { [K in keyof T]: T[K] }
type MutableKeyOf<T> = {
  [K in keyof T]-?: IfEquals<{ [P in K]: T[K] }, { -readonly [P in K]: T[K] }, K>
}[keyof T]
type IfEquals<X, Y, A = X, B = never> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

export type ArrayFilterFn<T> = (item: T, index: number) => boolean

export type StorePathRange = {
  from?: number
  to?: number
  by?: number
}

export type Part<T, K extends KeyOf<T> = KeyOf<T>> =
  | K
  | ([K] extends [never] ? never : readonly K[])
  | ([T] extends [readonly unknown[]] ? ArrayFilterFn<T[number]> | StorePathRange : never)

export type CustomPartial<T> = T extends readonly unknown[]
  ? "0" extends keyof T
    ? {
        [K in Extract<keyof T, `${number}`>]?: T[K]
      }
    : {
        [x: number]: T[number]
      }
  : Partial<T>

export type StoreSetter<T, U extends PropertyKey[] = []> =
  | T
  | CustomPartial<T>
  | ((prevState: T, traversed: U) => T | CustomPartial<T>)

type SetterOptions<VALUE, OPTIONS, KEY> =
  | AtomReturn<VALUE, OPTIONS, KEY>
  | [signal: AtomReturn<VALUE, OPTIONS, KEY>, key: Key, notUpdate?: boolean]

type RestSetterOrContinue<T, U extends PropertyKey[]> = [StoreSetter<T, U>] | RestContinue<T, U>

type RestContinue<T, U extends PropertyKey[]> = 0 extends 1 & T
  ? [...Part<any>[], StoreSetter<any, PropertyKey[]>]
  : Rest<W<T>, U>

type Rest<T, U extends PropertyKey[], K extends KeyOf<T> = KeyOf<T>> = [T] extends [never]
  ? never
  : K extends MutableKeyOf<T>
    ? [Part<T, K>, ...RestSetterOrContinue<T[K], [K, ...U]>]
    : K extends KeyOf<T>
      ? [Part<T, K>, ...RestContinue<T[K], [K, ...U]>]
      : never

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param setter
 */
function setter<VALUE, OPTIONS, KEY, K1 extends MutableKeyOf<W<VALUE>>>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,
  k1: Part<W<VALUE>, K1>,
  setter: StoreSetter<W<VALUE>[K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param setter
 */
function setter<VALUE, OPTIONS, KEY, K1 extends KeyOf<W<VALUE>>, K2 extends KeyOf<W<W<VALUE>[K1]>>>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,
  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  setter: StoreSetter<W<W<VALUE>[K1]>[K2], [K2, K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param setter
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,
  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  setter: StoreSetter<W<W<W<VALUE>[K1]>[K2]>[K3], [K3, K2, K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param k4
 * @param setter
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
  K4 extends KeyOf<W<W<W<W<VALUE>[K1]>[K2]>[K3]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,

  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  k4: Part<W<W<W<W<VALUE>[K1]>[K2]>[K3]>, K4>,
  setter: StoreSetter<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4], [K4, K3, K2, K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param k4
 * @param k5
 * @param setter
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
  K4 extends KeyOf<W<W<W<W<VALUE>[K1]>[K2]>[K3]>>,
  K5 extends KeyOf<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,

  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  k4: Part<W<W<W<W<VALUE>[K1]>[K2]>[K3]>, K4>,
  k5: Part<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>, K5>,
  setter: StoreSetter<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5], [K5, K4, K3, K2, K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param k4
 * @param k5
 * @param k6
 * @param setter
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
  K4 extends KeyOf<W<W<W<W<VALUE>[K1]>[K2]>[K3]>>,
  K5 extends KeyOf<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>>,
  K6 extends KeyOf<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,

  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  k4: Part<W<W<W<W<VALUE>[K1]>[K2]>[K3]>, K4>,
  k5: Part<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>, K5>,
  k6: Part<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
  setter: StoreSetter<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6], [K6, K5, K4, K3, K2, K1]>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param setter
 */
function setter<VALUE, OPTIONS, KEY>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,
  setter: StoreSetter<VALUE>,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param k4
 * @param k5
 * @param k6
 * @param k7
 * @param setter
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
  K4 extends KeyOf<W<W<W<W<VALUE>[K1]>[K2]>[K3]>>,
  K5 extends KeyOf<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>>,
  K6 extends KeyOf<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>>,
  K7 extends KeyOf<W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,

  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  k4: Part<W<W<W<W<VALUE>[K1]>[K2]>[K3]>, K4>,
  k5: Part<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>, K5>,
  k6: Part<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
  k7: Part<W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>,
  setter: StoreSetter<
    W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7],
    [K7, K6, K5, K4, K3, K2, K1]
  >,
): void

/**
 *
 * @param options ATOM or [ATOM, KEY]
 * @param k1
 * @param k2
 * @param k3
 * @param k4
 * @param k5
 * @param k6
 * @param k7
 * @param ...rest
 */
function setter<
  VALUE,
  OPTIONS,
  KEY,
  K1 extends KeyOf<W<VALUE>>,
  K2 extends KeyOf<W<W<VALUE>[K1]>>,
  K3 extends KeyOf<W<W<W<VALUE>[K1]>[K2]>>,
  K4 extends KeyOf<W<W<W<W<VALUE>[K1]>[K2]>[K3]>>,
  K5 extends KeyOf<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>>,
  K6 extends KeyOf<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>>,
  K7 extends KeyOf<W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>,
>(
  options: SetterOptions<VALUE, OPTIONS, KEY>,
  k1: Part<W<VALUE>, K1>,
  k2: Part<W<W<VALUE>[K1]>, K2>,
  k3: Part<W<W<W<VALUE>[K1]>[K2]>, K3>,
  k4: Part<W<W<W<W<VALUE>[K1]>[K2]>[K3]>, K4>,
  k5: Part<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>, K5>,
  k6: Part<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
  k7: Part<W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>,
  ...rest: Rest<
    W<W<W<W<W<W<W<VALUE>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7],
    [K7, K6, K5, K4, K3, K2, K1]
  >
): void

/* ORIGINAL */
function setter<VALUE, OPTIONS, KEY>(options: SetterOptions<VALUE, OPTIONS, KEY>, ...args: any[]) {
  const [signal, key, not_update = false] = Array.isArray(options[0])
    ? [options[0], options[1] as string, options[2]]
    : [options as AtomReturn<VALUE, OPTIONS, KEY>, "default", false]

  if (signal) {
    batch(async () => {
      const [getter, setter] = signal
      var update_at = new Date(Date.now() + getter.updateIntervalMs)

      const onUpdate = getter.onUpdate

      const prev = !!onUpdate && unlink(getter?.cache?.[key]?.data)

      if (not_update) {
        update_at = new Date(Date.now() - 1_000)
      }

      try {
        var cache = getter.cache[key]
        if (!cache) {
          setter(
            "cache",
            produce((cache) => {
              cache[key] = {
                data: getDefault(getter.default),
                system: { error: false, load: true, fullLoad: false },
                update_at: update_at,
              }
              return cache
            }),
          )
          if (!not_update) {
            if (getter.saveIndexedDB) {
              indexeddb.write(getter.name, key, getter.cache[key]?.data)
            }
          } else {
            update_at = new Date(Date.now() - 1_000)
          }
          ;(setter as any)("cache", key, "data", ...args)
          // setter(
          //   "cache",
          //   produce((cache) => {
          //     const data = getDefault(getter.default)
          //     const [getterData, setterData] = createStore<any>(data)
          //     if (!not_update) {
          //       // indexeddb.write(getter.name, getter.version, key, data)
          //     } else {
          //       update_at = new Date(Date.now() - 1_000)
          //     }
          //     ;(setterData as any)(...args)
          //     cache[key] = {
          //       data: [getterData, setterData],
          //       system: { error: false, load: false, fullLoad: false },
          //       update_at: update_at,
          //     }
          //     return cache
          //   }),
          // )
          // cache = getter.cache[key]
          return
        }

        if (cache && cache.data) {
          ;(setter as any)("cache", key, "data", ...args)
          // const [getterData, setterData] = cache.data
          // ;(setterData as any)(...args)
          if (!not_update) {
            if (getter.saveIndexedDB) {
              indexeddb.write(getter.name, key, getter.cache[key]?.data)
            }
          }
        }
      } finally {
        const next = getter?.cache?.[key]?.data

        if (!not_update) {
          if (prev && onUpdate && getter.requests[key] === "end" && !comparison(prev, next)) {
            const status = await onUpdate({ prev, next }, key as KEY)
            if (status === false) {
              setter("cache", key, "data", prev)
              if (getter.saveIndexedDB) {
                indexeddb.write(getter.name, key, prev)
              }
            }
          }
        }

        setter("cache", key, "update_at", update_at)
        setterStatus([signal, key], { load: false })
      }
    })
  }
}

export default setter
