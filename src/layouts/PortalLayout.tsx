import { signOut } from "firebase/auth";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useMember } from "../auth/AuthContext";
import { Icon } from "../components/icons";
import { ScrollToTop, SkipLink, ThemeToggle } from "../components/layout-bits";
import { useStore } from "../demo/store";
import { auth } from "../lib/firebase";
import { portalNav } from "../navigation";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand text-brand-ink" : "text-ink hover:bg-sunken"
  }`;
}

function SidebarContent() {
  const { association, members, news } = useStore();
  const member = useMember();
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bounced = members.filter((member) => member.bounced).length;
  const drafts = news.filter((item) => item.status === "draft").length;
  const badges: Record<string, number> = {
    "/portal/medlemmar": bounced,
    "/portal/nyheter": drafts,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Link to="/portal" className="font-display text-lg font-semibold text-brand-text">
          {association.shortName}
        </Link>
        <p className="text-xs text-muted">Styrelseportal</p>
      </div>
      <nav aria-label="Portalmeny" className="flex-1 overflow-y-auto px-3 pb-4">
        {portalNav.map((group, index) => (
          <div key={index} className="mb-4">
            {group.heading && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
                {group.heading}
              </p>
            )}
            <ul className="grid gap-0.5">
              {group.links.filter((link) => !link.adminOnly || member.role === "admin").map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.to === "/portal"} className={navLinkClass}>
                    <Icon name={link.icon} className="size-4.5" />
                    <span className="flex-1">{link.label}</span>
                    {badges[link.to] > 0 && (
                      <span className="rounded-full bg-warn-soft px-2 text-xs font-bold text-warn">
                        {badges[link.to]}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <span className="grid size-9 place-items-center rounded-full bg-brand-soft text-sm font-bold text-brand-text">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{member.name}</p>
            <p className="text-xs text-muted">{member.role === "admin" ? "Administratör" : "Styrelse"}</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="mt-1 flex gap-1">
          <Link to="/" className="flex flex-1 items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-sm text-muted hover:bg-sunken hover:text-ink">
            <Icon name="globe" className="size-4" /> Webbplatsen
          </Link>
          <button type="button" onClick={() => void signOut(auth)} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 text-sm text-muted hover:bg-sunken hover:text-ink">
            <Icon name="logout" className="size-4" /> Logga ut
          </button>
        </div>
      </div>
    </div>
  );
}

export function PortalLayout() {
  const { pathname } = useLocation();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const menuOpen = openedAt === pathname;

  return (
    <div className="min-h-screen bg-canvas text-ink lg:pl-64">
      <SkipLink />
      <ScrollToTop />
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface lg:block">
        <SidebarContent />
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 py-2.5 lg:hidden">
        <Link to="/portal" className="font-display text-lg font-semibold text-brand-text">
          Styrelseportal
        </Link>
        <button type="button" onClick={() => setOpenedAt(pathname)} aria-label="Öppna meny" className="rounded-lg p-2 hover:bg-sunken">
          <Icon name="menu" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" aria-label="Stäng meny" onClick={() => setOpenedAt(null)} className="absolute inset-0 bg-black/50" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-surface">
            <SidebarContent />
          </aside>
        </div>
      )}

      <p className="bg-warn-soft px-4 py-2 text-center text-sm font-medium text-warn">
        Innehållet är påhittat tills varje del har kopplats på. Ändringar försvinner när sidan laddas om.
      </p>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
        <Outlet />
      </main>
    </div>
  );
}
