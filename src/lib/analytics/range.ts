import type { Bucket, DateRange } from './types'

export const RANGE_PRESETS = [
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
  { id: '12m', label: '12 months', days: 365 },
] as const

export type RangeId = (typeof RANGE_PRESETS)[number]['id']

export const DEFAULT_RANGE: RangeId = '90d'

export function isRangeId(v: string | undefined): v is RangeId {
  return RANGE_PRESETS.some((p) => p.id === v)
}

/**
 * Anchored to a fixed "today" so the mock demo is reproducible and the
 * seeded RNG returns identical values on server and client.
 * Swap for `new Date()` when a real backend is wired up.
 */
export const TODAY = new Date('2026-09-07T00:00:00.000Z')

export function resolveRange(id: RangeId): DateRange {
  const preset = RANGE_PRESETS.find((p) => p.id === id) ?? RANGE_PRESETS[2]
  const to = new Date(TODAY)
  to.setUTCHours(0, 0, 0, 0)
  const from = new Date(to)
  from.setUTCDate(from.getUTCDate() - (preset.days - 1))
  return { from, to }
}

/** Keeps series charts at a readable point count across range lengths. */
export function bucketFor(id: RangeId): Bucket {
  if (id === '7d' || id === '30d') return 'day'
  if (id === '90d') return 'week'
  return 'month'
}