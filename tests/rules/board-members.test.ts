import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";

let env: RulesTestEnvironment;

const member = { name: "Test Person", email: "test@example.com", role: "board", pending: true };

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-samfalligheten",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("boardMembers/ledamot").set(member);
    await context.firestore().doc("boardMembers/annan").set(member);
  });
});

afterAll(async () => {
  await env.cleanup();
});

const asLedamot = () => env.authenticatedContext("ledamot", { role: "board" }).firestore();

describe("boardMembers", () => {
  it("is hidden from anonymous visitors", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(db.doc("boardMembers/ledamot").get());
  });

  it("is hidden from signed-in users without a role", async () => {
    const db = env.authenticatedContext("okand").firestore();
    await assertFails(db.collection("boardMembers").get());
  });

  it("is hidden from a user whose role is valid but who is not on the list", async () => {
    const db = env.authenticatedContext("borttagen", { role: "admin" }).firestore();
    await assertFails(db.doc("boardMembers/ledamot").get());
  });

  it("is readable by the board", async () => {
    await assertSucceeds(asLedamot().collection("boardMembers").get());
  });

  it("lets members confirm their own first login", async () => {
    await assertSucceeds(asLedamot().doc("boardMembers/ledamot").update({ pending: false }));
  });

  it("does not let members change their own role", async () => {
    await assertFails(asLedamot().doc("boardMembers/ledamot").update({ role: "admin" }));
  });

  it("does not let members update someone else", async () => {
    await assertFails(asLedamot().doc("boardMembers/annan").update({ pending: false }));
  });

  it("does not let an admin write directly", async () => {
    const db = env.authenticatedContext("ledamot", { role: "admin" }).firestore();
    await assertFails(db.doc("boardMembers/ny").set(member));
    await assertFails(db.doc("boardMembers/annan").delete());
  });
});
