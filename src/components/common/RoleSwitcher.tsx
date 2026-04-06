import { USER_ROLES, type UserRole } from '../../types/finance'
import { useDashboardStore } from '../../store/useDashboardStore'

export function RoleSwitcher() {
  const selectedRole = useDashboardStore((state) => state.selectedRole)
  const setRole = useDashboardStore((state) => state.setRole)

  return (
    <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
      <span className="font-medium text-[var(--text-muted)]">Role</span>
      <select
        value={selectedRole}
        onChange={(event) => setRole(event.target.value as UserRole)}
        className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-sm font-medium text-[var(--text-strong)] outline-none transition focus:border-[var(--accent)]"
      >
        {USER_ROLES.map((role) => (
          <option key={role} value={role}>
            {role[0].toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
    </label>
  )
}
