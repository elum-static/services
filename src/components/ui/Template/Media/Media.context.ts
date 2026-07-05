import { createContext } from "solid-js"
import { Media } from "./addons/Provider/Provider"

type MediaContextProps = {
  getActive: () => Media | undefined
  register: {
    (ref: HTMLAudioElement, type: "audio", position: number): void
    (ref: HTMLVideoElement, type: "video", position: number): void
  }
  removeActive: () => void
}

const MediaContext = createContext<MediaContextProps>()

export default MediaContext
