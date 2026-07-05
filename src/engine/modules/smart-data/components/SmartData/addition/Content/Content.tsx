import { context } from "../../SmartData"

import {
  type Component,
  type JSX,
  Show,
  createEffect,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js"

interface Content extends JSX.HTMLAttributes<HTMLDivElement> {}

const Content: Component<Content> = (props) => {
  const values = useContext(context)

  // return Show({ when: values.content, children: local.children })

  return <Show when={values.content}>{props.children}</Show>
}

export default Content
