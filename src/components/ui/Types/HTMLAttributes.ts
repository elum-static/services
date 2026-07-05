import { type Platform } from "@ui/Types"

import { type JSX } from "solid-js"
import { type DynamicProps } from "solid-js/web"

export interface HTMLAttributes<T = DynamicProps<"article">>
  extends JSX.HTMLAttributes<T> {
  platform?: Platform
}
