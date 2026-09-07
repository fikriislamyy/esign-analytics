import { SwipeableReports } from './SwipeableReports'

export function ReportsSection({ widgets }: { widgets: React.ReactNode[] }) {
  return (
    <>
      {/* Mobile: swipeable, one report per screen */}
      <div className="mt-4 sm:hidden">
        <SwipeableReports>{widgets}</SwipeableReports>
      </div>

      {/* Desktop: grid */}
      <div className="mt-4 hidden gap-3 sm:grid lg:grid-cols-2">
        {widgets.map((w, i) => (
          <div key={i} className="contents">
            {w}
          </div>
        ))}
      </div>
    </>
  )
}