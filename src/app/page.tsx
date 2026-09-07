import Link from 'next/link'
import { ExportButton } from '@/components/controls/ExportButton'
import { RangePicker } from '@/components/controls/RangePicker'
import { KpiCard } from '@/components/kpi/KpiCard'
import { ReportsSection } from '@/components/reports/ReportsSection'
import { Widget } from '@/components/widgets/Widget'
import { ecommercePack, esignPack } from '@/lib/analytics/packs'
import {
  DEFAULT_RANGE,
  bucketFor,
  isRangeId,
  resolveRange,
} from '@/lib/analytics/range'
import { getSource } from '@/lib/analytics/registry'

const TAB_ON = 'rounded-lg border border-indigo-500 px-3 py-1.5 text-indigo-500'
const TAB_OFF = 'rounded-lg border border-neutral-700 px-3 py-1.5'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string; range?: string }>
}) {
  const params = await searchParams
  const pack = params.pack === 'ecommerce' ? ecommercePack : esignPack
  const rangeId = isRangeId(params.range) ? params.range : DEFAULT_RANGE

  const source = getSource(pack.sourceId)
  const range = resolveRange(rangeId)
  const bucket = bucketFor(rangeId)

  const metricIds = pack.kpis.map((k) => k.metric)
  const metrics = await source.getMetrics(metricIds, range)
  const byId = new Map(metrics.map((m) => [m.id, m]))

  const widgets = pack.widgets.map((w) => {
    const kpi = pack.kpis.find((k) => k.metric === w.metric)
    return (
      <Widget
        key={w.type + ':' + w.metric}
        config={w}
        source={source}
        range={range}
        bucket={bucket}
        format={kpi ? kpi.format : 'number'}
      />
    )
  })

  const esignClass = pack.id === 'esign' ? TAB_ON : TAB_OFF
  const ecomClass = pack.id === 'ecommerce' ? TAB_ON : TAB_OFF

  const cards = pack.kpis.map((k) => {
    const m = byId.get(k.metric)
    if (!m) return null
    return <KpiCard key={k.metric} config={k} metric={m} />
  })

  const fmt = (d: Date) =>
    d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-lg font-semibold">{pack.label}</h1>
      <p className="mt-0.5 text-xs text-neutral-500">
        {fmt(range.from)} to {fmt(range.to)}
      </p>

      <nav className="mt-3 flex gap-2 text-sm">
        <Link href={'/?pack=esign&range=' + rangeId} className={esignClass}>
          E-Sign
        </Link>
        <Link href={'/?pack=ecommerce&range=' + rangeId} className={ecomClass}>
          E-Commerce
        </Link>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RangePicker packId={pack.id} current={rangeId} />
        <ExportButton packId={pack.id} rangeId={rangeId} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{cards}</div>

      <ReportsSection widgets={widgets} />
    </main>
  )
}
