import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getHistory, clearHistory, deleteHistory, type HistoryEntry } from "@/lib/history";
import { toast } from "sonner";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Agri-Lab" },
      {
        name: "description",
        content: "Previously analyzed potato leaf scans with predictions, severity, and treatment.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [active, setActive] = useState<HistoryEntry | null>(null);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const refresh = () => {
    const list = getHistory();
    setItems(list);
    if (active && !list.find((i) => i.id === active.id)) setActive(null);
  };

  return (
    <div className="data-grid">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Module_04 // Scan History
            </div>
            <h1 className="text-4xl font-light tracking-tight">Diagnostic History</h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              Last 30 scans stored locally on this device. No data is sent to any server beyond
              your configured inference API.
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all scan history?")) {
                  clearHistory();
                  refresh();
                  toast.success("History cleared");
                }
              }}
              className="text-xs font-mono uppercase tracking-widest px-4 py-2 border border-border rounded hover:bg-surface"
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-border rounded-sm p-16 text-center bg-card">
            <div className="text-sm text-muted-foreground mb-4">
              No scans yet. Run an analysis to populate the log.
            </div>
            <Link
              to="/detect"
              className="inline-block px-5 py-2.5 bg-foreground text-background text-sm font-medium rounded"
            >
              Open Diagnostics
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-3">
              {items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setActive(it)}
                  className={
                    "text-left border rounded-sm bg-card overflow-hidden hover:shadow-md transition-all " +
                    (active?.id === it.id ? "border-foreground" : "border-border")
                  }
                >
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img src={it.imageDataUrl} alt={it.filename} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="flex justify-between items-start gap-2">
                      <div className="font-medium text-sm truncate">{it.disease}</div>
                      <div className="text-[10px] font-mono text-muted-foreground shrink-0">
                        {(it.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      <span>{it.severity}</span>
                      <span>{new Date(it.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 border border-border bg-card rounded-sm p-5 min-h-[300px]">
                {!active ? (
                  <div className="text-sm text-muted-foreground text-center py-12">
                    Select a scan to view details.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-square bg-muted overflow-hidden rounded-sm border border-border">
                      <img src={active.imageDataUrl} alt={active.filename} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        Detected
                      </div>
                      <div className="text-xl font-medium">{active.disease}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <Cell label="Confidence" value={`${(active.confidence * 100).toFixed(1)}%`} />
                      <Cell label="Severity" value={active.severity} />
                      <Cell label="Infected" value={`${active.infected_area_percent.toFixed(1)}%`} />
                      <Cell label="Source" value={active.source.toUpperCase()} />
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                        Treatment
                      </div>
                      <p className="text-xs leading-relaxed">{active.recommendation}</p>
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground">
                      {new Date(active.timestamp).toLocaleString()} · {active.filename}
                    </div>
                    <button
                      onClick={() => {
                        deleteHistory(active.id);
                        refresh();
                        toast.success("Scan deleted");
                      }}
                      className="w-full py-2 border border-border rounded text-xs font-mono uppercase tracking-widest hover:bg-surface"
                    >
                      Delete Scan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-sm p-2 bg-surface">
      <div className="text-[9px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</div>
      <div className="tabular-nums">{value}</div>
    </div>
  );
}
