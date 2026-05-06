import { createFileRoute, Link } from "@tanstack/react-router";
import { TEST_ACCURACY } from "@/data/confusionMatrix";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Agri-Lab — Potato Leaf Disease Detection" },
      {
        name: "description",
        content:
          "Automated potato pathogen identification with 91.4% validated precision. MobileNetV2 + CBAM deep learning model.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const accPct = (TEST_ACCURACY * 100).toFixed(2);

  return (
    <div className="data-grid">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-8">
            <div className="inline-block px-3 py-1 bg-lab-accent/10 border border-lab-accent/20 rounded text-lab-accent text-xs font-mono font-medium tracking-wide">
              {accPct}% VALIDATED PRECISION
            </div>
            <h1 className="text-5xl lg:text-6xl font-light tracking-tight leading-[1.1] text-balance">
              Automated <span className="font-medium">Potato Pathogen</span> Identification System.
            </h1>
            <p className="text-lg text-muted-foreground max-w-[52ch] leading-relaxed">
              A high-fidelity diagnostic interface for rapid detection of Solanum tuberosum leaf
              anomalies using a deep MobileNetV2 + CBAM neural architecture trained on 7 disease
              classes.
            </p>

            <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
              <Stat label="Disease Classes" value="7" />
              <Stat label="Test Accuracy" value={`${accPct}%`} />
              <Stat label="Model Params" value="~3.5M" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/detect"
                className="px-7 py-3.5 bg-foreground text-background text-sm font-medium rounded hover:opacity-90 transition-all flex items-center gap-3"
              >
                Begin Diagnosis
                <span className="font-mono opacity-50">—&gt;</span>
              </Link>
              <Link
                to="/dashboard"
                className="px-7 py-3.5 border border-border text-sm font-medium rounded hover:bg-surface transition-colors"
              >
                View Model Metrics
              </Link>
            </div>
          </div>

          {/* Demo card */}
          <div className="relative">
            <div className="bg-card clinical-border rounded-sm shadow-2xl p-1">
              <div className="bg-surface p-6 sm:p-8 border border-border rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                    Sample Output // Module_01
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground">LIVE</div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="size-32 shrink-0 bg-muted clinical-border rounded overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=300&h=300&fit=crop"
                      alt="Potato leaf specimen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex justify-between items-end gap-3">
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
                          Detected
                        </div>
                        <div className="text-xl font-medium truncate">Late Blight</div>
                        <div className="text-xs text-lab-accent font-medium mt-0.5">Positive</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                          Confidence
                        </div>
                        <div className="text-xl font-mono tabular-nums">94.2%</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono uppercase text-muted-foreground">
                        <span>Severity</span>
                        <span>Moderate</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-lab-warn w-[62%]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-card border border-border rounded-sm">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">
                    Treatment Protocol
                  </div>
                  <p className="text-xs leading-relaxed">
                    Apply Copper-based fungicides or Metalaxyl. Improve airflow and remove infected
                    foliage immediately to prevent aerial spore transmission.
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 size-24 border-r-2 border-b-2 border-border opacity-50 hidden lg:block" />
            <div className="absolute -top-6 -left-6 size-24 border-l-2 border-t-2 border-border opacity-50 hidden lg:block" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
            Methodology
          </div>
          <h2 className="text-3xl font-light tracking-tight mb-12">How the pipeline works.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Step
              n="01"
              title="Image Capture"
              text="Upload a clear photo of a single potato leaf. The image is preprocessed to 224×224 and normalized."
            />
            <Step
              n="02"
              title="Neural Classification"
              text="MobileNetV2 backbone with CBAM attention blocks predicts one of 7 disease classes with confidence."
            />
            <Step
              n="03"
              title="Severity & Treatment"
              text="HSV-based segmentation estimates infected leaf area, classifies severity, and recommends a cure."
            />
          </div>
        </div>
      </section>

      {/* Disease grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
              Pathogen Coverage
            </div>
            <h2 className="text-3xl font-light tracking-tight">7 classes detected.</h2>
          </div>
          <Link
            to="/library"
            className="text-sm font-medium underline-offset-4 hover:underline"
          >
            Open full database →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            "Early Blight",
            "Late Blight",
            "Healthy",
            "Fungal Diseases",
            "Plant Pests",
            "Potato Cyst Nematode",
            "Potato Virus",
          ].map((d) => (
            <div
              key={d}
              className="border border-border rounded-sm p-4 bg-card hover:bg-surface transition-colors"
            >
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
                Class
              </div>
              <div className="text-sm font-medium">{d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </div>
      <div className="text-2xl font-medium tabular-nums font-mono">{value}</div>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="border border-border bg-card rounded-sm p-6">
      <div className="font-mono text-xs text-lab-accent mb-3">{n}</div>
      <div className="text-lg font-medium mb-2">{title}</div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
