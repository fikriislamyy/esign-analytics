import { KpiCard } from '@/components/kpi/KpiCard'
import { getSource } from '@/lib/analytics/registry'
import { esignPack, ecommercePack } from '@/lib/analytics/packs'
import { Widget } from '@/components/widgets/Widget'

export default async function Page({
  searchParams,
}: { searchParams: Promise<{ pack?: string }> }) {
  const { pack: packId } = await searchParams
  const pack = packId === 'ecommerce' ? ecommercePack : esignPack

  const source = getSource(pack.sourceId)
  const range = { from: new Date('2026-06-01'), to: new Date('2026-08-31') }
  const metrics = await source.getMetrics(pack.kpis.map(k => k.metric), range)
  const byId = new Map(metrics.map(m => [m.id, m]))

  return (
    <main className="mx-auto max-w-5xl p-4">
      <h1 className="text-lg font-semibold">{pack.label}</h1>
      <nav className="mt-3 flex gap-2 text-sm">
        <a href="/?pack=esign" className="rounded-lg border px-3 py-1.5">E-Sign</a>
        <a href="/?pack=ecommerce" className="rounded-lg border px-3 py-1.5">E-Commerce</a>
      </nav>
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {pack.kpis.map(k => {
          const m = byId.get(k.metric)
          return m ? <KpiCard key={k.metric} config={k} metric={m} /> : null
        })}
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {pack.widgets.map(w => (
          <Widget
            key={`${w.type}:${w.metric}`}
            config={w}
            source={source}
            range={range}
            format={pack.kpis.find(k => k.metric === w.metric)?.format ?? 'number'}
          />
        ))}
      </div>
    </main>
  )
}