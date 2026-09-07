import type { AnalyticsSource } from './types'
import { mockEsign } from './mock/esign'
import { mockEcommerce } from './mock/ecommerce'

const sources: Record<string, AnalyticsSource> = {
    'mock-esign': mockEsign,
    'mock-ecommerce': mockEcommerce,
    // 'laravel': laravelSource  ← added later, nothing else changes
}

export function getSource(id: string): AnalyticsSource {
    const s = sources[id]
    if (!s) throw new Error(`Unknown analytics source: ${id}`)
    return s
}