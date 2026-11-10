import { useRef, useState, type DragEvent } from "react";
import { Icon } from "../../components/icons";
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Switch, inputClass } from "../../components/ui";
import type { Doc } from "../../demo/data";
import { useStore } from "../../demo/store";
import { createId, formatDate, formatSize, today } from "../../lib/format";

export function DocumentsAdminPage() {
  const { docs, setDocs, folders, setFolders, toast } = useStore();
  const [folderId, setFolderId] = useState("all");
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<Doc | null>(null);
  const [removing, setRemoving] = useState<Doc | null>(null);
  const [folderDialog, setFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const shown = docs.filter(
    (doc) =>
      (folderId === "all" || doc.folderId === folderId) &&
      doc.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).map((file) => ({
      id: createId(),
      title: file.name,
      folderId: folderId === "all" ? folders[0].id : folderId,
      size: file.size,
      public: false,
      uploadedBy: "Ingrid Malm",
      uploadedAt: today(),
    }));
    setDocs((all) => [...added, ...all]);
    toast(`${added.length} dokument tillagda som interna`);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function createFolder() {
    const id = createId();
    setFolders((all) => [...all, { id, name: folderName.trim() }]);
    setFolderId(id);
    setFolderName("");
    setFolderDialog(false);
  }

  const folderClass = (active: boolean) =>
    `flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm font-medium ${
      active ? "bg-brand-soft text-brand-text" : "hover:bg-sunken"
    }`;

  return (
    <>
      <PageHeader
        title="Dokument"
        description="Nya dokument är interna tills någon väljer att göra dem publika."
        actions={
          <>
            <Button variant="secondary" icon="folder" onClick={() => setFolderDialog(true)}>
              Ny mapp
            </Button>
            <Button icon="upload" onClick={() => fileInput.current?.click()}>
              Ladda upp
            </Button>
            <input ref={fileInput} type="file" multiple className="sr-only" tabIndex={-1} aria-label="Välj filer" onChange={(e) => addFiles(e.target.files)} />
          </>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Mappar">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            <li>
              <button type="button" className={folderClass(folderId === "all")} onClick={() => setFolderId("all")}>
                <Icon name="folder" className="size-4" /> Alla dokument
              </button>
            </li>
            {folders.map((folder) => (
              <li key={folder.id}>
                <button type="button" className={folderClass(folderId === folder.id)} onClick={() => setFolderId(folder.id)}>
                  <Icon name="folder" className="size-4" /> {folder.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`min-w-0 rounded-2xl ${dragging ? "outline-2 outline-dashed outline-brand" : ""}`}
        >
          <div className="relative mb-3">
            <Icon name="search" className="absolute left-3 top-2.5 size-5 text-muted" />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sök dokument" aria-label="Sök dokument" className={`${inputClass} pl-10`} />
          </div>
          <Card className="overflow-hidden">
            {shown.length === 0 && (
              <EmptyState icon="upload" title="Inga dokument här">
                Dra filer hit eller klicka på Ladda upp.
              </EmptyState>
            )}
            <ul className="divide-y divide-line">
              {shown.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <button type="button" onClick={() => setPreview(doc)} className="flex min-w-0 flex-1 basis-56 items-center gap-3 text-left">
                    <Icon name="file" className="text-accent" />
                    <span className="min-w-0">
                      <span className="block font-medium hover:underline">{doc.title}</span>
                      <span className="text-sm text-muted">
                        {doc.uploadedBy} · {formatDate(doc.uploadedAt)} · {formatSize(doc.size)}
                      </span>
                    </span>
                  </button>
                  <div className="flex items-center gap-3">
                    <Badge tone={doc.public ? "ok" : "neutral"}>{doc.public ? "Publik" : "Intern"}</Badge>
                    <Switch
                      checked={doc.public}
                      label={`Gör ${doc.title} publikt`}
                      onChange={(value) => {
                        setDocs((all) => all.map((d) => (d.id === doc.id ? { ...d, public: value } : d)));
                        toast(value ? "Dokumentet visas nu på webbplatsen" : "Dokumentet är nu internt");
                      }}
                    />
                    <button type="button" onClick={() => setRemoving(doc)} aria-label={`Ta bort ${doc.title}`} className="rounded p-1 text-muted hover:text-danger">
                      <Icon name="trash" className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-2 text-center text-sm text-muted">Du kan också dra filer direkt hit.</p>
        </div>
      </div>

      <Modal open={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.title ?? ""} side>
        <div className="grid aspect-[3/4] place-items-center rounded-xl bg-sunken text-center text-muted">
          <div>
            <Icon name="file" className="mx-auto size-10" />
            <p className="mt-2 text-sm">PDF-förhandsvisning kopplas på med arkivet.</p>
          </div>
        </div>
      </Modal>

      <Modal open={folderDialog} onClose={() => setFolderDialog(false)} title="Ny mapp">
        <Field label="Namn">
          <input value={folderName} onChange={(e) => setFolderName(e.target.value)} className={inputClass} />
        </Field>
        <div className="mt-5 flex justify-end">
          <Button disabled={!folderName.trim()} onClick={createFolder}>
            Skapa mapp
          </Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(removing)}
        title="Ta bort dokumentet?"
        confirmLabel="Ta bort"
        onClose={() => setRemoving(null)}
        onConfirm={() => {
          setDocs((all) => all.filter((doc) => doc.id !== removing?.id));
          setRemoving(null);
          toast("Dokumentet är borttaget");
        }}
      >
        {removing?.title} tas bort permanent.
      </ConfirmDialog>
    </>
  );
}
