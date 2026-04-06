import { format, isValid, parseISO, startOfMonth, subMonths } from 'date-fns'
import type {
  ActionRecommendation,
  BudgetPerformanceItem,
  CategoryBudgets,
  CategoryBreakdownPoint,
  ExpenseAnomaly,
  ExpenseCategory,
  ForecastSnapshot,
  InsightItem,
  MonthlyTrendPoint,
  SummaryMetrics,
  Transaction,
  TransactionFilters,
  TransactionSort,
} from '../types/finance'
import { EXPENSE_CATEGORIES } from '../types/finance'

const getTimestamp = (dateValue: string) => {
  const parsed = parseISO(dateValue)
  return isValid(parsed) ? parsed.getTime() : 0
}

export const getVisibleTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters,
  sort: TransactionSort,
): Transaction[] => {
  const normalizedQuery = filters.query.trim().toLowerCase()

  const filtered = transactions.filter((transaction) => {
    const matchesQuery =
      normalizedQuery.length === 0 ||
      transaction.note.toLowerCase().includes(normalizedQuery) ||
      transaction.category.toLowerCase().includes(normalizedQuery)

    const matchesType = filters.type === 'all' || transaction.type === filters.type
    const matchesCategory =
      filters.category === 'all' || transaction.category === filters.category
    const matchesMonth =
      filters.month === 'all' || transaction.date.startsWith(filters.month)
    const matchesMinAmount =
      filters.minAmount === null || transaction.amount >= filters.minAmount
    const matchesMaxAmount =
      filters.maxAmount === null || transaction.amount <= filters.maxAmount

    return (
      matchesQuery &&
      matchesType &&
      matchesCategory &&
      matchesMonth &&
      matchesMinAmount &&
      matchesMaxAmount
    )
  })

  return filtered.sort((a, b) => {
    let comparison = 0

    if (sort.field === 'amount') {
      comparison = a.amount - b.amount
    } else if (sort.field === 'category') {
      comparison = a.category.localeCompare(b.category)
    } else {
      comparison = getTimestamp(a.date) - getTimestamp(b.date)
    }

    return sort.direction === 'asc' ? comparison : comparison * -1
  })
}

export const getSummaryMetrics = (transactions: Transaction[]): SummaryMetrics => {
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0)

  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0)

  return {
    income,
    expenses,
    balance: income - expenses,
    transactionCount: transactions.length,
  }
}

export const getMonthlyTrend = (
  transactions: Transaction[],
  monthWindow = 6,
): MonthlyTrendPoint[] => {
  const monthStart = startOfMonth(new Date())

  const months = Array.from({ length: monthWindow }, (_, index) =>
    subMonths(monthStart, monthWindow - index - 1),
  )

  const byMonth = new Map<string, { income: number; expenses: number }>()

  months.forEach((month) => {
    byMonth.set(format(month, 'yyyy-MM'), { income: 0, expenses: 0 })
  })

  transactions.forEach((transaction) => {
    const monthKey = transaction.date.slice(0, 7)
    const entry = byMonth.get(monthKey)

    if (!entry) {
      return
    }

    if (transaction.type === 'income') {
      entry.income += transaction.amount
    } else {
      entry.expenses += transaction.amount
    }
  })

  let runningBalance = 0

  return months.map((month) => {
    const monthKey = format(month, 'yyyy-MM')
    const monthEntry = byMonth.get(monthKey)

    if (!monthEntry) {
      return {
        monthKey,
        label: format(month, 'MMM yy'),
        income: 0,
        expenses: 0,
        net: 0,
        runningBalance,
      }
    }

    const net = monthEntry.income - monthEntry.expenses
    runningBalance += net

    return {
      monthKey,
      label: format(month, 'MMM yy'),
      income: monthEntry.income,
      expenses: monthEntry.expenses,
      net,
      runningBalance,
    }
  })
}

