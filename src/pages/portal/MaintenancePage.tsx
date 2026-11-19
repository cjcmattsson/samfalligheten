import { useState, type FormEvent } from "react";
import { MaintenanceChart } from "../../components/MaintenanceChart";
import { Icon } from "../../components/icons";
import { Badge, Button, Card, ConfirmDialog, Field, Modal, PageHeader, Switch, inputClass } from "../../components/ui";
import { maintenanceCategories, type Condition, type MaintenanceItem } from "../../demo/data";
import { useStore } from "../../demo/store";
import { createId } from "../../lib/format";
import { buildPlan, contributionNeeded, dueYear, formatKr } from "../../lib/maintenance";

const horizons = [10, 20, 30];

const conditions: { id: Condition; label: string; tone: "ok" | "neutral" | "warn" }[] = [
  { id: "god", label: "Gott skick", tone: "ok" },
  { id: "acceptabel", label: "Acceptabelt", tone: "neutral" },
  { id: "atgard", label: "Behöver åtgärdas", tone: "warn" },
];

type Draft = Omit<MaintenanceItem, "lastDoneYear" | "intervalYears" | "cost" | "plannedYear"> & {
  lastDoneYear: string;
  intervalYears: string;
  cost: string;
  plannedYear: string;
};

const toDraft = (item: MaintenanceItem): Draft => ({
  ...item,
  lastDoneYear: String(item.lastDoneYear),
  intervalYears: String(item.intervalYears),
  cost: String(item.cost),
  plannedYear: item.plannedYear ? String(item.plannedYear) : "",
});

const thisYear = new Date().getFullYear();

const blank: Draft = {
  id: "",
  title: "",
  category: "Vägar",
  quantity: "",
  lastDoneYear: String(thisYear),
  intervalYears: "10",
  cost: "",
  plannedYear: "",
  condition: "god",
  note: "",
};

function dueBadge(year: number) {
  if (year < thisYear) return <Badge tone="danger">Försenad, {year}</Badge>;
  if (year === thisYear) return <Badge tone="warn">I år</Badge>;
  if (year <= thisYear + 2) return <Badge tone="brand">{year}</Badge>;
  return <Badge>{year}</Badge>;
}

