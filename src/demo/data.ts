// Fictional sample data for designing the UI. Replaced by Firestore in later phases.

export type CoverKind = "sommar" | "lekplats" | "stamma" | "vag";

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  cover: CoverKind;
  status: "draft" | "published";
  date: string;
  author: string;
  mailedAt?: string;
};

export type Member = {
  id: string;
  name: string;
  property: string;
  address: string;
  email: string;
  phone: string;
  emailOptOut: boolean;
  bounced: boolean;
  updated: string;
};

export type Mailing = {
  id: string;
  subject: string;
  body: string;
  audience: string;
  sentAt: string;
  sender: string;
  recipients: number;
  bounces: number;
};

export type Folder = { id: string; name: string };

export type Doc = {
  id: string;
  title: string;
  folderId: string;
  size: number;
  public: boolean;
  uploadedBy: string;
  uploadedAt: string;
};

export type Page = {
  slug: string;
  title: string;
  lead: string;
  body: string;
  visible: boolean;
};

export type YearTask = {
  id: string;
  title: string;
  description: string;
  month: number;
  done: boolean;
};

export type AssemblyStep = {
  id: string;
  phase: string;
  title: string;
  description: string;
  offsetDays: number;
  done: boolean;
  to?: string;
  action?: string;
};

export type BoardMember = {
  id: string;
  name: string;
  email: string;
  title: string;
  role: "admin" | "board";
  showPublic: boolean;
  pending: boolean;
};

export type Association = {
  name: string;
  shortName: string;
  tagline: string;
  email: string;
  address: string;
};

export const initialAssociation: Association = {
  name: "Östergårdshus samfällighetsförening",
  shortName: "Östergårdshus",
  tagline: "Grannar som tillsammans tar hand om vägar, grönytor och det vi delar.",
  email: "styrelsen@example.se",
  address: "Exempelvägen 1, 123 45 Exempelstad",
};

export const initialNews: NewsItem[] = [
  {
    id: "n1",
    title: "Snöröjningen inför vintern",
    body: "Exempeltext. Säsongen för snöröjning börjar den 1 december. Vi ber alla att inte parkera på vändplatserna när det snöar.\n\n## Så kan du hjälpa till\n\n- Håll infarten fri från hinder\n- Flytta bilen från gatan vid snöfall\n- Hör av dig till styrelsen om något har missats",
    cover: "vag",
    status: "published",
    date: "2026-11-02",
    author: "Ingrid Malm",
    mailedAt: "2026-11-02",
  },
  {
    id: "n2",
    title: "Nya gungor på lekplatsen",
    body: "Exempeltext. Styrelsen har beslutat att byta ut gungställningen på lekplatsen. Arbetet görs under våren och lekplatsen hålls öppen under tiden.",
    cover: "lekplats",
    status: "published",
    date: "2026-09-14",
    author: "Tobias Ek",
  },
  {
    id: "n3",
    title: "Tack för en fin grannfest",
    body: "Exempeltext. Tack till alla som kom på årets grannfest och hjälpte till med grillen och städningen efteråt.",
    cover: "sommar",
    status: "published",
    date: "2026-06-22",
    author: "Ingrid Malm",
  },
  {
    id: "n4",
    title: "Förslag till nya parkeringsregler",
    body: "Exempeltext. Utkast som styrelsen ska diskutera på nästa möte.",
    cover: "stamma",
    status: "draft",
    date: "2026-11-08",
    author: "Nadia Rahimi",
  },
];

export const initialMembers: Member[] = [
  ["Astrid Lundell", "Exempel 1:1", "Exempelvägen 2", "astrid.lundell@example.com", "070-174 06 10", false, false],
  ["Bengt Forsman", "Exempel 1:2", "Exempelvägen 4", "bengt.forsman@example.com", "070-174 06 11", false, false],
  ["Camilla Öberg", "Exempel 1:3", "Exempelvägen 6", "camilla.oberg@example.com", "", true, false],
  ["David Nyberg", "Exempel 1:4", "Exempelvägen 8", "david.nyberg@example.com", "070-174 06 13", false, true],
  ["Elin Wahlgren", "Exempel 1:5", "Exempelvägen 10", "elin.wahlgren@example.com", "070-174 06 14", false, false],
  ["Fredrik Sjöö", "Exempel 1:6", "Exempelvägen 12", "", "070-174 06 15", false, false],
  ["Greta Holmér", "Exempel 1:7", "Exempelvägen 14", "greta.holmer@example.com", "", false, false],
  ["Hassan Karimi", "Exempel 1:8", "Exempelvägen 16", "hassan.karimi@example.com", "070-174 06 17", false, false],
].map(([name, property, address, email, phone, emailOptOut, bounced], index) => ({
  id: `m${index + 1}`,
  name: name as string,
  property: property as string,
  address: address as string,
  email: email as string,
  phone: phone as string,
  emailOptOut: emailOptOut as boolean,
  bounced: bounced as boolean,
  updated: "2026-10-12",
}));

