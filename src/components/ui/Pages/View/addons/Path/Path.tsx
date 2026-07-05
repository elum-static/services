import { Component, JSX, mergeProps } from "solid-js"

interface Path {
  tabbar?: boolean
  nav: string | string[]
  component: Component<{
    nav: string
    [key: string]: string
  }>
}

const Path = (props: Path): JSX.Element => {
  return mergeProps(props) as unknown as JSX.Element
  // return [props.component, props.nav] as unknown as JSX.Element;
}

export default Path
