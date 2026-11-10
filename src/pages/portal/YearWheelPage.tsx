import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation } from "react-router";
import { Icon } from "../../components/icons";
import { Badge, Button, Card, ConfirmDialog, Field, PageHeader, inputClass } from "../../components/ui";
import type { YearTask } from "../../demo/data";
import { useStore } from "../../demo/store";
import { MONTHS, addDays, createId, formatDate, today } from "../../lib/format";

const C = 170;

function polar(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return [C + radius * Math.cos(radians), C + radius * Math.sin(radians)];
}

function ringSegment(inner: number, outer: number, start: number, end: number) {
  const [x1, y1] = polar(outer, start);
  const [x2, y2] = polar(outer, end);
  const [x3, y3] = polar(inner, end);
  const [x4, y4] = polar(inner, start);
  return `M${x1} ${y1}A${outer} ${outer} 0 0 1 ${x2} ${y2}L${x3} ${y3}A${inner} ${inner} 0 0 0 ${x4} ${y4}Z`;
}

function Wheel({
  tasks,
  selected,
  current,
  onSelect,
}: {
  tasks: YearTask[];
  selected: number;
  current: number;
  onSelect: (month: number) => void;
}) {
  const open = tasks.filter((task) => task.month === selected && !task.done).length;

  function onKey(event: KeyboardEvent, month: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(month);
    }
  }

  return (
    <svg viewBox="0 0 340 340" className="mx-auto w-full max-w-sm" role="group" aria-label="Årshjul med årets månader">
      {MONTHS.map((name, index) => {
        const month = index + 1;
        const start = index * 30 + 1;
        const end = (index + 1) * 30 - 1;
        const monthTasks = tasks.filter((task) => task.month === month);
        const done = monthTasks.filter((task) => task.done).length;
        const share = monthTasks.length ? done / monthTasks.length : 0;
        const active = month === selected;
        const [lx, ly] = polar(112, (start + end) / 2);
        return (
          <g
            key={name}
            role="button"
            tabIndex={0}
            aria-pressed={active}
            aria-label={`${name}, ${done} av ${monthTasks.length} klara`}
            onClick={() => onSelect(month)}
            onKeyDown={(event) => onKey(event, month)}
            className="cursor-pointer"
          >
            <path d={ringSegment(76, 148, start, end)} className={active ? "fill-brand" : month === current ? "fill-brand-soft" : "fill-sunken hover:fill-line"} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" className={`text-[13px] font-semibold ${active ? "fill-brand-ink" : "fill-ink"}`}>
              {name.slice(0, 3)}
            </text>
            <path d={ringSegment(153, 160, start, end)} className="fill-sunken" />
            {share > 0 && <path d={ringSegment(153, 160, start, start + (end - start) * share)} className="fill-ok" />}
          </g>
        );
      })}
      <text x={C} y={C - 12} textAnchor="middle" className="fill-ink font-display text-[22px] font-semibold">
        {MONTHS[selected - 1]}
      </text>
      <text x={C} y={C + 14} textAnchor="middle" className="fill-muted text-[13px]">
        {open === 0 ? "Allt klart" : `${open} kvar att göra`}
      </text>
    </svg>
  );
}

