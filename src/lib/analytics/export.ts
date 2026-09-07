import type {
  AnalyticsSource,
  Bucket,
  DateRange,
  MetricFormat,
} from './types'
import type { DashboardPack } from './pack-types'

/** RFC 4180: wrap in quotes and double any inner quote. */
function cell(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

function row(cells: (string | number)[]): string {
  return cells.map(cell).join(',')
}

/** Raw numbers, not display strings: the file is for spreadsheets. */
function rawValue(value: number, format: MetricFormat): number {
  return format === 'percent' ? Math.round(value * 10000) / 100 : value
}

function unitFor(format: MetricFormat): string {
  if (format === 'percent') return '%'
  if (format === 'currency') return 'IDR'
  if (format === 'duration') return 'hours'
  return 'count'
}

export async function buildCsv(
  pack: DashboardPack,
  source: AnalyticsSource,
  range: DateRange,
  bucket: Bucket,
): Promise<string> {
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const lines: string[] = []

  lines.push(row(['Report', pack.label]))
  lines.push(row(['Period', iso(range.from) + ' to ' + iso(range.to)]))
  lines.push(row(['Generated', new Date().toISOString()]))
  lines.push('')

  // --- KPI summary ---
  const metricIds = pack.kpis.map((k) => k.metric)
  const metrics = await source.getMetrics(metricIds, range)
  const byId = new Map(metrics.map((m) => [m.id, m]))

  lines.push(row(['Summary']))
  lines.push(row(['Metric', 'Value', 'Unit', 'Previous', 'Change %']))
  for (const k of pack.kpis) {
    const m = byId.get(k.metric)
    if (!m) continue
    const prev = m.previousValue
    const change =
      prev === undefined || prev === 0
        ? ''
        : (((m.value - prev) / prev) * 100).toFixed(2)
    lines.push(
      row([
        k.label,
        rawValue(m.value, k.format),
        unitFor(k.format),
        prev === undefined ? '' : rawValue(prev, k.format),
        change,
      ]),
    )
  }
  lines.push('')

  // --- One section per widget ---
  for (const w of pack.widgets) {
    if (w.type === 'series') {
      const s = await source.getSeries(w.metric, range, bucket)
      lines.push(row([w.title]))
      lines.push(row(['Period start', 'Value']))
      for (const p of s.points) lines.push(row([p.t, p.value]))
    } else if (w.type === 'breakdown') {
      const b = await source.getBreakdown(w.metric, range)
      const total = b.slices.reduce((a, s) => a + s.value, 0) || 1
      lines.push(row([w.title]))
      lines.push(row(['Category', 'Value', 'Share %']))
      for (const s of b.slices) {
        lines.push(row([s.label, s.value, ((s.value / total) * 100).toFixed(2)]))
      }
    } else {
      const rows = await source.getRanked(w.metric, range, w.limit)
      const metaKeys = [...new Set(rows.flatMap((r) => Object.keys(r.meta ?? {})))]
      lines.push(row([w.title]))
      lines.push(row(['Rank', 'Name', w.valueLabel ?? 'Value', ...metaKeys]))
      rows.forEach((r, i) => {
        lines.push(row([i + 1, r.label, r.value, ...metaKeys.map((k) => r.meta?.[k] ?? '')]))
      })
    }
    lines.push('')
  }

  return lines.join('\r\n')
}