import { type TextProps } from "@ui/Types"

import { createContext } from "solid-js"

type Context =
  | {
      title: TextProps
      subTitle: TextProps
    }
  | {
      title: TextProps
      subTitle?: TextProps
    }
  | {
      title?: TextProps
      subTitle: TextProps
    }

const TextContext = createContext<Context>()

export default TextContext
