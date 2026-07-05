import { type ChildrenReturn, type Component } from "solid-js"

export type ArrayJSX<T extends Component> = {
  nav: string
  component: T
  getNav?: (nav: string) => boolean
  onAnimEnd?: () => void
}

const toArray = <T extends ArrayJSX<any>>(children: ChildrenReturn): T[] => {
  const child = children()
  if (Array.isArray(child)) {
    return child as unknown as T[]
  }
  return [child] as unknown as T[]
}

export default toArray
