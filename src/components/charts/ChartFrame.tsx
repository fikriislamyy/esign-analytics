export function ChartFrame({
    title,
    children,
    fixedHeight = true,
    className = '',
}: {
    title: string
    children: React.ReactNode
    /** Charts need a fixed box for ResponsiveContainer. Lists should grow. */
    fixedHeight?: boolean
    className?: string
}) {
    return (
        <section
            className={`rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900 ${className}`}
        >
            <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
            <div className={fixedHeight ? 'mt-3 h-56 sm:h-64' : 'mt-3'}>{children}</div>
        </section>
    )
}