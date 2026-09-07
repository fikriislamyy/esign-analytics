import type {
    AnalyticsSource, Breakdown, Bucket, DateRange,
    MetricFormat, MetricId, MetricValue, RankedRow, Series,
} from '../types'

/** Deterministic PRNG — same seed, same output, server and client. */
function mulberry32(seed: number) {
    return () => {
        seed |= 0
        seed = (seed + 0x6d2b79f5) | 0
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function hash(s: string): number {
    let h = 2166136261
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return h >>> 0
}

export interface MockMetricSpec {
    format: MetricFormat
    aggregate: 'sum' | 'mean'   // ← explicit, no inference
    base: number
    variance: number
    trendPerDay?: number
    weekendDip?: number
}

export interface MockSourceConfig {
    id: string
    metrics: Record<MetricId, MockMetricSpec>
    breakdowns: Record<MetricId, { label: string; weight: number }[]>
    ranked: Record<MetricId, { labels: string[]; base: number; meta?: (l: string) => Record<string, string> }>
}

function eachDay(range: DateRange): Date[] {
    const out: Date[] = []
    const d = new Date(range.from)
    d.setHours(0, 0, 0, 0)
    while (d <= range.to) {
        out.push(new Date(d))
        d.setDate(d.getDate() + 1)
    }
    return out
}

function dayValue(id: MetricId, spec: MockMetricSpec, day: Date, index: number): number {
    const rand = mulberry32(hash(`${id}:${day.toISOString().slice(0, 10)}`))
    const noise = 1 + (rand() - 0.5) * 2 * spec.variance
    const weekend = (day.getDay() === 0 || day.getDay() === 6)
        ? 1 - (spec.weekendDip ?? 0)
        : 1
    const trend = (spec.trendPerDay ?? 0) * index
    return Math.max(0, (spec.base + trend) * noise * weekend)
}

function bucketKey(d: Date, bucket: Bucket): string {
    if (bucket === 'day') return d.toISOString().slice(0, 10)
    if (bucket === 'month') return `${d.toISOString().slice(0, 7)}-01`
    const monday = new Date(d)
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    return monday.toISOString().slice(0, 10)
}

export function createMockSource(config: MockSourceConfig): AnalyticsSource {
    const delay = <T,>(v: T) => new Promise<T>(r => setTimeout(() => r(v), 120))

    function totalFor(id: MetricId, spec: MockMetricSpec, range: DateRange): number {
        const days = eachDay(range)
        const vals = days.map((d, i) => dayValue(id, spec, d, i))
        const sum = vals.reduce((a, b) => a + b, 0)
        return spec.aggregate === 'mean' ? sum / Math.max(1, vals.length) : sum
    }

    return {
        id: config.id,

        async getMetrics(ids, range) {
            const spanMs = range.to.getTime() - range.from.getTime()
            const prev: DateRange = {
                from: new Date(range.from.getTime() - spanMs),
                to: new Date(range.from.getTime() - 1),
            }
            const out: MetricValue[] = ids.map(id => {
                const spec = config.metrics[id]
                if (!spec) throw new Error(`[${config.id}] unknown metric: ${id}`)
                return {
                    id,
                    format: spec.format,
                    value: Math.round(totalFor(id, spec, range) * 100) / 100,
                    previousValue: Math.round(totalFor(id, spec, prev) * 100) / 100,
                }
            })
            return delay(out)
        },

        async getSeries(id, range, bucket): Promise<Series> {
            const spec = config.metrics[id]
            if (!spec) throw new Error(`[${config.id}] unknown metric: ${id}`)
            const buckets = new Map<string, number[]>()
            eachDay(range).forEach((d, i) => {
                const k = bucketKey(d, bucket)
                if (!buckets.has(k)) buckets.set(k, [])
                buckets.get(k)!.push(dayValue(id, spec, d, i))
            })
            const points = [...buckets.entries()].map(([t, vals]) => ({
                t,
                value: Math.round(
                    (spec.aggregate === 'mean'
                        ? vals.reduce((a, b) => a + b, 0) / vals.length
                        : vals.reduce((a, b) => a + b, 0)) * 100
                ) / 100,
            }))
            return delay({ id, points })
        },

        async getBreakdown(id, range): Promise<Breakdown> {
            const def = config.breakdowns[id]
            if (!def) throw new Error(`[${config.id}] unknown breakdown: ${id}`)
            const rand = mulberry32(hash(`${id}:${range.from.toISOString().slice(0, 10)}`))
            const days = eachDay(range).length
            const slices = def.map(s => ({
                label: s.label,
                value: Math.round(s.weight * days * (0.85 + rand() * 0.3)),
            }))
            return delay({ id, slices })
        },

        async getRanked(id, range, limit): Promise<RankedRow[]> {
            const def = config.ranked[id]
            if (!def) throw new Error(`[${config.id}] unknown ranked list: ${id}`)
            const days = eachDay(range).length
            const rows = def.labels.map(label => {
                const rand = mulberry32(hash(`${id}:${label}`))
                return {
                    label,
                    value: Math.round(def.base * days * (0.3 + rand() * 1.4)),
                    meta: def.meta?.(label),
                }
            })
            rows.sort((a, b) => b.value - a.value)
            return delay(rows.slice(0, limit))
        },
    }
}