'use client'
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
    ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useIsMobile } from '@/hooks/useIsMobile'
import { formatMetric } from '@/lib/analytics/format'
import type { Bucket, MetricFormat, SeriesPoint } from '@/lib/analytics/types'

export function SeriesChart({
    points,
    format,
    chart = 'area',
    bucket = 'week',
}: {
    points: SeriesPoint[]
    format: MetricFormat
    chart?: 'line' | 'area' | 'bar'
    bucket?: Bucket
}) {
    const isMobile = useIsMobile()

    const label = (t: string) => {
        const d = new Date(t)
        if (bucket === 'month') {
            return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
        }
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
    }

    const axis = {
        stroke: 'currentColor',
        fontSize: isMobile ? 10 : 12,
        tickLine: false,
        axisLine: false,
        className: 'text-neutral-400',
    }

    const targetTicks = isMobile ? 4 : 8
    const interval =
        points.length <= targetTicks
            ? 0
            : Math.max(0, Math.ceil(points.length / targetTicks) - 1)

    // Line/area put the last point on the container edge, so its tick label
    // overflows. Bars are inset already.
    const margin =
        chart === 'bar'
            ? { top: 4, right: 4, bottom: 0, left: 0 }
            : { top: 4, right: isMobile ? 16 : 24, bottom: 0, left: 0 }

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
                tickFormatter={(value) => label(String(value))}
                interval={interval}
                minTickGap={isMobile ? 24 : 12}
            />
            <YAxis
                {...axis}
                width={isMobile ? 40 : 60}
                tickFormatter={(value) => formatMetric(Number(value), format, { compact: true })}
            />
            <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                labelFormatter={(value) => label(String(value))}
                formatter={(value) => [formatMetric(Number(value), format), '']}
                contentStyle={{ borderRadius: 8, border: 'none', fontSize: 12 }}
            />
        </>
    )

    return (
        <ResponsiveContainer width="100%" height="100%">
            {chart === 'bar' ? (
                <BarChart data={points} margin={margin}>
                    {common}
                    <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
            ) : chart === 'line' ? (
                <LineChart data={points} margin={margin}>
                    {common}
                    <Line dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
            ) : (
                <AreaChart data={points} margin={margin}>
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