import { Link } from "react-router";
import { useStore } from "../../demo/store";
import { buildPlan } from "../../lib/maintenance";
import { NotFoundPage } from "../NotFoundPage";

export function MaintenancePublicPage() {
  const { maintenance, fund } = useStore();
  if (!fund.showPublic) return <NotFoundPage />;

  const thisYear = new Date().getFullYear();
  const upcoming = buildPlan(maintenance, fund, thisYear, 10).filter((year) => year.items.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Underhåll</h1>
      <p className="mt-3 text-lg text-muted">
        Det här planerar föreningen att göra de kommande tio åren. Planen ses över varje år och tas upp på årsstämman.
      </p>
      <ol className="mt-10 space-y-8">
        {upcoming.map((year) => (
          <li key={year.year} className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)]">
            <h2 className="font-display text-2xl font-semibold tabular-nums text-brand-text">{year.year}</h2>
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {year.items.map((item) => (
                <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-sm text-muted">{item.category}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <p className="mt-10 text-muted">
        Hela planen med kostnader finns bland <Link to="/dokument" className="underline">föreningens dokument</Link>.
      </p>
    </div>
  );
}
