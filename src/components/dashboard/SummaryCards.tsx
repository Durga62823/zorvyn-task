import type { Transaction } from '../../types/finance'
import { getSummaryMetrics } from '../../utils/financeAnalytics'
import { formatCurrency } from '../../utils/formatters'

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const summary = getSummaryMetrics(transactions)

  const cards = [
    {
      label: 'Total balance',
      value: formatCurrency(summary.balance),
      tone: summary.balance >= 0 ? 'text-emerald-600' : 'text-rose-600',
    },
    {
      label: 'Income',
      value: formatCurrency(summary.income),
      tone: 'text-emerald-600',
    },
    {
      label: 'Expenses',
      value: formatCurrency(summary.expenses),
      tone: 'text-rose-600',
    },
  ]

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className="stagger rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
          style={{ animationDelay: `${120 + index * 80}ms` }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {card.label}
          </p>
          <p className={`mt-3 text-2xl font-bold ${card.tone}`}>{card.value}</p>
        </article>
      ))}

      <article
        className="stagger rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
        style={{ animationDelay: '360ms' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Active records
        </p>
        <p className="mt-3 text-2xl font-bold text-[var(--text-strong)]">
          {summary.transactionCount}
        </p>
      </article>
    </section>
  )
}
