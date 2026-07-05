import { Accessor, type Component, createContext } from "solid-js"

export const LayoutManagerStore = createContext<{
  key: string
  child?: {
    first: Accessor<
      | {
          nav: string
          component: Component
        }
      | undefined
    >
    last: Accessor<
      | {
          nav: string
          component: Component
        }
      | undefined
    >
  }
  getDirection?: (type: "first" | "last") => "next" | "back"
  // getChild?: (type: "first" | "last") =>
  //   | {
  //       nav: string
  //       component: Component
  //     }
  //   | undefined
  onAnimationEnd?: (type: "first" | "last") => void
  getAnim?: () => boolean
  styleIndex?: (type: "first" | "last") =>
    | {
        [k: string]: boolean | undefined
      }
    | undefined
}>({ key: "test" })
