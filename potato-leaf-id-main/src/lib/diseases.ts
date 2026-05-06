export type DiseaseKey =
  | "Early Blight"
  | "Late Blight"
  | "Healthy"
  | "Fungal Diseases"
  | "Plant Pests"
  | "Potato Cyst Nematode"
  | "Potato Virus";

export type Severity = "Mild" | "Moderate" | "Severe" | "None";

export interface DiseaseInfo {
  key: DiseaseKey;
  scientific?: string;
  short: string;
  symptoms: string[];
  causes: string;
  prevention: string;
  cures: { Mild: string; Moderate: string; Severe: string };
  color: string; // tailwind text color
}

export const DISEASES: Record<DiseaseKey, DiseaseInfo> = {
  "Early Blight": {
    key: "Early Blight",
    scientific: "Alternaria solani",
    short: "Fungal disease causing concentric brown lesions on older leaves.",
    symptoms: ["Dark concentric ring spots", "Yellowing around lesions", "Lower leaves affected first"],
    causes: "Warm, humid conditions with fungal spores spread through wind and water.",
    prevention: "Crop rotation, resistant cultivars, avoid overhead irrigation, remove plant debris.",
    cures: {
      Mild: "Remove affected leaves and apply Mancozeb fungicide.",
      Moderate: "Apply Chlorothalonil or Mancozeb every 7–10 days.",
      Severe: "Use systemic fungicides like Azoxystrobin and remove heavily infected plants.",
    },
    color: "text-amber-600",
  },
  "Late Blight": {
    key: "Late Blight",
    scientific: "Phytophthora infestans",
    short: "Aggressive water mold causing rapid leaf and tuber decay.",
    symptoms: ["Water-soaked lesions", "White fuzzy growth underside", "Rapid blackening"],
    causes: "Cool, wet weather. Spreads via airborne sporangia.",
    prevention: "Plant certified seed, ensure airflow, monitor weather forecasts, preventive spraying.",
    cures: {
      Mild: "Remove infected leaves and improve air circulation.",
      Moderate: "Apply Copper-based fungicides or Metalaxyl.",
      Severe: "Use Ridomil Gold (Metalaxyl + Mancozeb) and destroy infected plants.",
    },
    color: "text-red-600",
  },
  Healthy: {
    key: "Healthy",
    short: "No disease detected. Leaf shows healthy chlorophyll distribution.",
    symptoms: ["Uniform green color", "No lesions or spots", "Firm leaf structure"],
    causes: "Optimal growing conditions and proper crop care.",
    prevention: "Continue current practices, regular monitoring, balanced fertilization.",
    cures: { Mild: "—", Moderate: "—", Severe: "—" },
    color: "text-lab-accent",
  },
  "Fungal Diseases": {
    key: "Fungal Diseases",
    short: "General fungal infection (powdery mildew, rust, septoria).",
    symptoms: ["White/grey powdery patches", "Yellow/orange pustules", "Leaf curling"],
    causes: "High humidity, poor airflow, contaminated tools or soil.",
    prevention: "Sanitize tools, prune for airflow, avoid leaf wetness in evening.",
    cures: {
      Mild: "Prune infected areas and reduce moisture exposure.",
      Moderate: "Apply broad-spectrum fungicides like Carbendazim.",
      Severe: "Use systemic fungicides and rotate crops.",
    },
    color: "text-violet-600",
  },
  "Plant Pests": {
    key: "Plant Pests",
    short: "Insect damage from aphids, beetles, or leafhoppers.",
    symptoms: ["Bite/chew marks", "Sticky honeydew residue", "Visible insects on underside"],
    causes: "Pest migration from neighbouring fields, lack of natural predators.",
    prevention: "Encourage beneficial insects, sticky traps, regular scouting.",
    cures: {
      Mild: "Use neem oil spray or manual removal of pests.",
      Moderate: "Apply insecticides like Imidacloprid.",
      Severe: "Use systemic insecticides and monitor field regularly.",
    },
    color: "text-orange-600",
  },
  "Potato Cyst Nematode": {
    key: "Potato Cyst Nematode",
    scientific: "Globodera rostochiensis",
    short: "Soil-borne nematode forming cysts on potato roots.",
    symptoms: ["Stunted growth", "Yellowing foliage", "Patchy field decline"],
    causes: "Infected soil, contaminated equipment, susceptible cultivars.",
    prevention: "Use resistant varieties, long crop rotations, soil testing.",
    cures: {
      Mild: "Use resistant potato varieties and crop rotation.",
      Moderate: "Apply nematicides and organic soil treatments.",
      Severe: "Deep soil treatment and long-term crop rotation required.",
    },
    color: "text-stone-600",
  },
  "Potato Virus": {
    key: "Potato Virus",
    short: "Viral infection (PVY, PLRV) typically vectored by aphids.",
    symptoms: ["Mosaic patterns", "Leaf rolling", "Stunted plants"],
    causes: "Aphid transmission, infected seed tubers.",
    prevention: "Use certified virus-free seed, control aphid populations.",
    cures: {
      Mild: "Remove infected plants early to prevent spread.",
      Moderate: "Control aphids using insecticides.",
      Severe: "Destroy infected crops and use certified virus-free seeds.",
    },
    color: "text-blue-600",
  },
};

export const DISEASE_KEYS = Object.keys(DISEASES) as DiseaseKey[];

export function severityFromPercent(p: number): Severity {
  if (p < 10) return "Mild";
  if (p < 30) return "Moderate";
  return "Severe";
}

export function recommendCure(disease: DiseaseKey, severity: Severity): string {
  if (disease === "Healthy") return "Leaf is healthy. No treatment required.";
  if (severity === "None") return "—";
  return DISEASES[disease].cures[severity];
}