export const initialMailings: Mailing[] = [
  {
    id: "u1",
    subject: "Vattnet stängs av torsdag 9–12",
    body: "Exempeltext. På torsdag stängs vattnet av mellan klockan 9 och 12 på grund av en reparation.",
    audience: "Alla medlemmar",
    sentAt: "2026-10-20",
    sender: "Ingrid Malm",
    recipients: 6,
    bounces: 1,
  },
  {
    id: "u2",
    subject: "Städdag lördag 3 oktober",
    body: "Exempeltext. Välkommen på höstens städdag. Vi börjar vid lekplatsen klockan 10.",
    audience: "Alla medlemmar",
    sentAt: "2026-09-21",
    sender: "Tobias Ek",
    recipients: 6,
    bounces: 0,
  },
];

export const initialFolders: Folder[] = [
  { id: "stadgar", name: "Stadgar" },
  { id: "protokoll", name: "Protokoll" },
  { id: "ekonomi", name: "Ekonomi" },
  { id: "underhall", name: "Underhållsplan" },
];

export const initialDocs: Doc[] = [
  { id: "d1", title: "Stadgar.pdf", folderId: "stadgar", size: 310000, public: true, uploadedBy: "Ingrid Malm", uploadedAt: "2026-03-23" },
  { id: "d2", title: "Protokoll årsstämma 2026.pdf", folderId: "protokoll", size: 245000, public: true, uploadedBy: "Nadia Rahimi", uploadedAt: "2026-04-05" },
  { id: "d3", title: "Protokoll styrelsemöte oktober.pdf", folderId: "protokoll", size: 128000, public: false, uploadedBy: "Nadia Rahimi", uploadedAt: "2026-10-28" },
  { id: "d4", title: "Budget 2027.pdf", folderId: "ekonomi", size: 96000, public: false, uploadedBy: "Per Sandell", uploadedAt: "2026-11-03" },
  { id: "d5", title: "Underhållsplan 2026–2036.pdf", folderId: "underhall", size: 1740000, public: true, uploadedBy: "Tobias Ek", uploadedAt: "2026-02-11" },
];

export const initialPages: Page[] = [
  {
    slug: "boende",
    title: "Boende",
    lead: "Praktisk information för dig som bor i området.",
    body: "Exempeltext. Här beskriver styrelsen det som är bra att veta när man bor i området.\n\n## Sophantering\n\nHär står var soprummet finns och när det töms.\n\n## Parkering\n\n- Parkera på din egen tomt\n- Gästparkering finns vid infarten",
    visible: true,
  },
  {
    slug: "gemensamt",
    title: "Gemensamt",
    lead: "Det vi äger och sköter tillsammans.",
    body: "Exempeltext. Föreningen sköter gemensamma vägar, grönytor, belysning och lekplats.\n\n## Lekplatsen\n\nHär står vad som gäller för lekplatsen.",
    visible: true,
  },
  {
    slug: "samfalligheten",
    title: "Samfälligheten",
    lead: "Så fungerar föreningen och styrelsens arbete.",
    body: "Exempeltext. En samfällighetsförening förvaltar det som fastighetsägarna äger gemensamt. Varje år hålls en stämma där medlemmarna fattar beslut.",
    visible: true,
  },
  {
    slug: "avgifter",
    title: "Avgifter",
    lead: "Vad avgiften går till och hur den betalas.",
    body: "Exempeltext. Avgiften beslutas på årsstämman och täcker drift, underhåll och avsättning till underhållsfonden.",
    visible: true,
  },
];

