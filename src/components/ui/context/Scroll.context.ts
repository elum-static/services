import { createContext } from "solid-js"

type ScrollContextProps = {
  /**
   * Реактивное состояние указывающее на то, что контент скролиться
   */
  isScroll: () => boolean
}

const ScrollContext = createContext<ScrollContextProps>()

export default ScrollContext
