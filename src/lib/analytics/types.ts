export type MetricId = string

export type MetricFormat = 'number' | 'currency' | 'percent' | 'duration'
export type Bucket = 'day' | 'week' | 'month'

export interface DateRange {
    from: Date
    to: Date
}

export interface MetricValue {
    id: MetricId
    value: number
    previousValue?: number
    format: MetricFormat
}

export interface SeriesPoint {
    t: string          // ISO date, bucket start
    value: number
}

export interface Series {
    id: MetricId
    points: SeriesPoint[]
}

export interface Breakdown {
    id: MetricId
    slices: { label: string; value: number }[]
}

export interface RankedRow {
    label: string
    value: number
    meta?: Record<string, string>
}

/** Every backend — mock, Laravel, anything future — implements this. */
export interface AnalyticsSource {
    id: string
    getMetrics(ids: MetricId[], range: DateRange): Promise<MetricValue[]>
    getSeries(id: MetricId, range: DateRange, bucket: Bucket): Promise<Series>
    getBreakdown(id: MetricId, range: DateRange): Promise<Breakdown>
    getRanked(id: MetricId, range: DateRange, limit: number): Promise<RankedRow[]>
}