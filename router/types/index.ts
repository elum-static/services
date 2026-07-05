import { isType } from "@minsize/utils"

export type ViewId = string
export type PanelId = string
export type ModalId = string

export type PanelState = {
  panel: PanelId
  modal?: ModalId
  // params?: unknown
  stay?: string | boolean
  freeze?: boolean

  lastView?: string
}

type ViewState = {
  view: ViewId
  panels: PanelState[]
}

type ActiveState = {
  view: ViewId
  panel: PanelId
  modal?: ModalId
}

type Primitive = number | string | boolean | undefined
type Object<T = Primitive> = { [key: string]: T }

export type Params =
  | Object
  | Object<Primitive | Array<Object | Primitive> | Object>
  | undefined

// Примеры использования:

// // 1. Простой объект с примитивными значениями
// const simpleParams: Params = {
//   id: 123,
//   name: "John Doe",
//   active: true,
//   permissions: undefined,
// }

// // 2. Объект с массивами примитивов
// const paramsWithPrimitiveArrays: Params = {
//   tags: ["admin", "user", "guest"], // массив строк
//   scores: [10, 20, 30], // массив чисел
//   flags: [true, false, true], // массив boolean
// }

// // 3. Объект с вложенными объектами
// const nestedObjectParams: Params = {
//   user: {
//     id: 1,
//     name: "Alice",
//   },
//   settings: {
//     darkMode: true,
//     notifications: false,
//   },
// }

// // 4. Комбинированный пример с массивами объектов
// const complexParams: Params = {
//   users: [
//     { id: 1, name: "Bob" },
//     { id: 2, name: "Charlie" },
//   ],
//   metadata: {
//     count: 2,
//     timestamps: 512,
//     active: false,
//   },
// }

// // 5. Пример с разными типами в одном объекте
// const mixedParams: Params = {
//   id: "abc123", // string
//   count: 10, // number
//   isValid: true, // boolean
//   details: undefined, // undefined
//   items: [
//     // массив объектов
//     { name: "item1", price: 100 },
//     { name: "item2", price: 200 },
//   ],
//   tags: ["new", "sale", "featured"], // массив строк
// }

export type Store = {
  history: ViewState[]
  active?: ActiveState
  params: Record<
    `${ViewId}_${PanelId}` | `${ViewId}_${PanelId}_${ModalId}`,
    Params
  >
}
