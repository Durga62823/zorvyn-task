import { useState } from 'react'
import clsx from 'clsx'
import type { Transaction } from '../../types/finance'
import {
  getExpenseAnomalies,
  getForecastSnapshot,
  getMonthlyTrend,
  getSummaryMetrics,
} from '../../utils/financeAnalytics'
import {
  formatCurrency,
  formatSignedCurrency,
  formatTransactionDate,
} from '../../utils/formatters'
import { EmptyState } from '../common/EmptyState'

interface FinanceIntelligencePanelProps {
  transactions: Transaction[]
}

export function FinanceIntelligencePanel({
  transactions,
}: FinanceIntelligencePanelProps) {
  const [stressPercent, setStressPercent] = useState(10)

  const forecast = getForecastSnapshot(transactions)
  const anomalies = getExpenseAnomalies(transactions, 3)
  const summary = getSummaryMetrics(transactions)
  const activeMonths = getMonthlyTrend(transactions, 6).filter(
    (month) => month.income > 0 || month.expenses > 0,
  )

  const averageMonthlyExpense =
    activeMonths.length > 0
      ? activeMonths.reduce((total, month) => total + month.expenses, 0) / activeMonths.length
      : 0

  const runwayDays =
    averageMonthlyExpense > 0 ? (summary.balance / averageMonthlyExpense) * 30 : 0

  const stressedProjectedNet =
    forecast.projectedIncome -
    forecast.projectedExpenses * (1 + stressPercent / 100)

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Finance intelligence</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Forecasting and anomaly detection summary.
        </p>
        <div className="mt-4">
          <EmptyState
            title="No data for intelligence"
            description="Intelligence metrics appear after transactions are available."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <h2 className="text-xl font-semibold text-[var(--text-strong)]">Finance intelligence</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Predictive view based on recent monthly performance.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Projected next net</p>
          <p
            className={clsx(
              'mt-1 text-lg font-semibold',
              forecast.projectedNet >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]',
            )}
          >
            {formatSignedCurrency(forecast.projectedNet)}
          </p>
        </article>

        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Forecast confidence</p>
          <p
            className={clsx(
              'mt-1 text-lg font-semibold uppercase',
              forecast.confidence === 'high' && 'text-[var(--positive)]',
              forecast.confidence === 'medium' && 'text-[var(--chart-c3)]',
              forecast.confidence === 'low' && 'text-[var(--negative)]',
            )}
          >
            {forecast.confidence}
          </p>
        </article>

        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Net volatility</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(forecast.volatility)}</p>
        </article>

        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Runway estimate</p>
          <p
            className={clsx(
              'mt-1 text-lg font-semibold',
              runwayDays >= 90
                ? 'text-[var(--positive)]'
                : runwayDays > 45
                  ? 'text-[var(--chart-c3)]'
                  : 'text-[var(--negative)]',
            )}
          >
            {Number.isFinite(runwayDays) && runwayDays > 0 ? `${Math.round(runwayDays)} days` : 'Deficit risk'}
          </p>
        </article>
      </div>

      <div className="mt-4">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
              Stress test simulator
            </p>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Expense shock: +{stressPercent}%
            </p>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={stressPercent}
            onChange={(event) => setStressPercent(Number(event.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Simulated next-month net under stress:{' '}
            <span
              className={clsx(
                'font-semibold',
                stressedProjectedNet >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]',
              )}
            >
              {formatSignedCurrency(stressedProjectedNet)}
            </span>
          </p>
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Anomaly watchlist</p>
        <div className="mt-2 space-y-2">
          {anomalies.length === 0 ? (
            <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
              No unusual expense spikes detected in this filtered view.
            </p>
          ) : (
            anomalies.map((anomaly) => (
              <article
                key={anomaly.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[var(--text-strong)]">{anomaly.category}</p>
                  <span
                    className={clsx(
                      'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
                      anomaly.severity === 'high'
                        ? 'bg-[var(--negative)]/12 text-[var(--negative)]'
                        : 'bg-[var(--chart-c3)]/16 text-[var(--chart-c5)]',
                    )}
                  >
                    {anomaly.severity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {formatTransactionDate(anomaly.date)} - {formatCurrency(anomaly.amount)}
                </p>
                <p className="mt-1 text-sm text-[var(--text-strong)]">{anomaly.note}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
