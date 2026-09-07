import type { DashboardPack } from '../pack-types'

export const esignPack: DashboardPack = {
    id: 'esign',
    label: 'Document Signing',
    sourceId: 'mock-esign',
    kpis: [
        { metric: 'documents.sent', label: 'Documents Sent', format: 'number' },
        { metric: 'documents.signed', label: 'Signed', format: 'number' },
        { metric: 'signing.avg_time', label: 'Avg. Sign Time', format: 'duration', goodDirection: 'down' },
        { metric: 'signing.completion', label: 'Completion Rate', format: 'percent' },
    ],
    widgets: [
        { type: 'series', metric: 'documents.signed', title: 'Signing Volume', chart: 'area' },
        { type: 'breakdown', metric: 'documents.status', title: 'Status Mix', chart: 'donut' },
        { type: 'ranked', metric: 'signers.top', title: 'Top Signers', limit: 10, valueLabel: 'Documents' },
    ],
}

export const ecommercePack: DashboardPack = {
    id: 'ecommerce',
    label: 'E-Commerce',
    sourceId: 'mock-ecommerce',
    kpis: [
        { metric: 'revenue.gross', label: 'Gross Revenue', format: 'currency' },
        { metric: 'orders.placed', label: 'Orders', format: 'number' },
        { metric: 'orders.avg_value', label: 'Avg. Order', format: 'currency' },
        { metric: 'cart.abandonment', label: 'Cart Abandon', format: 'percent', goodDirection: 'down' },
    ],
    widgets: [
        { type: 'series', metric: 'revenue.gross', title: 'Revenue', chart: 'area' },
        { type: 'breakdown', metric: 'orders.status', title: 'Order Status', chart: 'donut' },
        { type: 'ranked', metric: 'products.top', title: 'Top Products', limit: 10, valueLabel: 'Units' },
    ],
}

export const packs = [esignPack, ecommercePack] as const
export const defaultPack = esignPack