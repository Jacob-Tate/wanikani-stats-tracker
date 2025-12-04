/**
 * Filtering utilities for hidden items
 *
 * WaniKani can mark items as "hidden" when they're removed from the curriculum.
 * This creates two scenarios:
 * 1. Items hidden from curriculum (hidden_at on subjects)
 * 2. Items hidden from user's reviews (hidden on assignments/stats)
 *
 * Rules:
 * - Curriculum counts (what's available to learn) → exclude hidden
 * - User progress counts (what user accomplished) → include hidden if started
 * - Review forecasts (what will come up) → exclude hidden
 */

/**
 * Filters out subjects that are hidden from the curriculum
 *
 * Use for: "How many items are at this level?"
 *
 * Example: Level 13 has 14 radicals (excluding hidden)
 */
export function excludeHiddenSubjects<T extends { hidden_at: string | null }>(
  subjects: T[]
): T[] {
  return subjects.filter((subject) => subject.hidden_at === null)
}

/**
 * Filters out assignments that are hidden AND not started
 *
 * Use for: Progress tracking, items learned counts
 *
 * Logic:
 * - If user never started it and it's hidden → don't count it
 * - If user DID start it → count it (they did the work, they get credit)
 *
 * Example: User learned 15 Level 13 radicals (including 1 now-hidden)
 */
export function excludeHiddenUnstartedAssignments<
  T extends { hidden: boolean; started_at: string | null }
>(assignments: T[]): T[] {
  return assignments.filter((assignment) => {
    // If not hidden, always include
    if (!assignment.hidden) return true

    // If hidden but user started it, include (they did the work)
    if (assignment.started_at !== null) return true

    // Hidden and never started - exclude
    return false
  })
}

/**
 * Filters out assignments that are hidden from active reviews
 *
 * Use for: Available reviews, upcoming reviews, forecasts
 *
 * Logic: Hidden items don't show up in review queue anymore
 *
 * Example: 140 reviews available (excluding 10 hidden items)
 */
export function excludeHiddenFromReviews<T extends { hidden: boolean }>(
  assignments: T[]
): T[] {
  return assignments.filter((assignment) => !assignment.hidden)
}

/**
 * Filters out hidden review statistics
 *
 * Use for: Accuracy calculations, leech detection
 *
 * Logic: Don't calculate stats for items user doesn't review anymore
 */
export function excludeHiddenStats<T extends { hidden: boolean }>(stats: T[]): T[] {
  return stats.filter((stat) => !stat.hidden)
}

/**
 * Checks if a subject is hidden from curriculum
 */
export function isSubjectHidden(subject: { hidden_at: string | null }): boolean {
  return subject.hidden_at !== null
}

/**
 * Checks if an assignment is hidden from reviews
 */
export function isAssignmentHidden(assignment: { hidden: boolean }): boolean {
  return assignment.hidden
}
