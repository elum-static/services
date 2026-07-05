import { atom, getter, setter } from "@atom/index"
import { JSX } from "solid-js"
import { produce } from "solid-js/store"

export const SNACKBAR_ATOM = atom<
  {
    data: {
      id: number
      element: JSX.Element
      timeout: NodeJS.Timeout
      hidden: boolean
    }[]
  },
  {}
>({
  name: "snackbar",
  version: 2,
  default: {
    data: [],
  },
})

export const addSnackBar = (
  element: (options: { onClose: () => void; hidden: () => boolean }) => JSX.Element,
  timeout: number = 3_000,
) => {
  const onClose = (id: number) => {
    setter(
      SNACKBAR_ATOM,
      produce((store) => {
        const index = store.data.findIndex((x) => x.id === id)

        if (index !== -1) {
          clearTimeout(store.data[index].timeout)
          store.data.splice(index, 1)
        }

        return store
      }),
    )
  }

  setter(
    SNACKBAR_ATOM,
    produce((store) => {
      const id = store.data.length

      store.data.push({
        id: id,
        element: element({
          onClose: () => onClose(id),
          hidden: () => {
            const data = getter(SNACKBAR_ATOM)

            return !!data.data.find((x) => x.id === id)?.hidden
          },
        }),
        timeout: setTimeout(() => {
          setter(
            SNACKBAR_ATOM,
            produce((store) => {
              const item = store.data.find((x) => x.id === id)

              if (item) {
                clearTimeout(item.timeout)
                item.hidden = true
              }

              return store
            }),
          )
        }, timeout),
        hidden: false,
      })

      return store
    }),
  )
}

export const closeSnackBar = () => {
  setter(
    SNACKBAR_ATOM,
    produce((store) => {
      for (const item of store.data) {
        clearTimeout(item.timeout)
        item.hidden = true
      }

      return store
    }),
  )
}