export const initialTasks: YearTask[] = (
  [
    [1, "Boka lokal till årsstämman", "Kontrollera att lokalen räcker till alla.", true],
    [2, "Sammanställ årsbokslut", "Kassören tar fram underlag till revisorn.", true],
    [3, "Håll årsstämma", "Följ stämmoguiden nedan.", true],
    [4, "Konstituerande styrelsemöte", "Fördela rollerna i den nya styrelsen.", true],
    [4, "Beställ sommarens gräsklippning", "Stäm av avtalet med entreprenören.", true],
    [5, "Vårstädning", "Bjud in till gemensam städdag.", true],
    [5, "Besiktning av lekplatsen", "Dokumentera besiktningen i arkivet.", true],
    [6, "Grannfest", "Valfritt. Bjud in i god tid.", true],
    [8, "Uppdatera underhållsplanen", "Gå igenom kommande års behov.", true],
    [9, "Höststädning", "Bjud in till gemensam städdag.", true],
    [10, "Kontrollera utebelysningen", "Byt trasiga armaturer före vintern.", true],
    [11, "Budgetförslag för nästa år", "Kassören tar fram ett första förslag.", false],
    [11, "Avtal om snöröjning", "Bekräfta avtal och kontaktperson.", false],
    [12, "Julbelysning vid infarten", "Sätt upp före första advent.", false],
    [12, "Avstämning av medlemsregistret", "Rensa uppgifter som inte längre behövs.", false],
  ] as [number, string, string, boolean][]
).map(([month, title, description, done], index) => ({
  id: `t${index + 1}`,
  month,
  title,
  description,
  done,
}));

export const initialSteps: AssemblyStep[] = [
  { id: "s1", phase: "Planera", title: "Bestäm datum och lokal", description: "Kontrollera vad stadgarna säger om tidpunkt och kallelse.", offsetDays: -90, done: true },
  { id: "s2", phase: "Planera", title: "Sista dag för motioner", description: "Påminn medlemmarna i god tid.", offsetDays: -42, done: false, to: "/portal/utskick", action: "Skicka påminnelse" },
  { id: "s3", phase: "Planera", title: "Samla årshandlingarna", description: "Verksamhetsberättelse, resultat, budget och revisionsberättelse.", offsetDays: -35, done: false, to: "/portal/dokument", action: "Öppna dokument" },
  { id: "s4", phase: "Kalla", title: "Skriv kallelse och dagordning", description: "Skapa ett utkast och låt styrelsen läsa.", offsetDays: -28, done: false, to: "/portal/nyheter/ny", action: "Skapa utkast" },
  { id: "s5", phase: "Kalla", title: "Skicka kallelsen", description: "Publicera nyheten och skicka den till medlemmarna.", offsetDays: -21, done: false, to: "/portal/utskick", action: "Skapa utskick" },
  { id: "s6", phase: "Stämman", title: "Håll stämman", description: "Ta med röstlängd, fullmakter och handlingar.", offsetDays: 0, done: false },
  { id: "s7", phase: "Efteråt", title: "Publicera protokollet", description: "Lägg justerat protokoll i dokumentarkivet.", offsetDays: 21, done: false, to: "/portal/dokument", action: "Öppna dokument" },
  { id: "s8", phase: "Efteråt", title: "Lämna över till nya styrelsen", description: "Uppdatera behörigheter och kontaktuppgifter.", offsetDays: 28, done: false, to: "/portal/installningar", action: "Öppna inställningar" },
  { id: "s9", phase: "Efteråt", title: "Anmäl ändringar", description: "Kontrollera om ny styrelse ska anmälas till Lantmäteriet.", offsetDays: 30, done: false },
];

export const initialBoard: BoardMember[] = [
  { id: "b1", name: "Ingrid Malm", email: "ordforande@example.se", title: "Ordförande", role: "admin", showPublic: true, pending: false },
  { id: "b2", name: "Per Sandell", email: "kassor@example.se", title: "Kassör", role: "admin", showPublic: true, pending: false },
  { id: "b3", name: "Nadia Rahimi", email: "sekreterare@example.se", title: "Sekreterare", role: "board", showPublic: true, pending: false },
  { id: "b4", name: "Tobias Ek", email: "tobias@example.se", title: "Ledamot", role: "board", showPublic: true, pending: false },
  { id: "b5", name: "Lovisa Hägg", email: "lovisa@example.se", title: "Suppleant", role: "board", showPublic: false, pending: true },
];

export const initialAssemblyDate = "2027-03-20";
