import { produce } from "solid-js/store"
import { setStore } from "../store/store"
import { comparison, EventEmitter, unlink } from "@minsize/utils"
import router from "../emitter"
import { type Params } from "../types"

const replaceParams = (params: Params) => {
  setStore(
    produce((store) => {
      // Получаем текущий view, если не передан
      const currentView = store.active?.view
      if (!currentView) return store

      // Находим индекс существующей записи в истории
      const existingIndex = store.history.findIndex(
        (item) => item.view === currentView,
      )

      //Получаем текущую панель
      const currentPage = store.history[existingIndex].panels.at(-1)
      if (!currentPage) return store

      // Обновляем params
      store.params[`${currentView}_${currentPage.panel}_${currentPage.modal}`] =
        params

      return store
    }),
  )
}

export default replaceParams
