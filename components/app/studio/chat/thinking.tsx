/** Three bouncing dots and a shimmering label while the assistant works. */
export function Thinking({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-2.5 py-1">
      <span aria-hidden="true" className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-dot rounded-full bg-brand"
            style={{ animationDelay: `${i * 160}ms` }}
          />
        ))}
      </span>
      <span className="animate-text-shimmer bg-[linear-gradient(90deg,var(--text-muted)_0%,var(--text-muted)_40%,var(--text)_50%,var(--text-muted)_60%,var(--text-muted)_100%)] bg-[length:200%_100%] bg-clip-text type-body-sm text-transparent">
        {label}
      </span>
    </div>
  );
}
