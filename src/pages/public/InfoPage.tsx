import { useParams } from "react-router";
import { Prose } from "../../components/ui";
import { useStore } from "../../demo/store";
import { NotFoundPage } from "../NotFoundPage";

export function InfoPage() {
  const { slug } = useParams();
  const { pages } = useStore();
  const page = pages.find((candidate) => candidate.slug === slug && candidate.visible);

  if (!page) return <NotFoundPage />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{page.title}</h1>
      <p className="mb-8 mt-3 text-xl text-muted">{page.lead}</p>
      <Prose body={page.body} />
    </article>
  );
}
