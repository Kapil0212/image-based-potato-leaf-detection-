import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { predictLeaf, type PredictionResult } from "@/lib/predict";
import { addHistory, fileToDataUrl } from "@/lib/history";
import { ApiSettings } from "@/components/ApiSettings";
import { DISEASES } from "@/lib/diseases";
import { toast } from "sonner";

export const Route = createFileRoute("/detect")({
  head: () => ({
    meta: [
      { title: "Diagnostics — Agri-Lab" },
      {
        name: "description",
        content:
          "Upload a potato leaf image to detect disease, estimate severity, and get a treatment recommendation.",
      },
    ],
  }),
  component: DetectPage,
});

function DetectPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const onFile = useCallback(async (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG/PNG).");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      toast.error("Image too large (max 12MB).");
      return;
    }
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const runAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await predictLeaf(file);
      setResult(r);
      const dataUrl = await fileToDataUrl(file);
      addHistory({
        ...r,
        id: crypto.randomUUID(),
        filename: file.name,
        imageDataUrl: dataUrl,
        timestamp: Date.now(),
      });
      toast.success(
        r.source === "api" ? `Live API result · ${r.latency_ms}ms` : `Demo result · ${r.latency_ms}ms`
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Analysis failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
  };

  return (
    <div className="data-grid min-h-[calc(100vh-200px)]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
            Module_01 // Diagnostics
          </div>
          <h1 className="text-4xl font-light tracking-tight">Leaf Specimen Analysis</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Upload a single potato leaf image. The model returns predicted disease, confidence,
            infected leaf area, severity, and a treatment protocol.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: input */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card clinical-border rounded-sm shadow-xl p-1">
              <div className="bg-surface p-6 border border-border rounded-sm">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Input Terminal
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {new Date().toISOString().slice(0, 10)}
                  </div>
                </div>

                {!preview ? (
                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) onFile(f);
                    }}
                    className={
                      "block border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-colors bg-card " +
                      (dragOver ? "border-lab-accent bg-lab-accent/5" : "border-border hover:border-lab-accent")
                    }
                  >
                    <div className="size-12 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-4">
                      <div className="size-4 border-2 border-foreground rounded-sm" />
                    </div>
                    <div className="text-sm font-medium mb-1">Drop specimen image here</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      JPEG, PNG up to 12MB
                    </div>
                    <div className="mt-6 inline-block px-4 py-2 border border-border text-xs font-medium rounded hover:bg-surface bg-background">
                      Browse Directory
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onFile(f);
                      }}
                    />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-sm overflow-hidden border border-border">
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
                      <span className="truncate">{file?.name}</span>
                      <button onClick={reset} className="underline-offset-2 hover:underline">
                        Clear
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={runAnalysis}
                        disabled={loading}
                        className="flex-1 py-3 bg-lab-accent text-white text-[11px] font-mono uppercase tracking-wider font-semibold rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Analyzing…" : "Run Analysis"}
                      </button>
                      <button
                        onClick={reset}
                        disabled={loading}
                        className="py-3 px-5 bg-surface border border-border text-[11px] font-mono uppercase tracking-wider font-semibold rounded hover:bg-card disabled:opacity-50"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ApiSettings />
          </div>

          {/* Right: result */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-card clinical-border rounded-sm shadow-xl p-1">
              <div className="bg-surface p-6 border border-border rounded-sm min-h-[400px]">
                <div className="flex justify-between items-center mb-4 border-b border-border pb-3">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Analysis Output
                  </div>
                  {result && (
                    <div
                      className={
                        "text-[10px] font-mono px-2 py-0.5 rounded " +
                        (result.source === "api"
                          ? "bg-lab-accent/10 text-lab-accent"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {result.source === "api" ? "LIVE API" : "DEMO"}
                    </div>
                  )}
                </div>

                {!result && !loading && (
                  <div className="text-center text-sm text-muted-foreground py-20">
                    Awaiting specimen upload…
                  </div>
                )}

                {loading && (
                  <div className="space-y-4 py-8">
                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest text-center">
                      Processing neural inference…
                    </div>
                    <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-lab-accent animate-pulse w-2/3" />
                    </div>
                    <div className="space-y-2 mt-6">
                      <SkelLine />
                      <SkelLine />
                      <SkelLine />
                    </div>
                  </div>
                )}

                {result && <ResultView r={result} />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkelLine() {
  return <div className="h-3 bg-border rounded animate-pulse" />;
}

function ResultView({ r }: { r: PredictionResult }) {
  const info = DISEASES[r.disease];
  const sevColor =
    r.severity === "Severe"
      ? "bg-lab-danger"
      : r.severity === "Moderate"
        ? "bg-lab-warn"
        : "bg-lab-accent";
  const sevPct =
    r.severity === "Severe"
      ? 92
      : r.severity === "Moderate"
        ? 62
        : r.severity === "Mild"
          ? 28
          : 4;

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
          Detected Pathogen
        </div>
        <div className="text-2xl font-medium">{r.disease}</div>
        {info.scientific && (
          <div className="text-xs italic text-muted-foreground">{info.scientific}</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-border rounded-sm p-3 bg-card">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Confidence
          </div>
          <div className="text-xl font-mono tabular-nums">
            {(r.confidence * 100).toFixed(1)}%
          </div>
        </div>
        <div className="border border-border rounded-sm p-3 bg-card">
          <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Latency
          </div>
          <div className="text-xl font-mono tabular-nums">{r.latency_ms}ms</div>
        </div>
      </div>

      {r.disease !== "Healthy" && (
        <>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
              <span>Infected Area</span>
              <span>{r.infected_area_percent.toFixed(2)}%</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div
                className={"h-full " + sevColor}
                style={{ width: `${Math.min(100, r.infected_area_percent)}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
              <span>Severity Index</span>
              <span>{r.severity}</span>
            </div>
            <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
              <div className={"h-full " + sevColor} style={{ width: `${sevPct}%` }} />
            </div>
          </div>
        </>
      )}

      <div className="p-4 bg-card border border-border rounded-sm">
        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
          Treatment Protocol
        </div>
        <p className="text-xs leading-relaxed">{r.recommendation}</p>
      </div>
    </div>
  );
}
