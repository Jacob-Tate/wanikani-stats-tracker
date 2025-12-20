import { format } from 'date-fns'
import type { WorkloadMetrics } from '@/lib/calculations/workload-forecast'
import { cn } from '@/lib/utils/cn'
import { InfoTooltip } from '@/components/shared/info-tooltip'

interface ForecastMetricsProps {
  metrics: WorkloadMetrics | null
  isLoading: boolean
  forecastDays: number
  className?: string
}

export function ForecastMetrics({ metrics, isLoading, forecastDays, className }: ForecastMetricsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-4 shadow-sm"
          >
            <div className="h-4 bg-paper-300 dark:bg-ink-300 rounded animate-pulse mb-2" />
            <div className="h-8 bg-paper-300 dark:bg-ink-300 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 gap-4', className)}>
      {/* Peak Day */}
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-vermillion-500 p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-sm text-ink-400 dark:text-paper-300">Peak Day</p>
          <InfoTooltip content="The day when you'll have the most reviews. If this number is too high, slow down on lessons." />
        </div>
        <p className="text-2xl font-display font-bold text-vermillion-500 mb-1">
          {metrics.peakDay.count}
        </p>
        <p className="text-xs text-ink-400 dark:text-paper-300">
          {format(metrics.peakDay.date, 'MMM d')} (Day {metrics.peakDay.dayIndex + 1})
        </p>
      </div>

      {/* Average Daily */}
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-sm text-ink-400 dark:text-paper-300">Average Daily</p>
          <InfoTooltip content="How many reviews you'll do per day on average. Most people can comfortably handle 100-150 per day." />
        </div>
        <p className="text-2xl font-display font-bold text-ink-100 dark:text-paper-100 mb-1">
          {metrics.averageDaily}
        </p>
        <p className="text-xs text-ink-400 dark:text-paper-300">reviews per day</p>
      </div>

      {/* Stabilization */}
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-sm text-ink-400 dark:text-paper-300">Stabilization</p>
          <InfoTooltip content="When your daily reviews become more predictable and consistent. If this doesn't show up, your workload is still growing." />
        </div>
        {metrics.stabilizationDay ? (
          <>
            <p className="text-2xl font-display font-bold text-patina-600 dark:text-patina-500 mb-1">
              {format(metrics.stabilizationDay.date, 'MMM d')}
            </p>
            <p className="text-xs text-ink-400 dark:text-paper-300">
              Day {metrics.stabilizationDay.dayIndex + 1} (workload settles)
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-display font-bold text-ink-300 dark:text-paper-300 mb-1">
              —
            </p>
            <p className="text-xs text-ink-400 dark:text-paper-300">
              No stabilization in {forecastDays} days
            </p>
          </>
        )}
      </div>

      {/* Total Reviews */}
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-4 shadow-sm">
        <div className="flex items-center gap-1 mb-1">
          <p className="text-sm text-ink-400 dark:text-paper-300">Total ({forecastDays} Days)</p>
          <InfoTooltip content="All the reviews you'll do during this time period. More lessons = more reviews." />
        </div>
        <p className="text-2xl font-display font-bold text-ink-100 dark:text-paper-100 mb-1">
          {metrics.totalReviews.toLocaleString()}
        </p>
        <p className="text-xs text-ink-400 dark:text-paper-300">
          reviews over forecast period
        </p>
      </div>
    </div>
  )
}
