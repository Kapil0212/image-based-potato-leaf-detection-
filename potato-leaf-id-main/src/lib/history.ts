import type { PredictionResult } from "./predict";

const KEY = "plantai_history";

export interface HistoryEntry extends PredictionResult {
  id: string;
  filename: string;
  imageDataUrl: string;
  timestamp: number;
}

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addHistory(entry: HistoryEntry) {
  const list = [entry, ...getHistory()].slice(0, 30);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function deleteHistory(id: string) {
  const list = getHistory().filter((e) => e.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
