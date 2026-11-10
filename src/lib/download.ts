import type { Member } from "../demo/data";
import { createId, today } from "./format";

const CSV_COLUMNS = ["Namn", "Fastighet", "Adress", "E-post", "Telefon"];

// Stops spreadsheet programs from running a cell as a formula.
function csvCell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function membersToCsv(members: Member[]) {
  const rows = members.map((member) =>
    [member.name, member.property, member.address, member.email, member.phone]
      .map(csvCell)
      .join(";"),
  );
  return `\uFEFF${[CSV_COLUMNS.join(";"), ...rows].join("\r\n")}`;
}

export function parseMembersCsv(text: string): Member[] {
  const [, ...lines] = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  return lines
    .filter((line) => line.trim())
    .map((line) => {
      const [name = "", property = "", address = "", email = "", phone = ""] = line
        .split(";")
        .map((cell) => cell.trim().replace(/^"|"$/g, "").replaceAll('""', '"'));
      return {
        id: createId(),
        name,
        property,
        address,
        email,
        phone,
        emailOptOut: false,
        bounced: false,
        updated: today(),
      };
    })
    .filter((member) => member.name);
}

export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
