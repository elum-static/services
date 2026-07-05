import { createContext } from "solid-js"

const StoriesContext = createContext<{
  getAccent: () => boolean
  goNext: () => void
  goBack: () => void
  goStory: (type: "next" | "back") => void
  getStorySelect: () => number
  getAnimation: () => boolean
  getCounter: () => boolean
  getIndex: () => number
  getContentLength: () => number
}>()

export default StoriesContext
