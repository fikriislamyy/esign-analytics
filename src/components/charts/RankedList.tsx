import { formatMetric } from '@/lib/analytics/format'
import type { RankedRow } from '@/lib/analytics/types'

export function RankedList({
    rows,
    valueLabel,
}: {
    rows: RankedRow[]
    valueLabel?: string
}) {
    const max = Math.max(...rows.map(r => r.value), 1)

    return (
        <ul className="space-y-2.5">
            {rows.map((r, i) => (
                <li key={r.label}>
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                        <span className="flex min-w-0 items-baseline gap-1.5">
                            <span className="w-4 shrink-0 tabular-nums text-neutral-400">{i + 1}</span>
                            <span className="truncate">{r.label}</span>
                        </span>
                        <span className="shrink-0 tabular-nums text-neutral-500">
                            {formatMetric(r.value, 'number')}
                            {valueLabel ? ` ${valueLabel}` : ''}
                        </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                            className="h-full rounded-full bg-indigo-500"
                            style={{ width: `${(r.value / max) * 100}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    )
}