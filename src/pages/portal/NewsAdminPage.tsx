import { useState } from "react";
import { Link } from "react-router";
import { CoverArt } from "../../components/art";
import { Badge, Card, EmptyState, LinkButton, PageHeader } from "../../components/ui";
import { useStore } from "../../demo/store";
import { formatDate } from "../../lib/format";

const filters = [
  { id: "all", label: "Alla" },
  { id: "published", label: "Publicerade" },
  { id: "draft", label: "Utkast" },
];

export function NewsAdminPage() {
  const { news } = useStore();
  const [filter, setFilter] = useState("all");
  const shown = news.filter((item) => filter === "all" || item.status === filter);

  return (
    <>
      <PageHeader
        title="Nyheter"
        description="Publicerade nyheter visas på webbplatsen och kan skickas som mejl."
        actions={
          <LinkButton to="/portal/nyheter/ny" icon="plus">
            Ny nyhet
          </LinkButton>
        }
      />
      <div className="mb-4 flex gap-1" role="group" aria-label="Filtrera nyheter">
        {filters.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              filter === option.id ? "bg-brand text-brand-ink" : "text-muted hover:bg-sunken"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Card className="overflow-hidden">
        {shown.length === 0 && <EmptyState icon="news" title="Inga nyheter här än" />}
        <ul className="divide-y divide-line">
          {shown.map((item) => (
            <li key={item.id}>
              <Link to={`/portal/nyheter/${item.id}`} className="flex items-center gap-4 p-4 hover:bg-sunken">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                  <CoverArt kind={item.cover} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-muted">
                    {item.author} · {formatDate(item.date)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center">
                  {item.mailedAt && <Badge tone="brand">Mejlad</Badge>}
                  <Badge tone={item.status === "published" ? "ok" : "warn"}>
                    {item.status === "published" ? "Publicerad" : "Utkast"}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
