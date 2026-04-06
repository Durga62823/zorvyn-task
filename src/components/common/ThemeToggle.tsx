import { useDashboardStore } from '../../store/useDashboardStore'

export function ThemeToggle() {
  const theme = useDashboardStore((state) => state.theme)
  const toggleTheme = useDashboardStore((state) => state.toggleTheme)

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="control-chip rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold text-[var(--text-strong)] shadow-[var(--soft-shadow)] transition hover:border-[var(--accent-strong)]"
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
