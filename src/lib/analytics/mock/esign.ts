import { createMockSource } from './factory'

export const mockEsign = createMockSource({
    id: 'mock-esign',
    metrics: {
        'documents.sent': { format: 'number', aggregate: 'sum', base: 42, variance: 0.35, trendPerDay: 0.25, weekendDip: 0.7 },
        'documents.signed': { format: 'number', aggregate: 'sum', base: 34, variance: 0.35, trendPerDay: 0.22, weekendDip: 0.7 },
        'approvals.pending': { format: 'number', aggregate: 'mean', base: 11, variance: 0.4, weekendDip: 0.2 },
        'signing.avg_time': { format: 'duration', aggregate: 'mean', base: 6.4, variance: 0.25 },
        'signing.completion': { format: 'percent', aggregate: 'mean', base: 0.81, variance: 0.08 },
    },
    breakdowns: {
        'documents.status': [
            { label: 'Completed', weight: 34 },
            { label: 'Pending', weight: 11 },
            { label: 'Viewed', weight: 7 },
            { label: 'Declined', weight: 2 },
            { label: 'Expired', weight: 1 },
        ],
    },
    ranked: {
        'signers.top': {
            base: 1.4,
            labels: [
                'Andi Pratama', 'Siti Rahmawati', 'Budi Santoso', 'Dewi Lestari',
                'Rizky Hidayat', 'Putri Anggraini', 'Agus Wijaya', 'Nadia Safitri',
                'Fajar Nugroho', 'Maya Kusuma', 'Hendra Gunawan', 'Ratna Sari',
            ],
            meta: label => ({ department: label.length % 2 ? 'Legal' : 'Finance' }),
        },
    },
})