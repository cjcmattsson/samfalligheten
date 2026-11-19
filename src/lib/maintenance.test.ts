import { describe, expect, it } from "vitest";
import type { MaintenanceItem } from "../demo/data";
import { buildPlan, contributionNeeded, occurrences } from "./maintenance";

const item = (patch: Partial<MaintenanceItem>): MaintenanceItem => ({
  id: "x",
  title: "Test",
  category: "Vägar",
  quantity: "",
  lastDoneYear: 2020,
  intervalYears: 5,
  cost: 100,
  condition: "god",
  note: "",
  ...patch,
});

describe("occurrences", () => {
  it("repeats from the next due year at the interval", () => {
    expect(occurrences(item({}), 2026, 2040)).toEqual([2026, 2031, 2036]);
  });

  it("places overdue work in the first year of the plan", () => {
    expect(occurrences(item({ lastDoneYear: 2010, intervalYears: 10 }), 2026, 2040)).toEqual([2026, 2036]);
  });

  it("uses a manually planned year when one is set", () => {
    expect(occurrences(item({ plannedYear: 2029 }), 2026, 2035)).toEqual([2029, 2034]);
  });
});

describe("buildPlan", () => {
  it("adds the contribution and subtracts costs year by year", () => {
    const plan = buildPlan([item({ lastDoneYear: 2022, intervalYears: 5, cost: 300 })], { balance: 100, yearlyContribution: 50, showPublic: false }, 2026, 3);
    expect(plan.map((year) => [year.year, year.cost, year.balance])).toEqual([
      [2026, 0, 150],
      [2027, 300, -100],
      [2028, 0, -50],
    ]);
  });
});

describe("contributionNeeded", () => {
  it("returns the smallest contribution that keeps the fund from going negative", () => {
    const fund = { balance: 100, yearlyContribution: 0, showPublic: false };
    const plan = buildPlan([item({ lastDoneYear: 2022, intervalYears: 5, cost: 3100 })], fund, 2026, 4);
    const needed = contributionNeeded(plan, fund);
    expect(needed).toBe(2000);
    expect(buildPlan(plan.flatMap((year) => year.items).slice(0, 1), { ...fund, yearlyContribution: needed }, 2026, 4).every((year) => year.balance >= 0)).toBe(true);
  });
});
