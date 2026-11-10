import { Link, NavLink, Outlet } from "react-router";
import { SkipLink } from "../components/SkipLink";
import { publicNav } from "../navigation";

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `rounded px-3 py-2 text-sm font-medium ${
    isActive ? "bg-brand-100 text-brand-900" : "text-stone-700 hover:bg-stone-100"
  }`;
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      <SkipLink />
      <header className="border-b border-stone-200">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="text-lg font-semibold text-brand-900">
            Östergårdshus
          </Link>
          <nav aria-label="Huvudmeny">
            <ul className="flex flex-wrap gap-1">
              {publicNav.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className={navLinkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-stone-50">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-x-6 gap-y-2 px-4 py-6 text-sm text-stone-700">
          <span>Östergårdshus samfällighetsförening</span>
          <Link to="/integritetspolicy" className="underline">
            Integritetspolicy
          </Link>
          <Link to="/portal" className="underline">
            Styrelseportal
          </Link>
        </div>
      </footer>
    </div>
  );
}
