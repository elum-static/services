import { Component, JSX, mergeProps } from "solid-js"

export interface PathProps {
  nav: string
  component: Component<{
    nav: string
  }>
  fallback?: Component<{
    nav: string
  }>
}

const Path = (props: PathProps): JSX.Element => {
  return mergeProps(props) as unknown as JSX.Element
  // return [props.component, props.nav] as unknown as JSX.Element;
}

export default Path
