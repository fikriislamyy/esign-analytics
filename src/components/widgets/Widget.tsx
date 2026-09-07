import { BreakdownChart } from '@/components/charts/BreakdownChart'
import { ChartFrame } from '@/components/charts/ChartFrame'
import { RankedList } from '@/components/charts/RankedList'
import { SeriesChart } from '@/components/charts/SeriesChart'
import type { WidgetConfig } from '@/lib/analytics/pack-types'
import type {
    AnalyticsSource,
    Bucket,
    DateRange,
    MetricFormat,
} from '@/lib/analytics/types'

export async function Widget({
    config,
    source,
    range,
    bucket = 'week',
    format = 'number',
}: {
    config: WidgetConfig
    source: AnalyticsSource
    range: DateRange
    bucket?: Bucket
    format?: MetricFormat
}) {
    if (config.type === 'series') {
        const s = await source.getSeries(config.metric, range, bucket)
        return (
            <ChartFrame title={config.title}>
                <SeriesChart
                    points={s.points}
                    format={format}
                    chart={config.chart}
                    bucket={bucket}
                />
            </ChartFrame>
        )
    }

    if (config.type === 'breakdown') {
        const b = await source.getBreakdown(config.metric, range)
        return (
            <ChartFrame title={config.title}>
                <BreakdownChart slices={b.slices} />
            </ChartFrame>
        )
    }

    const rows = await source.getRanked(config.metric, range, config.limit)
    return (
        <ChartFrame title={config.title} fixedHeight={false}>
            <RankedList rows={rows} valueLabel={config.valueLabel} />
        </ChartFrame>
    )
}