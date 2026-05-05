import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { History, TrendingUp, Activity, User, Sparkles, Trash2, Plus, Award, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { clearHistory, loadHistory, loadProfile, saveProfile, getInitials, DEFAULT_PROFILE, type HistoryItem, type Profile } from "@/lib/analysis";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SWASTHIK" },
      { name: "description", content: "Your analyzed products, health trends and personal insights." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tab, setTab] = useState<"history" | "trends" | "profile">("history");
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    setHistory(loadHistory());
    setProfile(loadProfile());
  }, []);

  const avg = history.length ? Math.round(history.reduce((s, h) => s + h.result.score, 0) / history.length) : 0;
  const goodCount = history.filter((h) => h.result.verdict === "Good").length;
  const poorCount = history.filter((h) => h.result.verdict === "Poor").length;

  const onClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 mx-auto max-w-7xl w-full px-6 py-10 grid lg:grid-cols-[260px,1fr] gap-8">
        {/* Sidebar */}
        <aside className="bg-sidebar border border-sidebar-border rounded-3xl p-4 h-fit lg:sticky lg:top-24">
          <div className="px-3 py-3 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-gradient-primary grid place-items-center text-primary-foreground font-bold">
              {getInitials(profile.name)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold truncate">{profile.name || "Unnamed"}</div>
              <div className="text-xs text-muted-foreground truncate">{profile.title || "Health Explorer"}</div>
            </div>
          </div>
          <div className="h-px bg-sidebar-border my-3" />
          {[
            { id: "history" as const, icon: History, label: "History" },
            { id: "trends" as const, icon: TrendingUp, label: "Trends" },
            { id: "profile" as const, icon: User, label: "Profile" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
          <Button asChild className="w-full mt-4 bg-gradient-primary">
            <Link to="/analyze">
              <Plus className="mr-1 h-4 w-4" /> New analysis
            </Link>
          </Button>
        </aside>

        {/* Content */}
        <section>
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <StatCard icon={Activity} label="Avg. score" value={avg || "—"} tint="primary" />
            <StatCard icon={Award} label="Good picks" value={goodCount} tint="success" />
            <StatCard icon={Sparkles} label="Total scans" value={history.length} tint="warning" />
          </div>

          {tab === "history" && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-bold">Recent analyses</h2>
                {history.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={onClear}>
                    <Trash2 className="mr-1 h-4 w-4" /> Clear
                  </Button>
                )}
              </div>

              {history.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <HistoryRow key={h.id} item={h} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "trends" && (
            <div className="mt-6 bg-card border border-border rounded-3xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold mb-6">Health trend</h2>
              <TrendChart history={history} />
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                <MiniStat label="Good verdicts" value={goodCount} total={history.length} tone="success" />
                <MiniStat label="Moderate" value={history.length - goodCount - poorCount} total={history.length} tone="warning" />
                <MiniStat label="Poor verdicts" value={poorCount} total={history.length} tone="destructive" />
              </div>
            </div>
          )}

          {tab === "profile" && (
            <ProfileEditor profile={profile} onSave={(p) => { saveProfile(p); setProfile(p); }} />
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: any; label: string; value: number | string; tint: "primary" | "success" | "warning" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <div className="bg-gradient-card border border-border rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className={`h-9 w-9 rounded-xl grid place-items-center ${tones[tint]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-4xl font-bold">{value}</div>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const tone =
    item.result.verdict === "Good"
      ? "text-success bg-success/10"
      : item.result.verdict === "Moderate"
      ? "text-warning bg-warning/10"
      : "text-destructive bg-destructive/10";
  return (
    <Link
      to="/results/$id"
      params={{ id: item.id }}
      className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:shadow-glow hover:-translate-y-0.5 transition-all"
    >
      <div className="font-display text-3xl font-bold w-14 text-center text-gradient">{item.result.score}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{item.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {new Date(item.createdAt).toLocaleString()} · {item.result.ingredients.length} ingredients
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tone}`}>{item.result.verdict}</span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center">
      <div className="mx-auto h-16 w-16 rounded-2xl bg-accent grid place-items-center">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-4 font-display text-xl font-bold">No analyses yet</h3>
      <p className="text-muted-foreground mt-1">Analyze your first product to see it here.</p>
      <Button asChild className="mt-6 bg-gradient-primary">
        <Link to="/analyze">Start analyzing</Link>
      </Button>
    </div>
  );
}

function TrendChart({ history }: { history: HistoryItem[] }) {
  const data = [...history].reverse().slice(-12);
  if (data.length === 0) {
    return <p className="text-muted-foreground text-sm">Analyze a few products to see your trend.</p>;
  }
  const max = 100;
  const W = 600;
  const H = 180;
  const step = data.length > 1 ? W / (data.length - 1) : 0;
  const points = data.map((d, i) => `${i * step},${H - (d.result.score / max) * H}`).join(" ");
  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H + 30}`} className="w-full h-auto">
        <defs>
          <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.13 195)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="oklch(0.62 0.13 195)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,${H} ${points} ${(data.length - 1) * step},${H}`} fill="url(#g)" />
        <polyline points={points} fill="none" stroke="oklch(0.62 0.13 195)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => (
          <circle key={i} cx={i * step} cy={H - (d.result.score / max) * H} r="5" fill="var(--color-card)" stroke="oklch(0.62 0.13 195)" strokeWidth="3" />
        ))}
      </svg>
    </div>
  );
}

function MiniStat({ label, value, total, tone }: { label: string; value: number; total: number; tone: "success" | "warning" | "destructive" }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  const colors = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
  };
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value} · {pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full ${colors[tone]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ProfileEditor({ profile, onSave }: { profile: Profile; onSave: (p: Profile) => void }) {
  const [draft, setDraft] = useState<Profile>(profile);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => setDraft(profile), [profile]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const update = (k: keyof Profile, v: string) => setDraft((d) => ({ ...d, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Profile = {
      name: draft.name.trim().slice(0, 60) || "Unnamed",
      email: draft.email.trim().slice(0, 120),
      goal: draft.goal.trim().slice(0, 120),
      allergens: draft.allergens.trim().slice(0, 200),
      title: draft.title.trim().slice(0, 60) || "Health Explorer",
    };
    onSave(cleaned);
    setSavedAt(Date.now());
  };

  return (
    <form onSubmit={handleSave} className="mt-6 bg-card border border-border rounded-3xl p-8 shadow-card">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">Personalize your account — saved locally on this device.</p>
        </div>
        {savedAt && !dirty && (
          <span className="text-xs px-3 py-1 rounded-full bg-success/10 text-success font-medium">Saved</span>
        )}
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-5">
        <Field id="name" label="Name" value={draft.name} onChange={(v) => update("name", v)} placeholder="Your full name" />
        <Field id="title" label="Title" value={draft.title} onChange={(v) => update("title", v)} placeholder="e.g. Health Explorer" />
        <Field id="email" label="Email" type="email" value={draft.email} onChange={(v) => update("email", v)} placeholder="you@example.com" />
        <Field id="goal" label="Health goal" value={draft.goal} onChange={(v) => update("goal", v)} placeholder="e.g. Reduce sugar intake" />
        <div className="sm:col-span-2">
          <Field id="allergens" label="Allergens" value={draft.allergens} onChange={(v) => update("allergens", v)} placeholder="Comma separated, e.g. Peanuts, Shellfish" />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button type="submit" disabled={!dirty} className="bg-gradient-primary">
          <Save className="mr-1 h-4 w-4" /> Save changes
        </Button>
        {dirty && (
          <Button type="button" variant="ghost" onClick={() => setDraft(profile)}>
            <X className="mr-1 h-4 w-4" /> Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  id, label, value, onChange, placeholder, type = "text",
}: { id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} maxLength={200} />
    </div>
  );
}
