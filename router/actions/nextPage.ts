import { produce } from "solid-js/store"
import { setStore } from "../store/store"
import { comparison, EventEmitter, unlink } from "@minsize/utils"
import router from "../emitter"
import { PanelState, type Params } from "../types"

type NextPageProps = (
  | {
      view: string
      panel?: string
      modal?: string
      saveView?: undefined
    }
  | {
      view?: string
      panel: string
      /**
       * Сохраняет последнюю view, для возврата
       */
      saveView?: boolean | string
      modal?: string
    }
  | {
      view?: string
      panel?: string
      modal: string
      saveView?: undefined
    }
) & {
  params?: Params
  /** Точка возврата для backPage */
  stay?: string
  freeze?: boolean
  replace?: boolean
}

/**
 * Функция для навигации между страницами с обновлением истории и активного состояния
 * @param params - Объект с параметрами навигации
 */
const nextPage = ({
  view,
  panel,
  modal,
  params,
  stay,
  freeze,
  saveView,
  replace,
}: NextPageProps) => {
  setStore(
    produce((store) => {
      // Получаем текущий view, если не передан
      const currentView = view || store.active?.view
      if (!currentView) return store

      // Находим индекс существующей записи в истории
      const existingIndex = store.history.findIndex((item) => item.view === currentView)

      // Определяем targetPanel с учетом различных сценариев
      let targetPanel = panel

      if (!targetPanel) {
        if (existingIndex >= 0) {
          // Берем последнюю панель из существующего view
          const lastPanel = store.history[existingIndex].panels.at(-1)
          targetPanel = lastPanel?.panel || "default"
        } else {
          // Для нового view используем панель по умолчанию
          targetPanel = "default"
        }
      }

      // Убираем modal у старой панели
      // const lastPanel = store.history[existingIndex]?.panels.at(-1)
      // if (lastPanel) {
      //   lastPanel.modal = undefined
      // }
      if (replace) {
        // Удаляем последнюю панель (возвращаемся назад)
        store.history[existingIndex].panels.pop()
      }

      const lastView = unlink(store.history.at(-1))
      const lastPage = lastView?.panels?.at(-1)

      const newPanel: PanelState = {
        panel: targetPanel,
        modal,
        stay,
        freeze,
        lastView: undefined,
      }

      if (saveView) {
        if (typeof saveView === "boolean") {
          if (store.active?.view) {
            newPanel.lastView = store.active?.view
          }
        } else {
          newPanel.lastView = saveView
        }

        if (currentView === newPanel.lastView) {
          newPanel.lastView = lastPage?.lastView
        }
      }

      // Обрабатываем историю
      if (existingIndex >= 0) {
        // Если panel явно указана, добавляем новую панель
        if (!!panel || !!modal) {
          // Проверяем, что записывается не та же самая панель
          if (!comparison(newPanel, lastPage)) {
            store.history[existingIndex].panels.push(newPanel)
          }
        }

        // Перемещаем view в конец истории (делаем последним активным)
        const [movedItem] = store.history.splice(existingIndex, 1)
        store.history.push(movedItem)
      } else {
        // Создаем новую запись в истории
        store.history.push({
          view: currentView,
          panels: [newPanel],
        })
      }

      /**
       * Если данной view нет, добавляем с панелью "default"
       */
      if (newPanel.lastView && !store.history.find((x) => x.view === newPanel.lastView)) {
        store.history.splice(store.history.length - 1, 0, {
          view: newPanel.lastView,
          panels: [{ panel: "default" }],
        })
      }

      // Обновляем params
      if (params || !store.params[`${currentView}_${targetPanel}_${modal}`]) {
        store.params[`${currentView}_${targetPanel}_${modal}`] = params
      }

      // Обновляем активное состояние
      store.active = { view: currentView, panel: targetPanel, modal }

      router.emit("next", {
        history: store.history,
        prev:
          lastPage && lastView
            ? {
                view: lastView?.view,
                ...lastPage,
              }
            : undefined,
        next: {
          view: currentView,
          ...newPanel,
        },
      })

      return store
    }),
  )
}

export default nextPage
