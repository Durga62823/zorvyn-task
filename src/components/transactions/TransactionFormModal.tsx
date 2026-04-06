import { useMemo, useState } from 'react'
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionCategory,
  type TransactionDraft,
  type TransactionType,
} from '../../types/finance'

interface TransactionFormModalProps {
  isOpen: boolean
  initialTransaction: Transaction | null
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (draft: TransactionDraft) => Promise<void>
}

const buildInitialDraft = (
  transaction: Transaction | null,
): TransactionDraft => {
  if (transaction) {
    return {
      date: transaction.date,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      note: transaction.note,
    }
  }

  return {
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    category: EXPENSE_CATEGORIES[0],
    type: 'expense',
    note: '',
  }
}

const getCategoryOptions = (type: TransactionType) =>
  type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

const isAllowedCategory = (type: TransactionType, category: TransactionCategory) =>
  getCategoryOptions(type).some((option) => option === category)

export function TransactionFormModal({
  isOpen,
  initialTransaction,
  isSubmitting,
  onClose,
  onSubmit,
}: TransactionFormModalProps) {
  const [draft, setDraft] = useState<TransactionDraft>(() =>
    buildInitialDraft(initialTransaction),
  )
  const [formError, setFormError] = useState<string | null>(null)

  const categoryOptions = useMemo(
    () => getCategoryOptions(draft.type),
    [draft.type],
  )

  if (!isOpen) {
    return null
  }

  const modalTitle = initialTransaction ? 'Edit transaction' : 'Add transaction'

  const handleTypeChange = (type: TransactionType) => {
    setDraft((currentDraft) => {
      const nextCategory = isAllowedCategory(type, currentDraft.category)
        ? currentDraft.category
        : getCategoryOptions(type)[0]

      return {
        ...currentDraft,
        type,
        category: nextCategory,
      }
    })
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (draft.amount <= 0) {
      setFormError('Amount must be greater than zero.')
      return
    }

    if (draft.note.trim().length < 3) {
      setFormError('Add a short note with at least 3 characters.')
      return
    }

    await onSubmit({
      ...draft,
      amount: Number(draft.amount),
      note: draft.note.trim(),
    })
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4"
      onMouseDown={onClose}
      role="presentation"
    >
      <form
        onSubmit={submitForm}
        className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-[var(--text-strong)]">{modalTitle}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-2 py-1 text-sm text-[var(--text-muted)]"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-muted)]">Type</span>
            <select
              value={draft.type}
              onChange={(event) => handleTypeChange(event.target.value as TransactionType)}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-strong)] outline-none"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-muted)]">Category</span>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  category: event.target.value as TransactionCategory,
                }))
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-strong)] outline-none"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-muted)]">Date</span>
            <input
              type="date"
              value={draft.date}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  date: event.target.value,
                }))
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-strong)] outline-none"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-[var(--text-muted)]">Amount (USD)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={draft.amount}
              onChange={(event) =>
                setDraft((currentDraft) => ({
                  ...currentDraft,
                  amount: Number(event.target.value),
                }))
              }
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-strong)] outline-none"
              required
            />
          </label>
        </div>

        <label className="mt-3 flex flex-col gap-1 text-sm">
          <span className="font-medium text-[var(--text-muted)]">Note</span>
          <input
            type="text"
            value={draft.note}
            onChange={(event) =>
              setDraft((currentDraft) => ({ ...currentDraft, note: event.target.value }))
            }
            placeholder="Add context for this transaction"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-[var(--text-strong)] outline-none"
            required
          />
        </label>

        {formError ? <p className="mt-3 text-sm text-rose-600">{formError}</p> : null}

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-medium text-[var(--text-strong)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : initialTransaction ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </div>
  )
}
