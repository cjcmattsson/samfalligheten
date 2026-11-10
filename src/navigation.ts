import type { IconName } from "./components/icons";

type PortalLink = { to: string; label: string; icon: IconName; adminOnly?: boolean };

export const portalNav: { heading?: string; links: PortalLink[] }[] = [
  { links: [{ to: "/portal", label: "Översikt", icon: "home" }] },
  {
    heading: "Kommunikation",
    links: [
      { to: "/portal/nyheter", label: "Nyheter", icon: "news" },
      { to: "/portal/utskick", label: "Utskick", icon: "send" },
      { to: "/portal/sidor", label: "Sidor", icon: "page" },
    ],
  },
  {
    heading: "Föreningen",
    links: [
      { to: "/portal/dokument", label: "Dokument", icon: "folder" },
      { to: "/portal/medlemmar", label: "Medlemsregister", icon: "users" },
      { to: "/portal/arshjul", label: "Årshjul", icon: "wheel" },
    ],
  },
  {
    heading: "Administration",
    links: [
      { to: "/portal/installningar", label: "Inställningar", icon: "settings" },
      { to: "/portal/exportera", label: "Exportera allt", icon: "download", adminOnly: true },
    ],
  },
];
