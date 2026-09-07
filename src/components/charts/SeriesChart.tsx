'use client'
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatMetric } from '@/lib/analytics/format'
import type { MetricFormat, SeriesPoint } from '@/lib/analytics/types'

export function SeriesChart({
    points,
    format,
    chart = 'area',
}: {
    points: SeriesPoint[]
    format: MetricFormat
    chart?: 'line' | 'area' | 'bar'
}) {
    const isMobile = useIsMobile()

    const shortDate = (t: string) =>
        new Date(t).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

    const axis = {
        stroke: 'currentColor',
        fontSize: isMobile ? 10 : 12,
        tickLine: false,
        axisLine: false,
        className: 'text-neutral-400',
    }

    // Params are left unannotated on purpose: Recharts types them as
    // ValueType / ReactNode, and narrowing them here breaks assignability.
    const common = (
        <>
            <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                className="stroke-neutral-200 dark:stroke-neutral-800"
            />
            <XAxis
                dataKey="t"
                {...axis}
                tickFormatter={value => shortDate(String(value))}
                interval={isMobile ? Math.max(0, Math.ceil(points.length / 4) - 1) : 'preserveStartEnd'}
                minTickGap={isMobile ? 24 : 12}
            />
            <YAxis
                {...axis}
                width={isMobile ? 40 : 60}
                tickFormatter={value => formatMetric(Number(value), format, { compact: true })}
            />
            <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                labelFormatter={label => shortDate(String(label))}
                formatter={value => [formatMetric(Number(value), format), '']}
                contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
            />
        </>
    )

    return (
        <ResponsiveContainer width="100%" height="100%">
            {chart === 'bar' ? (
                <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    {common}
                    <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
            ) : chart === 'line' ? (
                <LineChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    {common}
                    <Line dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
            ) : (
                <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <defs>
                        <linearGradient id="seriesFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    {common}
                    <Area dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#seriesFill)" />
                </AreaChart>
            )}
        </ResponsiveContainer>
    )
}