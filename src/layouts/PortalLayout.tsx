import { Link, NavLink, Outlet } from "react-router";
import { SkipLink } from "../components/SkipLink";
import { portalNav } from "../navigation";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `block rounded px-3 py-2 text-sm font-medium whitespace-nowrap ${
    isActive ? "bg-brand-800 text-white" : "text-stone-700 hover:bg-stone-200"
  }`;
}

export function PortalLayout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 md:flex">
      <SkipLink />
      <aside className="border-b border-stone-200 bg-stone-100 md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="px-4 py-4">
          <Link to="/portal" className="font-semibold text-brand-900">
            Styrelseportal
          </Link>
        </div>
        <nav aria-label="Portalmeny" className="overflow-x-auto px-2 pb-3">
          <ul className="flex gap-1 md:flex-col">
            {portalNav.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} end={item.to === "/portal"} className={navLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden px-4 py-4 text-sm md:block">
          <Link to="/" className="text-stone-700 underline">
            Till webbplatsen
          </Link>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1 px-4 py-8 md:px-10">
        <Outlet />
      </main>
    </div>
  );
}
