export const TRANSACTION_TYPES = ['income', 'expense'] as const
export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Bonus',
  'Refund',
] as const

export const EXPENSE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Transport',
  'Utilities',
  'Health',
  'Entertainment',
  'Travel',
  'Shopping',
  'Education',
  'Dining',
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type TransactionCategory = IncomeCategory | ExpenseCategory

export interface Transaction {
  id: string
  date: string
  amount: number
  category: TransactionCategory
  type: TransactionType
  note: string
}

export interface TransactionDraft {
  date: string
  amount: number
  category: TransactionCategory
  type: TransactionType
  note: string
}

export const USER_ROLES = ['viewer', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

export type ThemeMode = 'light' | 'dark'

export interface TransactionFilters {
  query: string
  type: TransactionType | 'all'
  category: TransactionCategory | 'all'
  month: string | 'all'
  minAmount: number | null
  maxAmount: number | null
}

export interface TransactionSort {
  field: 'date' | 'amount' | 'category'
  direction: 'asc' | 'desc'
}

export interface SummaryMetrics {
  balance: number
  income: number
  expenses: number
  transactionCount: number
}

export interface MonthlyTrendPoint {
  monthKey: string
  label: string
  income: number
  expenses: number
  net: number
  runningBalance: number
}

export interface CategoryBreakdownPoint {
  category: ExpenseCategory
  total: number
  share: number
}

export interface InsightItem {
  title: string
  detail: string
  tone: 'positive' | 'neutral' | 'warning'
}

export type CategoryBudgets = Record<ExpenseCategory, number>

export interface ForecastSnapshot {
  projectedIncome: number
  projectedExpenses: number
  projectedNet: number
  volatility: number
  confidence: 'high' | 'medium' | 'low'
}

export interface ExpenseAnomaly {
  id: string
  date: string
  category: ExpenseCategory
  amount: number
  note: string
  score: number
  severity: 'high' | 'medium'
}

export interface BudgetPerformanceItem {
  category: ExpenseCategory
  budget: number
  spent: number
  remaining: number
  utilization: number
  status: 'on-track' | 'at-risk' | 'over'
}

export interface ActionRecommendation {
  id: string
  title: string
  detail: string
  impact: 'high' | 'medium' | 'low'
  priority: 1 | 2 | 3
}
