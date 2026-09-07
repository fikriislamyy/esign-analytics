import type { MetricFormat, MetricId } from './types'

export interface KpiConfig {
    metric: MetricId
    label: string
    format: MetricFormat
    /** Which direction is an improvement. Default 'up'. */
    goodDirection?: 'up' | 'down'
}

export type WidgetConfig =
    | { type: 'series'; metric: MetricId; title: string; chart?: 'line' | 'area' | 'bar' }
    | { type: 'breakdown'; metric: MetricId; title: string; chart?: 'bar' | 'donut' }
    | { type: 'ranked'; metric: MetricId; title: string; limit: number; valueLabel?: string }

export interface DashboardPack {
    id: string
    label: string
    sourceId: string
    kpis: KpiConfig[]
    widgets: WidgetConfig[]
}