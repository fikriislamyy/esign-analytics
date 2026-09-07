import { KpiCard } from '@/components/kpi/KpiCard'
import { ReportsSection } from '@/components/reports/ReportsSection'
import { Widget } from '@/components/widgets/Widget'
import { ecommercePack, esignPack } from '@/lib/analytics/packs'
import { getSource } from '@/lib/analytics/registry'

const TAB_BASE = 'rounded-lg border px-3 py-1.5'
const TAB_ON = 'rounded-lg border border-indigo-500 px-3 py-1.5 text-indigo-500'
const TAB_OFF = 'rounded-lg border border-neutral-700 px-3 py-1.5'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ pack?: string }>
}) {
  const params = await searchParams
  const pack = params.pack === 'ecommerce' ? ecommercePack : esignPack

  const source = getSource(pack.sourceId)
  const range = { from: new Date('2026-06-01'), to: new Date('2026-08-31') }

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

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-lg font-semibold">{pack.label}</h1>

      <nav className="mt-3 flex gap-2 text-sm">
        <a href="/?pack=esign" className={esignClass}>
          E-Sign
        </a>
        <a href="/?pack=ecommerce" className={ecomClass}>
          E-Commerce
        </a>
      </nav>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{cards}</div>

      <ReportsSection widgets={widgets} />
    </main>
  )
}
