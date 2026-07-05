import { context } from "../../SmartData"

import {
  type Component,
  type JSX,
  Show,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js"

interface Skeleton extends JSX.HTMLAttributes<HTMLDivElement> {}

const Skeleton: Component<Skeleton> = (props) => {
  const merged = mergeProps({}, props)

  const [local, others] = splitProps(merged, ["class", "classList", "children"])
  const values = useContext(context)

  // return Show({ when: values.skeleton, children: local.children })

  return <Show when={values.skeleton}>{local.children}</Show>
}

export default Skeleton
