import { Link } from "react-router";
import { CoverArt, HeroArt } from "../../components/art";
import { Icon } from "../../components/icons";
import { LinkButton } from "../../components/ui";
import { useStore } from "../../demo/store";
import { excerpt, formatDate } from "../../lib/format";

export function HomePage() {
  const { association, news, pages, docs } = useStore();
  const published = news.filter((item) => item.status === "published");
  const [featured, ...rest] = published;
  const publicDocs = docs.filter((doc) => doc.public).length;
  const visiblePages = pages.filter((page) => page.visible);

  return (
    <>
      <section className="relative isolate min-h-[29rem] overflow-hidden sm:min-h-[33rem]">
        <HeroArt />
        <div className="absolute inset-0 bg-linear-to-r from-canvas/95 from-20% via-canvas/70 via-40% to-transparent to-55% max-md:bg-linear-to-b max-md:from-canvas/95 max-md:from-45% max-md:via-canvas/60 max-md:via-65% max-md:to-transparent max-md:to-85%" />
        <div className="relative mx-auto max-w-6xl px-4 pb-32 pt-14 sm:px-6 sm:pt-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            Samfällighetsförening
          </p>
          <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
            Välkommen till {association.shortName}
          </h1>
          <p className="mt-5 max-w-md text-lg">{association.tagline}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <LinkButton to="/nyheter" icon="news">
              Senaste nytt
            </LinkButton>
            <LinkButton to="/kontakt" variant="secondary" icon="mail">
              Kontakta styrelsen
            </LinkButton>
          </div>
        </div>
      </section>

      <section aria-label="Genvägar" className="relative z-10 mx-auto -mt-14 max-w-6xl px-4 sm:px-6">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {visiblePages.map((page) => (
            <li key={page.slug} className="bg-surface">
              <Link to={`/${page.slug}`} className="group block h-full p-5 hover:bg-sunken">
                <span className="flex items-center justify-between font-display text-lg font-semibold">
                  {page.title}
                  <Icon name="arrow" className="size-4 text-muted transition-transform group-hover:translate-x-1" />
                </span>
                <span className="mt-1 block text-sm text-muted">{page.lead}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {featured && (
        <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold tracking-tight">Nytt i området</h2>
            <Link to="/nyheter" className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text underline-offset-4 hover:underline">
              Alla nyheter <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-5">
            <Link to={`/nyheter/${featured.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface lg:col-span-3">
              <div className="aspect-[2/1] overflow-hidden">
                <CoverArt kind={featured.cover} className="transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-6">
                <time className="text-sm text-muted">{formatDate(featured.date)}</time>
                <h3 className="mt-1 font-display text-2xl font-semibold group-hover:underline">{featured.title}</h3>
                <p className="mt-2 text-muted">{excerpt(featured.body, 170)}</p>
              </div>
            </Link>
            <ul className="grid gap-5 lg:col-span-2">
              {rest.slice(0, 2).map((item) => (
                <li key={item.id}>
                  <Link to={`/nyheter/${item.id}`} className="group flex h-full gap-4 rounded-2xl border border-line bg-surface p-4">
                    <div className="w-28 shrink-0 self-stretch overflow-hidden rounded-lg sm:w-40">
                      <CoverArt kind={item.cover} />
                    </div>
                    <div className="min-w-0 py-1">
                      <time className="text-sm text-muted">{formatDate(item.date)}</time>
                      <h3 className="mt-0.5 font-display text-lg font-semibold group-hover:underline">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted">{excerpt(item.body, 90)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="mx-auto mt-16 grid max-w-6xl gap-5 px-4 sm:px-6 md:grid-cols-2">
        <div className="rounded-2xl bg-brand p-8 text-brand-ink">
          <h2 className="font-display text-2xl font-semibold">Stadgar och protokoll</h2>
          <p className="mt-2 opacity-90">
            {publicDocs} dokument finns öppet att läsa, utan inloggning.
          </p>
          <Link to="/dokument" className="mt-5 inline-flex items-center gap-2 font-semibold underline underline-offset-4">
            Till dokumenten <Icon name="arrow" className="size-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-8">
          <h2 className="font-display text-2xl font-semibold">Frågor till styrelsen?</h2>
          <p className="mt-2 text-muted">Mejla oss, så svarar vi så snart vi kan.</p>
          <a href={`mailto:${association.email}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-text underline underline-offset-4">
            <Icon name="mail" className="size-4" /> {association.email}
          </a>
        </div>
      </section>
    </>
  );
}
