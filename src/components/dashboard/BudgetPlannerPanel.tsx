import { format, parseISO } from 'date-fns'
import clsx from 'clsx'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Transaction } from '../../types/finance'
import {
  getAvailableMonths,
  getBudgetPerformance,
  getBudgetTotals,
} from '../../utils/financeAnalytics'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { EmptyState } from '../common/EmptyState'

interface BudgetPlannerPanelProps {
  transactions: Transaction[]
}

export function BudgetPlannerPanel({ transactions }: BudgetPlannerPanelProps) {
  const budgets = useDashboardStore((state) => state.budgets)
  const selectedRole = useDashboardStore((state) => state.selectedRole)
  const authToken = useDashboardStore((state) => state.authToken)
  const filters = useDashboardStore((state) => state.filters)
  const setBudget = useDashboardStore((state) => state.setBudget)
  const resetBudgets = useDashboardStore((state) => state.resetBudgets)
  const updateFilters = useDashboardStore((state) => state.updateFilters)

  const monthOptions = getAvailableMonths(transactions)
  const monthForBudget = filters.month === 'all' ? monthOptions[0] ?? 'all' : filters.month

  if (transactions.length === 0 || monthForBudget === 'all') {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Budget planner</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Plan category-wise spending limits and monitor overrun risk.
        </p>
        <div className="mt-4">
          <EmptyState
            title="No monthly data for budgets"
            description="Budget planning activates when month-based transactions are available."
          />
        </div>
      </section>
    )
  }

  const performance = getBudgetPerformance(transactions, budgets, monthForBudget)
  const totals = getBudgetTotals(performance)
  const canManage = selectedRole === 'admin' && Boolean(authToken)

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">Budget planner</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Set category limits and watch utilization in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={monthForBudget}
            onChange={(event) => updateFilters({ month: event.target.value })}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {format(parseISO(`${month}-01`), 'MMM yyyy')}
              </option>
            ))}
          </select>

          {canManage ? (
            <button
              type="button"
              onClick={resetBudgets}
              className="control-chip rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-strong)]"
            >
              Reset budgets
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Budgeted</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(totals.totalBudget)}</p>
        </article>
        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Spent</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-strong)]">{formatCurrency(totals.totalSpent)}</p>
        </article>
        <article className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Utilization</p>
          <p className="mt-1 text-lg font-semibold text-[var(--text-strong)]">{formatPercent(totals.utilization)}</p>
        </article>
      </div>

      <div className="mt-4 space-y-2">
        {performance.map((item) => {
          const barWidth = `${Math.min(100, item.utilization * 100)}%`

          return (
            <article
              key={item.category}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--text-strong)]">{item.category}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
                      item.status === 'on-track' && 'bg-[var(--positive)]/15 text-[var(--positive)]',
                      item.status === 'at-risk' && 'bg-[var(--chart-c3)]/20 text-[var(--chart-c5)]',
                      item.status === 'over' && 'bg-[var(--negative)]/15 text-[var(--negative)]',
                    )}
                  >
                    {item.status.replace('-', ' ')}
                  </span>
                  {canManage ? (
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={item.budget}
                      onChange={(event) =>
                        setBudget(item.category, Number(event.target.value || 0))
                      }
                      className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-sm font-medium text-[var(--text-muted)]">
                      {formatCurrency(item.budget)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className={clsx(
                    'h-full rounded-full transition-[width] duration-300',
                    item.status === 'on-track' && 'bg-[var(--positive)]',
                    item.status === 'at-risk' && 'bg-[var(--chart-c3)]',
                    item.status === 'over' && 'bg-[var(--negative)]',
                  )}
                  style={{ width: barWidth }}
                />
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>Spent: {formatCurrency(item.spent)}</span>
                <span>Remaining: {formatCurrency(item.remaining)}</span>
              </div>
            </article>
          )
        })}
      </div>

      {!canManage ? (
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          Viewer mode is read-only. Login with an Admin account to edit budget limits.
        </p>
      ) : null}
    </section>
  )
}
