import { Icon } from "../../components/icons";
import { useStore } from "../../demo/store";

export function ContactPage() {
  const { association, board } = useStore();
  const shown = board.filter((person) => person.showPublic);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Kontakt</h1>
      <p className="mt-3 text-lg text-muted">Hör av dig till styrelsen om du har frågor om området.</p>
      <div className="mt-8 rounded-2xl bg-brand p-7 text-brand-ink">
        <p className="font-display text-xl font-semibold">Mejla styrelsen</p>
        <a href={`mailto:${association.email}`} className="mt-1 inline-flex items-center gap-2 underline underline-offset-4">
          <Icon name="mail" className="size-4" /> {association.email}
        </a>
        <p className="mt-3 opacity-90">{association.address}</p>
      </div>
      <h2 className="mt-12 font-display text-2xl font-semibold">Styrelsen</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {shown.map((person) => (
          <li key={person.id} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4">
            <span className="grid size-12 place-items-center rounded-full bg-brand-soft font-bold text-brand-text">
              {person.name.split(" ").map((part) => part[0]).join("")}
            </span>
            <span>
              <span className="block font-semibold">{person.name}</span>
              <span className="text-sm text-muted">{person.title}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
