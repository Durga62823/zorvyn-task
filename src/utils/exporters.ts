import type { Transaction } from '../types/finance'

const downloadBlob = (content: string, mimeType: string, fileName: string) => {
  const blob = new Blob([content], { type: mimeType })
  const objectUrl = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  URL.revokeObjectURL(objectUrl)
}

const escapeCsv = (value: string | number) => {
  const text = String(value)

  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

export const exportTransactionsAsCsv = (transactions: Transaction[]) => {
  const header = ['Date', 'Amount', 'Category', 'Type', 'Note']
  const rows = transactions.map((transaction) => [
    transaction.date,
    transaction.amount,
    transaction.category,
    transaction.type,
    transaction.note,
  ])

  const csv = [header, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(','))
    .join('\n')

  downloadBlob(csv, 'text/csv;charset=utf-8;', 'transactions.csv')
}

export const exportTransactionsAsJson = (transactions: Transaction[]) => {
  const json = JSON.stringify(transactions, null, 2)
  downloadBlob(json, 'application/json;charset=utf-8;', 'transactions.json')
}