export const getSpendingBreakdown = (
  transactions: Transaction[],
): CategoryBreakdownPoint[] => {
  const totals = new Map<string, number>()

  transactions.forEach((transaction) => {
    if (transaction.type !== 'expense') {
      return
    }

    const previous = totals.get(transaction.category) ?? 0
    totals.set(transaction.category, previous + transaction.amount)
  })

  const grandTotal = Array.from(totals.values()).reduce(
    (runningTotal, currentValue) => runningTotal + currentValue,
    0,
  )

  if (grandTotal === 0) {
    return []
  }

  return Array.from(totals.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([category, total]) => ({
      category: category as CategoryBreakdownPoint['category'],
      total,
      share: total / grandTotal,
    }))
}

export const getAvailableMonths = (transactions: Transaction[]) => {
  const monthSet = new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))

  return Array.from(monthSet).sort((left, right) => right.localeCompare(left))
}

const getStdDeviation = (values: number[]) => {
  if (values.length <= 1) {
    return 0
  }

  const mean = values.reduce((total, value) => total + value, 0) / values.length
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length

  return Math.sqrt(variance)
}

export const getForecastSnapshot = (transactions: Transaction[]): ForecastSnapshot => {
  const recentMonths = getMonthlyTrend(transactions, 6).filter(
    (point) => point.income > 0 || point.expenses > 0,
  )

  if (recentMonths.length === 0) {
    return {
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedNet: 0,
      volatility: 0,
      confidence: 'low',
    }
  }

  const sample = recentMonths.slice(-3)
  const projectedIncome =
    sample.reduce((total, month) => total + month.income, 0) / sample.length
  const projectedExpenses =
    sample.reduce((total, month) => total + month.expenses, 0) / sample.length
  const projectedNet = projectedIncome - projectedExpenses

  const netValues = sample.map((month) => month.net)
  const volatility = getStdDeviation(netValues)
  const relativeVolatility =
    Math.abs(projectedNet) > 0
      ? volatility / Math.abs(projectedNet)
      : volatility > 0
        ? 1
        : 0

  let confidence: ForecastSnapshot['confidence'] = 'low'

  if (sample.length >= 3 && relativeVolatility < 0.35) {
    confidence = 'high'
  } else if (sample.length >= 2 && relativeVolatility < 0.75) {
    confidence = 'medium'
  }

  return {
    projectedIncome,
    projectedExpenses,
    projectedNet,
    volatility,
    confidence,
  }
}

export const getExpenseAnomalies = (
  transactions: Transaction[],
  limit = 4,
): ExpenseAnomaly[] => {
  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === 'expense',
  )

  if (expenseTransactions.length === 0) {
    return []
  }

  const byCategory = new Map<ExpenseCategory, Transaction[]>()

  expenseTransactions.forEach((transaction) => {
    const category = transaction.category as ExpenseCategory
    const list = byCategory.get(category) ?? []
    list.push(transaction)
    byCategory.set(category, list)
  })

  const anomalies: ExpenseAnomaly[] = []

  byCategory.forEach((items, category) => {
    const amounts = items.map((item) => item.amount)
    const mean = amounts.reduce((total, amount) => total + amount, 0) / amounts.length
    const std = getStdDeviation(amounts)

    items.forEach((transaction) => {
      const zScore = std > 0 ? (transaction.amount - mean) / std : 0
      const ratio = mean > 0 ? transaction.amount / mean : 1

      if (zScore >= 1.35 || ratio >= 1.6) {
        anomalies.push({
          id: transaction.id,
          date: transaction.date,
          category,
          amount: transaction.amount,
          note: transaction.note,
          score: Number((zScore + ratio / 2).toFixed(2)),
          severity: zScore >= 2 || ratio >= 2 ? 'high' : 'medium',
        })
      }
    })
  })

  const ranked = anomalies.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score
    }

    return right.amount - left.amount
  })

  if (ranked.length > 0) {
    return ranked.slice(0, limit)
  }

  return expenseTransactions
    .slice()
    .sort((left, right) => right.amount - left.amount)
    .slice(0, Math.min(limit, 2))
    .map((transaction) => ({
      id: transaction.id,
      date: transaction.date,
      category: transaction.category as ExpenseCategory,
      amount: transaction.amount,
      note: transaction.note,
      score: 1,
      severity: 'medium',
    }))
}

