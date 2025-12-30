import { useMemo } from 'react'
import { Modal, ModalClose } from '@/components/shared/modal'
import { useSubjects } from '@/lib/api/queries'
import type { ReviewStatistic, Subject } from '@/lib/api/types'

interface AccuracyItemsModalProps {
  isOpen: boolean
  onClose: () => void
  bucketLabel: string
  bucketRange: string
  items: ReviewStatistic[]
}

interface ItemWithSubject {
  stat: ReviewStatistic
  subject: (Subject & { id: number }) | null
  character: string
  meaning: string
  reading: string | null
}

export function AccuracyItemsModal({
  isOpen,
  onClose,
  bucketLabel,
  bucketRange,
  items,
}: AccuracyItemsModalProps) {
  const { data: subjects } = useSubjects()

  // Combine review stats with subject data
  const itemsWithSubjects = useMemo(() => {
    if (!subjects) return []

    const subjectMap = new Map<number, Subject & { id: number }>()
    subjects.forEach((subject) => {
      subjectMap.set(subject.id, subject)
    })

    const combined: ItemWithSubject[] = items
      .map((stat) => {
        const subject = subjectMap.get(stat.subject_id) || null

        // Get character
        let character = '?'
        if (subject) {
          if ('characters' in subject && subject.characters) {
            character = subject.characters
          }
        }

        // Get primary meaning
        let meaning = 'Unknown'
        if (subject?.meanings) {
          const primaryMeaning = subject.meanings.find((m) => m.primary)
          meaning = primaryMeaning?.meaning || subject.meanings[0]?.meaning || 'Unknown'
        }

        // Get primary reading (for kanji and vocabulary)
        let reading: string | null = null
        if (subject && 'readings' in subject && subject.readings) {
          const primaryReading = subject.readings.find((r) => r.primary)
          reading = primaryReading?.reading || subject.readings[0]?.reading || null
        }

        return {
          stat,
          subject,
          character,
          meaning,
          reading,
        }
      })
      .sort((a, b) => a.stat.percentage_correct - b.stat.percentage_correct)

    return combined
  }, [subjects, items])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <ModalClose onClose={onClose} />

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold text-ink-100 dark:text-paper-100 mb-1">
            {bucketLabel} ({bucketRange})
          </h2>
          <p className="text-sm text-ink-400 dark:text-paper-300">
            {itemsWithSubjects.length} items
          </p>
        </div>

        {/* Items list */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {itemsWithSubjects.map((item, idx) => {
            const totalReviews =
              item.stat.meaning_correct +
              item.stat.meaning_incorrect +
              item.stat.reading_correct +
              item.stat.reading_incorrect

            return (
              <div
                key={`${item.stat.subject_id}-${idx}`}
                className="flex items-center justify-between p-3 rounded-lg bg-paper-300/50 dark:bg-ink-300/50 hover:bg-paper-300 dark:hover:bg-ink-300 transition-smooth"
              >
                {/* Left side: Character and meaning */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="text-2xl font-japanese text-ink-100 dark:text-paper-100 w-10 text-center cursor-help"
                      title={item.reading || undefined}
                    >
                      {item.character}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-100 dark:text-paper-100 truncate">
                        {item.meaning}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-400 dark:text-paper-300">
                        <span className="capitalize">{item.stat.subject_type}</span>
                        {item.subject && 'level' in item.subject && (
                          <>
                            <span>•</span>
                            <span>Level {item.subject.level}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Stats */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-ink-100 dark:text-paper-100 tabular-nums">
                      {Math.round(item.stat.percentage_correct)}%
                    </div>
                    <div className="text-xs text-ink-400 dark:text-paper-300 tabular-nums">
                      {totalReviews} reviews
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state */}
        {itemsWithSubjects.length === 0 && (
          <div className="text-center py-12 text-ink-400 dark:text-paper-300">
            No items in this category
          </div>
        )}
      </div>
    </Modal>
  )
}
