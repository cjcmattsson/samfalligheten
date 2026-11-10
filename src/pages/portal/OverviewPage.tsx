import { Link } from "react-router";
import { useMember } from "../../auth/AuthContext";
import { Icon, type IconName } from "../../components/icons";
import { Badge, Card, LinkButton, PageHeader } from "../../components/ui";
import { useStore } from "../../demo/store";
import { MONTHS, addDays, formatDate, formatShortDate, formatSize } from "../../lib/format";

type Todo = { icon: IconName; title: string; detail: string; to: string; tone: string };

export function OverviewPage() {
  const { members, news, tasks, setTasks, steps, assemblyDate, docs } = useStore();
  const member = useMember();

  const month = new Date().getMonth() + 1;
  const monthTasks = tasks.filter((task) => task.month === month);
  const openTasks = monthTasks.filter((task) => !task.done);
  const bounced = members.filter((member) => member.bounced).length;
  const drafts = news.filter((item) => item.status === "draft");
  const nextStep = steps.find((step) => !step.done);
  const doneSteps = steps.filter((step) => step.done).length;
  const progress = Math.round((doneSteps / steps.length) * 100);

  const todos: Todo[] = [];
  if (bounced > 0) {
    todos.push({
      icon: "alert",
      title: `${bounced} ${bounced === 1 ? "medlem" : "medlemmar"} har en e-post som inte fungerar`,
      detail: "De får inga utskick förrän adressen är rättad.",
      to: "/portal/medlemmar?visa=studsar",
      tone: "bg-danger-soft text-danger",
    });
  }
  if (nextStep) {
    todos.push({
      icon: "wheel",
      title: nextStep.title,
      detail: `Stämman · senast ${formatDate(addDays(assemblyDate, nextStep.offsetDays))}`,
      to: "/portal/arshjul#stamman",
      tone: "bg-brand-soft text-brand-text",
    });
  }
  drafts.forEach((item) =>
    todos.push({
      icon: "edit",
      title: `Utkast: ${item.title}`,
      detail: `Påbörjat av ${item.author}`,
      to: `/portal/nyheter/${item.id}`,
      tone: "bg-warn-soft text-warn",
    }),
  );

  return (
    <>
      <PageHeader
        title={`Hej ${member.name.split(" ")[0]}`}
        description={
          todos.length ? `Det finns ${todos.length} saker som väntar på styrelsen.` : "Allt är i fas just nu."
        }
        actions={
          <>
            <LinkButton to="/portal/utskick" variant="secondary" icon="send">
              Nytt utskick
            </LinkButton>
            <LinkButton to="/portal/nyheter/ny" icon="plus">
              Ny nyhet
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="border-b border-line px-5 py-4 font-display text-lg font-semibold">Att göra nu</h2>
          <ul className="divide-y divide-line">
            {todos.map((todo) => (
              <li key={todo.title}>
                <Link to={todo.to} className="group flex items-center gap-4 px-5 py-4 hover:bg-sunken">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${todo.tone}`}>
                    <Icon name={todo.icon} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{todo.title}</span>
                    <span className="text-sm text-muted">{todo.detail}</span>
                  </span>
                  <Icon name="arrow" className="size-4 text-muted transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
            {todos.length === 0 && <li className="px-5 py-8 text-center text-muted">Inget väntar.</li>}
          </ul>
        </Card>

        <Link to="/portal/arshjul#stamman" className="rounded-2xl bg-brand p-6 text-brand-ink">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-80">Årsstämma</p>
          <p className="mt-2 font-display text-3xl font-semibold">{formatDate(assemblyDate)}</p>
          <div className="mt-8 flex items-baseline justify-between">
            <span>
              {doneSteps} av {steps.length} steg klara
            </span>
            <span className="font-display text-2xl font-semibold">{progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-ink/25">
            <div className="h-full rounded-full bg-brand-ink" style={{ width: `${progress}%` }} />
          </div>
          {nextStep && <p className="mt-4 text-sm opacity-90">Nästa: {nextStep.title}</p>}
        </Link>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">{MONTHS[month - 1]}</h2>
            <Badge tone={openTasks.length ? "warn" : "ok"}>{openTasks.length} kvar</Badge>
          </div>
          <ul className="mt-3 space-y-1">
            {monthTasks.map((task) => (
              <li key={task.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-1.5 hover:bg-sunken">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() =>
                      setTasks((all) =>
                        all.map((item) => (item.id === task.id ? { ...item, done: !item.done } : item)),
                      )
                    }
                    className="mt-1 size-4 accent-[var(--brand)]"
                  />
                  <span className={task.done ? "text-muted line-through" : ""}>{task.title}</span>
                </label>
              </li>
            ))}
          </ul>
          <Link to="/portal/arshjul" className="mt-3 inline-block text-sm font-semibold text-brand-text underline-offset-4 hover:underline">
            Hela årshjulet
          </Link>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Senaste nyheter</h2>
          <ul className="mt-3 space-y-3">
            {news.slice(0, 3).map((item) => (
              <li key={item.id}>
                <Link to={`/portal/nyheter/${item.id}`} className="block hover:underline">
                  <span className="font-medium">{item.title}</span>
                </Link>
                <span className="text-sm text-muted">
                  {item.status === "draft" ? "Utkast" : "Publicerad"} · {formatShortDate(item.date)}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-lg font-semibold">Senaste dokument</h2>
          <ul className="mt-3 space-y-3">
            {[...docs]
              .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
              .slice(0, 3)
              .map((doc) => (
                <li key={doc.id}>
                  <Link to="/portal/dokument" className="block font-medium hover:underline">
                    {doc.title}
                  </Link>
                  <span className="text-sm text-muted">
                    {doc.public ? "Publik" : "Intern"} · {formatSize(doc.size)}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
