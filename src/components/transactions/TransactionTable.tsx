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
      <div className="max-h-[27rem] overflow-auto p-2 sm:hidden">
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {formatTransactionDate(transaction.date)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--text-strong)]">
                    {transaction.category}
                  </p>
                </div>
                <span
                  className={clsx(
                    'inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                    transaction.type === 'income'
                      ? 'bg-[var(--positive)]/15 text-[var(--positive)]'
                      : 'bg-[var(--negative)]/15 text-[var(--negative)]',
                  )}
                >
                  {transaction.type}
                </span>
              </div>

              <p
                className={clsx(
                  'mt-2 text-base font-semibold',
                  transaction.type === 'income'
                    ? 'text-[var(--positive)]'
                    : 'text-[var(--negative)]',
                )}
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </p>

              <p className="mt-2 text-sm text-[var(--text-muted)]">{transaction.note}</p>

              {canManage ? (
                <div className="mt-3 flex items-center gap-2">
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
                    className="rounded-md border border-[var(--negative)]/40 bg-[var(--negative)]/10 px-2 py-1 text-xs font-medium text-[var(--negative)]"
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="hidden max-h-[27rem] overflow-auto sm:block">
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
                        ? 'bg-[var(--positive)]/15 text-[var(--positive)]'
                        : 'bg-[var(--negative)]/15 text-[var(--negative)]',
                    )}
                  >
                    {transaction.type}
                  </span>
                </td>
                <td
                  className={clsx(
                    'whitespace-nowrap px-4 py-3 font-semibold',
                    transaction.type === 'income'
                      ? 'text-[var(--positive)]'
                      : 'text-[var(--negative)]',
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
                        className="rounded-md border border-[var(--negative)]/40 bg-[var(--negative)]/10 px-2 py-1 text-xs font-medium text-[var(--negative)]"
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
