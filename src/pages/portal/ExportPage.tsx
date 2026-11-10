import { Icon, type IconName } from "../../components/icons";
import { Button, Card, PageHeader } from "../../components/ui";
import { useStore } from "../../demo/store";
import { downloadFile, membersToCsv } from "../../lib/download";
import { formatSize } from "../../lib/format";

export function ExportPage() {
  const store = useStore();
  const { members, news, pages, mailings, tasks, steps, docs, folders, association, toast } = store;
  const totalSize = docs.reduce((sum, doc) => sum + doc.size, 0);

  function exportMembers() {
    downloadFile("medlemmar.csv", membersToCsv(members), "text/csv;charset=utf-8");
  }

  function exportText() {
    const content = JSON.stringify({ association, news, pages, mailings, tasks, steps, folders, docs }, null, 2);
    downloadFile("foreningens-innehall.json", content, "application/json");
  }

  const exports: {
    icon: IconName;
    title: string;
    detail: string;
    label: string;
    run: () => void;
  }[] = [
    {
      icon: "users",
      title: "Medlemsregistret",
      detail: `${members.length} medlemmar som CSV. Går att öppna i Excel.`,
      label: "Hämta CSV",
      run: exportMembers,
    },
    {
      icon: "news",
      title: "All text",
      detail: `${news.length} nyheter, ${pages.length} sidor, utskick och årshjul som JSON.`,
      label: "Hämta JSON",
      run: exportText,
    },
    {
      icon: "folder",
      title: "Alla dokument",
      detail: `${docs.length} filer, totalt ${formatSize(totalSize)}, som zip-fil.`,
      label: "Hämta zip",
      run: () => toast("Zip-filen kopplas på när dokumentarkivet byggs."),
    },
  ];

  return (
    <>
      <PageHeader
        title="Exportera allt"
        description="Föreningens data tillhör föreningen. Du kan när som helst ta med dig allt."
      />
      <ul className="grid gap-4 md:grid-cols-3">
        {exports.map((item) => (
          <li key={item.title}>
            <Card className="flex h-full flex-col p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand-text">
                <Icon name={item.icon} />
              </span>
              <h2 className="mt-4 font-display text-lg font-semibold">{item.title}</h2>
              <p className="mb-5 mt-1 flex-1 text-sm text-muted">{item.detail}</p>
              <Button variant="secondary" icon="download" onClick={item.run}>
                {item.label}
              </Button>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-5 rounded-xl bg-warn-soft px-4 py-3 text-sm text-warn">
        Exporten innehåller personuppgifter. Spara den säkert och radera den när den inte längre behövs.
      </p>
    </>
  );
}
