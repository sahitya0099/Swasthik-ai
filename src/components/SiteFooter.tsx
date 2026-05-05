import { Sparkles } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold">SWASTHIK</span>
          <span className="text-sm text-muted-foreground ml-2">© {new Date().getFullYear()}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Built with AI for healthier choices. Not medical advice.
        </p>
      </div>
    </footer>
  );
}
