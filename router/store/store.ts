import { createStore } from "solid-js/store"
import { Store } from "../types"

export const [store, setStore] = createStore<Store>({ history: [], params: {} })
