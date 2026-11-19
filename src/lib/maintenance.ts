import type { MaintenanceFund, MaintenanceItem } from "../demo/data";

export type PlanYear = {
  year: number;
  cost: number;
  items: MaintenanceItem[];
  balance: number;
};

export function dueYear(item: MaintenanceItem) {
  return item.plannedYear ?? item.lastDoneYear + item.intervalYears;
}

// Work that is already overdue is placed in the current year, since it still has to be paid for.
export function occurrences(item: MaintenanceItem, from: number, to: number) {
  const interval = Math.max(1, item.intervalYears);
  const years: number[] = [];
  for (let year = Math.max(dueYear(item), from); year <= to; year += interval) years.push(year);
  return years;
}

export function buildPlan(items: MaintenanceItem[], fund: MaintenanceFund, from: number, count: number) {
  const to = from + count - 1;
  let balance = fund.balance;
  return Array.from({ length: count }, (_, index): PlanYear => {
    const year = from + index;
    const due = items.filter((item) => occurrences(item, from, to).includes(year));
    const cost = due.reduce((sum, item) => sum + item.cost, 0);
    balance += fund.yearlyContribution - cost;
    return { year, cost, items: due, balance };
  });
}

// The smallest yearly contribution that keeps the fund at or above zero every year.
export function contributionNeeded(plan: PlanYear[], fund: MaintenanceFund) {
  let spent = 0;
  let needed = 0;
  plan.forEach((year, index) => {
    spent += year.cost;
    needed = Math.max(needed, (spent - fund.balance) / (index + 1));
  });
  return Math.ceil(needed / 1000) * 1000;
}

export function formatKr(amount: number) {
  return `${Math.round(amount).toLocaleString("sv-SE")} kr`;
}

export function formatKrShort(amount: number) {
  if (amount === 0) return "0";
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("sv-SE", { maximumFractionDigits: 1 })} mn`;
  }
  return `${Math.round(amount / 1000)} tkr`;
}
