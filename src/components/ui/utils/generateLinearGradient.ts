const generateLinearGradient = (colors: string[]) => {
  if (colors.length === 1) return colors[0]

  return `linear-gradient(180deg, ${colors.map(
    (color, index) => `${color} ${(index / (colors.length - 1)) * 100}%`,
  )})`
}

export default generateLinearGradient
