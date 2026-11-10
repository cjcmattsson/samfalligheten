import { useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Icon } from "../../components/icons";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Switch, inputClass } from "../../components/ui";
import type { Member } from "../../demo/data";
import { useStore } from "../../demo/store";
import { downloadFile, membersToCsv, parseMembersCsv } from "../../lib/download";
import { createId, today } from "../../lib/format";

const blank: Member = {
  id: "",
  name: "",
  property: "",
  address: "",
  email: "",
  phone: "",
  emailOptOut: false,
  bounced: false,
  updated: "",
};

const views = [
  { id: "alla", label: "Alla", test: () => true },
  { id: "studsar", label: "E-post fungerar inte", test: (m: Member) => m.bounced },
  { id: "avregistrerade", label: "Avregistrerade", test: (m: Member) => m.emailOptOut },
  { id: "saknar", label: "Saknar e-post", test: (m: Member) => !m.email },
];

function MemberBadges({ member }: { member: Member }) {
  return (
    <>
      {member.bounced && <Badge tone="danger">Studsar</Badge>}
      {member.emailOptOut && <Badge>Avregistrerad</Badge>}
      {!member.email && <Badge tone="warn">Saknar e-post</Badge>}
    </>
  );
}

export function MembersPage() {
  const { members, setMembers, toast } = useStore();
  const [params, setParams] = useSearchParams();
  const view = views.find((v) => v.id === params.get("visa")) ?? views[0];
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Member | null>(null);
  const [ownerChange, setOwnerChange] = useState(false);
  const [removing, setRemoving] = useState<Member | null>(null);
  const importInput = useRef<HTMLInputElement>(null);

  const needle = query.trim().toLowerCase();
  const shown = members.filter(
    (m) => view.test(m) && [m.name, m.property, m.address, m.email].join(" ").toLowerCase().includes(needle),
  );

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const saved = { ...editing, updated: today() };
    if (saved.id) {
      setMembers((all) => all.map((m) => (m.id === saved.id ? saved : m)));
    } else {
      setMembers((all) => [{ ...saved, id: createId() }, ...all]);
    }
    toast(ownerChange ? "Ägarbytet är klart. Tidigare uppgifter är borttagna." : "Medlemmen är sparad");
    setEditing(null);
    setOwnerChange(false);
  }

  function startOwnerChange(member: Member) {
    setOwnerChange(true);
    setEditing({ ...blank, id: member.id, property: member.property, address: member.address });
  }

  async function importCsv(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const imported = parseMembersCsv(await file.text());
    setMembers((all) => [...imported, ...all]);
    toast(`${imported.length} medlemmar importerade`);
    if (importInput.current) importInput.current.value = "";
  }

  const update = (patch: Partial<Member>) => setEditing((current) => current && { ...current, ...patch });

  const rowActions = (member: Member) => (
    <div className="flex justify-end gap-1">
      <button type="button" onClick={() => { setOwnerChange(false); setEditing(member); }} aria-label={`Redigera ${member.name}`} title="Redigera" className="rounded p-1.5 text-muted hover:bg-sunken hover:text-ink">
        <Icon name="edit" className="size-4" />
      </button>
      <button type="button" onClick={() => startOwnerChange(member)} aria-label={`Ägarbyte för ${member.property}`} title="Ägarbyte" className="rounded p-1.5 text-muted hover:bg-sunken hover:text-ink">
        <Icon name="swap" className="size-4" />
      </button>
      <button type="button" onClick={() => setRemoving(member)} aria-label={`Radera ${member.name}`} title="Radera" className="rounded p-1.5 text-muted hover:bg-sunken hover:text-danger">
        <Icon name="trash" className="size-4" />
      </button>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Medlemsregister"
        description={`${members.length} fastigheter. Registret är bara synligt för styrelsen.`}
        actions={
          <>
            <Button variant="secondary" icon="upload" onClick={() => importInput.current?.click()}>
              Importera
            </Button>
            <input ref={importInput} type="file" accept=".csv,text/csv" className="sr-only" tabIndex={-1} aria-label="Välj CSV-fil" onChange={(e) => importCsv(e.target.files)} />
            <Button variant="secondary" icon="download" onClick={() => downloadFile("medlemmar.csv", membersToCsv(members), "text/csv;charset=utf-8")}>
              Exportera
            </Button>
            <Button icon="plus" onClick={() => { setOwnerChange(false); setEditing(blank); }}>
              Lägg till
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Icon name="search" className="absolute left-3 top-2.5 size-5 text-muted" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sök namn, fastighet eller e-post" aria-label="Sök medlemmar" className={`${inputClass} pl-10`} />
        </div>
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtrera medlemmar">
          {views.map((option) => {
            const count = members.filter(option.test).length;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={view.id === option.id}
                onClick={() => setParams(option.id === "alla" ? {} : { visa: option.id })}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${view.id === option.id ? "bg-brand text-brand-ink" : "text-muted hover:bg-sunken"}`}
              >
                {option.label} {count}
              </button>
            );
          })}
        </div>
      </div>

      <Card className="overflow-hidden">
        {shown.length === 0 && <EmptyState icon="users" title="Inga medlemmar hittades" />}
        {shown.length > 0 && (
          <table className="hidden w-full text-left text-sm md:table">
            <thead className="border-b border-line text-muted">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Namn</th>
                <th scope="col" className="px-3 py-3 font-semibold">Fastighet</th>
                <th scope="col" className="px-3 py-3 font-semibold">Kontakt</th>
                <th scope="col" className="px-3 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">Åtgärder</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((member) => (
                <tr key={member.id} className="hover:bg-sunken/50">
                  <td className="px-5 py-3 font-semibold">{member.name || "Ej angivet"}</td>
                  <td className="px-3 py-3">
                    {member.property}
                    <span className="block text-muted">{member.address}</span>
                  </td>
                  <td className="px-3 py-3">
                    {member.email}
                    <span className="block text-muted">{member.phone}</span>
                  </td>
                  <td className="px-3 py-3"><div className="flex flex-wrap gap-1"><MemberBadges member={member} /></div></td>
                  <td className="px-5 py-3">{rowActions(member)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <ul className="divide-y divide-line md:hidden">
          {shown.map((member) => (
            <li key={member.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{member.name || "Ej angivet"}</p>
                  <p className="text-sm text-muted">{member.property} · {member.address}</p>
                  <p className="break-all text-sm">{member.email}</p>
                </div>
                {rowActions(member)}
              </div>
              <div className="mt-2 flex flex-wrap gap-1"><MemberBadges member={member} /></div>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={Boolean(editing)}
        onClose={() => { setEditing(null); setOwnerChange(false); }}
        title={ownerChange ? `Ägarbyte, ${editing?.property}` : editing?.id ? "Redigera medlem" : "Lägg till medlem"}
        side
      >
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {ownerChange && (
              <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-brand-text">
                Den tidigare ägarens namn, e-post och telefon raderas helt när du sparar. Fastigheten ligger kvar.
              </p>
            )}
            <Field label={ownerChange ? "Ny ägares namn" : "Namn"}>
              <input required value={editing.name} onChange={(e) => update({ name: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Fastighetsbeteckning">
              <input required value={editing.property} onChange={(e) => update({ property: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Adress">
              <input value={editing.address} onChange={(e) => update({ address: e.target.value })} className={inputClass} />
            </Field>
            <Field label="E-post">
              <input type="email" value={editing.email} onChange={(e) => update({ email: e.target.value, bounced: false })} className={inputClass} />
            </Field>
            <Field label="Telefon (valfritt)">
              <input value={editing.phone} onChange={(e) => update({ phone: e.target.value })} className={inputClass} />
            </Field>
            {!ownerChange && (
              <div className="flex items-center justify-between gap-4 rounded-xl bg-sunken p-4">
                <span className="font-semibold">Avregistrerad från utskick</span>
                <Switch checked={editing.emailOptOut} label="Avregistrerad från utskick" onChange={(emailOptOut) => update({ emailOptOut })} />
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button type="submit">{ownerChange ? "Slutför ägarbyte" : "Spara"}</Button>
              <Button variant="ghost" onClick={() => { setEditing(null); setOwnerChange(false); }}>
                Avbryt
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Radera medlemmen?"
        confirmLabel="Radera permanent"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          setMembers((all) => all.filter((m) => m.id !== removing?.id));
          setRemoving(null);
          toast("Alla uppgifter om medlemmen är raderade");
        }}
      >
        Alla uppgifter om {removing?.name} tas bort och kan inte återställas. Använd Ägarbyte om fastigheten bara har
        sålts.
      </ConfirmDialog>
    </>
  );
}
