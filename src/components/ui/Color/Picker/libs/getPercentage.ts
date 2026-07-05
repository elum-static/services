/**
 * Функция вычисляет процентные координаты точки.
 */
const getPercentage = (
  x: number,
  y: number,
  width: number,
  height: number,
) => ({
  percentageX: (x * 100) / width,
  percentageY: (y * 100) / height,
})
export default getPercentage
