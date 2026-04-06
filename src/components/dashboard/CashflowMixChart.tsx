import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Transaction } from '../../types/finance'
import { getMonthlyTrend } from '../../utils/financeAnalytics'
import { formatCurrency, formatSignedCurrency } from '../../utils/formatters'
import { EmptyState } from '../common/EmptyState'

interface CashflowMixChartProps {
  transactions: Transaction[]
}

export function CashflowMixChart({ transactions }: CashflowMixChartProps) {
  const data = getMonthlyTrend(transactions, 6)

  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const parsed = Array.isArray(value) ? Number(value[0]) : Number(value)
    return formatCurrency(Number.isFinite(parsed) ? parsed : 0)
  }

  const latest = data[data.length - 1]

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Cashflow mix</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Income, expenses, and monthly net in one view.
        </p>
        <div className="mt-4">
          <EmptyState
            title="No monthly cashflow data"
            description="Create or reveal transactions to compare income and expense bars."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">Cashflow mix</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Compare monthly income and expenses while tracking net momentum.
          </p>
        </div>
        {latest ? (
          <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            Latest net: {formatSignedCurrency(latest.net)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="var(--grid-line)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
            />
            <Tooltip
              formatter={(value) => formatTooltipValue(value)}
              contentStyle={{
                backgroundColor: 'var(--surface-muted)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-strong)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="income" name="Income" fill="#2a9d8f" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#e07a5f" radius={[6, 6, 0, 0]} />
            <Line
              type="monotone"
              dataKey="net"
              name="Net"
              stroke="#3d405b"
              strokeWidth={2.5}
              dot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
