import { createFileRoute } from "@tanstack/react-router";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { trainingHistory } from "@/data/trainingHistory";
import {
  CM_LABELS,
  CONFUSION_MATRIX,
  classMetrics,
  TEST_ACCURACY,
} from "@/data/confusionMatrix";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Model Metrics — Agri-Lab" },
      {
        name: "description",
        content:
          "Training history, confusion matrix, and per-class precision/recall/F1 for the MobileNetV2 + CBAM potato leaf classifier.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const last = trainingHistory[trainingHistory.length - 1];
  const metrics = classMetrics();
  const max = Math.max(...CONFUSION_MATRIX.flat());
  const accPct = (TEST_ACCURACY * 100).toFixed(2);

  return (
    <div className="data-grid">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
            Module_02 // Model Metrics
          </div>
          <h1 className="text-4xl font-light tracking-tight">Model Performance Dashboard</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            MobileNetV2 + CBAM trained on Potato_processed_7 dataset · 50 epochs · Adam
            optimizer with ReduceLROnPlateau.
          </p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Test Accuracy" value={`${accPct}%`} accent />
          <Kpi label="Final Val Acc" value={`${(last.val_acc * 100).toFixed(2)}%`} />
          <Kpi label="Final Train Loss" value={last.loss.toFixed(4)} />
          <Kpi label="Final Val Loss" value={last.val_loss.toFixed(4)} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <ChartCard title="Training Accuracy">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="epoch" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis
                  domain={[0.3, 1]}
                  stroke="var(--color-muted-foreground)"
                  fontSize={11}
                  tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="acc" name="Train Acc" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="val_acc" name="Val Acc" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Training Loss">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trainingHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="epoch" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="loss" name="Train Loss" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="val_loss" name="Val Loss" stroke="#f97316" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Confusion matrix */}
        <ChartCard title="Confusion Matrix (Test Set)">
          <div className="overflow-x-auto">
            <table className="text-xs font-mono w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className="p-2 text-left text-muted-foreground font-normal">True ↓ / Pred →</th>
                  {CM_LABELS.map((l) => (
                    <th
                      key={l}
                      className="p-2 font-normal text-muted-foreground text-center whitespace-nowrap"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                    >
                      {l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CM_LABELS.map((rowLabel, i) => (
                  <tr key={rowLabel} className="border-t border-border">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">{rowLabel}</td>
                    {CONFUSION_MATRIX[i].map((v, j) => {
                      const isDiag = i === j;
                      const intensity = v / max;
                      const bg = isDiag
                        ? `color-mix(in oklab, var(--color-lab-accent) ${intensity * 60}%, transparent)`
                        : v > 0
                          ? `color-mix(in oklab, var(--color-lab-danger) ${intensity * 50}%, transparent)`
                          : "transparent";
                      return (
                        <td
                          key={j}
                          className="p-2 text-center tabular-nums border-l border-border"
                          style={{ background: bg }}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        {/* Per-class metrics */}
        <ChartCard title="Per-Class Metrics">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  <th className="p-3 text-left font-normal">Class</th>
                  <th className="p-3 text-right font-normal">Support</th>
                  <th className="p-3 text-right font-normal">Precision</th>
                  <th className="p-3 text-right font-normal">Recall</th>
                  <th className="p-3 text-right font-normal">F1</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {metrics.map((m) => (
                  <tr key={m.label} className="border-t border-border">
                    <td className="p-3 font-sans font-medium">{m.label}</td>
                    <td className="p-3 text-right text-muted-foreground">{m.support}</td>
                    <td className="p-3 text-right">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="p-3 text-right">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="p-3 text-right text-lab-accent">{(m.f1 * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={"border border-border rounded-sm p-5 bg-card " + (accent ? "ring-1 ring-lab-accent/30" : "")}>
      <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className={"text-2xl font-mono tabular-nums " + (accent ? "text-lab-accent" : "")}>
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-sm p-5">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-4 border-b border-border pb-3">
        {title}
      </div>
      {children}
    </div>
  );
}
