import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

interface InfoTooltipProps {
  content: string
  className?: string
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        tooltipRef.current &&
        buttonRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isVisible])

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 text-ink-400 dark:text-paper-300 hover:text-ink-100 dark:hover:text-paper-100 transition-smooth focus:outline-none focus:ring-2 focus:ring-vermillion-500/20 rounded-full"
        aria-label="More information"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-ink-100 dark:bg-paper-100 text-paper-100 dark:text-ink-100 text-xs rounded-lg shadow-lg border border-ink-200 dark:border-paper-200"
          role="tooltip"
        >
          {content}
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-ink-100 dark:border-t-paper-100" />
        </div>
      )}
    </div>
  )
}
