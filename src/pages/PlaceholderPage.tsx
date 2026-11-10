export function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <h1 className="text-2xl font-semibold text-brand-900">{title}</h1>
      <p className="mt-3 text-stone-700">Den här sidan är inte klar ännu.</p>
    </>
  );
}
