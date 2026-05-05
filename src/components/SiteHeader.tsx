import { Link, useRouterState } from "@tanstack/react-router";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("swasthik:theme");
    const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const enabled = stored ? stored === "dark" : prefers;
    setDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("swasthik:theme", next ? "dark" : "light");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/analyze", label: "Analyze" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary grid place-items-center shadow-glow group-hover:scale-110 transition-transform">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">SWASTHIK</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = path === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  active ? "text-primary bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90 shadow-glow">
            <Link to="/analyze">Analyze Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
