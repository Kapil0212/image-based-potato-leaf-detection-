import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DISEASES, DISEASE_KEYS, type DiseaseKey } from "@/lib/diseases";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Pathogen Database — Agri-Lab" },
      {
        name: "description",
        content:
          "Reference library for the 7 potato leaf classes the model detects: symptoms, causes, prevention, and treatment by severity.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [active, setActive] = useState<DiseaseKey>("Early Blight");
  const info = DISEASES[active];

  return (
    <div className="data-grid">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
            Module_03 // Pathogen Database
          </div>
          <h1 className="text-4xl font-light tracking-tight">Disease Reference Library</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Field reference for the 7 classes covered by the model. Select a class to view full
            symptom profile, prevention measures, and severity-graded treatment.
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-1">
            {DISEASE_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={
                  "w-full text-left px-4 py-3 rounded-sm border text-sm transition-colors " +
                  (k === active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-card border-border hover:bg-surface")
                }
              >
                <div className="font-medium">{k}</div>
                {DISEASES[k].scientific && (
                  <div
                    className={
                      "text-[11px] italic mt-0.5 " +
                      (k === active ? "text-background/60" : "text-muted-foreground")
                    }
                  >
                    {DISEASES[k].scientific}
                  </div>
                )}
              </button>
            ))}
          </aside>

          {/* Detail */}
          <div className="lg:col-span-3 bg-card border border-border rounded-sm p-6 lg:p-8 space-y-8">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-2">
                Class Profile
              </div>
              <h2 className="text-3xl font-medium">{info.key}</h2>
              {info.scientific && (
                <div className="text-sm italic text-muted-foreground mt-1">{info.scientific}</div>
              )}
              <p className="text-base text-muted-foreground mt-4 leading-relaxed">{info.short}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Section title="Symptoms">
                <ul className="space-y-1.5 text-sm">
                  {info.symptoms.map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="text-lab-accent font-mono">›</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Section>
              <Section title="Causes">
                <p className="text-sm leading-relaxed">{info.causes}</p>
              </Section>
              <Section title="Prevention">
                <p className="text-sm leading-relaxed">{info.prevention}</p>
              </Section>
              <Section title="Detection Method">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Identified via MobileNetV2 + CBAM feature extraction. Severity computed from
                  HSV-segmented infected area percentage.
                </p>
              </Section>
            </div>

            {info.key !== "Healthy" && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  Treatment by Severity
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <SeverityCard level="Mild" tone="bg-lab-accent" text={info.cures.Mild} />
                  <SeverityCard level="Moderate" tone="bg-lab-warn" text={info.cures.Moderate} />
                  <SeverityCard level="Severe" tone="bg-lab-danger" text={info.cures.Severe} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function SeverityCard({ level, tone, text }: { level: string; tone: string; text: string }) {
  return (
    <div className="border border-border rounded-sm p-4 bg-surface">
      <div className="flex items-center gap-2 mb-2">
        <span className={"size-2 rounded-full " + tone} />
        <span className="font-mono text-xs uppercase tracking-widest">{level}</span>
      </div>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}
