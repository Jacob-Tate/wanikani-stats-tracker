// WaniKani SRS Interval Constants and Helper Functions

/**
 * WaniKani SRS stage intervals in hours
 * These represent the time until next review after a correct answer
 */
export const SRS_INTERVALS_HOURS: Record<number, number> = {
  1: 4, // Apprentice I -> II: 4 hours
  2: 8, // Apprentice II -> III: 8 hours
  3: 23, // Apprentice III -> IV: ~1 day (23 hours)
  4: 47, // Apprentice IV -> Guru I: ~2 days (47 hours)
  5: 168, // Guru I -> II: 1 week (168 hours)
  6: 336, // Guru II -> Master: 2 weeks (336 hours)
  7: 720, // Master -> Enlightened: ~1 month (720 hours / 30 days)
  8: 2880, // Enlightened -> Burned: ~4 months (2880 hours / 120 days)
}

/**
 * Get the interval in hours until next review for a given SRS stage
 * Returns 0 for stage 0 (initiate) and stage 9 (burned)
 */
export function getNextReviewInterval(srsStage: number): number {
  if (srsStage === 0 || srsStage === 9) return 0
  return SRS_INTERVALS_HOURS[srsStage] || 0
}

/**
 * Calculate the next SRS stage after a correct answer
 * Stage 9 (burned) remains at 9
 */
export function getNextStageOnCorrect(srsStage: number): number {
  return Math.min(srsStage + 1, 9)
}

/**
 * Calculate the next SRS stage after an incorrect answer
 * Based on WaniKani's penalty system:
 * - Apprentice (1-2): Drop to stage 1
 * - Apprentice (3-4): Drop by 1 stage
 * - Guru+ (5-8): Drop by 2 stages
 * - Burned (9): Drop to Apprentice IV (stage 4)
 */
export function getNextStageOnIncorrect(srsStage: number): number {
  if (srsStage <= 2) return 1
  if (srsStage <= 4) return srsStage - 1
  if (srsStage === 9) return 4 // Burned items go back to Apprentice IV
  return Math.max(srsStage - 2, 1) // Guru+ drops 2 stages
}

/**
 * Check if an SRS stage is active (not initiate or burned)
 */
export function isActiveStage(srsStage: number): boolean {
  return srsStage > 0 && srsStage < 9
}

/**
 * Get the SRS stage name
 */
export function getStageName(srsStage: number): string {
  if (srsStage === 0) return 'Initiate'
  if (srsStage >= 1 && srsStage <= 4) return 'Apprentice'
  if (srsStage >= 5 && srsStage <= 6) return 'Guru'
  if (srsStage === 7) return 'Master'
  if (srsStage === 8) return 'Enlightened'
  if (srsStage === 9) return 'Burned'
  return 'Unknown'
}
