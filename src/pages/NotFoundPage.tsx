import { LinkButton } from "../components/ui";

export function NotFoundPage() {
  return (
    <div className="px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">Sidan hittades inte</h1>
      <p className="mt-2 text-muted">Den kan ha flyttats eller tagits bort.</p>
      <div className="mt-6">
        <LinkButton to="/">Till startsidan</LinkButton>
      </div>
    </div>
  );
}
