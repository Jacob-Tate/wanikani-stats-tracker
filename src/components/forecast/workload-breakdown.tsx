import type { WorkloadBreakdown } from '@/lib/calculations/workload-forecast'
import { InfoTooltip } from '@/components/shared/info-tooltip'

interface WorkloadBreakdownProps {
  breakdown: WorkloadBreakdown | null
  isLoading: boolean
  forecastDays: number
}

export function WorkloadBreakdown({ breakdown, isLoading, forecastDays }: WorkloadBreakdownProps) {
  if (isLoading) {
    return (
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-sm">
        <div className="h-6 bg-paper-300 dark:bg-ink-300 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-8 bg-paper-300 dark:bg-ink-300 rounded animate-pulse" />
          <div className="h-8 bg-paper-300 dark:bg-ink-300 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (!breakdown) return null

  const total = breakdown.fromExisting + breakdown.fromNewLessons

  if (total === 0) {
    return (
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-lg font-display font-semibold text-ink-100 dark:text-paper-100">
            Workload Breakdown
          </h2>
          <InfoTooltip content="Shows the source of your forecasted reviews. 'Existing Items' = reviews from things already in your queue. 'New Lessons' = all reviews generated from lessons you'll do (starting tomorrow), including same-day reviews at 4h and 8h intervals, plus all future reviews as items progress through SRS stages." />
        </div>
        <p className="text-center text-ink-400 dark:text-paper-300">
          No reviews projected in the next {forecastDays} days
        </p>
      </div>
    )
  }

  return (
    <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <h2 className="text-lg font-display font-semibold text-ink-100 dark:text-paper-100">
          Workload Breakdown
        </h2>
        <InfoTooltip content="Shows the source of your forecasted reviews. 'Existing Items' = reviews from things already in your queue. 'New Lessons' = all reviews generated from lessons you'll do (starting tomorrow), including same-day reviews at 4h and 8h intervals, plus all future reviews as items progress through SRS stages." />
      </div>

      <div className="space-y-5">
        {/* Existing items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-100 dark:text-paper-100">
              Existing Items
            </span>
            <span className="text-sm font-semibold text-ink-100 dark:text-paper-100 tabular-nums">
              {breakdown.fromExisting.toLocaleString()} ({breakdown.existingPercentage}%)
            </span>
          </div>
          <div className="h-3 bg-paper-300 dark:bg-ink-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-patina-500 dark:bg-patina-400 rounded-full transition-all duration-slow ease-out"
              style={{ width: `${breakdown.existingPercentage}%` }}
            />
          </div>
        </div>

        {/* New lessons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-ink-100 dark:text-paper-100">
              New Lessons
            </span>
            <span className="text-sm font-semibold text-ink-100 dark:text-paper-100 tabular-nums">
              {breakdown.fromNewLessons.toLocaleString()} ({breakdown.newLessonsPercentage}%)
            </span>
          </div>
          <div className="h-3 bg-paper-300 dark:bg-ink-300 rounded-full overflow-hidden">
            <div
              className="h-full bg-patina-300 dark:bg-patina-600 rounded-full transition-all duration-slow ease-out"
              style={{ width: `${breakdown.newLessonsPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-paper-300 dark:border-ink-300">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink-400 dark:text-paper-300">
            Total Reviews ({forecastDays} days)
          </span>
          <span className="text-lg font-bold text-ink-100 dark:text-paper-100 tabular-nums">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
