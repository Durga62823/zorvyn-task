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
      tone: summary.balance >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]',
    },
    {
      label: 'Income',
      value: formatCurrency(summary.income),
      tone: 'text-[var(--positive)]',
    },
    {
      label: 'Expenses',
      value: formatCurrency(summary.expenses),
      tone: 'text-[var(--negative)]',
    },
  ]

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className="summary-card stagger rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
          style={{ animationDelay: `${120 + index * 80}ms` }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {card.label}
          </p>
          <p className={`mt-3 text-2xl font-bold tracking-tight ${card.tone}`}>
            {card.value}
          </p>
        </article>
      ))}

      <article
        className="summary-card stagger rounded-[1.35rem] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--soft-shadow)]"
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
