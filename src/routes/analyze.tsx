import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, Sparkles, Image as ImageIcon, X, Loader2, Search } from "lucide-react";
import Tesseract from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { saveHistory, type AnalysisResult, type RiskFlag, type IngredientInsight, type Verdict } from "@/lib/analysis";

type ApiDetail = { ingredient: string; category: "good" | "moderate" | "harmful" | "unknown"; effect: string };
type ApiResponse = { score: number; verdict: Verdict; risks: string[]; details: ApiDetail[] };

function toAnalysisResult(api: ApiResponse): AnalysisResult {
  const risks: RiskFlag[] = api.risks.map((label) => {
    const matched = api.details.find((d) => d.category === "harmful");
    return {
      label,
      severity: "high",
      detail: matched?.effect ?? "Flagged as a notable health risk.",
    };
  });

  const ingredients: IngredientInsight[] = api.details.map((d) => ({
    name: d.ingredient.charAt(0).toUpperCase() + d.ingredient.slice(1),
    status: d.category === "harmful" ? "avoid" : d.category === "moderate" ? "caution" : "safe",
    note: d.effect,
  }));

  const summary =
    api.verdict === "Good"
      ? "This product looks like a wholesome choice with minimal concerns."
      : api.verdict === "Moderate"
      ? "A mixed bag — some ingredients are fine, but watch the flagged items."
      : "Multiple concerning ingredients detected. Consider a healthier alternative.";

  const recs: string[] = [];
  if (api.risks.some((r) => /sugar/i.test(r))) recs.push("Look for products with <5g added sugar per serving.");
  if (api.risks.some((r) => /sodium|salt/i.test(r))) recs.push("Choose low-sodium variants (less than 140mg per serving).");
  if (api.risks.some((r) => /trans|hydrogenated|palm/i.test(r))) recs.push("Avoid hydrogenated and palm oils — try olive or avocado oil.");
  if (api.risks.some((r) => /artificial/i.test(r))) recs.push("Prefer items labeled 'no artificial colors or flavors'.");
  if (recs.length === 0) recs.push(api.verdict === "Good" ? "Great pick — keep prioritizing whole, minimally processed foods." : "Aim for products with short, recognizable ingredient lists.");

  return {
    score: api.score,
    verdict: api.verdict,
    summary,
    risks,
    ingredients,
    recommendations: recs,
  };
}

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze Ingredients — SWASTHIK" },
      { name: "description", content: "Paste ingredients or upload a label photo. Get an instant AI-powered health score." },
    ],
  }),
  component: AnalyzePage,
});

function AnalyzePage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const stages = ["Reading ingredients…", "Cross-checking database…", "Scoring health impact…", "Generating insights…"];

  const handleFile = async (f: File) => {
    const url = URL.createObjectURL(f);
    setImageUrl(url);
    setError(null);
    setScanning(true);
    
    try {
      // Use Tesseract.js to extract text from the image
      const { data: { text: scannedText } } = await Tesseract.recognize(f, 'eng');
      
      if (scannedText && scannedText.trim().length > 0) {
        // Clean up the text: remove extra newlines and normalize
        const cleaned = scannedText
          .replace(/\n/g, ", ")
          .replace(/\s+/g, " ")
          .trim();
        setText(cleaned);
      } else {
        setError("Could not detect any text in the image. Please try a clearer photo.");
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setError("Failed to scan the image. Please enter ingredients manually.");
    } finally {
      setScanning(false);
    }
  };

  const onAnalyze = async () => {
    if (!text.trim()) return;
    setError(null);
    setLoading(true);
    setStage(0);

    // Kick off the API call and the staged animation in parallel.
    const apiPromise = fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients: text }),
    }).then(async (res) => {
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
      return body as ApiResponse;
    });

    try {
      for (let i = 0; i < stages.length; i++) {
        setStage(i);
        await new Promise((r) => setTimeout(r, 500));
      }
      const apiResult = await apiPromise;
      const result = toAnalysisResult(apiResult);
      const id = Math.random().toString(36).slice(2, 10);
      saveHistory({
        id,
        name: name.trim() || "Untitled product",
        input: text,
        result,
        createdAt: Date.now(),
      });
      nav({ to: "/results/$id", params: { id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-4xl w-full px-6 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-sm font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI Ingredient Scanner
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold">Analyze a product</h1>
          <p className="mt-3 text-muted-foreground text-lg">
            Paste an ingredient list or upload a label photo to begin.
          </p>
        </div>

        {error && !loading && (
          <div className="mt-6 p-4 rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {!loading ? (
          <div className="mt-10 bg-gradient-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-up">
            <label className="text-sm font-semibold">Product name (optional)</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Choco Crunch Cereal"
              className="mt-2 h-11"
            />

            <label className="text-sm font-semibold mt-6 block">Ingredients</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste comma-separated ingredients here…&#10;e.g. Wheat flour, sugar, palm oil, salt, artificial flavor"
              rows={6}
              className="mt-2 resize-none"
            />

            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-accent/40 transition-all text-left"
              >
                <div className="h-11 w-11 rounded-xl bg-accent grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Upload label photo</div>
                  <div className="text-xs text-muted-foreground">PNG, JPG up to 10MB</div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </button>

              {imageUrl ? (
                <div className="relative flex items-center gap-3 p-4 rounded-2xl border border-border bg-background">
                  <img src={imageUrl} alt="Uploaded label" className="h-11 w-11 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">
                      {scanning ? "Scanning ingredients..." : "Image attached"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {scanning ? "AI is reading the label" : "Ready for analysis"}
                    </div>
                  </div>
                  {scanning ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary mr-1" />
                  ) : (
                    <button onClick={() => { setImageUrl(null); setText(""); }} className="p-1 rounded-md hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-muted/40 text-muted-foreground">
                  <div className="h-11 w-11 rounded-xl bg-background grid place-items-center">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="text-sm">No image uploaded</div>
                </div>
              )}
            </div>

            <Button
              onClick={onAnalyze}
              disabled={!text.trim()}
              size="lg"
              className="mt-8 w-full h-12 bg-gradient-primary hover:opacity-90 shadow-glow text-base"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze with AI
            </Button>
          </div>
        ) : (
          <LoadingState stage={stage} stages={stages} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

function LoadingState({ stage, stages }: { stage: number; stages: string[] }) {
  return (
    <div className="mt-10 bg-gradient-card rounded-3xl border border-border shadow-card p-12 text-center animate-fade-up">
      <div className="relative mx-auto h-32 w-32">
        <div className="absolute inset-0 rounded-full bg-gradient-primary blur-2xl opacity-50 animate-pulse-glow" />
        <div className="relative h-full w-full rounded-full bg-gradient-primary grid place-items-center shadow-glow">
          <Loader2 className="h-12 w-12 text-primary-foreground animate-spin" />
        </div>
      </div>
      <h2 className="mt-8 font-display text-2xl font-bold">AI is analyzing your product</h2>
      <p className="text-muted-foreground mt-2">This usually takes a few seconds.</p>

      <div className="mt-8 max-w-sm mx-auto space-y-3 text-left">
        {stages.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
              i < stage
                ? "border-success/40 bg-success/10 text-success"
                : i === stage
                ? "border-primary bg-accent text-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {i < stage ? (
              <span className="h-5 w-5 rounded-full bg-success grid place-items-center text-success-foreground text-xs">✓</span>
            ) : i === stage ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <span className="h-5 w-5 rounded-full border-2 border-border" />
            )}
            <span className="text-sm font-medium">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
