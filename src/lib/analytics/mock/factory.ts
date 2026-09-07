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
    /** How daily values combine over a range. Counts sum; rates and averages mean. */
    aggregate: 'sum' | 'mean'
    base: number
    variance: number
    trendPerDay?: number
    weekendDip?: number
}

export interface MockSourceConfig {
    id: string
    metrics: Record<MetricId, MockMetricSpec>
    breakdowns: Record<MetricId, { label: string; weight: number }[]>
    ranked: Record<MetricId, {
        labels: string[]
        base: number
        meta?: (label: string) => Record<string, string>
    }>
}

/**
 * All date arithmetic is UTC. Mixing UTC and local methods shifts every
 * bucket by the viewer's offset, which silently moves data a day.
 */
function eachDay(range: DateRange): Date[] {
    const out: Date[] = []
    const d = new Date(range.from)
    d.setUTCHours(0, 0, 0, 0)
    const end = new Date(range.to)
    end.setUTCHours(0, 0, 0, 0)
    while (d <= end) {
        out.push(new Date(d))
        d.setUTCDate(d.getUTCDate() + 1)
    }
    return out
}

function dayValue(id: MetricId, spec: MockMetricSpec, day: Date, index: number): number {
    const rand = mulberry32(hash(id + ':' + day.toISOString().slice(0, 10)))
    const noise = 1 + (rand() - 0.5) * 2 * spec.variance
    const dow = day.getUTCDay()
    const weekend = dow === 0 || dow === 6 ? 1 - (spec.weekendDip ?? 0) : 1
    const trend = (spec.trendPerDay ?? 0) * index
    return Math.max(0, (spec.base + trend) * noise * weekend)
}

function bucketKey(d: Date, bucket: Bucket): string {
    if (bucket === 'day') return d.toISOString().slice(0, 10)
    if (bucket === 'month') return d.toISOString().slice(0, 7) + '-01'
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
    return monday.toISOString().slice(0, 10)
}

/** Round to the precision the metric's unit actually has. */
function finalize(value: number, format: MetricFormat): number {
    if (format === 'number') return Math.round(value)
    if (format === 'currency') return Math.round(value)
    if (format === 'percent') return Math.round(value * 10000) / 10000
    return Math.round(value * 100) / 100
}

function combine(vals: number[], spec: MockMetricSpec): number {
    const sum = vals.reduce((a, b) => a + b, 0)
    const v = spec.aggregate === 'mean' ? sum / Math.max(1, vals.length) : sum
    return finalize(v, spec.format)
}

export function createMockSource(config: MockSourceConfig): AnalyticsSource {
    const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 120))

    function totalFor(id: MetricId, spec: MockMetricSpec, range: DateRange): number {
        const vals = eachDay(range).map((d, i) => dayValue(id, spec, d, i))
        return combine(vals, spec)
    }

    return {
        id: config.id,

        async getMetrics(ids, range) {
            // Equal-length previous window, counted in days rather than milliseconds:
            // ms subtraction yields N-1 days and makes every delta wrong.
            const days = eachDay(range).length
            const prevTo = new Date(range.from)
            prevTo.setUTCHours(0, 0, 0, 0)
            prevTo.setUTCDate(prevTo.getUTCDate() - 1)
            const prevFrom = new Date(prevTo)
            prevFrom.setUTCDate(prevFrom.getUTCDate() - (days - 1))
            const prev: DateRange = { from: prevFrom, to: prevTo }

            const out: MetricValue[] = ids.map((id) => {
                const spec = config.metrics[id]
                if (!spec) throw new Error('[' + config.id + '] unknown metric: ' + id)
                return {
                    id,
                    format: spec.format,
                    value: totalFor(id, spec, range),
                    previousValue: totalFor(id, spec, prev),
                }
            })
            return delay(out)
        },

        async getSeries(id, range, bucket): Promise<Series> {
            const spec = config.metrics[id]
            if (!spec) throw new Error('[' + config.id + '] unknown metric: ' + id)

            const buckets = new Map<string, number[]>()
            eachDay(range).forEach((d, i) => {
                const k = bucketKey(d, bucket)
                if (!buckets.has(k)) buckets.set(k, [])
                buckets.get(k)!.push(dayValue(id, spec, d, i))
            })

            // Drop leading/trailing partial buckets: a sum over 1 day is not
            // comparable to a sum over 7, and renders as a fake cliff.
            const expected = bucket === 'day' ? 1 : bucket === 'week' ? 7 : 28
            const entries = [...buckets.entries()]
            if (entries.length > 2) {
                if (entries[0][1].length < expected) entries.shift()
                if (entries[entries.length - 1][1].length < expected) entries.pop()
            }

            const points = entries.map(([t, vals]) => ({ t, value: combine(vals, spec) }))
            return delay({ id, points })
        },

        async getBreakdown(id, range): Promise<Breakdown> {
            const def = config.breakdowns[id]
            if (!def) throw new Error('[' + config.id + '] unknown breakdown: ' + id)
            const rand = mulberry32(hash(id + ':' + range.from.toISOString().slice(0, 10)))
            const days = eachDay(range).length
            const slices = def.map((s) => ({
                label: s.label,
                value: Math.round(s.weight * days * (0.85 + rand() * 0.3)),
            }))
            return delay({ id, slices })
        },

        async getRanked(id, range, limit): Promise<RankedRow[]> {
            const def = config.ranked[id]
            if (!def) throw new Error('[' + config.id + '] unknown ranked list: ' + id)
            const days = eachDay(range).length
            const rows = def.labels.map((label) => {
                const rand = mulberry32(hash(id + ':' + label))
                return {
                    label,
                    value: Math.round(def.base * days * (0.3 + rand() * 1.4)),
                    meta: def.meta ? def.meta(label) : undefined,
                }
            })
            rows.sort((a, b) => b.value - a.value)
            return delay(rows.slice(0, limit))
        },
    }
}