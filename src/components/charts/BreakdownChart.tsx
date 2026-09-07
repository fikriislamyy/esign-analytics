'use client'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useIsMobile } from '@/hooks/useIsMobile'

const COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#f43f5e', '#10b981', '#a855f7']

export function BreakdownChart({
    slices,
}: {
    slices: { label: string; value: number }[]
}) {
    const isMobile = useIsMobile()
    const total = slices.reduce((a, s) => a + s.value, 0) || 1

    return (
        <div className="flex h-full flex-col">
            <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={slices}
                            dataKey="value"
                            nameKey="label"
                            innerRadius={isMobile ? '52%' : '58%'}
                            outerRadius={isMobile ? '78%' : '82%'}
                            paddingAngle={2}
                            strokeWidth={0}
                            isAnimationActive={false}
                        >
                            {slices.map((s, i) => (
                                <Cell key={s.label} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value, name) => [
                                `${Number(value).toLocaleString()} (${((Number(value) / total) * 100).toFixed(1)}%)`,
                                name,
                            ]}
                            contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Rendered as plain HTML rather than <Legend>: Recharts v3 omits the
          `payload` prop, and its default legend sorts independently of slice
          order, which decouples labels from colors. */}
            <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs">
                {slices.map((s, i) => (
                    <li key={s.label} className="flex items-center gap-1.5">
                        <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-neutral-500">{s.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}