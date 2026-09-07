import { NextResponse } from 'next/server'
import { getSource } from '@/lib/analytics/registry'

export async function GET() {
  const range = { from: new Date('2026-06-01'), to: new Date('2026-08-31') }

  const cases = [
    { src: 'mock-esign', metrics: ['documents.sent', 'signing.completion', 'signing.avg_time'], breakdown: 'documents.status', ranked: 'signers.top' },
    { src: 'mock-ecommerce', metrics: ['orders.placed', 'revenue.gross', 'cart.abandonment'], breakdown: 'orders.status', ranked: 'products.top' },
  ]

  const out: Record<string, unknown> = {}
  for (const c of cases) {
    const s = getSource(c.src)
    out[c.src] = {
      metrics: await s.getMetrics(c.metrics, range),
      series: (await s.getSeries(c.metrics[0], range, 'week')).points.slice(0, 3),
      breakdown: await s.getBreakdown(c.breakdown, range),
      ranked: await s.getRanked(c.ranked, range, 3),
    }
  }
  return NextResponse.json(out)
}
