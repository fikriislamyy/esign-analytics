import Link from 'next/link'
import { RANGE_PRESETS, type RangeId } from '@/lib/analytics/range'

const ON = 'rounded-lg border border-indigo-500 px-2.5 py-1 text-indigo-500'
const OFF = 'rounded-lg border border-neutral-700 px-2.5 py-1 text-neutral-400'

export function RangePicker({
  packId,
  current,
}: {
  packId: string
  current: RangeId
}) {
  return (
    <nav className="flex flex-wrap gap-2 text-xs">
      {RANGE_PRESETS.map((p) => {
        const href = '/?pack=' + packId + '&range=' + p.id
        return (
          <Link key={p.id} href={href} className={p.id === current ? ON : OFF}>
            {p.label}
          </Link>
        )
      })}
    </nav>
  )
}