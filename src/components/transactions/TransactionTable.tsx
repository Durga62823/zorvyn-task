import clsx from 'clsx'
import type { Transaction } from '../../types/finance'
import { formatCurrency, formatTransactionDate } from '../../utils/formatters'

interface TransactionTableProps {
  transactions: Transaction[]
  canManage: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

export function TransactionTable({
  transactions,
  canManage,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="max-h-[27rem] overflow-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-[var(--surface-muted)]">
            <tr>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Date</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Category</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Type</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Amount</th>
              <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Note</th>
              {canManage ? (
                <th className="px-4 py-3 font-semibold text-[var(--text-muted)]">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="border-t border-[var(--border)] bg-[var(--surface)]/90"
              >
                <td className="whitespace-nowrap px-4 py-3 text-[var(--text-muted)]">
                  {formatTransactionDate(transaction.date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-[var(--text-strong)]">
                  {transaction.category}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide',
                      transaction.type === 'income'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800',
                    )}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td
                  className={clsx(
                    'whitespace-nowrap px-4 py-3 font-semibold',
                    transaction.type === 'income'
                      ? 'text-emerald-600'
                      : 'text-rose-600',
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="max-w-52 truncate px-4 py-3 text-[var(--text-muted)]">
                  {transaction.note}
                </td>
                {canManage ? (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(transaction)}
                        className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--text-strong)]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(transaction.id)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
