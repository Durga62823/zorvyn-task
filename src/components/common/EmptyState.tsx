interface EmptyStateProps {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-5 py-8 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
        Empty view
      </p>
      <h3 className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">{description}</p>
    </div>
  )
}
