import { clamp, RGBtoHSV } from "@minsize/utils"

const getPosition = (r: number, g: number, b: number) => {
  const [h, s, v] = RGBtoHSV(r, g, b)

  return {
    x: clamp(100 - v * 100, 0, 100),
    y: 0, // clamp(100 - v * 100, 0, 100)
  }
}

export default getPosition
