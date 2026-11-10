import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Icon } from "../components/icons";
import { ScrollToTop, SkipLink, ThemeToggle } from "../components/layout-bits";
import { useStore } from "../demo/store";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand-soft text-brand-text" : "text-ink hover:bg-sunken"
  }`;
}

export function PublicLayout() {
  const { association, pages } = useStore();
  const { pathname } = useLocation();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname;

  const links = [
    ...pages.filter((page) => page.visible).map((page) => ({ to: `/${page.slug}`, label: page.title })),
    { to: "/nyheter", label: "Nyheter" },
    { to: "/dokument", label: "Dokument" },
    { to: "/kontakt", label: "Kontakt" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <SkipLink />
      <ScrollToTop />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-xl font-semibold text-brand-text">
            {association.shortName}
          </Link>
          <nav aria-label="Huvudmeny" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-sunken lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Stäng meny" : "Öppna meny"}
              onClick={() => setOpenedAt(menuOpen ? null : pathname)}
            >
              <Icon name={menuOpen ? "x" : "menu"} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav aria-label="Mobilmeny" className="border-t border-line px-4 py-3 lg:hidden">
            <ul className="grid gap-1">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={navLinkClass}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-line bg-sunken">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-2 sm:px-6">
          <div>
            <p className="font-display text-lg font-semibold">{association.name}</p>
            <p className="mt-1 text-muted">{association.address}</p>
            <a href={`mailto:${association.email}`} className="mt-1 inline-block underline">
              {association.email}
            </a>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
            <Link to="/integritetspolicy" className="underline">
              Integritetspolicy
            </Link>
            <Link to="/logga-in" className="underline">
              Styrelseportal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
