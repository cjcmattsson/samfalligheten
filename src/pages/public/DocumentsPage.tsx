import { useState } from "react";
import { Icon } from "../../components/icons";
import { EmptyState, inputClass } from "../../components/ui";
import { useStore } from "../../demo/store";
import { formatDate, formatSize } from "../../lib/format";

export function DocumentsPage() {
  const { docs, folders, toast } = useStore();
  const [query, setQuery] = useState("");
  const matches = docs.filter(
    (doc) => doc.public && doc.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const groups = folders
    .map((folder) => ({ folder, docs: matches.filter((doc) => doc.folderId === folder.id) }))
    .filter((group) => group.docs.length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Dokument</h1>
      <p className="mt-3 text-lg text-muted">Stadgar, protokoll och planer som styrelsen har publicerat.</p>
      <div className="relative mt-8">
        <Icon name="search" className="absolute left-3 top-2.5 size-5 text-muted" />
        <label className="sr-only" htmlFor="doc-search">
          Sök bland dokumenten
        </label>
        <input
          id="doc-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Sök bland dokumenten"
          className={`${inputClass} pl-10`}
        />
      </div>
      {groups.length === 0 && <EmptyState icon="search" title="Inga dokument hittades" />}
      {groups.map((group) => (
        <section key={group.folder.id} className="mt-9">
          <h2 className="font-display text-xl font-semibold">{group.folder.name}</h2>
          <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {group.docs.map((doc) => (
              <li key={doc.id}>
                <button
                  type="button"
                  onClick={() => toast("Filerna kopplas på när dokumentarkivet byggs.")}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-sunken"
                >
                  <Icon name="file" className="text-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{doc.title}</span>
                    <span className="text-sm text-muted">
                      {formatDate(doc.uploadedAt)} · {formatSize(doc.size)}
                    </span>
                  </span>
                  <Icon name="download" className="text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
