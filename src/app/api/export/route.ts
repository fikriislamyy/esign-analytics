import { buildCsv } from '@/lib/analytics/export'
import { ecommercePack, esignPack } from '@/lib/analytics/packs'
import {
  DEFAULT_RANGE,
  bucketFor,
  isRangeId,
  resolveRange,
} from '@/lib/analytics/range'
import { getSource } from '@/lib/analytics/registry'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const pack = searchParams.get('pack') === 'ecommerce' ? ecommercePack : esignPack
  const rangeParam = searchParams.get('range') ?? undefined
  const rangeId = isRangeId(rangeParam) ? rangeParam : DEFAULT_RANGE

  const source = getSource(pack.sourceId)
  const range = resolveRange(rangeId)
  const csv = await buildCsv(pack, source, range, bucketFor(rangeId))

  const filename = pack.id + '-' + rangeId + '-' + range.to.toISOString().slice(0, 10) + '.csv'

  return new Response('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + filename + '"',
      'Cache-Control': 'no-store',
    },
  })
}