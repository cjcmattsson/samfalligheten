import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { Icon } from "./icons";

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only rounded bg-surface px-4 py-2 text-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
    >
      Hoppa till innehållet
    </a>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme ?? "light");
  const next = theme === "dark" ? "light" : "dark";

  function toggle() {
    document.documentElement.dataset.theme = next;
    setTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // The theme still applies for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Byt till ljust läge" : "Byt till mörkt läge"}
      className={`rounded-lg p-2 text-muted hover:bg-sunken hover:text-ink ${className}`}
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
