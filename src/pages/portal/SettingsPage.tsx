import { useState, type FormEvent } from "react";
import { Icon } from "../../components/icons";
import { Badge, Button, Card, ConfirmDialog, Field, Modal, PageHeader, Switch, inputClass } from "../../components/ui";
import type { BoardMember } from "../../demo/data";
import { useStore, type Palette } from "../../demo/store";
import { createId } from "../../lib/format";

const palettes: { id: Palette; label: string; color: string }[] = [
  { id: "fjord", label: "Fjord", color: "#1f4b63" },
  { id: "skog", label: "Skog", color: "#28583f" },
  { id: "falu", label: "Falu", color: "#8a2f22" },
];

const handover = [
  "Nya styrelsen är inbjuden och gamla konton är borttagna",
  "Minst två personer har rollen administratör",
  "Föreningens Google-konto har nya ägare",
  "Årshjulet är genomgånget med nya styrelsen",
];

export function SettingsPage() {
  const { association, setAssociation, board, setBoard, palette, setPalette, toast } = useStore();
  const [details, setDetails] = useState(association);
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState<BoardMember | null>(null);
  const [checked, setChecked] = useState<string[]>([]);

  const admins = board.filter((person) => person.role === "admin").length;

  function saveDetails(event: FormEvent) {
    event.preventDefault();
    setAssociation(details);
    toast("Föreningsuppgifterna är sparade");
  }

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBoard((all) => [
      ...all,
      {
        id: createId(),
        name: String(form.get("name")),
        email: String(form.get("email")),
        title: String(form.get("title")),
        role: form.get("role") === "admin" ? "admin" : "board",
        showPublic: false,
        pending: true,
      },
    ]);
    setInviting(false);
    toast("Inbjudan är skickad");
  }

  const update = (id: string, patch: Partial<BoardMember>) =>
    setBoard((all) => all.map((person) => (person.id === id ? { ...person, ...patch } : person)));

  const field = (key: keyof typeof details, label: string, type = "text") => (
    <Field label={label}>
      <input type={type} value={details[key]} onChange={(e) => setDetails({ ...details, [key]: e.target.value })} className={inputClass} />
    </Field>
  );

  return (
    <>
      <PageHeader title="Inställningar" description="Styrelse, föreningsuppgifter och överlämning." />
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-semibold">Styrelsen</h2>
            <Button variant="secondary" icon="plus" onClick={() => setInviting(true)}>
              Bjud in
            </Button>
          </div>
          <ul className="divide-y divide-line">
            {board.map((person) => (
              <li key={person.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4">
                <div className="min-w-0 flex-1 basis-52">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {person.name} {person.pending && <Badge tone="warn">Inbjuden</Badge>}
                  </p>
                  <p className="text-sm text-muted">
                    {person.title} · {person.email}
                  </p>
                </div>
                <select
                  value={person.role}
                  aria-label={`Roll för ${person.name}`}
                  disabled={person.role === "admin" && admins === 1}
                  onChange={(e) => update(person.id, { role: e.target.value as BoardMember["role"] })}
                  className={`${inputClass.replace("w-full", "w-auto")} text-sm`}
                >
                  <option value="admin">Administratör</option>
                  <option value="board">Styrelse</option>
                </select>
                <span className="flex items-center gap-2 text-sm text-muted">
                  På webbplatsen
                  <Switch checked={person.showPublic} label={`Visa ${person.name} på webbplatsen`} onChange={(showPublic) => update(person.id, { showPublic })} />
                </span>
                <button
                  type="button"
                  disabled={person.role === "admin" && admins === 1}
                  onClick={() => setRemoving(person)}
                  aria-label={`Ta bort ${person.name}`}
                  className="rounded p-1 text-muted hover:text-danger disabled:opacity-30"
                >
                  <Icon name="trash" className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-lg font-semibold">Föreningsuppgifter</h2>
            <form onSubmit={saveDetails} className="space-y-4">
              {field("name", "Föreningens namn")}
              {field("shortName", "Kort namn")}
              {field("tagline", "Text på startsidan")}
              {field("email", "Kontakt-e-post", "email")}
              {field("address", "Adress")}
              <Button type="submit">Spara</Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="p-5">
              <h2 className="font-display text-lg font-semibold">Färgtema</h2>
              <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Färgtema">
                {palettes.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={palette === option.id}
                    onClick={() => setPalette(option.id)}
                    className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold ${palette === option.id ? "border-brand" : "border-line"}`}
                  >
                    <span className="size-4 rounded-full" style={{ background: option.color }} />
                    {option.label}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-display text-lg font-semibold">Överlämning till ny styrelse</h2>
              <p className="mt-1 text-sm text-muted">Gå igenom listan varje gång styrelsen byts.</p>
              <ul className="mt-3 space-y-2">
                {handover.map((item) => (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked.includes(item)}
                        onChange={() =>
                          setChecked((all) => (all.includes(item) ? all.filter((i) => i !== item) : [...all, item]))
                        }
                        className="mt-1 size-4 accent-[var(--brand)]"
                      />
                      <span>{item}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <Modal open={inviting} onClose={() => setInviting(false)} title="Bjud in till styrelsen">
        <form onSubmit={invite} className="space-y-4">
          <Field label="Namn">
            <input name="name" required className={inputClass} />
          </Field>
          <Field label="E-post">
            <input name="email" type="email" required className={inputClass} />
          </Field>
          <Field label="Uppdrag">
            <input name="title" required placeholder="Till exempel Ledamot" className={inputClass} />
          </Field>
          <Field label="Roll" hint="En administratör kan också hantera styrelsen och inställningarna.">
            <select name="role" defaultValue="board" className={inputClass}>
              <option value="board">Styrelse</option>
              <option value="admin">Administratör</option>
            </select>
          </Field>
          <Button type="submit" icon="mail">
            Skicka inbjudan
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Ta bort från styrelsen?"
        confirmLabel="Ta bort åtkomst"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          setBoard((all) => all.filter((person) => person.id !== removing?.id));
          setRemoving(null);
          toast("Åtkomsten är borttagen");
        }}
      >
        {removing?.name} förlorar åtkomsten till portalen direkt.
      </ConfirmDialog>
    </>
  );
}
