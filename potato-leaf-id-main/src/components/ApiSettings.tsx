import { useEffect, useState } from "react";
import { getApiUrl, setApiUrl } from "@/lib/predict";
import { toast } from "sonner";

export function ApiSettings() {
  const [url, setUrl] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    const s = getApiUrl();
    setUrl(s);
    setSaved(s);
  }, []);

  const onSave = () => {
    setApiUrl(url.trim());
    setSaved(url.trim());
    toast.success(url.trim() ? "API endpoint saved" : "Switched to demo mode");
  };

  return (
    <div className="rounded-sm border border-border bg-surface p-5">
      <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
        Inference Endpoint
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Point this to your Python FastAPI/Flask server (the one loading{" "}
        <code className="font-mono text-xs">final_mobilenet_cbam_v2_224.h5</code>). When empty, the
        site runs in <span className="text-foreground font-medium">demo mode</span> with realistic
        mock predictions.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-api.ngrok.io  (POST /predict)"
          className="flex-1 px-3 py-2 bg-background border border-border rounded text-sm font-mono"
        />
        <button
          onClick={onSave}
          className="px-5 py-2 bg-foreground text-background text-sm font-medium rounded hover:opacity-90"
        >
          Save
        </button>
      </div>
      <div className="mt-3 text-[11px] font-mono text-muted-foreground">
        Current: {saved ? <span className="text-lab-accent">{saved}</span> : <span>— demo mode</span>}
      </div>
    </div>
  );
}
