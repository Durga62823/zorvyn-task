import { format, parseISO } from 'date-fns'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const percent = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export const formatCurrency = (value: number) => currency.format(value)

export const formatSignedCurrency = (value: number) => {
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${currency.format(value)}`
}

export const formatPercent = (value: number) => percent.format(value)

export const formatTransactionDate = (dateValue: string) =>
  format(parseISO(dateValue), 'dd MMM yyyy')