export const getBudgetPerformance = (
  transactions: Transaction[],
  budgets: CategoryBudgets,
  month: string | 'all',
): BudgetPerformanceItem[] => {
  const selectedMonth = month === 'all' ? getAvailableMonths(transactions)[0] : month

  const spendByCategory = new Map<ExpenseCategory, number>()

  if (selectedMonth) {
    transactions.forEach((transaction) => {
      if (
        transaction.type !== 'expense' ||
        !transaction.date.startsWith(selectedMonth)
      ) {
        return
      }

      const category = transaction.category as ExpenseCategory
      const currentSpent = spendByCategory.get(category) ?? 0
      spendByCategory.set(category, currentSpent + transaction.amount)
    })
  }

  return EXPENSE_CATEGORIES.map((category) => {
    const budget = budgets[category] ?? 0
    const spent = spendByCategory.get(category) ?? 0
    const remaining = budget - spent
    const utilization = budget > 0 ? spent / budget : spent > 0 ? 1 : 0

    let status: BudgetPerformanceItem['status'] = 'on-track'

    if (budget > 0 && utilization > 1) {
      status = 'over'
    } else if (budget === 0 && spent > 0) {
      status = 'over'
    } else if (utilization >= 0.85) {
      status = 'at-risk'
    }

    return {
      category,
      budget,
      spent,
      remaining,
      utilization,
      status,
    }
  }).sort((left, right) => right.utilization - left.utilization)
}

export const getBudgetTotals = (items: BudgetPerformanceItem[]) => {
  const totalBudget = items.reduce((total, item) => total + item.budget, 0)
  const totalSpent = items.reduce((total, item) => total + item.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const utilization = totalBudget > 0 ? totalSpent / totalBudget : 0

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    utilization,
  }
}

const toImpact = (priority: ActionRecommendation['priority']) => {
  if (priority === 1) {
    return 'high'
  }

  if (priority === 2) {
    return 'medium'
  }

  return 'low'
}

export const getActionRecommendations = (
  transactions: Transaction[],
  budgets: CategoryBudgets,
  month: string | 'all',
): ActionRecommendation[] => {
  if (transactions.length === 0) {
    return []
  }

  const summary = getSummaryMetrics(transactions)
  const forecast = getForecastSnapshot(transactions)
  const anomalies = getExpenseAnomalies(transactions, 2)
  const budgetPerformance = getBudgetPerformance(transactions, budgets, month)

  const recommendations: ActionRecommendation[] = []

  const overBudget = budgetPerformance.find((item) => item.status === 'over')
  if (overBudget) {
    recommendations.push({
      id: `budget-over-${overBudget.category}`,
      title: `Cut ${overBudget.category} spend this month`,
      detail: `${overBudget.category} is over budget by ${Math.abs(overBudget.remaining).toFixed(0)}. Reduce variable expenses in this category to stabilize cash flow.`,
      priority: 1,
      impact: toImpact(1),
    })
  }

  if (forecast.projectedNet < 0) {
    recommendations.push({
      id: 'forecast-negative-net',
      title: 'Prevent projected next-month deficit',
      detail: `Forecasted net is ${forecast.projectedNet.toFixed(0)}. Set stricter expense caps or add short-term income buffers to avoid negative carryover.`,
      priority: 1,
      impact: toImpact(1),
    })
  }

  const atRisk = budgetPerformance.find((item) => item.status === 'at-risk')
  if (atRisk) {
    recommendations.push({
      id: `budget-risk-${atRisk.category}`,
      title: `Monitor ${atRisk.category} closely`,
      detail: `${atRisk.category} has already used ${(atRisk.utilization * 100).toFixed(0)}% of its monthly budget. Small cuts now can prevent overrun.`,
      priority: 2,
      impact: toImpact(2),
    })
  }

  if (anomalies[0]) {
    recommendations.push({
      id: `anomaly-${anomalies[0].id}`,
      title: `Review unusual ${anomalies[0].category} transaction`,
      detail: `A ${anomalies[0].amount.toFixed(0)} spend was flagged as an anomaly (${anomalies[0].note}). Validate whether it is one-off or recurring.`,
      priority: anomalies[0].severity === 'high' ? 1 : 2,
      impact: anomalies[0].severity === 'high' ? 'high' : 'medium',
    })
  }

  const savingsRate =
    summary.income > 0 ? ((summary.income - summary.expenses) / summary.income) * 100 : 0

  if (savingsRate < 20) {
    recommendations.push({
      id: 'savings-rate-boost',
      title: 'Increase savings rate toward 20%',
      detail: `Current savings rate is ${savingsRate.toFixed(1)}%. Target a 20% baseline by reducing low-value discretionary spending.`,
      priority: 2,
      impact: toImpact(2),
    })
  } else {
    recommendations.push({
      id: 'invest-surplus-automation',
      title: 'Automate surplus allocation',
      detail: `Savings rate is ${savingsRate.toFixed(1)}%. Automate part of monthly surplus into long-term investments to retain discipline.`,
      priority: 3,
      impact: toImpact(3),
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: 'steady-state',
      title: 'Maintain current spending discipline',
      detail: 'No immediate risks detected. Continue monitoring category utilization and forecast confidence weekly.',
      priority: 3,
      impact: 'low',
    })
  }

  return recommendations
    .sort((left, right) => left.priority - right.priority)
    .slice(0, 3)
}

