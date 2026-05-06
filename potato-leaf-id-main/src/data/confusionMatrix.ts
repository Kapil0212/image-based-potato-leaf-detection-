import type { DiseaseKey } from "@/lib/diseases";

// From mobilenet_cbam_v2_224_cm.png (test set)
export const CM_LABELS: DiseaseKey[] = [
  "Early Blight",
  "Fungal Diseases",
  "Healthy",
  "Late Blight",
  "Plant Pests",
  "Potato Cyst Nematode",
  "Potato Virus",
];

// rows = true, cols = predicted
export const CONFUSION_MATRIX: number[][] = [
  [51, 0, 0, 0, 0, 0, 0],
  [0, 44, 0, 0, 5, 0, 2],
  [0, 0, 47, 0, 0, 0, 4],
  [0, 4, 1, 46, 0, 0, 0],
  [0, 2, 0, 0, 49, 0, 0],
  [0, 0, 0, 0, 0, 51, 0],
  [0, 1, 0, 0, 0, 0, 50],
];

export function classMetrics() {
  return CM_LABELS.map((label, i) => {
    const tp = CONFUSION_MATRIX[i][i];
    const rowSum = CONFUSION_MATRIX[i].reduce((a, b) => a + b, 0);
    const colSum = CONFUSION_MATRIX.reduce((a, r) => a + r[i], 0);
    const precision = colSum ? tp / colSum : 0;
    const recall = rowSum ? tp / rowSum : 0;
    const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
    return { label, support: rowSum, precision, recall, f1 };
  });
}

export const TEST_ACCURACY = (() => {
  const tp = CONFUSION_MATRIX.reduce((s, r, i) => s + r[i], 0);
  const total = CONFUSION_MATRIX.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0);
  return tp / total;
})();
