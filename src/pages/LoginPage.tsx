import { Link } from "react-router";

export function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-stone-900">
      <h1 className="text-2xl font-semibold text-brand-900">Logga in</h1>
      <p className="mt-3 text-stone-700">Inloggningen för styrelsen är inte klar ännu.</p>
      <p className="mt-6">
        <Link to="/" className="underline">
          Till webbplatsen
        </Link>
      </p>
    </main>
  );
}
