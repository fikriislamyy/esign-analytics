import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import { computeDelta, formatMetric, isImprovement } from '@/lib/analytics/format'
import type { KpiConfig } from '@/lib/analytics/pack-types'
import type { MetricValue } from '@/lib/analytics/types'

export function KpiCard({ config, metric }: { config: KpiConfig; metric: MetricValue }) {
    const raw = computeDelta(metric.value, metric.previousValue)
    const delta = raw && Math.abs(raw.pct) >= 0.001 ? raw : null
    const good = delta ? isImprovement(delta.direction, config.goodDirection) : null
    const Icon = !delta ? Minus : delta.direction === 'up' ? ArrowUp : ArrowDown

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <p className="truncate text-xs font-medium text-neutral-500">{config.label}</p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums sm:text-2xl">
                {formatMetric(metric.value, config.format, { compact: config.format === 'currency' })}
            </p>
            {delta && (
                <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${good ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                    <Icon className="h-3 w-3" strokeWidth={2.5} />
                    <span className="tabular-nums">{Math.abs(delta.pct * 100).toFixed(1)}%</span>
                    <span className="font-normal text-neutral-500">vs prev</span>
                </div>
            )}
        </div>
    )
}