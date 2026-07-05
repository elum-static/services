// Функция для расчета параметров отрисовки под cover
const calculateCoverDimensions = (
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number,
) => {
  const imgRatio = imgWidth / imgHeight
  const containerRatio = containerWidth / containerHeight

  let srcX = 0,
    srcY = 0,
    srcWidth = imgWidth,
    srcHeight = imgHeight
  let dstX = 0,
    dstY = 0,
    dstWidth = containerWidth,
    dstHeight = containerHeight

  if (containerRatio > imgRatio) {
    // Обрезаем по высоте (вертикальные части)
    srcHeight = imgWidth / containerRatio
    srcY = (imgHeight - srcHeight) / 2
  } else {
    // Обрезаем по ширине (горизонтальные части)
    srcWidth = imgHeight * containerRatio
    srcX = (imgWidth - srcWidth) / 2
  }

  return { srcX, srcY, srcWidth, srcHeight, dstX, dstY, dstWidth, dstHeight }
}

export default calculateCoverDimensions