export function MaintenancePage() {
  const { maintenance, setMaintenance, fund, setFund, maintenanceLog, setMaintenanceLog, toast } = useStore();
  const [horizon, setHorizon] = useState(10);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [completing, setCompleting] = useState<MaintenanceItem | null>(null);
  const [actualCost, setActualCost] = useState("");
  const [removing, setRemoving] = useState<MaintenanceItem | null>(null);

  const plan = buildPlan(maintenance, fund, thisYear, horizon);
  const total = plan.reduce((sum, year) => sum + year.cost, 0);
  const lowest = plan.reduce((low, year) => (year.balance < low.balance ? year : low), plan[0]);
  const shortfall = plan.find((year) => year.balance < 0);
  const needed = contributionNeeded(plan, fund);
  const sorted = [...maintenance].sort((a, b) => dueYear(a) - dueYear(b) || a.title.localeCompare(b.title, "sv"));

  const update = (patch: Partial<Draft>) => setEditing((current) => current && { ...current, ...patch });

  function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    const item: MaintenanceItem = {
      ...editing,
      id: editing.id || createId(),
      title: editing.title.trim(),
      lastDoneYear: Number(editing.lastDoneYear),
      intervalYears: Math.max(1, Number(editing.intervalYears)),
      cost: Number(editing.cost),
      plannedYear: editing.plannedYear ? Number(editing.plannedYear) : undefined,
    };
    setMaintenance((all) => (editing.id ? all.map((i) => (i.id === item.id ? item : i)) : [...all, item]));
    setEditing(null);
    toast("Åtgärden är sparad");
  }

  function complete(event: FormEvent) {
    event.preventDefault();
    if (!completing) return;
    setMaintenance((all) =>
      all.map((i) => (i.id === completing.id ? { ...i, lastDoneYear: thisYear, plannedYear: undefined, condition: "god" } : i)),
    );
    setMaintenanceLog((all) => [
      { id: createId(), title: completing.title, category: completing.category, year: thisYear, cost: Number(actualCost) },
      ...all,
    ]);
    toast(`Klart. Nästa gång blir ${thisYear + completing.intervalYears}.`);
    setCompleting(null);
  }

  return (
    <>
      <PageHeader
        title="Underhållsplan"
        description="Vad som behöver göras de kommande åren och vad det kostar. Beloppen är i dagens priser."
        actions={
          <Button icon="plus" onClick={() => setEditing(blank)}>
            Ny åtgärd
          </Button>
        }
      />

      <Card className="p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Kostnad, {horizon} år</dt>
              <dd className="font-display text-xl font-semibold whitespace-nowrap tabular-nums sm:text-2xl">{formatKr(total)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Snitt per år</dt>
              <dd className="font-display text-xl font-semibold whitespace-nowrap tabular-nums sm:text-2xl">{formatKr(total / horizon)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Fondens lägsta saldo</dt>
              <dd className={`font-display text-xl font-semibold whitespace-nowrap tabular-nums sm:text-2xl ${lowest.balance < 0 ? "text-danger" : ""}`}>
                {formatKr(lowest.balance)}
              </dd>
            </div>
          </dl>
          <div className="flex gap-1" role="group" aria-label="Tidsperiod">
            {horizons.map((years) => (
              <button
                key={years}
                type="button"
                aria-pressed={horizon === years}
                onClick={() => setHorizon(years)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${horizon === years ? "bg-brand text-brand-ink" : "text-muted hover:bg-sunken"}`}
              >
                {years} år
              </button>
            ))}
          </div>
        </div>
        <MaintenanceChart plan={plan} />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand-text">Visa siffrorna per år</summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm tabular-nums">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-semibold">År</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Kostnad</th>
                  <th scope="col" className="py-2 pr-4 text-right font-semibold">Fond efter året</th>
                  <th scope="col" className="py-2 font-semibold">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plan.map((year) => (
                  <tr key={year.year}>
                    <td className="py-2 pr-4">{year.year}</td>
                    <td className="py-2 pr-4 text-right">{formatKr(year.cost)}</td>
                    <td className={`py-2 pr-4 text-right ${year.balance < 0 ? "text-danger" : ""}`}>{formatKr(year.balance)}</td>
                    <td className="py-2 text-muted">{year.items.map((item) => item.title).join(", ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Åtgärder</h2>
          <ul className="divide-y divide-line">
            {sorted.map((item) => {
              const condition = conditions.find((c) => c.id === item.condition)!;
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
                  <button type="button" onClick={() => setEditing(toDraft(item))} className="min-w-0 flex-1 basis-60 text-left">
                    <span className="block font-semibold hover:underline">{item.title}</span>
                    <span className="text-sm text-muted">
                      {item.category}
                      {item.quantity && ` · ${item.quantity}`} · senast {item.lastDoneYear}, var {item.intervalYears}:e år
                    </span>
                  </button>
                  <div className="flex flex-wrap items-center gap-2">
                    {item.condition !== "god" && <Badge tone={condition.tone}>{condition.label}</Badge>}
                    {dueBadge(dueYear(item))}
                    <span className="w-28 text-right text-sm font-semibold tabular-nums">{formatKr(item.cost)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActualCost(String(item.cost));
                        setCompleting(item);
                      }}
                      aria-label={`Markera ${item.title} som utförd`}
                      title="Markera som utförd"
                      className="rounded p-1.5 text-muted hover:bg-sunken hover:text-ok"
                    >
                      <Icon name="check" className="size-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4 p-5">
            <h2 className="font-display text-lg font-semibold">Underhållsfonden</h2>
            <Field label="Saldo i dag (kr)">
              <input type="number" min={0} step={1000} value={fund.balance} onChange={(e) => setFund({ ...fund, balance: Number(e.target.value) })} className={inputClass} />
            </Field>
            <Field label="Avsättning per år (kr)">
              <input type="number" min={0} step={1000} value={fund.yearlyContribution} onChange={(e) => setFund({ ...fund, yearlyContribution: Number(e.target.value) })} className={inputClass} />
            </Field>
            {shortfall ? (
              <p className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
                Fonden räcker till {shortfall.year - 1}. För att den ska räcka i {horizon} år behöver avsättningen vara
                minst {formatKr(needed)} per år.
              </p>
            ) : (
              <p className="rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok">Fonden räcker hela perioden med nuvarande avsättning.</p>
            )}
            <div className="flex items-center justify-between gap-4 border-t border-line pt-4">
              <span className="text-sm">
                <span className="block font-semibold">Visa kommande arbeten på webbplatsen</span>
                <span className="text-muted">Utan belopp.</span>
              </span>
              <Switch checked={fund.showPublic} label="Visa kommande arbeten på webbplatsen" onChange={(showPublic) => setFund({ ...fund, showPublic })} />
            </div>
          </Card>

          <Card className="overflow-hidden">
            <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Utfört</h2>
            <ul className="divide-y divide-line">
              {maintenanceLog.map((done) => (
                <li key={done.id} className="flex items-baseline justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block font-medium">{done.title}</span>
                    <span className="text-muted">{done.year}</span>
                  </span>
                  <span className="whitespace-nowrap tabular-nums">{formatKr(done.cost)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.id ? "Redigera åtgärd" : "Ny åtgärd"} side>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <Field label="Åtgärd">
              <input id="m-title" required value={editing.title} onChange={(e) => update({ title: e.target.value })} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kategori">
                <select id="m-category" value={editing.category} onChange={(e) => update({ category: e.target.value as Draft["category"] })} className={inputClass}>
                  {maintenanceCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Mängd">
                <input id="m-quantity" value={editing.quantity} placeholder="Till exempel 42 stolpar" onChange={(e) => update({ quantity: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Senast utförd (år)">
                <input id="m-last" type="number" required min={1900} max={thisYear} value={editing.lastDoneYear} onChange={(e) => update({ lastDoneYear: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Görs om vart (år)">
                <input id="m-interval" type="number" required min={1} max={100} value={editing.intervalYears} onChange={(e) => update({ intervalYears: e.target.value })} className={inputClass} />
              </Field>
            </div>
            <Field label="Beräknad kostnad (kr)" hint="I dagens priser.">
              <input id="m-cost" type="number" required min={0} step={1000} value={editing.cost} onChange={(e) => update({ cost: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Flytta till år (valfritt)" hint="Lämna tomt för att räkna fram året från senaste utförande och intervall.">
              <input id="m-planned" type="number" min={thisYear} value={editing.plannedYear} onChange={(e) => update({ plannedYear: e.target.value })} className={inputClass} />
            </Field>
            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold">Skick</legend>
              <div className="flex flex-wrap gap-2">
                {conditions.map((option) => (
                  <label key={option.id} className={`cursor-pointer rounded-lg border-2 px-3 py-1.5 text-sm font-semibold ${editing.condition === option.id ? "border-brand" : "border-line"}`}>
                    <input type="radio" name="condition" className="sr-only" checked={editing.condition === option.id} onChange={() => update({ condition: option.id })} />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label="Anteckning" hint="Skriv inga personuppgifter här, till exempel namn på boende.">
              <textarea id="m-note" rows={3} value={editing.note} onChange={(e) => update({ note: e.target.value })} className={inputClass} />
            </Field>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit">Spara</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Avbryt
              </Button>
              {editing.id && (
                <Button
                  variant="ghost"
                  icon="trash"
                  className="ml-auto text-danger"
                  onClick={() => {
                    setRemoving(maintenance.find((i) => i.id === editing.id) ?? null);
                    setEditing(null);
                  }}
                >
                  Ta bort
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>

      <Modal open={Boolean(completing)} onClose={() => setCompleting(null)} title="Markera som utförd">
        {completing && (
          <form onSubmit={complete} className="space-y-4">
            <p className="text-muted">
              {completing.title} sparas som utförd {thisYear} och planeras in igen {thisYear + completing.intervalYears}.
            </p>
            <Field label="Verklig kostnad (kr)" hint="Sparas i historiken så att nästa uppskattning blir bättre.">
              <input id="m-actual" type="number" required min={0} step={100} value={actualCost} onChange={(e) => setActualCost(e.target.value)} className={inputClass} />
            </Field>
            <Button type="submit" icon="check">
              Markera som utförd
            </Button>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Ta bort åtgärden?"
        confirmLabel="Ta bort"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          setMaintenance((all) => all.filter((i) => i.id !== removing?.id));
          setRemoving(null);
          toast("Åtgärden är borttagen");
        }}
      >
        {removing?.title} tas bort ur planen. Historiken över utfört arbete ligger kvar.
      </ConfirmDialog>
    </>
  );
}
