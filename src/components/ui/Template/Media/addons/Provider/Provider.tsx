import { createStore, produce } from "solid-js/store"
import MediaContext from "../../Media.context"

import { type JSX, type Component, mergeProps, splitProps, onCleanup, onMount } from "solid-js"
import { router } from "root/router"

interface Provider {
  children: JSX.Element
}

export type Media = { position: number; pause: boolean; progress: number } & (
  | {
      type: "audio"
      ref: HTMLAudioElement & {
        getDuration: () => number
      }
    }
  | {
      type: "video"
      ref: HTMLVideoElement & {
        getDuration: () => number
      }
    }
)

type Store = {
  activePosition: number

  media: Array<Media>
}

const Provider: Component<Provider> = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["children"])

  const [store, setStore] = createStore<Store>({
    activePosition: -1,
    media: [],
  })

  let animFrame: number | undefined

  const startTimer = () => {
    const updateTime = () => {
      stopTimer()
      setStore(
        produce((store) => {
          const media = store.media.find((x) => x.position === store.activePosition)
          if (media) {
            media.progress = media.ref.currentTime / media.ref.getDuration()
          }

          // Запрашиваем следующий кадр анимации
          animFrame = requestAnimationFrame(updateTime)

          return store
        }),
      )
    }

    animFrame = requestAnimationFrame(updateTime)
  }

  const stopTimer = () => {
    if (animFrame) {
      cancelAnimationFrame(animFrame)
    }
  }

  const onPause = (event: Event) => {
    const currentTarget = event.currentTarget as HTMLAudioElement | HTMLVideoElement
    setStore(
      produce((store) => {
        const media = store.media.find((x) => x.ref === currentTarget)

        if (media) {
          media.pause = true
        }

        return store
      }),
    )
    stopTimer()
  }

  const onPlay = (event: Event) => {
    const currentTarget = event.currentTarget as HTMLAudioElement | HTMLVideoElement
    const lastMedia = store.media.find((x) => x.position === store.activePosition)

    if (lastMedia && lastMedia.ref !== currentTarget) {
      lastMedia.ref.pause()
    }

    setStore(
      produce((store) => {
        const media = store.media.find((x) => x.ref === currentTarget)

        if (media) {
          media.pause = false
          media.progress = 0
        }
        store.activePosition = media?.position || -1

        return store
      }),
    )
    startTimer()
  }

  const onEnded = (event: Event) => {
    // const currentTarget = event.currentTarget as HTMLAudioElement | HTMLVideoElement
    removeActive()
    // const nextMedia = store.media.find((x) => x.position > store.activePosition)
    // if (nextMedia) {
    //   const rect = nextMedia?.ref.getBoundingClientRect()

    //   const visible =
    //     rect.top >= 0 &&
    //     rect.left >= 0 &&
    //     rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    //     rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    //   if (visible) {
    //     nextMedia?.ref.play()
    //   }
    // } else {
    //   removeActive()
    // }
  }

  /**
   * Регистрация медиа
   */
  function register(ref: HTMLAudioElement, type: "audio", position: number): void
  function register(ref: HTMLVideoElement, type: "video", position: number): void

  function register(
    ref: HTMLAudioElement | HTMLAudioElement,
    type: "video" | "audio",
    position: number,
  ) {
    setStore(
      produce((store) => {
        let media = store.media.find((x) => x.ref === ref || x.position === position)

        if (media) {
          media.ref = ref
          media.type = type
          media.position = position
        } else {
          media = { ref, type, position, pause: true }
          store.media.push(media)
        }

        store.media.sort((a, b) => {
          return a.position - b.position
        })

        media?.ref.addEventListener("pause", onPause)
        media?.ref.addEventListener("play", onPlay)
        media?.ref.addEventListener("ended", onEnded)

        return store
      }),
    )
  }

  onMount(() => {
    const off = router.on("back", () => {
      const lastMedia = store.media.find((x) => x.position === store.activePosition)

      if (lastMedia) {
        lastMedia.ref.pause()
      }
    })

    onCleanup(() => {
      off()
    })
  })

  onCleanup(() => {
    for (const media of store.media) {
      media?.ref.removeEventListener("pause", onPause)
      media?.ref.removeEventListener("play", onPlay)
      media?.ref.removeEventListener("ended", onEnded)
    }
  })

  const getActive = () => {
    const media = store.media.find((x) => x.position === store.activePosition)
    return media
  }

  const removeActive = () => {
    const active = getActive()
    active?.ref?.pause()
    setStore("activePosition", -1)
  }

  return (
    <MediaContext.Provider value={{ getActive, removeActive, register }}>
      {local.children}
    </MediaContext.Provider>
  )
}

export default Provider
