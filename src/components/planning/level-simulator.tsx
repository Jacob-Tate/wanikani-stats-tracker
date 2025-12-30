import { useState, useMemo } from 'react'
import { useUser, useSubjects } from '@/lib/api/queries'
import { calculateLevelPlan } from '@/lib/calculations/level-planning'
import { Calculator, Calendar, Target } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export function LevelSimulator() {
  const { data: user } = useUser()
  const { data: subjects } = useSubjects()

  // Default to current level
  const [targetLevel, setTargetLevel] = useState(user?.level ?? 1)
  const [radicalDays, setRadicalDays] = useState(4)
  const [kanjiDays, setKanjiDays] = useState(4)

  // Calculate the plan whenever inputs change
  const plan = useMemo(() => {
    if (!subjects) return null

    return calculateLevelPlan({
      subjects,
      targetLevel,
      radicalDays,
      kanjiDays,
    })
  }, [subjects, targetLevel, radicalDays, kanjiDays])

  if (!user || !subjects) {
    return (
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-8 shadow-md">
        <div className="h-6 bg-paper-300 dark:bg-ink-300 rounded animate-pulse mb-8" />
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-paper-300 dark:bg-ink-300 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const totalDays = radicalDays + kanjiDays

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Calculator className="w-6 h-6 text-vermillion-500" />
          <h2 className="text-xl font-display font-semibold text-ink-100 dark:text-paper-100">
            Level Progression Simulator
          </h2>
        </div>
        <p className="text-ink-400 dark:text-paper-300 mb-6">
          Plan your WaniKani level progression by simulating your daily study schedule.
          This helps you optimize your lessons to complete all previous level vocabulary
          alongside your current level radicals and kanji.
        </p>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Target Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-100 dark:text-paper-100">
              Target Level
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={targetLevel}
              onChange={(e) => setTargetLevel(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-3 bg-paper-100 dark:bg-ink-100 border border-paper-300 dark:border-ink-300 rounded-md text-ink-100 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
            />
            <p className="text-xs text-ink-400 dark:text-paper-300">
              Current: Level {user.level}
            </p>
          </div>

          {/* Radical Days */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-100 dark:text-paper-100">
              Radical Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={radicalDays}
              onChange={(e) => setRadicalDays(Math.max(1, Math.min(14, parseInt(e.target.value) || 4)))}
              className="w-full px-4 py-3 bg-paper-100 dark:bg-ink-100 border border-paper-300 dark:border-ink-300 rounded-md text-ink-100 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
            />
            <p className="text-xs text-ink-400 dark:text-paper-300">
              Days until radicals reach Guru
            </p>
          </div>

          {/* Kanji Days */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink-100 dark:text-paper-100">
              Kanji Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="14"
              value={kanjiDays}
              onChange={(e) => setKanjiDays(Math.max(1, Math.min(14, parseInt(e.target.value) || 4)))}
              className="w-full px-4 py-3 bg-paper-100 dark:bg-ink-100 border border-paper-300 dark:border-ink-300 rounded-md text-ink-100 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-vermillion-500"
            />
            <p className="text-xs text-ink-400 dark:text-paper-300">
              Days until kanji reach Guru
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {plan && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-vermillion-500" />
              <span className="text-sm font-medium text-ink-400 dark:text-paper-300">
                Total Duration
              </span>
            </div>
            <p className="text-3xl font-semibold text-ink-100 dark:text-paper-100">
              {totalDays} days
            </p>
            <p className="text-xs text-ink-400 dark:text-paper-300 mt-1">
              {radicalDays}d radicals + {kanjiDays}d kanji
            </p>
          </div>

          <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-patina-500" />
              <span className="text-sm font-medium text-ink-400 dark:text-paper-300">
                Current Level Kanji
              </span>
            </div>
            <p className="text-3xl font-semibold text-ink-100 dark:text-paper-100">
              {plan.kanjiCount}
            </p>
            <p className="text-xs text-ink-400 dark:text-paper-300 mt-1">
              {plan.unlockedKanjiCount} unlocked + {plan.lockedKanjiCount} locked
            </p>
          </div>

          <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-6 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-ochre" />
              <span className="text-sm font-medium text-ink-400 dark:text-paper-300">
                Previous Level Vocab
              </span>
            </div>
            <p className="text-3xl font-semibold text-ink-100 dark:text-paper-100">
              {plan.vocabCount}
            </p>
            <p className="text-xs text-ink-400 dark:text-paper-300 mt-1">
              From Level {Math.max(1, targetLevel - 1)}
            </p>
          </div>
        </div>
      )}

      {/* Day by Day Breakdown */}
      {plan && (
        <div className="bg-paper-200 dark:bg-ink-200 rounded-lg border border-paper-300 dark:border-ink-300 p-8 shadow-md">
          <h3 className="text-lg font-display font-semibold text-ink-100 dark:text-paper-100 mb-6">
            Day-by-Day Study Plan
          </h3>

          <div className="space-y-4">
            {plan.schedule.map((day, index) => (
              <div
                key={index}
                className={cn(
                  'border border-paper-300 dark:border-ink-300 rounded-lg p-5 transition-smooth',
                  day.isLevelUpDay
                    ? 'bg-vermillion-500/10 border-vermillion-500'
                    : 'bg-paper-100 dark:bg-ink-100'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold text-ink-100 dark:text-paper-100">
                      Day {day.day}
                    </span>
                    {day.isLevelUpDay && (
                      <span className="px-2 py-1 bg-vermillion-500 text-white text-xs font-medium rounded">
                        Level Up
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-ink-400 dark:text-paper-300">
                    {day.totalLessons} lessons
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Radicals */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-ink-400 dark:text-paper-300 uppercase">
                      Radicals
                    </div>
                    <div className="text-2xl font-semibold text-ink-100 dark:text-paper-100">
                      {day.radicals}
                    </div>
                    {day.radicals > 0 && (
                      <div className="text-xs text-ink-400 dark:text-paper-300">
                        {day.radicalsNote}
                      </div>
                    )}
                  </div>

                  {/* Kanji */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-ink-400 dark:text-paper-300 uppercase">
                      Kanji
                    </div>
                    <div className="text-2xl font-semibold text-ink-100 dark:text-paper-100">
                      {day.kanji}
                    </div>
                    {day.kanji > 0 && (
                      <div className="text-xs text-ink-400 dark:text-paper-300">
                        {day.kanjiNote}
                      </div>
                    )}
                  </div>

                  {/* Vocabulary */}
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-ink-400 dark:text-paper-300 uppercase">
                      Vocabulary
                    </div>
                    <div className="text-2xl font-semibold text-ink-100 dark:text-paper-100">
                      {day.vocab}
                    </div>
                    {day.vocab > 0 && (
                      <div className="text-xs text-ink-400 dark:text-paper-300">
                        Prev. level
                      </div>
                    )}
                  </div>
                </div>

                {day.note && (
                  <div className="mt-3 pt-3 border-t border-paper-300 dark:border-ink-300">
                    <p className="text-sm text-ink-400 dark:text-paper-300">
                      {day.note}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary Note */}
          <div className="mt-6 p-4 bg-patina-500/10 border border-patina-500 rounded-lg">
            <p className="text-sm text-ink-100 dark:text-paper-100">
              <span className="font-semibold">Strategy:</span> Complete all {plan.radicalCount} radicals on day 1.
              Spread {plan.unlockedKanjiCount} initially unlocked kanji over days 1-{radicalDays}.
              On day {radicalDays}, when radicals reach Guru, do all {plan.lockedKanjiCount} newly unlocked kanji.
              This ensures all kanji reach Guru on day {totalDays} simultaneously. Previous level vocabulary
              is distributed throughout to finish alongside level completion.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