export const getInsights = (transactions: Transaction[]): InsightItem[] => {
  if (transactions.length === 0) {
    return []
  }

  const summary = getSummaryMetrics(transactions)
  const spendingBreakdown = getSpendingBreakdown(transactions)
  const trend = getMonthlyTrend(transactions, 2)

  const topCategory = spendingBreakdown[0]
  const latestMonth = trend[trend.length - 1]
  const previousMonth = trend[trend.length - 2]
  const forecast = getForecastSnapshot(transactions)
  const anomalies = getExpenseAnomalies(transactions, 1)

  const savingsRate =
    summary.income > 0 ? ((summary.income - summary.expenses) / summary.income) * 100 : 0

  const largestExpense = transactions
    .filter((transaction) => transaction.type === 'expense')
    .sort((left, right) => right.amount - left.amount)[0]

  const monthlyChange =
    previousMonth && previousMonth.expenses > 0
      ? ((latestMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
      : 0

  const monthPhrase =
    monthlyChange > 0
      ? `${Math.abs(monthlyChange).toFixed(1)}% higher spending than last month.`
      : `${Math.abs(monthlyChange).toFixed(1)}% lower spending than last month.`

  const nextMonthPhrase =
    forecast.projectedNet >= 0
      ? `Projected positive net of ${forecast.projectedNet.toFixed(0)} for next month.`
      : `Projected deficit risk of ${Math.abs(forecast.projectedNet).toFixed(0)} next month.`

  return [
    {
      title: 'Highest spending category',
      detail: topCategory
        ? `${topCategory.category} accounts for ${(topCategory.share * 100).toFixed(1)}% of expenses.`
        : 'No expense records in the current view.',
      tone: topCategory && topCategory.share > 0.35 ? 'warning' : 'neutral',
    },
    {
      title: 'Monthly comparison',
      detail:
        latestMonth && previousMonth
          ? `${latestMonth.label} vs ${previousMonth.label}: ${monthPhrase}`
          : 'Not enough monthly data to compare.',
      tone: monthlyChange > 0 ? 'warning' : 'positive',
    },
    {
      title: 'Savings pulse',
      detail: `Current savings rate is ${savingsRate.toFixed(1)}%. Largest expense: ${largestExpense?.category ?? 'n/a'} (${largestExpense ? largestExpense.amount.toFixed(0) : 0}).`,
      tone: savingsRate >= 20 ? 'positive' : 'neutral',
    },
    {
      title: 'Forecast confidence',
      detail: `${nextMonthPhrase} Confidence: ${forecast.confidence.toUpperCase()}.`,
      tone: forecast.projectedNet >= 0 ? 'positive' : 'warning',
    },
    {
      title: 'Anomaly watch',
      detail: anomalies[0]
        ? `${anomalies[0].category} spike on ${anomalies[0].date}: ${anomalies[0].amount.toFixed(0)} (${anomalies[0].note}).`
        : 'No unusual expense spikes detected in this view.',
      tone: anomalies[0] && anomalies[0].severity === 'high' ? 'warning' : 'neutral',
    },
  ]
}