export function YearWheelPage() {
  const { tasks, setTasks, steps, setSteps, assemblyDate, setAssemblyDate, toast } = useStore();
  const { hash } = useLocation();
  const current = new Date().getMonth() + 1;
  const [selected, setSelected] = useState(current);
  const [title, setTitle] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (hash) document.querySelector(hash)?.scrollIntoView();
  }, [hash]);

  const monthTasks = tasks.filter((task) => task.month === selected);
  const doneSteps = steps.filter((step) => step.done).length;
  const phases = [...new Set(steps.map((step) => step.phase))];

  function addTask(event: FormEvent) {
    event.preventDefault();
    setTasks((all) => [...all, { id: createId(), title: title.trim(), description: "", month: selected, done: false }]);
    setTitle("");
  }

  function resetYear() {
    setTasks((all) => all.map((task) => ({ ...task, done: false })));
    setSteps((all) => all.map((step) => ({ ...step, done: false })));
    setConfirmReset(false);
    toast("Årshjulet är nollställt inför nytt verksamhetsår");
  }

  return (
    <>
      <PageHeader
        title="Årshjul"
        description="Allt som återkommer under året, så att inget tappas bort när styrelsen byts."
        actions={
          <Button variant="secondary" onClick={() => setConfirmReset(true)}>
            Starta nytt år
          </Button>
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <Card className="p-5">
          <Wheel tasks={tasks} selected={selected} current={current} onSelect={setSelected} />
        </Card>
        <Card className="overflow-hidden">
          <h2 className="border-b border-line px-5 py-4 font-display text-xl font-semibold">{MONTHS[selected - 1]}</h2>
          <ul className="divide-y divide-line">
            {monthTasks.map((task) => (
              <li key={task.id} className="flex items-start gap-3 px-5 py-3.5">
                <input
                  type="checkbox"
                  id={task.id}
                  checked={task.done}
                  onChange={() => setTasks((all) => all.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)))}
                  className="mt-1 size-4 accent-[var(--brand)]"
                />
                <label htmlFor={task.id} className="min-w-0 flex-1 cursor-pointer">
                  <span className={`block font-medium ${task.done ? "text-muted line-through" : ""}`}>{task.title}</span>
                  {task.description && <span className="text-sm text-muted">{task.description}</span>}
                </label>
                <button type="button" onClick={() => setTasks((all) => all.filter((t) => t.id !== task.id))} aria-label={`Ta bort ${task.title}`} className="rounded p-1 text-muted hover:text-danger">
                  <Icon name="trash" className="size-4" />
                </button>
              </li>
            ))}
            {monthTasks.length === 0 && <li className="px-5 py-8 text-center text-muted">Inga uppgifter den här månaden.</li>}
          </ul>
          <form onSubmit={addTask} className="flex gap-2 border-t border-line p-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`Ny uppgift i ${MONTHS[selected - 1].toLowerCase()}`} aria-label="Ny uppgift" className={inputClass} />
            <Button type="submit" variant="secondary" icon="plus" disabled={!title.trim()}>
              Lägg till
            </Button>
          </form>
        </Card>
      </div>

      <section id="stamman" className="mt-12 scroll-mt-20">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Stämmoguiden</h2>
            <p className="mt-1 text-muted">
              {doneSteps} av {steps.length} steg klara. Datumen räknas fram från stämmans datum.
            </p>
          </div>
          <div className="w-full max-w-52">
            <Field label="Stämmans datum">
              <input type="date" value={assemblyDate} onChange={(e) => e.target.value && setAssemblyDate(e.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {phases.map((phase, index) => (
            <div key={phase}>
              <p className="mb-2 flex items-center gap-2 font-display text-lg font-semibold">
                <span className="grid size-7 place-items-center rounded-full bg-brand font-sans text-sm font-bold text-brand-ink">
                  {index + 1}
                </span>
                {phase}
              </p>
              <ul className="space-y-2.5">
                {steps
                  .filter((step) => step.phase === phase)
                  .map((step) => {
                    const deadline = addDays(assemblyDate, step.offsetDays);
                    const late = !step.done && deadline < today();
                    return (
                      <li key={step.id} className={`rounded-xl border border-line p-4 ${step.done ? "bg-sunken" : "bg-surface"}`}>
                        <label className="flex cursor-pointer items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={step.done}
                            onChange={() => setSteps((all) => all.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s)))}
                            className="mt-1 size-4 accent-[var(--brand)]"
                          />
                          <span className={`font-semibold ${step.done ? "text-muted line-through" : ""}`}>{step.title}</span>
                        </label>
                        <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <Badge tone={step.done ? "ok" : late ? "danger" : "neutral"}>
                            {step.done ? "Klart" : formatDate(deadline)}
                          </Badge>
                          {step.to && !step.done && (
                            <Link to={step.to} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-text hover:underline">
                              {step.action} <Icon name="arrow" className="size-3.5" />
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-5 text-sm text-muted">
          Guiden är ett stöd. Föreningens stadgar och gällande lag avgör vilka tidsfrister som faktiskt gäller.
        </p>
      </section>

      <ConfirmDialog
        open={confirmReset}
        title="Starta nytt verksamhetsår?"
        confirmLabel="Nollställ"
        onClose={() => setConfirmReset(false)}
        onConfirm={resetYear}
      >
        Alla bockar i årshjulet och stämmoguiden tas bort. Själva uppgifterna ligger kvar.
      </ConfirmDialog>
    </>
  );
}
