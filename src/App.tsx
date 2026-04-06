import { Suspense, lazy, useEffect, useMemo } from 'react'
import { AuthAccessPanel } from './components/common/AuthAccessPanel'
import { RoleSwitcher } from './components/common/RoleSwitcher'
import { ThemeToggle } from './components/common/ThemeToggle'
import { SummaryCards } from './components/dashboard/SummaryCards'
import { useDashboardStore } from './store/useDashboardStore'
import { getVisibleTransactions } from './utils/financeAnalytics'

const BalanceTrendChart = lazy(async () => {
  const module = await import('./components/dashboard/BalanceTrendChart')
  return { default: module.BalanceTrendChart }
})

const SpendingBreakdownChart = lazy(async () => {
  const module = await import('./components/dashboard/SpendingBreakdownChart')
  return { default: module.SpendingBreakdownChart }
})

const CashflowMixChart = lazy(async () => {
  const module = await import('./components/dashboard/CashflowMixChart')
  return { default: module.CashflowMixChart }
})

const TransactionsPanel = lazy(async () => {
  const module = await import('./components/transactions/TransactionsPanel')
  return { default: module.TransactionsPanel }
})

const InsightsPanel = lazy(async () => {
  const module = await import('./components/insights/InsightsPanel')
  return { default: module.InsightsPanel }
})

const BudgetPlannerPanel = lazy(async () => {
  const module = await import('./components/dashboard/BudgetPlannerPanel')
  return { default: module.BudgetPlannerPanel }
})

const FinanceIntelligencePanel = lazy(async () => {
  const module = await import('./components/insights/FinanceIntelligencePanel')
  return { default: module.FinanceIntelligencePanel }
})

const ActionPlanPanel = lazy(async () => {
  const module = await import('./components/insights/ActionPlanPanel')
  return { default: module.ActionPlanPanel }
})

function SectionFallback({ minHeightClass }: { minHeightClass?: string }) {
  return (
    <div
      className={`panel-surface rounded-[1.6rem] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--soft-shadow)] ${minHeightClass ?? 'min-h-[280px]'}`}
    >
      <div className="h-full animate-pulse rounded-xl bg-[var(--surface-muted)]" />
    </div>
  )
}

function App() {
  const initialize = useDashboardStore((state) => state.initialize)
  const theme = useDashboardStore((state) => state.theme)
  const transactions = useDashboardStore((state) => state.transactions)
  const filters = useDashboardStore((state) => state.filters)
  const sort = useDashboardStore((state) => state.sort)
  const isLoading = useDashboardStore((state) => state.isLoading)
  const errorMessage = useDashboardStore((state) => state.errorMessage)

  const visibleTransactions = useMemo(
    () => getVisibleTransactions(transactions, filters, sort),
    [transactions, filters, sort],
  )

  useEffect(() => {
    void initialize()
  }, [initialize])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="app-shell min-h-screen pb-10">
      <div className="dashboard-frame mx-auto max-w-[1240px] px-3 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="hero-panel reveal-panel">
          <div className="hero-grid">
            <div>
              <p className="hero-eyebrow">Ledger atelier</p>
              <h1 className="hero-title mt-4 max-w-2xl text-3xl font-semibold leading-tight text-[var(--text-strong)] sm:text-5xl">
                Every transaction now reads like a story.
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[var(--text-muted)] sm:text-base">
                Explore balance momentum, inspect cash movement, and switch perspectives between admin and viewer controls.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 max-[420px]:flex-col max-[420px]:items-stretch">
                <RoleSwitcher />
                <ThemeToggle />
              </div>

              <div className="mt-4 max-w-lg">
                <AuthAccessPanel />
              </div>
            </div>

            <aside className="hero-aside">
              <p className="hero-aside-label">Session pulse</p>
              <ul className="mt-3 space-y-2">
                <li className="hero-signal">
                  <span>Sync status</span>
                  <strong>{isLoading ? 'Refreshing' : 'Stable'}</strong>
                </li>
                <li className="hero-signal">
                  <span>Visible records</span>
                  <strong>{visibleTransactions.length}</strong>
                </li>
                <li className="hero-signal">
                  <span>Total ledger</span>
                  <strong>{transactions.length}</strong>
                </li>
              </ul>
            </aside>
          </div>
        </header>

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-[var(--negative)] bg-[var(--accent-soft)] px-4 py-3 text-sm font-medium text-[var(--negative)]">
            {errorMessage}
          </p>
        ) : null}

        <SummaryCards transactions={visibleTransactions} />

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="stagger" style={{ animationDelay: '120ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[360px]" />}>
              <BalanceTrendChart transactions={visibleTransactions} />
            </Suspense>
          </div>
          <div className="stagger" style={{ animationDelay: '200ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[360px]" />}>
              <SpendingBreakdownChart transactions={visibleTransactions} />
            </Suspense>
          </div>
        </div>

        <div className="mt-6 stagger" style={{ animationDelay: '240ms' }}>
          <Suspense fallback={<SectionFallback minHeightClass="min-h-[360px]" />}>
            <CashflowMixChart transactions={visibleTransactions} />
          </Suspense>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="stagger" style={{ animationDelay: '280ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[460px]" />}>
              <TransactionsPanel />
            </Suspense>
          </div>
          <div className="stagger" style={{ animationDelay: '340ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[360px]" />}>
              <InsightsPanel transactions={visibleTransactions} />
            </Suspense>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <div className="stagger" style={{ animationDelay: '380ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[460px]" />}>
              <BudgetPlannerPanel transactions={transactions} />
            </Suspense>
          </div>
          <div className="stagger" style={{ animationDelay: '430ms' }}>
            <Suspense fallback={<SectionFallback minHeightClass="min-h-[460px]" />}>
              <FinanceIntelligencePanel transactions={visibleTransactions} />
            </Suspense>
          </div>
        </div>

        <div className="mt-6 stagger" style={{ animationDelay: '470ms' }}>
          <Suspense fallback={<SectionFallback minHeightClass="min-h-[280px]" />}>
            <ActionPlanPanel transactions={visibleTransactions} />
          </Suspense>
        </div>

        <p className="mt-5 text-right text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          {isLoading
            ? 'Updating mock API feed...'
            : 'Mock API and local storage persistence active'}
        </p>
      </div>
    </div>
  )
}

export default App
