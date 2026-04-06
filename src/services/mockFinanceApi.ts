import { DEFAULT_TRANSACTIONS } from '../data/mockTransactions'
import type { Transaction, TransactionDraft } from '../types/finance'

let transactionDb: Transaction[] = cloneTransactions(DEFAULT_TRANSACTIONS)

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })

const randomDelay = () => 140 + Math.floor(Math.random() * 220)

const withDelay = async <T>(payload: T): Promise<T> => {
  await delay(randomDelay())
  return payload
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `tx-${Date.now()}-${Math.round(Math.random() * 100000)}`
}

function cloneTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map((transaction) => ({ ...transaction }))
}

export const mockFinanceApi = {
  async bootstrap(initialTransactions?: Transaction[]) {
    transactionDb = cloneTransactions(
      initialTransactions && initialTransactions.length > 0
        ? initialTransactions
        : DEFAULT_TRANSACTIONS,
    )

    return withDelay(cloneTransactions(transactionDb))
  },

  async getTransactions() {
    return withDelay(cloneTransactions(transactionDb))
  },

  async createTransaction(draft: TransactionDraft) {
    const created: Transaction = {
      ...draft,
      id: makeId(),
    }

    transactionDb = [created, ...transactionDb]

    return withDelay({ ...created })
  },

  async updateTransaction(id: string, draft: TransactionDraft) {
    const targetIndex = transactionDb.findIndex((transaction) => transaction.id === id)

    if (targetIndex < 0) {
      throw new Error('Unable to update transaction. Record was not found.')
    }

    const updated: Transaction = {
      ...draft,
      id,
    }

    transactionDb = transactionDb.map((transaction) =>
      transaction.id === id ? updated : transaction,
    )

    return withDelay({ ...updated })
  },

  async deleteTransaction(id: string) {
    const exists = transactionDb.some((transaction) => transaction.id === id)

    if (!exists) {
      throw new Error('Unable to delete transaction. Record was not found.')
    }

    transactionDb = transactionDb.filter((transaction) => transaction.id !== id)

    return withDelay(id)
  },
}
