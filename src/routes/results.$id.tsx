import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Share2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ScoreRing } from "@/components/ScoreRing";
import { loadHistory, type HistoryItem } from "@/lib/analysis";

export const Route = createFileRoute("/results/$id")({
  head: () => ({
    meta: [
      { title: "Analysis Results — SWASTHIK" },
      { name: "description", content: "Your AI-powered ingredient health analysis." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { id } = useParams({ from: "/results/$id" });
  const [item, setItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const found = loadHistory().find((h) => h.id === id);
    setItem(found || null);
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 grid place-items-center px-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold">Analysis not found</h1>
            <p className="text-muted-foreground mt-2">It may have expired or been cleared.</p>
            <Button asChild className="mt-6 bg-gradient-primary">
              <Link to="/analyze">Analyze a product</Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { result, name } = item;
  const verdictTone =
    result.verdict === "Good"
      ? { bg: "bg-success/15", text: "text-success", grad: "bg-score-good" }
      : result.verdict === "Moderate"
      ? { bg: "bg-warning/15", text: "text-warning", grad: "bg-score-mod" }
      : { bg: "bg-destructive/15", text: "text-destructive", grad: "bg-score-poor" };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link to="/analyze">
              <ArrowLeft className="mr-1 h-4 w-4" /> New analysis
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="mr-1 h-4 w-4" /> Share
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/analyze">
                <RotateCcw className="mr-1 h-4 w-4" /> Re-analyze
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero result card */}
        <div className="bg-gradient-card rounded-3xl border border-border shadow-card overflow-hidden animate-fade-up">
          <div className="p-8 md:p-12 grid md:grid-cols-[auto,1fr] gap-10 items-center">
            <ScoreRing score={result.score} />
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Product</div>
              <h1 className="mt-1 font-display text-4xl md:text-5xl font-bold">{name}</h1>
              <div className="mt-4 flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full font-semibold text-sm ${verdictTone.bg} ${verdictTone.text}`}>
                  {result.verdict.toUpperCase()}
                </span>
                <span className="text-sm text-muted-foreground">
                  {result.ingredients.length} ingredients analyzed
                </span>
              </div>
              <p className="mt-4 text-lg text-muted-foreground">{result.summary}</p>

              <div className="mt-6 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full ${verdictTone.grad} rounded-full transition-all duration-1000`} style={{ width: `${result.score}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid lg:grid-cols-2 gap-6">
          {/* Risk flags */}
          <section className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h2 className="font-display text-xl font-bold">Risk indicators</h2>
            </div>
            {result.risks.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/10 text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">No major risks detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {result.risks.map((r, i) => {
                  const tone =
                    r.severity === "high"
                      ? "border-destructive/30 bg-destructive/5"
                      : r.severity === "medium"
                      ? "border-warning/30 bg-warning/5"
                      : "border-border bg-muted/30";
                  const dot =
                    r.severity === "high" ? "bg-destructive" : r.severity === "medium" ? "bg-warning" : "bg-muted-foreground";
                  return (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${tone}`}>
                      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full ${dot} flex-shrink-0`} />
                      <div>
                        <div className="font-semibold">{r.label}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">{r.detail}</div>
                      </div>
                      <span className="ml-auto text-xs uppercase tracking-wider text-muted-foreground">{r.severity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-bold">Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-accent/40">
                  <span className="mt-0.5 h-6 w-6 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm">{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Ingredient breakdown */}
        <section className="mt-6 bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="font-display text-xl font-bold mb-5">Ingredient breakdown</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {result.ingredients.map((ing, i) => {
              const Icon = ing.status === "safe" ? CheckCircle2 : ing.status === "caution" ? AlertTriangle : XCircle;
              const tone =
                ing.status === "safe"
                  ? "text-success bg-success/10"
                  : ing.status === "caution"
                  ? "text-warning bg-warning/10"
                  : "text-destructive bg-destructive/10";
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-border hover:bg-muted/30 transition-colors">
                  <div className={`h-9 w-9 rounded-xl grid place-items-center flex-shrink-0 ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{ing.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{ing.note}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
