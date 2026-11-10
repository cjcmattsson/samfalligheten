import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Icon } from "../../components/icons";
import { Button, Card, Field, PageHeader, Prose, Switch, inputClass } from "../../components/ui";
import { useStore } from "../../demo/store";
import { NotFoundPage } from "../NotFoundPage";

export function PagesAdminPage() {
  const { pages, setPages } = useStore();

  function move(index: number, delta: number) {
    setPages((all) => {
      const next = [...all];
      const [page] = next.splice(index, 1);
      next.splice(index + delta, 0, page);
      return next;
    });
  }

  return (
    <>
      <PageHeader title="Sidor" description="Redigera informationssidorna och välj vilka som visas i menyn." />
      <Card className="overflow-hidden">
        <ul className="divide-y divide-line">
          {pages.map((page, index) => (
            <li key={page.slug} className="flex items-center gap-3 p-4">
              <div className="flex flex-col">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Flytta upp ${page.title}`} className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30">
                  <Icon name="up" className="size-4" />
                </button>
                <button type="button" disabled={index === pages.length - 1} onClick={() => move(index, 1)} aria-label={`Flytta ner ${page.title}`} className="rounded p-0.5 text-muted hover:text-ink disabled:opacity-30">
                  <Icon name="down" className="size-4" />
                </button>
              </div>
              <Link to={`/portal/sidor/${page.slug}`} className="min-w-0 flex-1 hover:underline">
                <span className="block font-semibold">{page.title}</span>
                <span className="block truncate text-sm text-muted">{page.lead}</span>
              </Link>
              <span className="hidden text-sm text-muted sm:inline">{page.visible ? "Visas" : "Dold"}</span>
              <Switch
                checked={page.visible}
                label={`Visa ${page.title} på webbplatsen`}
                onChange={(visible) =>
                  setPages((all) => all.map((p) => (p.slug === page.slug ? { ...p, visible } : p)))
                }
              />
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}

export function PageEditorPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pages, setPages, toast } = useStore();
  const page = pages.find((candidate) => candidate.slug === slug);
  const [title, setTitle] = useState(page?.title ?? "");
  const [lead, setLead] = useState(page?.lead ?? "");
  const [body, setBody] = useState(page?.body ?? "");

  if (!page) return <NotFoundPage />;

  function save() {
    setPages((all) => all.map((p) => (p.slug === slug ? { ...p, title, lead, body } : p)));
    toast("Sidan är uppdaterad på webbplatsen");
    navigate("/portal/sidor");
  }

  return (
    <>
      <PageHeader title={`Redigera ${page.title}`} />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card className="space-y-5 p-5">
          <Field label="Rubrik">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Ingress">
            <input value={lead} onChange={(e) => setLead(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Text" hint="Tom rad ger nytt stycke. ## ger mellanrubrik och - ger punktlista.">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className={inputClass} />
          </Field>
          <div className="flex gap-2">
            <Button disabled={!title.trim()} onClick={save}>
              Spara
            </Button>
            <Button variant="ghost" onClick={() => navigate("/portal/sidor")}>
              Avbryt
            </Button>
          </div>
        </Card>
        <div className="xl:sticky xl:top-6">
          <p className="mb-2 text-sm font-semibold text-muted">Så här ser den ut på webbplatsen</p>
          <Card className="p-7">
            <h2 className="font-display text-3xl font-semibold">{title}</h2>
            <p className="mb-6 mt-2 text-lg text-muted">{lead}</p>
            <Prose body={body} />
          </Card>
        </div>
      </div>
    </>
  );
}
