// Phase 3 replaces infoPages with the pages collection in Firestore.
export const infoPages = [
  { slug: "boende", label: "Boende" },
  { slug: "gemensamt", label: "Gemensamt" },
  { slug: "samfalligheten", label: "Samfälligheten" },
  { slug: "avgifter", label: "Avgifter" },
];

export const publicNav = [
  ...infoPages.map((page) => ({ to: `/${page.slug}`, label: page.label })),
  { to: "/nyheter", label: "Nyheter" },
  { to: "/dokument", label: "Dokument" },
  { to: "/kontakt", label: "Kontakt" },
];

export const portalNav = [
  { to: "/portal", label: "Översikt" },
  { to: "/portal/nyheter", label: "Nyheter" },
  { to: "/portal/utskick", label: "Utskick" },
  { to: "/portal/dokument", label: "Dokument" },
  { to: "/portal/medlemmar", label: "Medlemsregister" },
  { to: "/portal/arshjul", label: "Årshjul" },
  { to: "/portal/sidor", label: "Sidor" },
  { to: "/portal/installningar", label: "Inställningar" },
  { to: "/portal/exportera", label: "Exportera allt" },
];
