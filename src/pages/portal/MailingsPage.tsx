import { useState } from "react";
import { Badge, Button, Card, EmptyState, Field, Modal, PageHeader, Prose, inputClass } from "../../components/ui";
import { useStore } from "../../demo/store";
import { createId, formatDate, today } from "../../lib/format";

export function MailingsPage() {
  const { mailings, setMailings, members, board, association, toast } = useStore();
  const [composing, setComposing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("members");

  const memberRecipients = members.filter((m) => m.email && !m.emailOptOut && !m.bounced).length;
  const skipped = members.length - memberRecipients;
  const recipients = audience === "members" ? memberRecipients : board.length;

  function send() {
    setMailings((all) => [
      {
        id: createId(),
        subject,
        body,
        audience: audience === "members" ? "Alla medlemmar" : "Styrelsen",
        sentAt: today(),
        sender: "Ingrid Malm",
        recipients,
        bounces: 0,
      },
      ...all,
    ]);
    setSubject("");
    setBody("");
    setConfirming(false);
    setComposing(false);
    toast(`Skickat till ${recipients} mottagare`);
  }

  return (
    <>
      <PageHeader
        title="Utskick"
        description="Mejla medlemmarna utan att skapa en nyhet, till exempel om vattenavstängning."
        actions={
          !composing && (
            <Button icon="plus" onClick={() => setComposing(true)}>
              Nytt utskick
            </Button>
          )
        }
      />

      {composing && (
        <div className="mb-8 grid items-start gap-6 xl:grid-cols-2">
          <Card className="space-y-5 p-5">
            <Field label="Mottagare">
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className={inputClass}>
                <option value="members">Alla medlemmar ({memberRecipients})</option>
                <option value="board">Styrelsen ({board.length})</option>
              </select>
            </Field>
            {audience === "members" && skipped > 0 && (
              <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
                {skipped} medlemmar får inget mejl eftersom de saknar fungerande adress eller har avregistrerat sig.
              </p>
            )}
            <Field label="Ämne">
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
            </Field>
            <Field label="Meddelande">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} className={inputClass} />
            </Field>
            <div className="flex gap-2">
              <Button icon="send" disabled={!subject.trim() || !body.trim()} onClick={() => setConfirming(true)}>
                Granska och skicka
              </Button>
              <Button variant="ghost" onClick={() => setComposing(false)}>
                Avbryt
              </Button>
            </div>
          </Card>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted">Så här ser mejlet ut</p>
            <Card className="p-6">
              <dl className="border-b border-line pb-4 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted">Från:</dt>
                  <dd>{association.name}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">Till:</dt>
                  <dd>Endast mottagarens egen adress</dd>
                </div>
              </dl>
              <h2 className="mb-3 mt-4 font-display text-xl font-semibold">{subject || "Ämne"}</h2>
              <Prose body={body || "Meddelandet visas här medan du skriver."} />
              <p className="mt-6 border-t border-line pt-4 text-xs text-muted">
                Du får det här mejlet som medlem i {association.name}.{" "}
                <span className="underline">Avregistrera dig</span>
              </p>
            </Card>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Skickade</h2>
        {mailings.length === 0 && <EmptyState icon="send" title="Inga utskick än" />}
        <ul className="divide-y divide-line">
          {mailings.map((mailing) => (
            <li key={mailing.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <div className="min-w-0 flex-1 basis-60">
                <p className="font-semibold">{mailing.subject}</p>
                <p className="text-sm text-muted">
                  {formatDate(mailing.sentAt)} · {mailing.audience} · {mailing.sender}
                </p>
              </div>
              <Badge tone="ok">{mailing.recipients - mailing.bounces} levererade</Badge>
              {mailing.bounces > 0 && <Badge tone="danger">{mailing.bounces} studsade</Badge>}
            </li>
          ))}
        </ul>
      </Card>

      <Modal open={confirming} onClose={() => setConfirming(false)} title="Skicka utskicket?">
        <p className="text-muted">
          <strong className="text-ink">{subject}</strong> skickas till {recipients} mottagare. Det går inte att ta
          tillbaka när det är skickat.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirming(false)}>
            Avbryt
          </Button>
          <Button icon="send" onClick={send}>
            Skicka nu
          </Button>
        </div>
      </Modal>
    </>
  );
}
