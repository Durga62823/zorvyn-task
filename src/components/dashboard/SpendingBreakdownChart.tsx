import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Transaction } from '../../types/finance'
import { getSpendingBreakdown } from '../../utils/financeAnalytics'
import { formatCurrency, formatPercent } from '../../utils/formatters'
import { EmptyState } from '../common/EmptyState'

interface SpendingBreakdownChartProps {
  transactions: Transaction[]
}

const CATEGORY_COLORS = [
  'var(--chart-c1)',
  'var(--chart-c2)',
  'var(--chart-c3)',
  'var(--chart-c4)',
  'var(--chart-c5)',
  'var(--chart-c6)',
]

export function SpendingBreakdownChart({
  transactions,
}: SpendingBreakdownChartProps) {
  const data = getSpendingBreakdown(transactions)

  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const parsed = Array.isArray(value) ? Number(value[0]) : Number(value)
    return formatCurrency(Number.isFinite(parsed) ? parsed : 0)
  }

  if (data.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Spending breakdown</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Top categories by expense value.
        </p>
        <div className="mt-4">
          <EmptyState
            title="No expenses to segment"
            description="Expense transactions are required to render category slices."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <h2 className="text-xl font-semibold text-[var(--text-strong)]">Spending breakdown</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Distribution of expenses by category.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              contentStyle={{
                backgroundColor: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-strong)',
              }}
            />
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={62}
              outerRadius={104}
              paddingAngle={2}
            >
              {data.map((item, index) => (
                <Cell
                  key={item.category}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-2">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }}
              />
              <span className="font-medium text-[var(--text-strong)]">{item.category}</span>
            </div>
            <span className="text-[var(--text-muted)]">
              {formatCurrency(item.total)} ({formatPercent(item.share)})
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
