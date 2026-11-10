import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="px-4 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">Sidan hittades inte</h1>
      <p className="mt-3 text-stone-700">
        <Link to="/" className="underline">
          Gå till startsidan
        </Link>
      </p>
    </div>
  );
}
