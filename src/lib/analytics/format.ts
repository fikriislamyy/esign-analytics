import type { MetricFormat } from './types'

const idr = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
})
const num = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function formatMetric(value: number, format: MetricFormat, opts?: { compact?: boolean }): string {
    switch (format) {
        case 'currency':
            return opts?.compact ? 'Rp' + compact.format(value) : idr.format(value)
        case 'percent':
            return `${(value * 100).toFixed(1)}%`
        case 'duration': {
            if (value < 1) return `${Math.round(value * 60)}m`
            if (value < 48) return `${value.toFixed(1)}h`
            return `${(value / 24).toFixed(1)}d`
        }
        default:
            return opts?.compact ? compact.format(value) : num.format(Math.round(value))
    }
}

export function computeDelta(value: number, previous?: number) {
    if (previous === undefined || previous === 0) return null
    const pct = (value - previous) / previous
    return { pct, direction: pct >= 0 ? 'up' as const : 'down' as const }
}

export function isImprovement(direction: 'up' | 'down', goodDirection: 'up' | 'down' = 'up') {
    return direction === goodDirection
}