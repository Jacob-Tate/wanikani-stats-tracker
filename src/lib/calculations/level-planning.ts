import type { Subject } from '../api/types'

interface LevelPlanInput {
  subjects: Subject[]
  targetLevel: number
  radicalDays: number
  kanjiDays: number
}

export interface DayPlan {
  day: number
  radicals: number
  kanji: number
  vocab: number
  totalLessons: number
  radicalsNote: string
  kanjiNote: string
  note: string
  isLevelUpDay: boolean
}

export interface LevelPlan {
  targetLevel: number
  radicalCount: number
  kanjiCount: number
  unlockedKanjiCount: number
  lockedKanjiCount: number
  vocabCount: number
  currentLevelTotal: number
  schedule: DayPlan[]
}

/**
 * Calculates a day-by-day study plan for a WaniKani level.
 *
 * Strategy:
 * - Day 1: Do all radicals
 * - Days 1 through radicalDays: Spread initially unlocked kanji
 * - Day radicalDays: Do all newly unlocked kanji (when radicals reach Guru)
 * - This ensures all kanji reach Guru on the same day (fastest possible)
 * - Throughout all days: Distribute vocab from previous level
 * - Goal: Finish all vocab from previous level when current level completes
 */
export function calculateLevelPlan(input: LevelPlanInput): LevelPlan {
  const { subjects, targetLevel, radicalDays, kanjiDays } = input

  // Get items for the target level
  const targetLevelSubjects = subjects.filter(s => s.level === targetLevel)

  const radicalCount = targetLevelSubjects.filter(s =>
    'amalgamation_subject_ids' in s && 'character_images' in s
  ).length

  // Get all kanji for this level and determine which are locked
  const allKanji = targetLevelSubjects.filter(s =>
    'amalgamation_subject_ids' in s && 'characters' in s && 'component_subject_ids' in s && 'readings' in s
  )

  // Separate kanji into unlocked (available immediately) and locked (need radicals to Guru)
  // For simplicity, we'll assume that approximately 50% of kanji are locked behind radicals
  // In reality, this varies by level, but this is a reasonable approximation for planning
  const halfwayPoint = Math.floor(allKanji.length / 2)
  const unlockedKanjiCount = halfwayPoint
  const lockedKanjiCount = allKanji.length - halfwayPoint
  const kanjiCount = allKanji.length

  // Count vocab from previous level
  const prevLevel = Math.max(1, targetLevel - 1)
  const vocabCount = subjects.filter(s =>
    s.level === prevLevel &&
    'characters' in s &&
    'component_subject_ids' in s &&
    'context_sentences' in s
  ).length

  const totalDays = radicalDays + kanjiDays
  const currentLevelTotal = radicalCount + kanjiCount

  // Build the schedule
  const schedule: DayPlan[] = []

  // Distribute vocab evenly across all days
  const vocabPerDay = vocabCount > 0 ? Math.ceil(vocabCount / totalDays) : 0
  let remainingVocab = vocabCount

  // Day 1: All radicals + first batch of unlocked kanji (if any)
  const unlockedKanjiPerDay = radicalDays > 0 ? Math.floor(unlockedKanjiCount / radicalDays) : unlockedKanjiCount
  const unlockedKanjiRemainder = radicalDays > 0 ? unlockedKanjiCount % radicalDays : 0
  let remainingUnlockedKanji = unlockedKanjiCount

  const day1UnlockedKanji = radicalDays > 0
    ? Math.min(unlockedKanjiPerDay + (1 <= unlockedKanjiRemainder ? 1 : 0), remainingUnlockedKanji)
    : 0
  remainingUnlockedKanji -= day1UnlockedKanji

  const day1Vocab = Math.min(vocabPerDay, remainingVocab)
  remainingVocab -= day1Vocab

  schedule.push({
    day: 1,
    radicals: radicalCount,
    kanji: day1UnlockedKanji,
    vocab: day1Vocab,
    totalLessons: radicalCount + day1UnlockedKanji + day1Vocab,
    radicalsNote: 'All radicals',
    kanjiNote: day1UnlockedKanji > 0 ? 'Initially unlocked' : '',
    note: day1UnlockedKanji > 0
      ? 'Start all radicals and initially unlocked kanji'
      : 'Start all radicals to unlock kanji',
    isLevelUpDay: false,
  })

  // Days 2 through radicalDays: Continue spreading unlocked kanji
  for (let day = 2; day <= radicalDays; day++) {
    const kanjiForDay = day <= unlockedKanjiRemainder
      ? Math.min(unlockedKanjiPerDay + 1, remainingUnlockedKanji)
      : Math.min(unlockedKanjiPerDay, remainingUnlockedKanji)
    remainingUnlockedKanji -= kanjiForDay

    const vocabForDay = Math.min(vocabPerDay, remainingVocab)
    remainingVocab -= vocabForDay

    const isGuruDay = day === radicalDays
    const isLevelUpDay = day === totalDays && radicalDays === totalDays

    let note = ''
    if (isGuruDay && lockedKanjiCount > 0) {
      note = `Radicals reach Guru today, unlocking ${lockedKanjiCount} kanji`
    }
    if (isLevelUpDay) {
      note = 'All kanji reach Guru today - Level Up!'
    }

    // On the radical Guru day, also add all the locked kanji
    const lockedKanjiForDay = isGuruDay ? lockedKanjiCount : 0

    schedule.push({
      day,
      radicals: 0,
      kanji: kanjiForDay + lockedKanjiForDay,
      vocab: vocabForDay,
      totalLessons: kanjiForDay + lockedKanjiForDay + vocabForDay,
      radicalsNote: '',
      kanjiNote: lockedKanjiForDay > 0
        ? `${kanjiForDay} unlocked + ${lockedKanjiForDay} newly available`
        : kanjiForDay > 0 ? 'Initially unlocked' : '',
      note,
      isLevelUpDay,
    })
  }

  // Days after radicalDays: Just vocab (all kanji are done)
  for (let day = radicalDays + 1; day <= totalDays; day++) {
    const vocabForDay = Math.min(vocabPerDay, remainingVocab)
    remainingVocab -= vocabForDay

    const isLevelUpDay = day === totalDays

    schedule.push({
      day,
      radicals: 0,
      kanji: 0,
      vocab: vocabForDay,
      totalLessons: vocabForDay,
      radicalsNote: '',
      kanjiNote: '',
      note: isLevelUpDay ? 'All kanji reach Guru today - Level Up!' : '',
      isLevelUpDay,
    })
  }

  // If there's remaining vocab (due to rounding), add it to the last day
  if (remainingVocab > 0) {
    const lastDay = schedule[schedule.length - 1]
    lastDay.vocab += remainingVocab
    lastDay.totalLessons += remainingVocab
  }

  return {
    targetLevel,
    radicalCount,
    kanjiCount,
    unlockedKanjiCount,
    lockedKanjiCount,
    vocabCount,
    currentLevelTotal,
    schedule,
  }
}
