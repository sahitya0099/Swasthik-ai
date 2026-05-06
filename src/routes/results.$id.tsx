import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, Lightbulb, Share2, RotateCcw, Sparkles } from "lucide-react";
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
        <div className="relative group bg-gradient-card rounded-[2.5rem] border border-border shadow-card overflow-hidden animate-fade-up noise">
          {/* Subtle background decoration */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-aurora pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-success/10 rounded-full blur-[80px] animate-aurora pointer-events-none" style={{ animationDelay: "-4s" }} />

          <div className="relative p-8 md:p-14 grid md:grid-cols-[auto,1fr] gap-12 items-center">
            <div className="animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <ScoreRing score={result.score} />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-muted-foreground/80">Analysis Report</div>
              <h1 className="mt-2 font-display text-4xl md:text-6xl font-bold leading-tight tracking-tight">
                {name}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <span className={`px-5 py-2 rounded-2xl font-bold text-xs uppercase tracking-widest ${verdictTone.bg} ${verdictTone.text} border border-current/10 shadow-sm`}>
                  {result.verdict}
                </span>
                <div className="h-1 w-1 rounded-full bg-border" />
                <span className="text-sm font-medium text-muted-foreground">
                  {result.ingredients.length} ingredients analyzed
                </span>
              </div>
              <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl">{result.summary}</p>

              <div className="mt-8 relative h-3 rounded-full bg-muted/50 overflow-hidden border border-border/50">
                <div 
                  className={`h-full ${verdictTone.grad} rounded-full transition-all duration-[1500ms] cubic-bezier(0.2, 0.8, 0.2, 1)`} 
                  style={{ width: `${result.score}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-8 stagger">
          {/* Risk flags */}
          <section className="glass-card rounded-[2rem] border border-border shadow-soft p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <AlertTriangle className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h2 className="font-display text-2xl font-bold">Risk indicators</h2>
            </div>
            
            {result.risks.length === 0 ? (
              <div className="flex items-center gap-4 p-6 rounded-[1.5rem] bg-success/10 text-success border border-success/20 animate-scale-in">
                <CheckCircle2 className="h-6 w-6" />
                <div>
                  <span className="font-bold block">Perfectly Clean</span>
                  <span className="text-sm opacity-90">No major risks detected in the ingredients.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {result.risks.map((r, i) => {
                  const tone =
                    r.severity === "high"
                      ? "border-destructive/20 bg-destructive/5"
                      : r.severity === "medium"
                      ? "border-warning/20 bg-warning/5"
                      : "border-border/50 bg-muted/20";
                  const dot =
                    r.severity === "high" ? "bg-destructive" : r.severity === "medium" ? "bg-warning" : "bg-muted-foreground";
                  return (
                    <div key={i} className={`group flex items-start gap-4 p-5 rounded-2xl border ${tone} transition-all hover:scale-[1.02]`}>
                      <span className={`mt-2 h-2 w-2 rounded-full ${dot} flex-shrink-0 shadow-[0_0_8px_currentColor]`} />
                      <div>
                        <div className="font-bold text-base">{r.label}</div>
                        <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.detail}</div>
                      </div>
                      <span className="ml-auto text-[10px] font-black uppercase tracking-tighter text-muted-foreground/50 border border-border/50 px-2 py-0.5 rounded-md self-start">
                        {r.severity}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section className="glass-card rounded-[2rem] border border-border shadow-soft p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
              <Lightbulb className="h-24 w-24" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">Recommendations</h2>
            </div>
            <div className="space-y-4">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-accent/30 border border-border/50 transition-all hover:bg-accent/50">
                  <span className="mt-0.5 h-7 w-7 rounded-lg bg-gradient-primary text-primary-foreground grid place-items-center text-xs font-black flex-shrink-0 shadow-glow">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Ingredient breakdown */}
        <section className="mt-8 glass-card rounded-[2.5rem] border border-border shadow-soft p-8 md:p-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold">Detailed Analysis</h2>
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-muted/50 px-4 py-2 rounded-full border border-border/50">
              <Sparkles className="h-3 w-3 text-primary" /> AI Insights
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.ingredients.map((ing, i) => {
              const Icon = ing.status === "safe" ? CheckCircle2 : ing.status === "caution" ? AlertTriangle : XCircle;
              const tone =
                ing.status === "safe"
                  ? "text-success bg-success/10 border-success/20"
                  : ing.status === "caution"
                  ? "text-warning bg-warning/10 border-warning/20"
                  : "text-destructive bg-destructive/10 border-destructive/20";
              
              return (
                <div 
                  key={i} 
                  className="group relative flex items-start gap-4 p-5 rounded-2xl border border-border/50 bg-card/30 hover:bg-card hover:border-primary/30 transition-all duration-300 card-hover"
                >
                  <div className={`h-11 w-11 rounded-[0.9rem] grid place-items-center flex-shrink-0 border shadow-sm transition-transform group-hover:scale-110 ${tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{ing.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{ing.note}</div>
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
