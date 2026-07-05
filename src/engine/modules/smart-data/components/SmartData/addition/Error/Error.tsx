import { context } from "../../SmartData"

import {
  type Component,
  type JSX,
  Show,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js"

interface Error extends JSX.HTMLAttributes<HTMLDivElement> {}

const Error: Component<Error> = (props) => {
  const merged = mergeProps({}, props)

  const [local, others] = splitProps(merged, ["class", "classList", "children"])
  const values = useContext(context)

  // return Show({ when: values.error, children: local.children })
  return <Show when={values.error}>{local.children}</Show>
}

export default Error
