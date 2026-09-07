import { Download } from 'lucide-react'

const CLASSES =
  'inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200'

export function ExportButton({
  packId,
  rangeId,
}: {
  packId: string
  rangeId: string
}) {
  const href = '/api/export?pack=' + packId + '&range=' + rangeId

  return (
    <a href={href} download className={CLASSES}>
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </a>
  )
}
