/** Label shown beside an icon-only control when the sidebar is collapsed (hover or keyboard focus). */
export function CollapsedHint({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 hidden -translate-y-1/2 rounded-sm bg-edge px-2 py-1 type-caption font-medium whitespace-nowrap text-bg opacity-0 shadow-pop transition-opacity duration-150 group-hover/nav:opacity-100 group-focus-visible/nav:opacity-100 group-data-[collapsed=true]/sidebar:block"
    >
      {children}
    </span>
  );
}
