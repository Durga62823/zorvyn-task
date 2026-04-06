import clsx from 'clsx'
import type { Transaction } from '../../types/finance'
import { getInsights } from '../../utils/financeAnalytics'
import { EmptyState } from '../common/EmptyState'

interface InsightsPanelProps {
  transactions: Transaction[]
}

export function InsightsPanel({ transactions }: InsightsPanelProps) {
  const insights = getInsights(transactions)

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <h2 className="text-xl font-semibold text-[var(--text-strong)]">Insights</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Fast observations generated from visible transaction data.
      </p>

      <div className="mt-4 space-y-3">
        {insights.length === 0 ? (
          <EmptyState
            title="No insights available"
            description="Insights will appear once transactions are visible in the current view."
          />
        ) : (
          insights.map((insight, index) => (
            <article
              key={insight.title}
              className={clsx(
                'stagger rounded-xl border px-4 py-3',
                insight.tone === 'positive' &&
                  'border-[var(--positive)]/45 bg-[var(--positive)]/10 text-[var(--text-strong)]',
                insight.tone === 'neutral' &&
                  'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-strong)]',
                insight.tone === 'warning' &&
                  'border-[var(--chart-c3)]/60 bg-[var(--chart-c3)]/14 text-[var(--text-strong)]',
              )}
              style={{ animationDelay: `${120 + index * 100}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                {insight.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{insight.detail}</p>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
