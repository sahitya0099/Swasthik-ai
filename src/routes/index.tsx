import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Sparkles,
  ScanLine,
  ShieldCheck,
  Brain,
  ArrowRight,
  Leaf,
  AlertTriangle,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SWASTHIK — Understand Your Food with AI" },
      {
        name: "description",
        content:
          "Decode food labels in seconds. Get an AI-powered health score, risk indicators and smarter alternatives.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero text-primary-foreground noise">
        <div className="absolute inset-0 grid-bg opacity-40" />

        {/* Aurora blobs */}
        <div
          className="absolute h-[500px] w-[500px] rounded-full bg-primary-glow/40 blur-3xl animate-aurora"
          style={{
            top: `${10 + mouse.y * 10}%`,
            right: `${-10 + mouse.x * -5}%`,
            transition: "top 1s ease-out, right 1s ease-out",
          }}
        />
        <div
          className="absolute h-[450px] w-[450px] rounded-full bg-primary/50 blur-3xl animate-aurora"
          style={{
            bottom: `${-15 - mouse.y * 5}%`,
            left: `${-5 + mouse.x * 10}%`,
            animationDelay: "-6s",
            transition: "bottom 1s ease-out, left 1s ease-out",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm animate-fade-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-glow opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-glow" />
              </span>
              AI-powered ingredient intelligence
            </div>

            <h1
              className="mt-6 font-display text-5xl md:text-7xl font-bold leading-[1.05] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              Understand Your
              <br />
              Food with{" "}
              <span className="text-gradient-animated">AI</span>
            </h1>

            <p
              className="mt-6 text-lg md:text-xl text-white/80 max-w-xl animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              Paste a label, snap a photo. SWASTHIK reads ingredients, scores them on a 0–100 scale, and tells you exactly
              what you're putting in your body.
            </p>

            <div
              className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Button
                asChild
                size="lg"
                className="group relative bg-white text-secondary hover:bg-white shadow-glow text-base h-12 px-6 overflow-hidden"
              >
                <Link to="/analyze">
                  <span className="relative z-10 flex items-center">
                    Analyze Now
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-white hover:bg-white/10 h-12 px-6 border border-white/20 backdrop-blur"
              >
                <Link to="/dashboard">View Dashboard</Link>
              </Button>
            </div>

            <div
              className="mt-12 flex items-center gap-8 text-sm text-white/70 animate-fade-up"
              style={{ animationDelay: "0.4s" }}
            >
              {[
                { v: "5K+", l: "products analyzed" },
                { v: "85%", l: "accuracy" },
                { v: "3s", l: "avg. analysis" },
              ].map((s, i) => (
                <div key={i}>
                  <span className="text-2xl font-display font-bold text-white block">{s.v}</span>
                  {s.l}
                </div>
              ))}
            </div>
          </div>

          {/* Hero score card with parallax + orbiting badges */}
          <div className="relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
            <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-40 animate-pulse-glow" />

            {/* orbiting decorative dots */}
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="relative h-0 w-0">
                <div className="absolute animate-orbit" style={{ ["--orbit-r" as never]: "180px" }}>
                  <div className="h-3 w-3 rounded-full bg-primary-glow shadow-glow" />
                </div>
                <div
                  className="absolute animate-orbit"
                  style={{ ["--orbit-r" as never]: "180px", animationDelay: "-7s" }}
                >
                  <div className="h-2 w-2 rounded-full bg-white/60" />
                </div>
              </div>
            </div>

            <div
              className="relative glass-card rounded-3xl p-8 shadow-glow border-gradient animate-float text-card-foreground"
              style={{
                transform: `perspective(1000px) rotateY(${(mouse.x - 0.5) * 6}deg) rotateX(${(0.5 - mouse.y) * 4}deg)`,
                transition: "transform 0.4s ease-out",
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Sample Analysis</div>
                  <div className="font-display text-2xl font-bold mt-1">Granola Bar</div>
                </div>
                <span className="px-3 py-1 rounded-full bg-success/15 text-success text-xs font-semibold border border-success/30">
                  GOOD
                </span>
              </div>

              <div className="mt-6 flex items-end gap-4">
                <div className="font-display text-7xl font-bold text-gradient-animated leading-none">82</div>
                <div className="pb-2 text-sm text-muted-foreground">/ 100</div>
              </div>

              <div className="mt-6 h-2 rounded-full bg-muted overflow-hidden relative">
                <div
                  className="h-full bg-score-good rounded-full relative"
                  style={{ width: "82%" }}
                >
                  <div className="absolute inset-0 shimmer" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: CheckCircle2, label: "Whole oats", tone: "text-success" },
                  { icon: CheckCircle2, label: "Almonds", tone: "text-success" },
                  { icon: AlertTriangle, label: "Added sugar", tone: "text-warning" },
                  { icon: Leaf, label: "No additives", tone: "text-success" },
                ].map((t, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <t.icon className={`h-4 w-4 ${t.tone}`} />
                    <span className="text-muted-foreground">{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* TRUSTED MARQUEE */}
      <section className="border-y border-border bg-card/30 overflow-hidden">
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap py-5">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex items-center gap-12 px-6 text-muted-foreground">
                {["Whole Foods Lab", "NutriCheck", "CleanLabel.io", "GreenScore", "FoodMD", "PureTrack", "Vital&Co"].map(
                  (b, i) => (
                    <div key={`${dup}-${i}`} className="flex items-center gap-2 text-sm font-display font-semibold tracking-wide">
                      <Star className="h-4 w-4 text-primary" />
                      {b}
                    </div>
                  ),
                )}
              </div>
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
      </section>

      {/* FEATURES */}
      <FeaturesSection />

      {/* CTA */}
      <CtaSection />

      <SiteFooter />
    </div>
  );
}

function FeaturesSection() {
  const { ref, shown } = useReveal<HTMLDivElement>();

  return (
    <section className="mx-auto max-w-7xl px-6 py-28 relative">
      <div className="absolute inset-0 dot-bg opacity-50 pointer-events-none" />
      <div className="relative text-center max-w-2xl mx-auto">
        <div className="text-sm font-semibold text-primary uppercase tracking-widest">How it works</div>
        <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold">
          Three steps to <span className="text-gradient">clarity</span>
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          From confusing labels to confident decisions in seconds.
        </p>
      </div>

      <div ref={ref} className={`relative mt-14 grid md:grid-cols-3 gap-6 ${shown ? "stagger" : "opacity-0"}`}>
        {[
          {
            icon: ScanLine,
            title: "Scan or paste",
            desc: "Upload a label photo or paste the ingredient list. We handle the rest.",
            num: "01",
          },
          {
            icon: Brain,
            title: "AI analysis",
            desc: "Our model decodes additives, allergens, sugars, fats, and processing red flags.",
            num: "02",
          },
          {
            icon: ShieldCheck,
            title: "Smart insights",
            desc: "Get a clear score, verdict, risk badges and healthier alternative suggestions.",
            num: "03",
          },
        ].map((f, i) => (
          <div
            key={i}
            className="group relative bg-gradient-card border border-border rounded-3xl p-8 card-hover overflow-hidden"
          >
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-primary opacity-0 group-hover:opacity-20 blur-3xl transition-opacity" />
            <div className="absolute top-6 right-6 font-display text-5xl font-bold text-muted/40 group-hover:text-primary/30 transition-colors">
              {f.num}
            </div>
            <div className="relative h-14 w-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <f.icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <h3 className="mt-6 font-display text-2xl font-bold">{f.title}</h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">{f.desc}</p>

            <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              Learn more <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section className="mx-auto max-w-7xl px-6 pb-24">
      <div
        ref={ref}
        className={`relative overflow-hidden rounded-3xl bg-gradient-hero p-12 md:p-20 text-center text-primary-foreground noise ${
          shown ? "animate-scale-in" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary-glow/40 blur-3xl animate-aurora" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-sm">
            <Zap className="h-3.5 w-3.5 text-primary-glow" /> Free to start
          </div>
          <h2 className="mt-5 font-display text-4xl md:text-6xl font-bold">
            Eat smarter, <span className="text-gradient-animated">starting now.</span>
          </h2>
          <p className="mt-4 text-white/80 text-lg max-w-xl mx-auto">
            Join thousands using SWASTHIK to make confident food choices every day.
          </p>
          <Button
            asChild
            size="lg"
            className="group mt-8 bg-white text-secondary hover:bg-white h-12 px-8 text-base shadow-glow"
          >
            <Link to="/analyze">
              <Sparkles className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
              Start Free Analysis
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
