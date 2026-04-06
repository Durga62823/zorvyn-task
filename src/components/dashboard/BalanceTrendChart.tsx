import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Transaction } from '../../types/finance'
import { getMonthlyTrend } from '../../utils/financeAnalytics'
import { formatCurrency } from '../../utils/formatters'
import { EmptyState } from '../common/EmptyState'

interface BalanceTrendChartProps {
  transactions: Transaction[]
}

export function BalanceTrendChart({ transactions }: BalanceTrendChartProps) {
  const data = getMonthlyTrend(transactions, 6)

  const formatTooltipValue = (
    value: number | string | ReadonlyArray<number | string> | undefined,
  ) => {
    const parsed = Array.isArray(value) ? Number(value[0]) : Number(value)
    return formatCurrency(Number.isFinite(parsed) ? parsed : 0)
  }

  if (transactions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
        <h2 className="text-xl font-semibold text-[var(--text-strong)]">Balance trend</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Month-over-month cash movement.
        </p>
        <div className="mt-4">
          <EmptyState
            title="No transactions to chart"
            description="Add transactions or clear filters to view trend lines."
          />
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <h2 className="text-xl font-semibold text-[var(--text-strong)]">Balance trend</h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Running balance across the last six months.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.04} />
              </linearGradient>
            </defs>

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
            <Area
              type="monotone"
              dataKey="runningBalance"
              stroke="#0d9488"
              strokeWidth={2.6}
              fill="url(#balanceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
