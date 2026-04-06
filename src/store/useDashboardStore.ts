import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_BUDGETS,
  DEFAULT_FILTERS,
  DEFAULT_SORT,
} from '../data/mockTransactions'
import {
  clearLoginToken,
  getActiveSession,
  loginUser as loginStoredUser,
  registerUser as registerStoredUser,
} from '../services/authStorage'
import { mockFinanceApi } from '../services/mockFinanceApi'
import type {
  CategoryBudgets,
  ExpenseCategory,
  LoginCredentials,
  RegisteredUser,
  RegisterUserDraft,
  ThemeMode,
  Transaction,
  TransactionDraft,
  TransactionFilters,
  TransactionSort,
  UserRole,
} from '../types/finance'

const getDefaultTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

interface DashboardState {
  transactions: Transaction[]
  filters: TransactionFilters
  sort: TransactionSort
  budgets: CategoryBudgets
  selectedRole: UserRole
  authToken: string | null
  currentUser: RegisteredUser | null
  theme: ThemeMode
  isInitialized: boolean
  isLoading: boolean
  errorMessage: string | null
  initialize: () => Promise<void>
  setRole: (role: UserRole) => void
  registerAccount: (draft: RegisterUserDraft) => RegisteredUser
  loginAccount: (credentials: LoginCredentials) => RegisteredUser
  logoutAccount: () => void
  setTheme: (mode: ThemeMode) => void
  toggleTheme: () => void
  updateFilters: (patch: Partial<TransactionFilters>) => void
  clearFilters: () => void
  setSortField: (field: TransactionSort['field']) => void
  setSortDirection: (direction: TransactionSort['direction']) => void
  setBudget: (category: ExpenseCategory, limit: number) => void
  resetBudgets: () => void
  addTransaction: (draft: TransactionDraft) => Promise<void>
  editTransaction: (id: string, draft: TransactionDraft) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

const roleCanManageData = (role: UserRole, token: string | null) =>
  role === 'admin' && Boolean(token)

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Something went wrong while updating transactions.'

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      transactions: [],
      filters: DEFAULT_FILTERS,
      sort: DEFAULT_SORT,
      budgets: DEFAULT_BUDGETS,
      selectedRole: 'viewer',
      authToken: null,
      currentUser: null,
      theme: getDefaultTheme(),
      isInitialized: false,
      isLoading: false,
      errorMessage: null,

      initialize: async () => {
        if (get().isInitialized || get().isLoading) {
          return
        }

        const activeSession = getActiveSession()

        set({
          currentUser: activeSession?.user ?? null,
          authToken: activeSession?.token ?? null,
          selectedRole: activeSession?.user.role ?? get().selectedRole,
        })

        set({ isLoading: true, errorMessage: null })

        try {
          const hydratedTransactions = get().transactions

          await mockFinanceApi.bootstrap(
            hydratedTransactions.length > 0 ? hydratedTransactions : undefined,
          )

          const freshTransactions = await mockFinanceApi.getTransactions()

          set({
            transactions: freshTransactions,
            isInitialized: true,
            isLoading: false,
            errorMessage: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            errorMessage: getErrorMessage(error),
          })
        }
      },

      setRole: (role) => {
        if (get().currentUser) {
          return
        }

        set({ selectedRole: role })
      },

      registerAccount: (draft) => registerStoredUser(draft),

      loginAccount: (credentials) => {
        const session = loginStoredUser(credentials)

        set({
          authToken: session.token,
          currentUser: session.user,
          selectedRole: session.user.role,
        })

        return session.user
      },

      logoutAccount: () => {
        clearLoginToken()

        set({
          authToken: null,
          currentUser: null,
          selectedRole: 'viewer',
        })
      },

      setTheme: (mode) => {
        set({ theme: mode })
      },

      toggleTheme: () => {
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
      },

      updateFilters: (patch) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...patch,
          },
        }))
      },

      clearFilters: () => {
        set({ filters: DEFAULT_FILTERS })
      },

      setSortField: (field) => {
        set((state) => ({
          sort: {
            field,
            direction:
              state.sort.field === field
                ? state.sort.direction === 'asc'
                  ? 'desc'
                  : 'asc'
                : 'desc',
          },
        }))
      },

      setSortDirection: (direction) => {
        set((state) => ({
          sort: {
            ...state.sort,
            direction,
          },
        }))
      },

      setBudget: (category, limit) => {
        if (!roleCanManageData(get().selectedRole, get().authToken)) {
          return
        }

        const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.round(limit)) : 0

        set((state) => ({
          budgets: {
            ...state.budgets,
            [category]: safeLimit,
          },
        }))
      },

      resetBudgets: () => {
        if (!roleCanManageData(get().selectedRole, get().authToken)) {
          return
        }

        set({ budgets: DEFAULT_BUDGETS })
      },

      addTransaction: async (draft) => {
        if (!roleCanManageData(get().selectedRole, get().authToken)) {
          return
        }

        set({ isLoading: true, errorMessage: null })

        try {
          const created = await mockFinanceApi.createTransaction(draft)

          set((state) => ({
            transactions: [created, ...state.transactions],
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false, errorMessage: getErrorMessage(error) })
        }
      },

      editTransaction: async (id, draft) => {
        if (!roleCanManageData(get().selectedRole, get().authToken)) {
          return
        }

        set({ isLoading: true, errorMessage: null })

        try {
          const updated = await mockFinanceApi.updateTransaction(id, draft)

          set((state) => ({
            transactions: state.transactions.map((transaction) =>
              transaction.id === id ? updated : transaction,
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false, errorMessage: getErrorMessage(error) })
        }
      },

      deleteTransaction: async (id) => {
        if (!roleCanManageData(get().selectedRole, get().authToken)) {
          return
        }

        set({ isLoading: true, errorMessage: null })

        try {
          await mockFinanceApi.deleteTransaction(id)

          set((state) => ({
            transactions: state.transactions.filter(
              (transaction) => transaction.id !== id,
            ),
            isLoading: false,
          }))
        } catch (error) {
          set({ isLoading: false, errorMessage: getErrorMessage(error) })
        }
      },
    }),
    {
      name: 'zynox-dashboard-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        selectedRole: state.selectedRole,
        theme: state.theme,
      }),
    },
  ),
)
