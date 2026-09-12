import type { Release } from '../data/types'

/** Cards spell the same benchmark several ways — "GPQA-Diamond", "GPQA Diamond",
 *  "MMLU-pro" — so fold case, spaces and separators before grouping. Without
 *  this the whole curve silently collapses to one lab's spelling. */
export function canonMetric(name: string): string {
  return name
    .replace(/[–—]/g, '-')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Units that cannot share a score axis (money, throughput, seconds, sizes). */
const NON_SCORE = /\$|usd|token|t\/s|tok\/s|sec\b|ms\b|min\b|hour|gb|mb|张|秒/

export interface MetricPoint {
  release: Release
  score: number
  unit: string
  note: string
  /** Rows folded into this point when the card reports several harness variants. */
  variants: number
}

export interface MetricSeries {
  key: string
  /** Display label: the spelling most cards use. */
  label: string
  unit: string
  points: MetricPoint[]
  /** Distinct labs covered, first-appearance order. */
  labs: string[]
  /** Releases where several harness variants were reported and the max won. */
  variantsFolded: number
}

/**
 * Rank every benchmark the model cards actually report by how many labs, then
 * how many releases, cover it — so the capability curve is chosen by
 * comparability instead of by whichever metric one lab happens to top out on.
 * Same-release duplicates (Agentless / Agentic runs) keep the best score and
 * are counted in `variants` so the UI can say so.
 */
export function rankMetrics(releases: Release[]): MetricSeries[] {
  const groups = new Map<
    string,
    { spellings: Map<string, number>; pts: Map<string, MetricPoint>; labs: string[]; folded: number }
  >()
  for (const r of releases) {
    const lab = r.org ?? r.repo.split('/')[0]
    for (const b of r.benchmarks) {
      if (NON_SCORE.test(b.unit) || NON_SCORE.test(b.name)) continue
      const key = `${canonMetric(b.name)}|${b.unit}`
      const g =
        groups.get(key) ??
        { spellings: new Map<string, number>(), pts: new Map<string, MetricPoint>(), labs: [] as string[], folded: 0 }
      g.spellings.set(b.name, (g.spellings.get(b.name) ?? 0) + 1)
      const prev = g.pts.get(r.id)
      if (prev) {
        g.folded += 1
        if (b.score > prev.score) {
          g.pts.set(r.id, { release: r, score: b.score, unit: b.unit, note: b.note ?? '', variants: prev.variants + 1 })
        } else {
          g.pts.set(r.id, { ...prev, variants: prev.variants + 1 })
        }
      } else {
        g.pts.set(r.id, { release: r, score: b.score, unit: b.unit, note: b.note ?? '', variants: 1 })
      }
      if (!g.labs.includes(lab)) g.labs.push(lab)
      groups.set(key, g)
    }
  }

  const out: MetricSeries[] = []
  for (const [key, g] of groups) {
    const label = [...g.spellings.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
    const points = [...g.pts.values()].sort((a, b) => a.release.date.localeCompare(b.release.date))
    out.push({
      key,
      label,
      unit: points[0].unit,
      points,
      labs: g.labs,
      variantsFolded: points.filter((p) => p.variants > 1).length,
    })
  }

  return out
    .filter((s) => s.points.length >= 3)
    .sort((a, b) => b.labs.length - a.labs.length || b.points.length - a.points.length)
}
