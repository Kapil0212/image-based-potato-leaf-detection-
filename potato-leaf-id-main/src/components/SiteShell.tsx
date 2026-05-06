import { Link, useRouterState } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Overview" },
  { to: "/detect", label: "Diagnostics" },
  { to: "/dashboard", label: "Model Metrics" },
  { to: "/library", label: "Pathogen Database" },
  { to: "/history", label: "Scan History" },
] as const;

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-mono font-semibold tracking-tighter text-xl">
            AGRI-LAB <span className="text-lab-accent">v.01</span>
          </span>
        </Link>

        <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "transition-colors hover:text-foreground " +
                  (active ? "text-foreground" : "")
                }
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface border border-border rounded text-[11px] font-mono uppercase tracking-wider">
          <span className="size-2 rounded-full bg-lab-accent animate-pulse" />
          System Active
        </div>
      </div>

      {/* mobile nav */}
      <div className="md:hidden border-t border-border overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 text-xs whitespace-nowrap">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={
                  "px-3 py-1.5 rounded font-medium " +
                  (active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface")
                }
              >
                {n.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background mt-20">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <div className="flex flex-wrap gap-6">
          <span>Status: Nominal</span>
          <span>Model: MobileNetV2 + CBAM</span>
          <span>Dataset: AGRI-POTATO-V4 · 7 Classes</span>
        </div>
        <div className="flex gap-6">
          <span>Final Year Major Project</span>
          <span className="text-foreground">© Agri-Lab Research</span>
        </div>
      </div>
    </footer>
  );
}
