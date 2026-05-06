// Prediction client. Calls user-hosted Python API if configured,
// otherwise returns a realistic mock so the UI works in demo mode.
import { DISEASE_KEYS, severityFromPercent, recommendCure, type DiseaseKey, type Severity } from "./diseases";

export interface PredictionResult {
  disease: DiseaseKey;
  confidence: number;          // 0..1
  infected_area_percent: number;
  severity: Severity;
  recommendation: string;
  source: "api" | "mock";
  latency_ms: number;
}

const API_URL_KEY = "plantai_api_url";

export function getApiUrl(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(API_URL_KEY) || "";
}

export function setApiUrl(url: string) {
  if (typeof window === "undefined") return;
  if (url) localStorage.setItem(API_URL_KEY, url);
  else localStorage.removeItem(API_URL_KEY);
}

async function estimateInfectedAreaFromImage(file: File): Promise<number> {
  // Browser-side approximation matching severity_estimation.py:
  // converts to HSV-ish (we use simple RGB heuristic) and counts brown/yellow pixels.
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const size = 224;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(15);
      ctx.drawImage(img, 0, 0, size, size);
      const { data } = ctx.getImageData(0, 0, size, size);
      let infected = 0;
      const total = size * size;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        // brown / yellow / dead-tissue heuristic
        const isBrownish = r > 80 && r < 200 && g > 50 && g < 170 && b < 120 && r > b && r >= g - 20;
        const isYellowish = r > 150 && g > 130 && b < 110;
        if (isBrownish || isYellowish) infected++;
      }
      resolve((infected / total) * 100);
    };
    img.onerror = () => resolve(12);
    img.src = URL.createObjectURL(file);
  });
}

function mockClassify(filename: string): { disease: DiseaseKey; confidence: number } {
  const lower = filename.toLowerCase();
  for (const key of DISEASE_KEYS) {
    if (lower.includes(key.toLowerCase().replace(/\s+/g, "")) || lower.includes(key.toLowerCase().split(" ")[0])) {
      return { disease: key, confidence: 0.88 + Math.random() * 0.1 };
    }
  }
  // hash-based pseudo-random pick for stable demo behavior
  let h = 0;
  for (let i = 0; i < filename.length; i++) h = (h * 31 + filename.charCodeAt(i)) >>> 0;
  const disease = DISEASE_KEYS[h % DISEASE_KEYS.length];
  return { disease, confidence: 0.82 + (h % 100) / 1000 };
}

export async function predictLeaf(file: File): Promise<PredictionResult> {
  const start = performance.now();
  const apiUrl = getApiUrl();

  if (apiUrl) {
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${apiUrl.replace(/\/$/, "")}/predict`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const j = await res.json();
      const disease = j.disease as DiseaseKey;
      const infected = Number(j.infected_area_percent ?? 0);
      const severity = (j.severity as Severity) ?? (disease === "Healthy" ? "None" : severityFromPercent(infected));
      return {
        disease,
        confidence: Number(j.confidence ?? 0),
        infected_area_percent: infected,
        severity,
        recommendation: j.recommendation ?? recommendCure(disease, severity),
        source: "api",
        latency_ms: Math.round(performance.now() - start),
      };
    } catch (err) {
      console.warn("[predict] API failed, falling back to mock:", err);
    }
  }

  // Mock pipeline
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
  const { disease, confidence } = mockClassify(file.name);
  let infected = 0;
  let severity: Severity = "None";
  let recommendation = "Leaf is healthy. No treatment required.";
  if (disease !== "Healthy") {
    infected = await estimateInfectedAreaFromImage(file);
    severity = severityFromPercent(infected);
    recommendation = recommendCure(disease, severity);
  }
  return {
    disease,
    confidence,
    infected_area_percent: Number(infected.toFixed(2)),
    severity,
    recommendation,
    source: "mock",
    latency_ms: Math.round(performance.now() - start),
  };
}
