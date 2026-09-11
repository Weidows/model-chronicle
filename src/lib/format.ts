/** Number / date formatting used across the chronicle UI. */

const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** 1776693 -> "1.8M" */
export function fmtCompact(n: number) {
  return compact.format(n)
}

/** 1776693 -> "1,776,693" */
export function fmtFull(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

/** "2024-12-25" -> { year: 2024, month: 12, day: 25, isoTimestamp } */
export function parseIso(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return { year: y, month: m, day: d }
}

/** "2024-12-25" -> "2024.12.25" */
export function fmtDate(iso: string) {
  const { year, month, day } = parseIso(iso)
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`
}

/** "2024-12-25" -> "2024 Q4" */
export function fmtQuarter(iso: string) {
  const { year, month } = parseIso(iso)
  return `${year} Q${Math.ceil(month / 3)}`
}

/** Fractional year, used as the timeline x coordinate. */
export function yearFraction(iso: string) {
  const { year, month, day } = parseIso(iso)
  const start = Date.UTC(year, 0, 1)
  const next = Date.UTC(year + 1, 0, 1)
  const at = Date.UTC(year, month - 1, day)
  return year + (at - start) / (next - start)
}

/** Whole days between two ISO dates. */
export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000)
}
