type Props = {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DesignSection({ id, title, description, children }: Props) {
  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-6 border-t border-border pt-10">
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="type-section">
          {title}
        </h2>
        {description ? <p className="type-body-sm max-w-prose text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="type-label text-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
  );
}
