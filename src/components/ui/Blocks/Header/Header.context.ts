import { createContext } from "solid-js"

export type HeaderContextProps = {
  /**
   * Инициализация дочерних элементов
   *
   * @returns cleanup
   */
  init: (grid: "before" | "content" | "after") => { cleanup: () => void; isLast: boolean }
}

const HeaderContext = createContext<HeaderContextProps>()

export default HeaderContext
