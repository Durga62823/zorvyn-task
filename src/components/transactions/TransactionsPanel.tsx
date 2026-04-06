import { format, parseISO } from 'date-fns'
import { useMemo, useState } from 'react'
import { ALL_CATEGORIES } from '../../data/mockTransactions'
import { useDashboardStore } from '../../store/useDashboardStore'
import type { Transaction, TransactionDraft } from '../../types/finance'
import {
  getAvailableMonths,
  getVisibleTransactions,
} from '../../utils/financeAnalytics'
import {
  exportTransactionsAsCsv,
  exportTransactionsAsJson,
} from '../../utils/exporters'
import { EmptyState } from '../common/EmptyState'
import { TransactionFormModal } from './TransactionFormModal'
import { TransactionTable } from './TransactionTable'

const parseAmountInput = (raw: string) => {
  const trimmed = raw.trim()

  if (trimmed.length === 0) {
    return null
  }

  const numeric = Number(trimmed)

  if (!Number.isFinite(numeric)) {
    return null
  }

  return Math.max(0, numeric)
}

export function TransactionsPanel() {
  const {
    transactions,
    filters,
    sort,
    selectedRole,
    isLoading,
    updateFilters,
    clearFilters,
    setSortField,
    setSortDirection,
    addTransaction,
    editTransaction,
    deleteTransaction,
  } = useDashboardStore((state) => state)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(
    null,
  )
  const [modalSeed, setModalSeed] = useState(0)

  const visibleTransactions = useMemo(
    () => getVisibleTransactions(transactions, filters, sort),
    [transactions, filters, sort],
  )

  const monthOptions = useMemo(() => getAvailableMonths(transactions), [transactions])

  const activeFilterCount = useMemo(() => {
    const checks = [
      filters.query.trim().length > 0,
      filters.type !== 'all',
      filters.category !== 'all',
      filters.month !== 'all',
      filters.minAmount !== null,
      filters.maxAmount !== null,
    ]

    return checks.filter(Boolean).length
  }, [filters])

  const canManage = selectedRole === 'admin'

  const openCreateModal = () => {
    setEditingTransaction(null)
    setModalSeed((seed) => seed + 1)
    setIsModalOpen(true)
  }

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setModalSeed((seed) => seed + 1)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingTransaction(null)
    setIsModalOpen(false)
  }

  const submitTransaction = async (draft: TransactionDraft) => {
    if (editingTransaction) {
      await editTransaction(editingTransaction.id, draft)
    } else {
      await addTransaction(draft)
    }

    closeModal()
  }

  const removeTransaction = async (id: string) => {
    const shouldDelete = window.confirm('Delete this transaction? This action cannot be undone.')

    if (!shouldDelete) {
      return
    }

    await deleteTransaction(id)
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-strong)]">Transactions</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Search, filter, sort, and manage money movement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => exportTransactionsAsCsv(visibleTransactions)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-strong)]"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => exportTransactionsAsJson(visibleTransactions)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-strong)]"
          >
            Export JSON
          </button>
          {canManage ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
            >
              Add transaction
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <input
          value={filters.query}
          onChange={(event) => updateFilters({ query: event.target.value })}
          placeholder="Search by note or category"
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        />

        <select
          value={filters.type}
          onChange={(event) =>
            updateFilters({
              type: event.target.value as typeof filters.type,
              category: 'all',
            })
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        >
          <option value="all">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filters.category}
          onChange={(event) =>
            updateFilters({ category: event.target.value as typeof filters.category })
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        >
          <option value="all">All categories</option>
          {ALL_CATEGORIES.filter((category) => {
            if (filters.type === 'income') {
              return ['Salary', 'Freelance', 'Investments', 'Bonus', 'Refund'].includes(
                category,
              )
            }

            if (filters.type === 'expense') {
              return !['Salary', 'Freelance', 'Investments', 'Bonus', 'Refund'].includes(
                category,
              )
            }

            return true
          }).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={filters.month}
          onChange={(event) => updateFilters({ month: event.target.value })}
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        >
          <option value="all">All months</option>
          {monthOptions.map((month) => (
            <option key={month} value={month}>
              {format(parseISO(`${month}-01`), 'MMM yyyy')}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0"
          placeholder="Min amount"
          value={filters.minAmount ?? ''}
          onChange={(event) =>
            updateFilters({ minAmount: parseAmountInput(event.target.value) })
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        />

        <input
          type="number"
          min="0"
          placeholder="Max amount"
          value={filters.maxAmount ?? ''}
          onChange={(event) =>
            updateFilters({ maxAmount: parseAmountInput(event.target.value) })
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        />

        <select
          value={sort.field}
          onChange={(event) =>
            setSortField(event.target.value as typeof sort.field)
          }
          className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none"
        >
          <option value="date">Sort by date</option>
          <option value="amount">Sort by amount</option>
          <option value="category">Sort by category</option>
        </select>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() =>
              setSortDirection(sort.direction === 'asc' ? 'desc' : 'asc')
            }
            className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-sm font-medium text-[var(--text-strong)]"
          >
            {sort.direction === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-strong)]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">
          Showing {visibleTransactions.length} of {transactions.length} transactions.
        </p>
        <div className="flex items-center gap-3">
          <p className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
            {activeFilterCount} active filters
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {canManage ? 'Admin mode: editing enabled' : 'Viewer mode: read-only access'}
          </p>
        </div>
      </div>

      <div className="mt-4">
        {transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Admin users can add the first transaction to populate the dashboard."
          />
        ) : visibleTransactions.length === 0 ? (
          <EmptyState
            title="No matching results"
            description="Try clearing one or more filters to expand the result set."
          />
        ) : (
          <TransactionTable
            transactions={visibleTransactions}
            canManage={canManage}
            onEdit={openEditModal}
            onDelete={removeTransaction}
          />
        )}
      </div>

      <TransactionFormModal
        key={modalSeed}
        isOpen={isModalOpen}
        initialTransaction={editingTransaction}
        onClose={closeModal}
        onSubmit={submitTransaction}
        isSubmitting={isLoading}
      />
    </section>
  )
}
