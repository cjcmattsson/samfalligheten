import { Link, useParams } from "react-router";
import { CoverArt } from "../../components/art";
import { Icon } from "../../components/icons";
import { Prose } from "../../components/ui";
import { useStore } from "../../demo/store";
import { excerpt, formatDate } from "../../lib/format";
import { NotFoundPage } from "../NotFoundPage";

export function NewsListPage() {
  const { news } = useStore();
  const published = news.filter((item) => item.status === "published");

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Nyheter</h1>
      <p className="mt-3 text-lg text-muted">Det senaste från styrelsen.</p>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {published.map((item) => (
          <li key={item.id}>
            <Link to={`/nyheter/${item.id}`} className="group block h-full overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="aspect-[5/3] overflow-hidden">
                <CoverArt kind={item.cover} className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <time className="text-sm text-muted">{formatDate(item.date)}</time>
                <h2 className="mt-1 font-display text-xl font-semibold group-hover:underline">{item.title}</h2>
                <p className="mt-2 text-sm text-muted">{excerpt(item.body)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewsArticlePage() {
  const { id } = useParams();
  const { news } = useStore();
  const item = news.find((candidate) => candidate.id === id && candidate.status === "published");

  if (!item) return <NotFoundPage />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link to="/nyheter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-text">
        <Icon name="arrow" className="size-4 rotate-180" /> Alla nyheter
      </Link>
      <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight">{item.title}</h1>
      <p className="mt-3 text-muted">
        <time>{formatDate(item.date)}</time> · {item.author}
      </p>
      <div className="my-8 aspect-[2/1] overflow-hidden rounded-2xl">
        <CoverArt kind={item.cover} />
      </div>
      <Prose body={item.body} />
    </article>
  );
}
