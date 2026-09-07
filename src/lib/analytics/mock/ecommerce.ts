import { createMockSource } from './factory'

export const mockEcommerce = createMockSource({
    id: 'mock-ecommerce',
    metrics: {
        'orders.placed': { format: 'number', aggregate: 'sum', base: 128, variance: 0.4, trendPerDay: 0.9, weekendDip: -0.25 },
        'revenue.gross': { format: 'currency', aggregate: 'sum', base: 8_400_000, variance: 0.45, trendPerDay: 40_000, weekendDip: -0.25 },
        'cart.abandonment': { format: 'percent', aggregate: 'mean', base: 0.68, variance: 0.06 },
        'orders.avg_value': { format: 'currency', aggregate: 'mean', base: 65_000, variance: 0.2 },
    },
    breakdowns: {
        'orders.status': [
            { label: 'Delivered', weight: 96 },
            { label: 'Shipped', weight: 18 },
            { label: 'Processing', weight: 9 },
            { label: 'Cancelled', weight: 4 },
            { label: 'Refunded', weight: 2 },
        ],
    },
    ranked: {
        'products.top': {
            base: 3.2,
            labels: [
                'Kemeja Linen Pria', 'Tas Kanvas Tote', 'Sepatu Sneakers Putih',
                'Jam Tangan Minimalis', 'Dompet Kulit', 'Kacamata Hitam',
                'Topi Baseball', 'Sandal Kulit', 'Ransel Laptop', 'Ikat Pinggang',
            ],
            meta: label => ({ category: label.includes('Sepatu') || label.includes('Sandal') ? 'Footwear' : 'Accessories' }),
        },
    },
})