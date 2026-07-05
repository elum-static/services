// Для лучшей читаемости можно вынести дублирование в отдельную функцию
export function duplicateArray<T>(array: T[], times: number = 5): T[] {
  return Array.from({ length: array.length * times }, (_, i) => {
    const originalIndex = i % array.length
    return { ...array[originalIndex], id: i }
  })
}

export type Day = { id: number; day: number; title: string }
export type Month = { id: number; month: number; title: string }
export type Year = { id: number; year: number; title: string }

interface DateRangeData {
  months: Array<Month>
  years: Array<Year>
}

export function generateDateRange(
  from: Date,
  to: Date,
  lang: string = "ru",
): DateRangeData {
  // Базовые годы
  const startYear = from.getFullYear()
  const endYear = to.getFullYear()
  const baseYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
    id: i,
    year: startYear + i,
    title: String(startYear + i),
  }))

  // Базовые месяцы
  const baseMonths = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2023, i, 1)
    const monthName = new Intl.DateTimeFormat(lang, { month: "long" })
      .format(date)
      .replace(".", "")
    return {
      id: i,
      month: i % 12,
      title: monthName,
    }
  })

  return {
    months: baseMonths,
    years: baseYears,
  }
}

// Функция для получения актуального количества дней в месяце
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getDaysForMonth(
  year: number,
  month: number,
): Array<{ id: number; day: number; title: string }> {
  const daysInMonth = getDaysInMonth(year, month)
  const baseDays = Array.from({ length: daysInMonth }, (_, i) => ({
    id: i,
    day: (i % daysInMonth) + 1,
    title: String(i + 1),
  }))

  return baseDays
}
