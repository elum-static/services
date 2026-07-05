import { Component, JSX } from "solid-js"

interface LogoText extends JSX.SvgSVGAttributes<SVGSVGElement> {
  type?: "original" | "orange"
}

const LogoText: Component<LogoText> = (props) => {
  const color = {
    original: "#0077fc",
    orange: "#FF781A",
  }

  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 474 474">
      <rect width="474" height="474" fill={color[props.type || "original"]} rx="143.8" ry="143.8" />

      <path
        fill="#fff"
        d="M294 180.8c37-7.2 68.4 3.7 94.5 29.3 7 7 12.6 16.2 16.6 25.4 23.5 54.6 3.4 111.3-48.7 140.1a160.1 160.1 0 0 1-65.5 18.9 816.3 816.3 0 0 1-144.5-2.5 70.3 70.3 0 0 1-63.7-62.6 742.1 742.1 0 0 1-1.8-154.8 138.9 138.9 0 0 1 40.3-86.2c35.1-34.7 99-39.3 137.1-7.9a98.1 98.1 0 0 1 36.3 93.2c-.2 1.9-.7 3.8-1 5.8l.4 1.3Z"
      />
    </svg>
  )
}

export default LogoText
