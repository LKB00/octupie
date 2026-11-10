import { Input } from "@/components/ui/input";

export function Field({
  id,
  label,
  defaultValue,
  hint,
  type = "text",
  disabled,
}: {
  id: string;
  label: string;
  defaultValue: string;
  hint?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="type-label">
        {label}
      </label>
      <Input
        id={id}
        type={type}
        defaultValue={defaultValue}
        disabled={disabled}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint ? (
        <p id={`${id}-hint`} className="type-caption text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="type-section">{title}</h2>
      {children}
    </section>
  );
}
