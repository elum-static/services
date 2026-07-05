export type Drags = {
  key: string
  isActive: boolean
  isAnim?: boolean
  lastEdit?: boolean
  position: {
    element: number
    x?: number
    y?: number
    bounding: DOMRect
  }

  transform?: {
    y: number
  }
}
