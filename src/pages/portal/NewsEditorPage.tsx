import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { CoverArt } from "../../components/art";
import { Button, Card, ConfirmDialog, Field, PageHeader, Prose, inputClass } from "../../components/ui";
import type { CoverKind, NewsItem } from "../../demo/data";
import { useStore } from "../../demo/store";
import { createId, formatDate, today } from "../../lib/format";

const covers: CoverKind[] = ["vag", "lekplats", "sommar", "stamma"];

export function NewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { news, setNews, members, toast } = useStore();
  const existing = news.find((item) => item.id === id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [cover, setCover] = useState<CoverKind>(existing?.cover ?? "vag");
  const [mail, setMail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const recipients = members.filter((m) => m.email && !m.emailOptOut && !m.bounced).length;
  const canSave = title.trim() && body.trim();

  function save(status: NewsItem["status"]) {
    const mailedNow = status === "published" && mail;
    const item: NewsItem = {
      id: existing?.id ?? createId(),
      title: title.trim(),
      body,
      cover,
      status,
      date: existing?.date ?? today(),
      author: existing?.author ?? "Ingrid Malm",
      mailedAt: mailedNow ? today() : existing?.mailedAt,
    };
    setNews((all) => (existing ? all.map((n) => (n.id === item.id ? item : n)) : [item, ...all]));
    toast(
      mailedNow
        ? `Publicerad och skickad till ${recipients} medlemmar`
        : status === "published"
          ? "Nyheten är publicerad"
          : "Utkastet är sparat",
    );
    navigate("/portal/nyheter");
  }

  function remove() {
    setNews((all) => all.filter((item) => item.id !== existing?.id));
    toast("Nyheten är borttagen");
    navigate("/portal/nyheter");
  }

  return (
    <>
      <PageHeader title={existing ? "Redigera nyhet" : "Ny nyhet"} />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card className="space-y-5 p-5">
          <Field label="Rubrik">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-semibold">Omslagsbild</legend>
            <div className="grid grid-cols-4 gap-2">
              {covers.map((option) => (
                <label key={option} className={`cursor-pointer overflow-hidden rounded-lg border-2 ${cover === option ? "border-brand" : "border-transparent"}`}>
                  <input type="radio" name="cover" className="sr-only" checked={cover === option} onChange={() => setCover(option)} aria-label={`Omslag ${option}`} />
                  <span className="block aspect-[4/3]">
                    <CoverArt kind={option} />
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-sm text-muted">Egna bilder kan laddas upp när arkivet är kopplat.</p>
          </fieldset>
          <Field label="Text" hint="Tom rad ger nytt stycke. ## ger mellanrubrik och - ger punktlista.">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={11} className={inputClass} />
          </Field>
          <label className="flex items-start gap-3 rounded-xl bg-sunken p-4">
            <input type="checkbox" checked={mail} onChange={(e) => setMail(e.target.checked)} className="mt-1 size-4 accent-[var(--brand)]" />
            <span>
              <span className="block font-semibold">Mejla till {recipients} medlemmar när den publiceras</span>
              <span className="text-sm text-muted">Mejlen skickas individuellt med avregistreringslänk.</span>
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canSave} onClick={() => save("published")}>
              Publicera
            </Button>
            <Button variant="secondary" disabled={!canSave} onClick={() => save("draft")}>
              Spara utkast
            </Button>
            <Button variant="ghost" onClick={() => navigate("/portal/nyheter")}>
              Avbryt
            </Button>
            {existing && (
              <Button variant="ghost" icon="trash" className="ml-auto text-danger" onClick={() => setConfirmDelete(true)}>
                Ta bort
              </Button>
            )}
          </div>
        </Card>

        <div className="xl:sticky xl:top-6">
          <p className="mb-2 text-sm font-semibold text-muted">Så här ser den ut på webbplatsen</p>
          <Card className="overflow-hidden">
            <div className="aspect-[2/1]">
              <CoverArt kind={cover} />
            </div>
            <div className="p-6">
              <p className="text-sm text-muted">{formatDate(existing?.date ?? today())}</p>
              <h2 className="mb-4 mt-1 font-display text-2xl font-semibold">{title || "Rubrik"}</h2>
              <Prose body={body || "Texten visas här medan du skriver."} />
            </div>
          </Card>
        </div>
      </div>
      <ConfirmDialog
        open={confirmDelete}
        title="Ta bort nyheten?"
        confirmLabel="Ta bort"
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      >
        Nyheten försvinner från webbplatsen och kan inte återställas.
      </ConfirmDialog>
    </>
  );
}
