import { produce } from "solid-js/store"
import { setStore } from "../store/store"
import router, { _emitter } from "../emitter"
import { unlink } from "@minsize/utils"

type BackPageProps = {
  ignoreFreeze?: boolean
  toStay?: string | boolean
}

const backPage = ({ toStay, ignoreFreeze }: BackPageProps = {}) => {
  setStore(
    produce((store) => {
      // Проверяем наличие истории переходов
      if (store.history.length === 0) {
        console.error("Navigation error: history stack is empty")
        return store
      }

      // Получаем последний view из истории
      var lastView = store.history[store.history.length - 1]

      const lastPage = unlink(lastView.panels.at(-1))

      // Проверяем на freeze
      const isFreeze = lastPage?.freeze

      if (isFreeze && !ignoreFreeze) {
        _emitter.emit("freeze")
        return store
      }

      var isToStay = false

      if (toStay) {
        // Возвращаем на точку stay
        // Поиск в последней view
        const index = lastView.panels.findLastIndex((x) => x.stay === toStay)
        if (index !== -1) {
          // удаляем все панели до этой + 2 панель
          lastView.panels.splice(index + 1)
          isToStay = true
        }
      }

      if (!isToStay) {
        const swipeLastViewIndex = store.history.findIndex(
          (x) => x.view === lastView.panels.at(-1)?.lastView,
        )

        // Удаляем последнюю панель (возвращаемся назад)
        lastView.panels.pop()

        // Если панелей не осталось, устанавливаем панель по умолчанию
        if (lastView.panels.length === 0) {
          lastView.panels.push({ panel: "default" })
        }

        if (swipeLastViewIndex !== -1 && lastView.panels.at(-1)?.lastView !== lastView.view) {
          // Перемещаем view в конец истории (делаем последним активным)
          const [movedItem] = store.history.splice(swipeLastViewIndex, 1)
          store.history.push(movedItem)

          const swipeView = store.history.at(-1)
          if (swipeView) {
            lastView = swipeView
          }
        }
      }
      // Получаем новое активное состояние
      const currentPanel = lastView.panels[lastView.panels.length - 1]

      // Обновляем активный view и panel
      store.active = {
        view: lastView.view,
        panel: currentPanel.panel,
        modal: currentPanel.modal,
      }
      router.emit("back", {
        history: store.history,
        prev:
          lastPage && lastView
            ? {
                view: lastView?.view,
                ...lastPage,
              }
            : undefined,
        next: {
          view: lastView.view,
          ...lastView.panels[lastView.panels.length - 1],
        },
      })

      return store
    }),
  )
}

export default backPage
