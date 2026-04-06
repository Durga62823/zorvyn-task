import clsx from 'clsx'
import type { Transaction } from '../../types/finance'
import { useDashboardStore } from '../../store/useDashboardStore'
import { getActionRecommendations } from '../../utils/financeAnalytics'

interface ActionPlanPanelProps {
  transactions: Transaction[]
}

export function ActionPlanPanel({ transactions }: ActionPlanPanelProps) {
  const budgets = useDashboardStore((state) => state.budgets)
  const filters = useDashboardStore((state) => state.filters)
  const recommendations = getActionRecommendations(transactions, budgets, filters.month)

  const copyChecklist = async () => {
    const text = recommendations
      .map(
        (recommendation) =>
          `P${recommendation.priority} - ${recommendation.title}: ${recommendation.detail}`,
      )
      .join('\n')

    if (!navigator.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard failures are non-blocking for dashboard usage.
    }
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">Action plan</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Personalized, data-driven recommendations prioritized for next actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void copyChecklist()
          }}
          className="control-chip rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-strong)]"
        >
          Copy checklist
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {recommendations.map((recommendation) => (
          <article
            key={recommendation.id}
            className={clsx(
              'rounded-xl border px-4 py-3',
              recommendation.impact === 'high' &&
                'border-[var(--negative)]/45 bg-[var(--negative)]/10 text-[var(--text-strong)]',
              recommendation.impact === 'medium' &&
                'border-[var(--chart-c3)]/60 bg-[var(--chart-c3)]/14 text-[var(--text-strong)]',
              recommendation.impact === 'low' &&
                'border-[var(--positive)]/45 bg-[var(--positive)]/10 text-[var(--text-strong)]',
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
              Priority {recommendation.priority}
            </p>
            <h3 className="mt-2 text-sm font-semibold leading-snug">{recommendation.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{recommendation.detail}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
